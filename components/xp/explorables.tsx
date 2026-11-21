"use client"

import { useEffect, useMemo, useRef, useState } from "react"

// One explorable per project: the single idea that makes it work, told in short scenes,
// each with one thing to try. Toy numbers are labelled as toy numbers; the rules, sizes and
// orderings come from each repository.

const fmt = (v: number, d = 2) => (v >= 0 ? "" : "−") + Math.abs(v).toFixed(d)
const clamp = (v: number, lo = -1, hi = 1) => Math.min(hi, Math.max(lo, v))

/* ───────────────────────── Shared: a scene-by-scene frame ───────────────────────── */

function Guided({ titles, scene, setScene, children, caption }: {
  titles: string[]; scene: number; setScene: (i: number) => void; children: React.ReactNode
  caption: { title: React.ReactNode; body: React.ReactNode; tryit?: React.ReactNode; note?: React.ReactNode }
}) {
  return (
    <div className="ex ex-guided">
      <ol className="ex-tabs" aria-label="Scenes">
        {titles.map((t, i) => (
          <li key={t}><button type="button" className={i === scene ? "is-on" : i < scene ? "is-done" : undefined} aria-current={i === scene ? "step" : undefined} onClick={() => setScene(i)}><span>{i + 1}</span>{t}</button></li>
        ))}
      </ol>
      <div className="ex-scene" key={scene}>{children}</div>
      <div className="ex-caption" key={`c${scene}`}>
        <h3>{caption.title}</h3>
        <p>{caption.body}</p>
        {caption.tryit && <p className="ex-try"><b>Try it</b><span>{caption.tryit}</span></p>}
        {caption.note && <p className="ex-note">{caption.note}</p>}
        <div className="ex-nav">
          {scene > 0 && <button type="button" className="ex-back" onClick={() => setScene(scene - 1)}>← Back</button>}
          {scene < titles.length - 1 && <button type="button" className="ex-next" onClick={() => setScene(scene + 1)}>Next: {titles[scene + 1]} →</button>}
        </div>
      </div>
    </div>
  )
}

// A short vector you can grab: each bar is one number, drag its tip up or down.
function Bars({ values, color, names, onChange, height = 150 }: { values: number[]; color: string; names: string[]; onChange?: (v: number[]) => void; height?: number }) {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<number | null>(null)
  const W = 46, mid = height / 2, amp = height / 2 - 14
  const set = (e: React.PointerEvent) => {
    if (drag.current === null || !svg.current || !onChange) return
    const r = svg.current.getBoundingClientRect()
    const y = ((e.clientY - r.top) / r.height) * height
    const v = Math.round(clamp((mid - y) / amp) * 20) / 20
    onChange(values.map((x, i) => (i === drag.current ? v : x)))
  }
  return (
    <svg ref={svg} viewBox={`0 0 ${values.length * W + 8} ${height + 22}`} width={values.length * W + 8} className={`ex-bars ${onChange ? "is-live" : ""}`}
      onPointerMove={set} onPointerUp={() => { drag.current = null }} onPointerLeave={() => { drag.current = null }} style={{ "--c": color } as React.CSSProperties}>
      <line x1={0} x2={values.length * W + 8} y1={mid} y2={mid} className="ex-zero" />
      {values.map((v, i) => {
        const y = mid - v * amp
        return (
          <g key={i} onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); drag.current = i; set(e) }}>
            <rect x={8 + i * W} y={0} width={W - 12} height={height} className="ex-hit" />
            <rect x={8 + i * W + 6} y={Math.min(y, mid)} width={W - 24} height={Math.max(2, Math.abs(mid - y))} rx={4} className="ex-bar" />
            {onChange && <circle cx={8 + i * W + (W - 12) / 2} cy={y} r={8} className="ex-handle" />}
            <text x={8 + i * W + (W - 12) / 2} y={height + 16} className="ex-bname">{names[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

const cellColor = (v: number) => (v >= 0 ? `rgba(88,196,221,${Math.min(0.92, 0.08 + Math.abs(v) * 0.85)})` : `rgba(252,98,85,${Math.min(0.92, 0.08 + Math.abs(v) * 0.85)})`)

/* ───────────────────────── Tensor Fusion: why append a 1 ───────────────────────── */

export function FusionExplorable() {
  const [scene, setScene] = useState(0)
  const [v, setV] = useState([0.8, -0.4])
  const [a, setA] = useState([0.5, 0.9])
  const [t, setT] = useState([-0.6, 0.7])
  const [one, setOne] = useState(true)
  const [muted, setMuted] = useState(false)
  const [apart, setApart] = useState(0.55)

  const aa = muted ? [0, 0] : a
  const V = one ? [1, ...v] : v, A = one ? [1, ...aa] : aa, T = one ? [1, ...t] : t
  const vName = one ? ["1", "v₁", "v₂"] : ["v₁", "v₂"]
  const aName = one ? ["1", "a₁", "a₂"] : ["a₁", "a₂"]
  const kind = (i: number, j: number) => (!one ? "pair" : i === 0 && j === 0 ? "const" : i === 0 || j === 0 ? "solo" : "pair")
  const lit = V.flatMap((x) => A.map((y) => x * y)).filter((x) => Math.abs(x) > 0.001).length

  const grid = (k?: number) => (
    <div className={`ex-grid ${one ? "" : "is-small"}`} style={{ gridTemplateColumns: `repeat(${A.length}, 1fr)` }}>
      {V.map((x, i) => A.map((y, j) => {
        const val = x * y * (k === undefined ? 1 : T[k])
        return <span key={`${i}${j}`} className={`is-${kind(i, j)}`} style={{ background: cellColor(val), animationDelay: `${(i * A.length + j) * 45}ms` }}>{fmt(val, 2)}</span>
      }))}
    </div>
  )

  const [count, setCount] = useState(0)
  useEffect(() => {
    if (scene !== 3) return
    let raf = 0; const start = performance.now()
    const run = (now: number) => { const p = Math.min(1, (now - start) / 1600); setCount(Math.round(140481 * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(run) }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [scene])

  const titles = ["Three vectors", "Multiply two", "Add the third", "At real size"]
  const captions = [
    {
      title: <>Every clip becomes <em>three short lists of numbers</em>.</>,
      body: "Before anything is combined, each sense runs through its own small network: the face, the voice and the words each come out as a short list of numbers, a vector. Here each has two numbers, so you can see everything.",
      tryit: "Grab the top of any bar and drag it. These are the numbers the next scenes multiply.",
    },
    {
      title: <>Multiply every number by every number, <em>after adding a 1</em>.</>,
      body: muted
        ? one
          ? "The voice is silent, so its row is all zeros. But the first column is still a perfect copy of the face, untouched. The 1 kept it alive."
          : "Without the 1, a silent voice wipes out the whole grid. The face had something to say, and now it's gone."
        : "Each vector gets a 1 at the front. The top row becomes a copy of the voice, the left column a copy of the face, and the yellow middle holds every face-times-voice pair.",
      tryit: muted ? <>Now press <b>{one ? "Take the 1 away" : "Put the 1 back"}</b> and compare.</> : <>Press <b>Mute the voice</b> and watch which cells survive.</>,
    },
    {
      title: <>A third vector turns the grid into <em>a cube</em>.</>,
      body: "Multiply the grid by each number of the text vector and stack the results. The first layer is multiplied by the text's 1, so the whole grid from the last scene survives inside it, unchanged.",
      tryit: "Drag the slider to pull the layers apart.",
    },
    {
      title: <>The real cube holds <em>140,481</em> numbers per clip.</>,
      body: "In the notebook the vectors are 32, 32 and 128 long, plus their 1s. Two layers squeeze that cube down to 128 numbers, and a last one predicts the clip's sentiment.",
      note: "Asked positive or negative on a balanced test set, the notebook gets 70.4% right (guessing gets 50%), with an F1 of 0.709. The test set also influenced which model was kept, so that is likely a little optimistic.",
    },
  ]

  return (
    <Guided titles={titles} scene={scene} setScene={setScene} caption={captions[scene]}>
      {scene === 0 && (
        <div className="ex-trio">
          <figure><Bars values={v} color="var(--ex-blue)" names={["v₁", "v₂"]} onChange={setV} /><figcaption><b style={{ color: "var(--ex-blue)" }}>face</b> → visual <i>v</i></figcaption></figure>
          <figure><Bars values={a} color="var(--ex-yellow)" names={["a₁", "a₂"]} onChange={setA} /><figcaption><b style={{ color: "var(--ex-yellow)" }}>voice</b> → acoustic <i>a</i></figcaption></figure>
          <figure><Bars values={t} color="var(--ex-green)" names={["t₁", "t₂"]} onChange={setT} /><figcaption><b style={{ color: "var(--ex-green)" }}>words</b> → text <i>t</i></figcaption></figure>
        </div>
      )}
      {scene === 1 && (
        <div className="ex-outer">
          <div className="ex-outer-top">{aName.map((n, j) => <b key={n} className={one && j === 0 ? "is-one" : ""} style={{ color: "var(--ex-yellow)" }}>{n}<small>{fmt(A[j], 1)}</small></b>)}</div>
          <div className="ex-outer-row">
            <div className="ex-outer-left">{vName.map((n, i) => <b key={n} className={one && i === 0 ? "is-one" : ""} style={{ color: "var(--ex-blue)" }}>{n}<small>{fmt(V[i], 1)}</small></b>)}</div>
            {grid()}
          </div>
          <div className="ex-legend">
            {one && <span className="is-solo">copies of one vector</span>}
            <span className="is-pair">face × voice</span>
            <span className="ex-count">{lit} of {V.length * A.length} cells carry signal</span>
          </div>
          <div className="ex-actions">
            <button type="button" className={`ex-toggle ${muted ? "is-on" : ""}`} onClick={() => setMuted((m) => !m)}>{muted ? "Unmute the voice" : "Mute the voice"}</button>
            <button type="button" className={`ex-toggle ${one ? "" : "is-on"}`} onClick={() => setOne((o) => !o)}>{one ? "Take the 1 away" : "Put the 1 back"}</button>
          </div>
        </div>
      )}
      {scene === 2 && (
        <div className="ex-cubewrap">
          <div className="ex-cubeview">
            <div className="ex-cube" style={{ "--apart": apart } as React.CSSProperties}>
              {[1, ...t].map((tk, k) => (
                <div key={k} className={`ex-layer ${k === 0 ? "is-first" : ""}`} style={{ "--k": k } as React.CSSProperties}>
                  <div className="ex-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    {[1, ...v].map((x, i) => [1, ...a].map((y, j) => {
                      const val = x * y * tk
                      return <span key={`${i}${j}`} className={`is-${i === 0 && j === 0 ? "const" : i === 0 || j === 0 ? "solo" : "pair"}`} style={{ background: cellColor(val) }} />
                    }))}
                  </div>
                </div>
              ))}
            </div>
            <ol className="ex-layers">
              <li className="is-first"><b>× 1</b> the grid from scene 2, untouched</li>
              <li><b>× t₁</b> every cell times {fmt(t[0], 2)}</li>
              <li><b>× t₂</b> every cell times {fmt(t[1], 2)}</li>
            </ol>
          </div>
          <label className="ex-apart">Pull the layers apart <input type="range" min={0} max={1} step={0.01} value={apart} onChange={(e) => setApart(Number(e.target.value))} /></label>
        </div>
      )}
      {scene === 3 && (
        <div className="ex-real">
          <div className="ex-dims">
            <p><span className="ex-dim" style={{ width: "26%", background: "var(--ex-blue)" }} /> 32 + 1 = <b>33</b></p>
            <p><span className="ex-dim" style={{ width: "26%", background: "var(--ex-yellow)" }} /> 32 + 1 = <b>33</b></p>
            <p><span className="ex-dim" style={{ width: "100%", background: "var(--ex-green)" }} /> 128 + 1 = <b>129</b></p>
          </div>
          <p className="ex-big">{count.toLocaleString("en-US")}</p>
          <p className="ex-chain"><span>140,481</span>→<span>128</span>→<span>128</span>→<span>sentiment</span></p>
        </div>
      )}
    </Guided>
  )
}

/* ───────────────────────── X-MuTeST: probe each phrase alone ───────────────────────── */

// A toy scorer stands in for the trained model, so the method can run live in the browser.
const WORDS = ["honestly", "the", "new", "update", "is", "garbage", "and", "so", "are", "you"]
const WEIGHT: Record<string, number> = { honestly: -0.2, update: 0.1, garbage: 1.6, so: 0.1, you: 0.9 }
const prob = (ws: string[]) => 1 / (1 + Math.exp(-(-1.2 + ws.reduce((s, w) => s + (WEIGHT[w] ?? 0), 0))))
const NW: Record<number, number> = { 1: 0.5, 2: 0.3, 3: 0.2 }
const WINDOWS = [1, 2, 3].flatMap((n) => Array.from({ length: WORDS.length - n + 1 }, (_, s) => ({ n, s })))

export function ProbeExplorable() {
  const [k, setK] = useState(0)
  const [playing, setPlaying] = useState(false)
  const full = prob(WORDS)

  useEffect(() => {
    if (!playing) return
    if (k >= WINDOWS.length) { setPlaying(false); return }
    const id = window.setTimeout(() => setK((v) => v + 1), 560)
    return () => window.clearTimeout(id)
  }, [playing, k])

  // Exactly the notebook's arithmetic, over the windows seen so far.
  const { scores, cur } = useMemo(() => {
    const sum: number[] = WORDS.map(() => 0), cnt: number[] = WORDS.map(() => 0)
    WINDOWS.slice(0, k).forEach(({ n, s }) => {
      const diff = Math.abs(full - prob(WORDS.slice(s, s + n)))
      for (let i = s; i < s + n; i++) { sum[i] += NW[n] * diff; cnt[i] += 1 }
    })
    const avg = sum.map((v, i) => (cnt[i] ? v / cnt[i] : 0))
    const total = avg.reduce((x, y) => x + y, 0)
    return { scores: avg.map((v) => (total ? v / total : 0)), cur: k > 0 ? WINDOWS[k - 1] : null }
  }, [k, full])

  const done = k >= WINDOWS.length
  const half = Math.floor(WORDS.length / 2)
  const order = scores.map((v, i) => [v, i] as const).sort((x, y) => x[0] - y[0])
  const chosen = done ? new Set(order.slice(0, half).map(([, i]) => i)) : new Set<number>()
  const phraseP = cur ? prob(WORDS.slice(cur.s, cur.s + cur.n)) : null
  const max = Math.max(0.0001, ...scores)
  const phase = cur?.n ?? 0

  return (
    <div className="ex">
      <div className="ex-stage ex-probe">
        <ol className="ex-phases">{["one word", "two words", "three words"].map((p, i) => <li key={p} className={phase === i + 1 ? "is-on" : phase > i + 1 || done ? "is-done" : undefined}>{p} <small>× {NW[i + 1]}</small></li>)}</ol>
        <div className="ex-bars-p">
          <div className="ex-pbar"><span>whole post</span><i style={{ width: `${full * 100}%` }} /><b>{full.toFixed(2)}</b></div>
          <div className="ex-pbar is-phrase"><span>{cur ? `“${WORDS.slice(cur.s, cur.s + cur.n).join(" ")}” alone` : "a phrase alone"}</span><i style={{ width: `${(phraseP ?? 0) * 100}%` }} /><b>{phraseP !== null ? phraseP.toFixed(2) : "—"}</b></div>
          <p className="ex-formula">{cur ? <>gap {Math.abs(full - (phraseP ?? 0)).toFixed(2)} × {NW[cur.n]} → added to {cur.n === 1 ? "this word" : `each of these ${cur.n} words`}</> : "Probability the post is offensive, from a toy model."}</p>
        </div>
        <div className="ex-words">
          {WORDS.map((w, i) => {
            const inWin = cur && i >= cur.s && i < cur.s + cur.n
            return (
              <div key={w} className={`ex-word ${inWin ? "is-in" : ""} ${chosen.has(i) ? "is-chosen" : ""}`}>
                <span className="ex-score" style={{ height: `${(scores[i] / max) * 60}px` }} />
                <b>{w}</b>
              </div>
            )
          })}
        </div>
        <p className="ex-axis-note">bar = average gap so far · <em>shorter means the word alone stays closer to the whole post</em></p>
        <div className="ex-scrub">
          <button type="button" onClick={() => { if (done) setK(0); setPlaying((p) => !p || done) }}>{playing ? "Pause" : done ? "Replay" : k ? "Resume" : "Start the probe"}</button>
          <input type="range" min={0} max={WINDOWS.length} value={k} onChange={(e) => { setPlaying(false); setK(Number(e.target.value)) }} aria-label="Phrases probed so far" />
          <span>{k}/{WINDOWS.length}</span>
        </div>
        {done && (
          <p className="ex-reveal">Rationale: {WORDS.map((w, i) => <span key={w} className={chosen.has(i) ? "is-chosen" : ""}>{w} </span>)}</p>
        )}
      </div>
      <div className="ex-side">
        <p className="ex-kicker">The one idea</p>
        <h3>Ask every phrase what it does <em>alone</em>.</h3>
        <p>The model reads each word, each pair and each triple by itself. A phrase that, alone, lands close to the whole post&apos;s score is carrying the decision. The gaps are weighted by length, averaged per word and normalized.</p>
        <p>{done
          ? <>Done. <em>garbage</em> alone scores 0.60, close to the post&apos;s 0.79, so it gets the shortest bar; its neighbours share some credit through the pairs and triples around it. The shortest half become the rationale.</>
          : <>Press <b>Start the probe</b> and watch the bars. When it finishes, the <em>shortest</em> bars become the rationale: the lower half here, the lowest five in longer posts.</>}</p>
        <p className="ex-note">A toy scorer stands in for the trained model; the arithmetic is the repository&apos;s.</p>
      </div>
    </div>
  )
}

/* ───────────────────────── AgentGuard: pair, don't average ───────────────────────── */

const PASS = 0.8, TOL = 0.05
const BASE = [0.92, 0.88, 0.85, 0.95, 0.81, 0.7, 0.9, 0.86, 0.83, 0.65]
const CAND = [0.95, 0.91, 0.88, 0.97, 0.72, 0.84, 0.93, 0.62, 0.86, 0.82]
type Cls = "regressed" | "improved" | "unchanged"

// The repository's pairing rule for rubric-judged cases.
function classify(b: number, c: number): Cls {
  const bp = b >= PASS, cp = c >= PASS
  if (bp && !cp) return "regressed"
  if (!bp && cp) return "improved"
  // The repository compares Decimals; round so 0.97 − 0.92 counts as exactly 0.05.
  const d = Math.round((c - b) * 10000) / 10000
  if (-d >= TOL) return "regressed"
  if (d >= TOL) return "improved"
  return "unchanged"
}

export function PairingExplorable() {
  const [scene, setScene] = useState(0)
  const [allowed, setAllowed] = useState(0)
  const [critical, setCritical] = useState(false)
  const cls = BASE.map((b, i) => classify(b, CAND[i]))
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
  const regs = cls.filter((c) => c === "regressed").length
  const reasons: string[] = []
  if (critical && cls[4] === "regressed") reasons.push("Case 5 is critical, and it broke.")
  if (regs > allowed) reasons.push(`${regs} cases broke; your policy allows ${allowed}.`)
  const decision = reasons.length ? "BLOCK" : "PASS"

  const rows = (paired: boolean) => (
    <div className={`ex-rows ${paired ? "is-paired" : ""}`}>
      <p className="ex-rows-head"><span>case</span><span>baseline</span><span /><span>candidate</span><span /></p>
      {BASE.map((b, i) => (
        <p key={i} className={`ex-row is-${paired ? cls[i] : "plain"} ${critical && i === 4 && paired ? "is-critical" : ""}`} style={{ animationDelay: `${i * 70}ms` }}
          title={paired ? (cls[i] === "regressed" ? "Passed before, fails now" : cls[i] === "improved" ? "Failed before, passes now (or rose by 0.05 or more)" : "No meaningful change") : undefined}>
          <span>{i + 1}</span>
          <span className={b >= PASS ? "is-pass" : "is-fail"}>{b.toFixed(2)}</span>
          <i className="ex-link" />
          <span className={CAND[i] >= PASS ? "is-pass" : "is-fail"}>{CAND[i].toFixed(2)}</span>
          <em>{paired ? cls[i] : ""}</em>
        </p>
      ))}
    </div>
  )

  const titles = ["The averages", "Pair them", "Let policy decide"]
  const captions = [
    {
      title: <>On average, the new version <em>looks better</em>.</>,
      body: <>Ten test questions, two versions of the app. Scores of 0.80 or more pass. The average went from {avg(BASE).toFixed(3)} to {avg(CAND).toFixed(3)}, and eight cases pass either way.</>,
      tryit: <>Would you ship it? Press <b>Next</b>.</>,
    },
    {
      title: <>Pair each case with <em>itself</em>.</>,
      body: "Compare every question with the same question in the old version. Cases 5 and 8 used to pass and now fail. Cases 6 and 10 were fixed. Two broke, two healed, and the average rose anyway, which is exactly what an average hides.",
      tryit: "Point at a row to read the rule that labelled it.",
    },
    {
      title: <>The verdict is <em>arithmetic</em>, not a vote.</>,
      body: "Your release policy says how many regressions you can live with. Before shipping, the deployment pipeline asks AgentGuard's release gate and gets a clear answer: carry on, or stop.",
      tryit: "Raise the allowance to 2, then mark case 5 as critical.",
    },
  ]

  return (
    <Guided titles={titles} scene={scene} setScene={setScene} caption={captions[scene]}>
      {scene === 0 && (
        <div className="ex-avgview">
          <div className="ex-avgcards">
            <p><small>baseline average</small><b>{avg(BASE).toFixed(3)}</b></p>
            <p className="is-up"><small>candidate average</small><b>{avg(CAND).toFixed(3)} ▲</b></p>
            <p><small>passing</small><b>8 → 8</b></p>
          </div>
          {rows(false)}
        </div>
      )}
      {scene === 1 && rows(true)}
      {scene === 2 && (
        <div className="ex-gate">
          <div className="ex-gate-controls">
            <label>Regressions allowed
              <span className="ex-stepper">
                <button type="button" onClick={() => setAllowed((v) => Math.max(0, v - 1))} aria-label="Fewer">−</button>
                <b>{allowed}</b>
                <button type="button" onClick={() => setAllowed((v) => Math.min(3, v + 1))} aria-label="More">+</button>
              </span>
            </label>
            <label className="ex-check"><input type="checkbox" checked={critical} onChange={(e) => setCritical(e.target.checked)} /> Case 5 is critical</label>
            <p className="ex-found">Found: <b>{regs}</b> paired regressions{critical ? ", one of them critical" : ""}</p>
          </div>
          <div className={`ex-verdict is-${decision.toLowerCase()}`} key={decision + reasons.length} role="status">
            <p className="ex-verdict-label">Release gate says</p>
            <b>{decision}</b>
            <p className="ex-verdict-why">{reasons.length ? reasons.map((r) => <span key={r}>{r}</span>) : <span>No rule is broken: the two cases that broke are within what you allowed.</span>}</p>
            <p className="ex-verdict-pipe">{decision === "PASS" ? "The pipeline continues and the release ships." : "The pipeline stops; the release waits for a fix."}</p>
          </div>
        </div>
      )}
    </Guided>
  )
}

/* ───────────────────────── Course Catalog: where a crash leaves you ───────────────────────── */

const CART = [{ code: "CS101", credits: 3 }, { code: "CS102", credits: 4 }, { code: "CS104", credits: 5 }]
const OPS = [...CART.map((c) => `Save ${c.code} with the student added`), "Save the student with the courses added", "Empty the cart"]

export function CrashExplorable() {
  const [at, setAt] = useState(OPS.length) // the crash happens before this operation; OPS.length means no crash
  const [retries, setRetries] = useState(0)

  // Replay /student/confirm: courses are saved inside the map, the student after Promise.all, then the cart is cleared.
  const state = useMemo(() => {
    const courses = CART.map((_, i) => (i < at ? 1 : 0))
    let student = at > CART.length ? CART.length : 0
    let cart = at > CART.length + 1 ? 0 : CART.length
    let studentSaved = at > CART.length
    for (let r = 0; r < retries; r++) {
      if (!cart) break
      // Confirm again with the same cart: nothing checks for duplicates, so every course gains the student again.
      for (let i = 0; i < courses.length; i++) courses[i] += 1
      student = (studentSaved ? student : 0) + CART.length
      studentSaved = true
      cart = 0
    }
    return { courses, student, cart }
  }, [at, retries])

  const crashed = at < OPS.length
  const mismatch = state.courses.some((n) => n !== (state.student ? Math.max(1, state.student / CART.length) : 0)) || state.courses.some((n) => n > 1)

  return (
    <div className="ex">
      <div className="ex-stage ex-crash">
        <p className="ex-kicker">Pressing Confirm, one write at a time. Click a dot to crash there.</p>
        <ol className="ex-ops">
          {OPS.map((op, i) => (
            <li key={op} className={i < at ? "is-done" : "is-lost"}>
              <button type="button" onClick={() => { setAt(i); setRetries(0) }} aria-label={`Crash before ${op}`} className={i === at ? "is-crash" : undefined} />
              <span className="ex-op">{op}{i === at && <i className="ex-bolt">crash here</i>}</span>{i < CART.length && <small>runs alongside the other courses</small>}
            </li>
          ))}
          <li className={!crashed ? "is-done" : "is-lost"}><button type="button" onClick={() => { setAt(OPS.length); setRetries(0) }} aria-label="No crash" /><span className="ex-op">Done, back to the home page{!crashed && <i className="ex-bolt is-ok">no crash</i>}</span></li>
        </ol>
        <div className="ex-docs">
          <div className={`ex-doc ${state.student === 0 && state.courses.some(Boolean) ? "is-bad" : state.student > CART.length ? "is-bad" : ""}`}>
            <p>The student&apos;s record</p>
            <span>{state.student ? Array.from({ length: state.student }, (_, i) => <i key={i}>{CART[i % CART.length].code}</i>) : <em>no courses</em>}</span>
          </div>
          {CART.map((c, i) => (
            <div key={c.code} className={`ex-doc ${state.courses[i] > 1 || (state.courses[i] > 0) !== (state.student > 0) ? "is-bad" : ""}`}>
              <p>{c.code}&apos;s record</p>
              <span>{state.courses[i] ? Array.from({ length: state.courses[i] }, (_, k) => <i key={k}>student 42</i>) : <em>no students</em>}</span>
            </div>
          ))}
          <p className="ex-cart">Cart: {state.cart ? CART.map((c) => c.code).join(", ") : "empty"}</p>
        </div>
      </div>
      <div className="ex-side">
        <p className="ex-kicker">The one idea</p>
        <h3>Two records, saved <em>separately</em>.</h3>
        <p>An enrollment lives in two places: the course lists the student, and the student lists the course. Confirm saves the courses first and the student last, as separate writes. Crash in between and watch the two records disagree.</p>
        <p>Then confirm again. The cart is still there, and unlike the single-course enroll button, this route never checks whether the student is already listed.</p>
        <button type="button" className="ex-toggle" onClick={() => setRetries((r) => r + 1)} disabled={!state.cart}>{state.cart ? "Confirm again" : "Cart is empty"}</button>
        <p className={`ex-status ${mismatch ? "is-bad" : "is-good"}`} role="status">{mismatch ? (state.courses.some((n) => n > 1) ? "Duplicates: a course now lists the same student twice." : "The two sides disagree.") : crashed ? "Nothing was written yet." : "Both sides agree."}</p>
        <p className="ex-note">The fix: wrap all the writes in one transaction, so they succeed or fail together, and check for an existing enrollment first, as the single-course route already does.</p>
      </div>
    </div>
  )
}
