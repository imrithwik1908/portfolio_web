"use client"

import { useEffect, useMemo, useRef, useState } from "react"

// One explorable per project: the single idea that makes it work, small enough to play with.
// Toy numbers are labelled as toy numbers; the rules, sizes and orderings come from each repository.

const fmt = (v: number, d = 2) => (v >= 0 ? "" : "−") + Math.abs(v).toFixed(d)

/* ───────────────────────── Tensor Fusion: why append a 1 ───────────────────────── */

const SUB = ["₀", "₁", "₂"]
type Vec = [number, number]

function Slider({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <label className="ex-slider" style={{ "--c": color } as React.CSSProperties}>
      <span>{label}</span>
      <input type="range" min={-1} max={1} step={0.05} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <output>{fmt(value)}</output>
    </label>
  )
}

export function FusionExplorable() {
  const [a, setA] = useState<Vec>([0.8, -0.4])
  const [b, setB] = useState<Vec>([0.5, 0.9])
  const [t, setT] = useState<Vec>([-0.6, 0.7])
  const [one, setOne] = useState(true)
  const [hover, setHover] = useState<[number, number, number] | null>(null)

  const A = one ? [1, ...a] : [...a]
  const B = one ? [1, ...b] : [...b]
  const T = one ? [1, ...t] : [...t]
  // How many real modalities a cell mixes: 0 is the constant, 1 unimodal, 2 bimodal, 3 trimodal.
  const order = (i: number, j: number, k: number) => (one ? Number(i > 0) + Number(j > 0) + Number(k > 0) : 3)
  const kinds = ["constant", "unimodal", "bimodal", "trimodal"]
  const idx = (n: number) => (one ? n : n + 1)
  const counts = [0, 0, 0, 0]
  T.forEach((_, k) => A.forEach((_, i) => B.forEach((_, j) => { counts[order(i, j, k)]++ })))

  const cell = 46
  const h = hover
  const formula = h
    ? `${one && h[0] === 0 ? "1" : `v${SUB[idx(h[0])]}`} · ${one && h[1] === 0 ? "1" : `a${SUB[idx(h[1])]}`} · ${one && h[2] === 0 ? "1" : `t${SUB[idx(h[2])]}`} = ${fmt(A[h[0]] * B[h[1]] * T[h[2]])}`
    : "Point at a cell to see what it multiplies."

  return (
    <div className="ex">
      <div className="ex-stage ex-fusion">
        <div className="ex-vectors">
          <div><p className="ex-vlabel" style={{ color: "var(--ex-blue)" }}>visual <i>v</i></p><Slider label="v₁" value={a[0]} color="var(--ex-blue)" onChange={(v) => setA([v, a[1]])} /><Slider label="v₂" value={a[1]} color="var(--ex-blue)" onChange={(v) => setA([a[0], v])} /></div>
          <div><p className="ex-vlabel" style={{ color: "var(--ex-yellow)" }}>acoustic <i>a</i></p><Slider label="a₁" value={b[0]} color="var(--ex-yellow)" onChange={(v) => setB([v, b[1]])} /><Slider label="a₂" value={b[1]} color="var(--ex-yellow)" onChange={(v) => setB([b[0], v])} /></div>
          <div><p className="ex-vlabel" style={{ color: "var(--ex-green)" }}>text <i>t</i></p><Slider label="t₁" value={t[0]} color="var(--ex-green)" onChange={(v) => setT([v, t[1]])} /><Slider label="t₂" value={t[1]} color="var(--ex-green)" onChange={(v) => setT([t[0], v])} /></div>
        </div>
        <div className="ex-slices" onPointerLeave={() => setHover(null)}>
          {T.map((tk, k) => (
            <figure key={`${one}-${k}`} className="ex-slice" style={{ animationDelay: `${k * 90}ms` }}>
              <svg viewBox={`0 0 ${B.length * cell + 2} ${A.length * cell + 2}`} width={B.length * cell + 2}>
                {A.map((ai, i) => B.map((bj, j) => {
                  const v = ai * bj * tk, o = order(i, j, k)
                  const on = h && h[0] === i && h[1] === j && h[2] === k
                  return (
                    <g key={`${i}${j}`} onPointerEnter={() => setHover([i, j, k])}>
                      <rect x={1 + j * cell} y={1 + i * cell} width={cell - 3} height={cell - 3} rx={5}
                        className={`ex-cell is-${kinds[o]} ${on ? "is-on" : ""}`}
                        style={{ fill: v >= 0 ? `rgba(88,196,221,${Math.min(0.9, Math.abs(v))})` : `rgba(252,98,85,${Math.min(0.9, Math.abs(v))})` }} />
                    </g>
                  )
                }))}
              </svg>
              <figcaption>× {one && k === 0 ? "1" : `t${SUB[idx(k)]}`}</figcaption>
            </figure>
          ))}
        </div>
        <p className="ex-formula" aria-live="polite">{formula}</p>
      </div>
      <div className="ex-side">
        <p className="ex-kicker">The one idea</p>
        <h3>Append a <em>1</em> before you multiply.</h3>
        <p>Tensor fusion takes the outer product of the three vectors: every entry of one times every entry of the others. On its own that only keeps three-way terms. Put a constant 1 at the front of each vector and the product also carries each modality alone and every pair.</p>
        <button type="button" className={`ex-toggle ${one ? "is-on" : ""}`} onClick={() => setOne((v) => !v)} aria-pressed={one}>{one ? "Remove the 1" : "Append the 1"}</button>
        <ul className="ex-legend">
          {kinds.map((k, i) => counts[i] > 0 && <li key={k} className={`is-${k}`}><b>{counts[i]}</b> {k}</li>)}
        </ul>
        <p className="ex-note">Toy vectors of two numbers each. In the notebook they are 32, 32 and 128 long, so the cube holds 33 × 33 × 129 = 140,481 numbers for every clip.</p>
      </div>
    </div>
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
    const id = window.setTimeout(() => setK((v) => v + 1), 520)
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
  const chosen = done ? new Set(scores.map((v, i) => [v, i] as const).sort((x, y) => x[0] - y[0]).slice(0, half).map(([, i]) => i)) : new Set<number>()
  const phraseP = cur ? prob(WORDS.slice(cur.s, cur.s + cur.n)) : null
  const max = Math.max(0.0001, ...scores)

  return (
    <div className="ex">
      <div className="ex-stage ex-probe">
        <div className="ex-bars">
          <div className="ex-pbar"><span>whole post</span><i style={{ width: `${full * 100}%` }} /><b>{full.toFixed(2)}</b></div>
          <div className="ex-pbar is-phrase"><span>{cur ? `“${WORDS.slice(cur.s, cur.s + cur.n).join(" ")}” alone` : "a phrase alone"}</span><i style={{ width: `${(phraseP ?? 0) * 100}%` }} /><b>{phraseP !== null ? phraseP.toFixed(2) : "—"}</b>
            {phraseP !== null && <em className="ex-gap" style={{ left: `${Math.min(full, phraseP) * 100}%`, width: `${Math.abs(full - phraseP) * 100}%` }} />}
          </div>
          <p className="ex-formula">{cur ? <>|Δ| = {Math.abs(full - (phraseP ?? 0)).toFixed(2)} × weight {NW[cur.n]} → added to {cur.n === 1 ? "this word" : `each of these ${cur.n} words`}</> : "Each phrase is scored by how far it lands from the whole post."}</p>
        </div>
        <div className="ex-words">
          {WORDS.map((w, i) => {
            const inWin = cur && i >= cur.s && i < cur.s + cur.n
            return (
              <div key={w} className={`ex-word ${inWin ? "is-in" : ""} ${chosen.has(i) ? "is-chosen" : ""}`}>
                <span className="ex-score" style={{ height: `${(scores[i] / max) * 56}px` }} />
                <b>{w}</b>
              </div>
            )
          })}
        </div>
        <div className="ex-scrub">
          <button type="button" onClick={() => { if (done) setK(0); setPlaying((p) => !p || done) }}>{playing ? "Pause" : done ? "Replay" : k ? "Resume" : "Probe"}</button>
          <input type="range" min={0} max={WINDOWS.length} value={k} onChange={(e) => { setPlaying(false); setK(Number(e.target.value)) }} aria-label="Phrases probed so far" />
          <span>{cur ? `${["", "uni", "bi", "tri"][cur.n]}grams · ${k}/${WINDOWS.length}` : `0/${WINDOWS.length}`}</span>
        </div>
      </div>
      <div className="ex-side">
        <p className="ex-kicker">The one idea</p>
        <h3>Ask every phrase what it does <em>alone</em>.</h3>
        <p>Each unigram, bigram and trigram is fed to the model by itself. A phrase that, alone, lands close to the whole post&apos;s prediction is carrying the decision. Gaps are weighted 0.5, 0.3 and 0.2 by length, averaged per word and normalized.</p>
        <p>When the probe finishes, the words with the <em>smallest</em> scores become the rationale: the lower half here, the lowest five in longer posts.</p>
        <p className="ex-note">A toy scorer stands in for the trained MuRIL model; the arithmetic is the repository&apos;s.</p>
      </div>
    </div>
  )
}

/* ───────────────────────── AgentGuard: pair, don't average ───────────────────────── */

const PASS = 0.8, TOL = 0.05
const BASE = [0.92, 0.88, 0.85, 0.95, 0.81, 0.7, 0.9, 0.86, 0.83, 0.65]
const CAND0 = [0.97, 0.93, 0.9, 0.98, 0.72, 0.84, 0.95, 0.62, 0.88, 0.82]
type Cls = "regressed" | "improved" | "unchanged" | "not comparable"

// The repository's pairing rule for rubric-judged cases, where a fail-to-fail drop can still count.
function classify(b: number, c: number | null): Cls {
  if (c === null) return "not comparable"
  const bp = b >= PASS, cp = c >= PASS
  if (bp && !cp) return "regressed"
  if (!bp && cp) return "improved"
  if (b - c >= TOL) return "regressed"
  if (c - b >= TOL) return "improved"
  return "unchanged"
}

export function PairingExplorable() {
  const [cand, setCand] = useState<number[]>(CAND0)
  const [sel, setSel] = useState(4)
  const [critical, setCritical] = useState<Set<number>>(() => new Set())
  const [maxReg, setMaxReg] = useState(0)
  const [minPass, setMinPass] = useState(0.8)
  const [drop, setDrop] = useState(0)
  const [missing, setMissing] = useState(false)
  const [crash, setCrash] = useState(false)
  const svg = useRef<SVGSVGElement>(null)
  const dragging = useRef<number | null>(null)

  const candAt = (i: number) => (missing && i === 9 ? null : cand[i])
  const cls = BASE.map((b, i) => classify(b, candAt(i)))
  const comparable = cls.filter((c) => c !== "not comparable").length
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
  const baseAvg = avg(BASE), candVals = cand.filter((_, i) => candAt(i) !== null), candAvg = avg(candVals)
  const passRate = candVals.filter((v) => v >= PASS).length / candVals.length
  const pairedDelta = avg(BASE.map((b, i) => (candAt(i) === null ? null : (candAt(i) as number) - b)).filter((v): v is number => v !== null))
  const regs = cls.filter((c) => c === "regressed").length
  const critRegs = Array.from(critical).filter((i) => cls[i] === "regressed").length

  // Same order and wording as decide_release.
  const reasons: [string, "block" | "gap"][] = []
  if (comparable < BASE.length) reasons.push([`Comparison coverage ${(comparable / BASE.length).toFixed(2)} is below 1.00`, "gap"])
  if (crash) reasons.push(["A runtime-success check failed", "block"])
  if (critRegs) reasons.push([`${critRegs} critical case${critRegs > 1 ? "s" : ""} regressed`, "block"])
  if (passRate < minPass) reasons.push([`Pass rate ${passRate.toFixed(2)} is below ${minPass.toFixed(2)}`, "block"])
  if (regs > maxReg) reasons.push([`${regs} paired regression${regs === 1 ? "" : "s"}; at most ${maxReg} allowed`, "block"])
  if (pairedDelta < -drop) reasons.push([`Paired score fell ${Math.abs(pairedDelta).toFixed(3)}, more than ${drop.toFixed(2)}`, "block"])
  const blocked = reasons.some(([, k]) => k === "block")
  const verdict = !reasons.length ? "PASS" : blocked ? "BLOCK" : "REVIEW"

  // Plot: baseline score across, candidate score up, both from 0.55 to 1.
  const W = 300, lo = 0.55, X = (v: number) => 24 + ((v - lo) / (1 - lo)) * W, Y = (v: number) => 12 + (1 - (v - lo) / (1 - lo)) * W
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current === null || !svg.current) return
    const r = svg.current.getBoundingClientRect()
    const y = ((e.clientY - r.top) / r.height) * (W + 40)
    const v = Math.max(lo, Math.min(1, 1 - ((y - 12) / W) * (1 - lo)))
    setCand((c) => c.map((x, i) => (i === dragging.current ? Math.round(v * 100) / 100 : x)))
  }

  return (
    <div className="ex">
      <div className="ex-stage ex-pair">
        <svg ref={svg} viewBox={`0 0 ${W + 40} ${W + 40}`} onPointerMove={onMove} onPointerUp={() => { dragging.current = null }} onPointerLeave={() => { dragging.current = null }} role="img" aria-label="Baseline score against candidate score for ten test cases">
          <polygon className="ex-band" points={`${X(lo)},${Y(lo + TOL)} ${X(1 - TOL)},${Y(1)} ${X(1)},${Y(1)} ${X(1)},${Y(1 - TOL)} ${X(lo + TOL)},${Y(lo)} ${X(lo)},${Y(lo)}`} />
          <rect className="ex-zone is-bad" x={X(PASS)} y={Y(PASS)} width={X(1) - X(PASS)} height={Y(lo) - Y(PASS)} />
          <rect className="ex-zone is-good" x={X(lo)} y={Y(1)} width={X(PASS) - X(lo)} height={Y(PASS) - Y(1)} />
          <line className="ex-diag" x1={X(lo)} y1={Y(lo)} x2={X(1)} y2={Y(1)} />
          <line className="ex-thresh" x1={X(PASS)} y1={Y(lo)} x2={X(PASS)} y2={Y(1)} />
          <line className="ex-thresh" x1={X(lo)} y1={Y(PASS)} x2={X(1)} y2={Y(PASS)} />
          <text className="ex-axis" x={X(1)} y={W + 34} textAnchor="end">baseline score →</text>
          <text className="ex-axis" x={10} y={Y(1) - 2} transform={`rotate(-90 10 ${Y(1) - 2})`} textAnchor="end">candidate →</text>
          <text className="ex-zlabel" x={X(PASS) + 6} y={Y(lo) - 8}>passed → failed</text>
          <text className="ex-zlabel" x={X(lo) + 6} y={Y(1) + 14}>failed → passed</text>
          {BASE.map((b, i) => {
            const c = candAt(i)
            if (c === null) return <text key={i} className="ex-missing" x={X(b)} y={Y(lo) - 4} textAnchor="middle">?</text>
            return (
              <g key={i} className={`ex-pt is-${cls[i].replace(" ", "-")} ${sel === i ? "is-sel" : ""}`}
                onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); dragging.current = i; setSel(i) }}>
                <line x1={X(b)} y1={Y(b)} x2={X(b)} y2={Y(c)} />
                <circle cx={X(b)} cy={Y(c)} r={critical.has(i) ? 9 : 7} />
                {critical.has(i) && <circle className="ex-crit" cx={X(b)} cy={Y(c)} r={13} />}
              </g>
            )
          })}
        </svg>
        <div className="ex-avg">
          <p>Average score <b>{baseAvg.toFixed(3)} → {candAvg.toFixed(3)}</b> <span className={candAvg >= baseAvg ? "is-up" : "is-down"}>{candAvg >= baseAvg ? "looks better" : "looks worse"}</span></p>
          <p>Pass rate <b>{passRate.toFixed(2)}</b> · paired regressions <b className={regs ? "is-bad" : ""}>{regs}</b></p>
        </div>
      </div>
      <div className="ex-side">
        <p className="ex-kicker">The one idea</p>
        <h3>Pair each case with <em>itself</em>.</h3>
        <p>The average went up, and the pass rate held. Two cases still broke. AgentGuard compares every case against the same case in the baseline: passed to failed, or a drop of 0.05 or more, is a regression. Drag a dot to change a candidate score.</p>
        <div className="ex-policy">
          <p className="ex-selected">Case {sel + 1}: {BASE[sel].toFixed(2)} → {candAt(sel)?.toFixed(2) ?? "no run"} · <b className={`is-${cls[sel].replace(" ", "-")}`}>{cls[sel]}</b>
            <label><input type="checkbox" checked={critical.has(sel)} onChange={() => setCritical((s) => { const n = new Set(s); if (!n.delete(sel)) n.add(sel); return n })} /> critical</label></p>
          <label>Most regressions allowed <output>{maxReg}</output><input type="range" min={0} max={3} value={maxReg} onChange={(e) => setMaxReg(Number(e.target.value))} /></label>
          <label>Minimum pass rate <output>{minPass.toFixed(2)}</output><input type="range" min={0.5} max={1} step={0.05} value={minPass} onChange={(e) => setMinPass(Number(e.target.value))} /></label>
          <label>Allowed score drop <output>{drop.toFixed(2)}</output><input type="range" min={0} max={0.1} step={0.01} value={drop} onChange={(e) => setDrop(Number(e.target.value))} /></label>
          <label className="ex-check"><input type="checkbox" checked={missing} onChange={(e) => setMissing(e.target.checked)} /> Case 10 never ran on the candidate</label>
          <label className="ex-check"><input type="checkbox" checked={crash} onChange={(e) => setCrash(e.target.checked)} /> A candidate run crashed</label>
        </div>
        <div className={`ex-verdict is-${verdict.toLowerCase()}`} role="status">
          <strong key={verdict}>{verdict}</strong>
          <ul>{reasons.length ? reasons.map(([r]) => <li key={r}>{r}</li>) : <li>Every rule holds and every case is paired.</li>}</ul>
        </div>
        <button type="button" className="ex-reset" onClick={() => { setCand(CAND0); setCritical(new Set()); setMaxReg(0); setMinPass(0.8); setDrop(0); setMissing(false); setCrash(false) }}>Reset</button>
      </div>
    </div>
  )
}

/* ───────────────────────── Course Catalog: where a crash leaves you ───────────────────────── */

const CART = [{ code: "CS101", credits: 3 }, { code: "CS102", credits: 4 }, { code: "CS104", credits: 5 }]
const OPS = [...CART.map((c) => `course ${c.code}.save()`), "student.save()", "delete session.cart"]

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
        <p className="ex-kicker">POST /student/confirm, one operation at a time</p>
        <ol className="ex-ops">
          {OPS.map((op, i) => (
            <li key={op} className={i < at ? "is-done" : "is-lost"}>
              <button type="button" onClick={() => { setAt(i); setRetries(0) }} aria-label={`Crash before ${op}`}>{i === at && <i className="ex-bolt">crash</i>}</button>
              <code>{op}</code>{i < CART.length && <small>runs alongside the other courses</small>}
            </li>
          ))}
          <li className={!crashed ? "is-done" : "is-lost"}><button type="button" onClick={() => { setAt(OPS.length); setRetries(0) }} aria-label="No crash">{!crashed && <i className="ex-bolt is-ok">done</i>}</button><code>redirect</code></li>
        </ol>
        <div className="ex-docs">
          <pre className={state.student === 0 && state.courses.some(Boolean) ? "is-bad" : state.student > CART.length ? "is-bad" : ""}>{`student 42 {\n  enrolledCourses: [${Array.from({ length: state.student }, (_, i) => CART[i % CART.length].code).join(", ")}]\n}`}</pre>
          {CART.map((c, i) => (
            <pre key={c.code} className={state.courses[i] > 1 || (state.courses[i] > 0) !== (state.student > 0) ? "is-bad" : ""}>{`${c.code} {\n  enrolledStudents: [${Array.from({ length: state.courses[i] }, () => "42").join(", ")}]\n}`}</pre>
          ))}
          <p className="ex-cart">session cart: {state.cart ? `[${CART.map((c) => c.code).join(", ")}]` : "empty"}</p>
        </div>
      </div>
      <div className="ex-side">
        <p className="ex-kicker">The one idea</p>
        <h3>Two collections, no <em>transaction</em>.</h3>
        <p>Confirm saves each course first and the student last, as separate writes. Click a step to crash just before it and watch the documents disagree.</p>
        <p>Then try confirming again. The cart is still in the session, and this route, unlike the single-course enroll route, never checks whether the student is already listed.</p>
        <button type="button" className="ex-toggle" onClick={() => setRetries((r) => r + 1)} disabled={!state.cart}>{state.cart ? "Confirm again" : "Cart is empty"}</button>
        <p className={`ex-status ${mismatch ? "is-bad" : "is-good"}`} role="status">{mismatch ? (state.courses.some((n) => n > 1) ? "Duplicates: a course now lists the same student twice." : "The two sides disagree.") : crashed ? "Nothing was written yet." : "Both sides agree."}</p>
        <p className="ex-note">The fix is one transaction around all four writes, plus an already-enrolled check like the one in /student/enroll.</p>
      </div>
    </div>
  )
}
