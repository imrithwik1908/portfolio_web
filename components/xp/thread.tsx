"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { currentPalette } from "@/components/xp/palette"

// "Where I've worked", told by one line of light. The section pins and the scroll reshapes a single
// glowing thread, the same thin light as the planet's rim in the opening:
//   IIT Indore   the line reads: it rises under the words that justify a label
//   Blackcoffer  the line predicts: it unrolls into a time series, runs past the data, and the
//                band of uncertainty around the forecast tightens
//   Now (ASU)    the line decides: it splits into the old and the new version, one case breaks
//                away, and the two meet at a gate that returns its verdict
// Facts come from the résumé and the AgentGuard / X-MuTeST repositories; every bullet that used to
// be here is one click away under "The details". The reading scene uses a neutral, made-up review so the
// idea (a label has to point at the words behind it) lands without any offensive example on screen.

type Scene = {
  id: string; when: string; place: string; role: string; title: string; org: string; stack: string[]; question: string; line: string
  stats: [string, string][]; did: string[]; results: string[]; link?: { href: string; label: string }
}

const SCENES: Scene[] = [
  {
    id: "indore", when: "Apr – Nov 2024", place: "IIT Indore", role: "Summer Research Intern · AI/ML",
    title: "Research Intern, AI/ML", org: "IIT Indore",
    stack: ["PyTorch", "MuRIL", "XLM-R", "LLaMA 3.1", "Attention supervision", "Token-F1 · IOU-F1"],
    question: "Which words actually support the label?",
    line: "Hate-speech detection in English, Hindi and Telugu that has to point at the words behind its answer.",
    stats: [["AAAI", "2026 paper"], ["−20%", "inference latency"]],
    did: [
      "Trained with two-stage attention supervision: human rationales first, then n-gram perturbation scores that measure how predictions shift",
      "Chose the encoder per language from validation results (MuRIL for English and Telugu, XLM-R for Hindi) and merged model rationales with LLaMA 3.1 suggestions",
      "Evaluated explanations for plausibility (Token-F1, IOU-F1) and faithfulness (comprehensiveness, sufficiency), not just accuracy",
    ],
    results: ["Cut inference latency by 20% across pipeline iterations", "Published at AAAI 2026"],
    link: { href: "/projects/x-mutest", label: "X-MuTeST" },
  },
  {
    id: "blackcoffer", when: "Dec 2024 – May 2025", place: "Blackcoffer", role: "Data Science Associate · India",
    title: "Data Science Associate", org: "Blackcoffer · India",
    stack: ["Python", "Time-series forecasting", "Feature engineering", "Model validation"],
    question: "What can this data actually support?",
    line: "Two forecasting problems that arrived as business questions, with no clean benchmark to lean on.",
    stats: [["+18%", "accuracy over the earlier method"], ["$142", "mean daily ad-revenue error"]],
    did: [
      "Built time-series models in Python on a 40K+ record dataset of shoppers' paths through a mall, and validated them against the approach already in use",
      "Did the preprocessing and feature engineering to make the data trustworthy before modelling, and kept the pipeline reproducible",
      "Forecast daily digital-ad revenue, and traced the remaining error back to three patterns in user behaviour",
    ],
    results: ["Trajectory forecasts 18% more accurate than the earlier method, 82% overall", "Ad-revenue mean daily error down to $142, which freed about 15% of the marketing budget to be reallocated"],
  },
  {
    id: "now", when: "2025 – present", place: "Arizona State", role: "M.S. Computer Science · building AgentGuard",
    title: "Building AgentGuard", org: "M.S. Computer Science · Arizona State",
    stack: ["Python SDK", "FastAPI", "PostgreSQL", "Redis / ARQ", "Next.js", "LLM evaluation"],
    question: "What changed, and is it safe to release?",
    line: "A release gate that tells you which cases a new LLM version broke, not just whether the average moved.",
    stats: [["13", "checks on every run"], ["0", "LLM votes in the final call"]],
    did: [
      "A Python SDK that captures runs and nested spans, and fails open so it can never take down the app it instruments",
      "A FastAPI service that ingests each trace in one transaction into PostgreSQL, with evaluation pushed to Redis / ARQ workers off the request path",
      "Pairing logic that compares the same case and evaluator across versions, and a policy engine that returns PASS, BLOCK or REVIEW with reasons, never an LLM's opinion",
    ],
    results: ["Found and fixed a comparison bug where older runs leaked into current results, by scoping pairs to the latest finished job", "Integration tests cover atomic ingestion, workspace isolation, pairing and release policy"],
    link: { href: "/projects/agentguard", label: "AgentGuard" },
  },
]

const WORDS = ["the", "review", "praised", "the", "battery", "but", "hated", "the", "screen"]
// How strongly each word supports the label "negative": the line rises under these, with the weight shown.
const RATIONALE: Record<number, number> = { 6: 1, 8: 0.72, 2: 0.18 } // hated, screen, (praised, weakly)
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

// The question decodes in, letter by letter, whenever a scene arrives.
function Decoded({ text }: { text: string }) {
  const [shown, setShown] = useState(text)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(text); return }
    const start = performance.now()
    let frame = 0, last = 0
    const step = (now: number) => {
      frame = requestAnimationFrame(step)
      if (now - last < 50) return
      last = now
      const settled = Math.floor((now - start) / 26)
      setShown(Array.from(text, (ch, i) => (i < settled || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""))
      if (settled >= text.length) cancelAnimationFrame(frame)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [text])
  return <>{shown}</>
}

function Count({ value, k }: { value: string; k: number }) {
  const m = value.match(/^([^0-9]*)([0-9]+)(.*)$/)
  if (!m) return <>{value}</>
  return <>{m[1]}{Math.round(Number(m[2]) * k)}{m[3]}</>
}

export function Thread() {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sentence = useRef<HTMLParagraphElement>(null)
  const prog = useRef(0)
  const [p, setP] = useState(0)
  const [still, setStill] = useState(false)
  const [details, setDetails] = useState(false)

  // Scroll → progress through the pinned section.
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    let raf = 0
    const update = () => {
      raf = 0
      const el = root.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const v = clamp(-r.top / Math.max(1, r.height - window.innerHeight))
      prog.current = v
      setP(v)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])

  // The line itself, drawn every frame while the section is on screen.
  useEffect(() => {
    const el = canvas.current
    if (!el || still) return
    const ctx = el.getContext("2d")!
    let W = 0, H = 0, frame = 0, visible = false, shown = 0
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = el.clientWidth; H = el.clientHeight
      el.width = W * dpr; el.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { rootMargin: "200px" }); io.observe(el)
    const N = 260
    const xs = Array.from({ length: N }, (_, i) => i / (N - 1))
    // A deterministic, slightly irregular history for the forecast scene.
    const hist = (x: number) => Math.sin(x * 15) * 0.32 + Math.sin(x * 37 + 1.3) * 0.14 + Math.sin(x * 83 + 0.4) * 0.06 + (x - 0.5) * 0.5

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      if (!visible) return
      const v = prog.current
      // Scene weights, cross-fading around the boundaries.
      const toB = smooth(span(v, 0.27, 0.39)), toC = smooth(span(v, 0.6, 0.72))
      const wA = 1 - toB, wB = toB * (1 - toC), wC = toC
      const a = span(v, 0.02, 0.27), b = span(v, 0.39, 0.6), c = span(v, 0.72, 0.96)
      shown += (Math.min(1, v / 0.05 + 0.15) - shown) * 0.08
      const lamp = currentPalette().lampRgb
      ctx.clearRect(0, 0, W, H)
      const mid = H * 0.56, amp = Math.min(H * 0.22, 150)
      const left = W * 0.06, right = W * 0.94, wide = right - left

      // Camera: each scene gets a slow push-in that settles as it completes, like a dolly on the line.
      const sceneK = wA * a + wB * b + wC * c
      const zoom = 1 + 0.035 * Math.sin(Math.PI * Math.min(1, sceneK))
      ctx.save(); ctx.translate(W / 2, mid); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -mid)
      // An instrument floor: a faint perspective grid under the line, like the bench it's measured on.
      const vpX = W / 2, vpY = mid - amp * 0.25, floorTop = mid + amp * 1.25
      ctx.strokeStyle = "rgba(226,230,238,0.045)"; ctx.lineWidth = 1
      for (let k = 0; k < 7; k++) { const y = floorTop + (k * k) * 5.5; if (y > H) break; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let k = -8; k <= 8; k++) {
        const xb = vpX + k * W * 0.09
        ctx.beginPath(); ctx.moveTo(lerp(vpX, xb, (floorTop - vpY) / (H - vpY)), floorTop); ctx.lineTo(xb, H); ctx.stroke()
      }
      ctx.font = "10px ui-monospace, monospace"; ctx.textAlign = "center"

      // Word positions for the "reading" shape, measured from the sentence on screen.
      const bumps: [number, number][] = []
      if (sentence.current && wA > 0.01) {
        const box = el.getBoundingClientRect()
        Array.from(sentence.current.children).forEach((w, i) => {
          if (!(i in RATIONALE)) return
          const r = (w as HTMLElement).getBoundingClientRect()
          bumps.push([(r.left + r.width / 2 - box.left - left) / wide, RATIONALE[i] * smooth(span(a, 0.15 + i * 0.03, 0.55 + i * 0.03))])
        })
      }
      const yA = (x: number) => {
        let y = 0
        for (const [bx, h] of bumps) y -= h * Math.exp(-((x - bx) ** 2) / 0.0022) * 0.9
        return y + Math.sin(x * 40 + now / 900) * 0.006
      }
      const reach = lerp(0.55, 0.64, b) // where the known data ends and the forecast begins
      const yB = (x: number) => (x <= reach ? hist(x) : hist(reach) + (x - reach) * 0.6 + Math.sin((x - reach) * 9) * 0.05)
      const brk = smooth(span(c, 0.2, 0.55))   // the case that breaks
      const gate = smooth(span(c, 0.45, 0.85)) // the two versions converge on the gate
      const yC = (x: number, second: boolean) => {
        const sep = second ? 0.2 : -0.2
        const converge = 1 - smooth(span(x, 0.6, 0.86)) * gate
        const dip = second ? -0.55 * brk * Math.exp(-((x - 0.48) ** 2) / 0.0016) : 0
        return sep * converge * (0.4 + 0.6 * c) + dip + Math.sin(x * 11 + (second ? 0.6 : 0)) * 0.05
      }

      const path = (fy: (x: number) => number, upto = 1) => {
        ctx.beginPath()
        for (let i = 0; i < N; i++) {
          const x = xs[i]
          if (x > upto) break
          const X = left + x * wide, Y = mid + fy(x) * amp
          if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y)
        }
      }
      const glow = (alpha = 1, upto = 1, fy: (x: number) => number, rgb: string = lamp) => {
        for (const [lw, al] of [[9, 0.06], [3.5, 0.22], [1.3, 0.95]] as const) {
          path(fy, upto); ctx.strokeStyle = `rgba(${rgb},${al * alpha})`; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke()
        }
      }
      const main = (x: number) => wA * yA(x) + wB * yB(x) + wC * yC(x, false)

      // Forecast band: the uncertainty around the prediction, tightening as the scene plays.
      if (wB > 0.01) {
        const w0 = lerp(0.42, 0.12, smooth(b))
        ctx.beginPath()
        for (let i = 0; i < N; i++) { const x = xs[i]; if (x < reach) continue; const d = (x - reach) / (1 - reach); ctx.lineTo(left + x * wide, mid + (main(x) - w0 * d) * amp) }
        for (let i = N - 1; i >= 0; i--) { const x = xs[i]; if (x < reach) break; const d = (x - reach) / (1 - reach); ctx.lineTo(left + x * wide, mid + (main(x) + w0 * d) * amp) }
        ctx.closePath(); ctx.fillStyle = `rgba(${lamp},${0.09 * wB})`; ctx.fill()
        const X = left + reach * wide
        ctx.strokeStyle = `rgba(226,230,238,${0.18 * wB})`; ctx.lineWidth = 1; ctx.setLineDash([2, 5])
        ctx.beginPath(); ctx.moveTo(X, mid - amp * 1.1); ctx.lineTo(X, mid + amp * 1.1); ctx.stroke(); ctx.setLineDash([])
      }
      // The second version of the app, appearing beside the first and peeling away where a case breaks.
      // The candidate in cool white, so the two versions read apart at a glance.
      if (wC > 0.01) glow(wC * (0.6 + 0.4 * c), shown, (x) => yC(x, true), "196,212,240")
      glow(1, shown, main)

      // Reading: each rise is labelled with how strongly that word supports the label (illustrative).
      if (wA > 0.05) for (const [bx, h] of bumps) {
        if (h < 0.08) continue
        const X = left + bx * wide, Y = mid + yA(bx) * amp - 14
        ctx.fillStyle = `rgba(226,230,238,${0.6 * wA * Math.min(1, h * 2)})`; ctx.fillText((h * 0.91).toFixed(2), X, Y)
      }
      // Predicting: where the data stops, and what the shaded band means.
      if (wB > 0.05) {
        ctx.fillStyle = `rgba(226,230,238,${0.45 * wB})`
        ctx.fillText("t₀", left + reach * wide, mid - amp * 1.18)
        ctx.textAlign = "right"; ctx.fillText("error band", right, mid + (main(1) + lerp(0.42, 0.12, smooth(b))) * amp + 16); ctx.textAlign = "center"
      }
      // Deciding: the same test cases on both versions, paired; one fails in the candidate.
      if (wC > 0.05) {
        for (let i = 0; i < 9; i++) {
          const x = 0.1 + i * 0.09, X = left + x * wide
          const y1 = mid + main(x) * amp, y2 = mid + yC(x, true) * amp
          ctx.strokeStyle = `rgba(226,230,238,${0.1 * wC})`; ctx.beginPath(); ctx.moveTo(X, y1); ctx.lineTo(X, y2); ctx.stroke()
          ctx.fillStyle = `rgba(${lamp},${0.9 * wC})`; ctx.beginPath(); ctx.arc(X, y1, 2.2, 0, 6.283); ctx.fill()
          const broke = i === 4 && brk > 0.3
          ctx.fillStyle = broke ? `rgba(255,120,100,${wC})` : `rgba(196,212,240,${0.9 * wC})`; ctx.beginPath(); ctx.arc(X, y2, broke ? 3 : 2.2, 0, 6.283); ctx.fill()
          if (broke) {
            ctx.strokeStyle = `rgba(255,120,100,${0.7 * wC * brk})`; ctx.beginPath(); ctx.arc(X, y2, 8 + 2 * Math.sin(now / 300), 0, 6.283); ctx.stroke()
            ctx.fillStyle = `rgba(255,170,160,${0.8 * wC * brk})`; ctx.fillText("case 5 · pass → fail", X, y2 - 16)
          }
        }
      }
      // The gate: two short posts the paths have to pass between.
      if (wC > 0.01) {
        const X = left + 0.9 * wide, gap = amp * lerp(0.4, 0.13, gate)
        ctx.strokeStyle = `rgba(226,230,238,${0.5 * wC * c})`; ctx.lineWidth = 1.5
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X, mid + s * gap); ctx.lineTo(X, mid + s * (gap + amp * 0.35)); ctx.stroke() }
        ctx.fillStyle = `rgba(226,230,238,${0.45 * wC * c})`; ctx.fillText("release gate", X, mid - gap - amp * 0.35 - 10)
      }
      // A photon running along the line, so the light is always alive.
      const u = ((now / 3400) % 1) * shown
      const PX = left + u * wide, PY = mid + main(u) * amp
      // As the line changes shape, the photon flares, as if the light itself is doing the rewriting.
      const flare = Math.sin(Math.PI * toB) + Math.sin(Math.PI * toC)
      const pr = 18 * (1 + 1.4 * flare)
      const g = ctx.createRadialGradient(PX, PY, 0, PX, PY, pr)
      g.addColorStop(0, `rgba(255,248,236,0.9)`); g.addColorStop(0.2, `rgba(${lamp},${0.35 + 0.2 * flare})`); g.addColorStop(1, `rgba(${lamp},0)`)
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(PX, PY, pr, 0, 6.283); ctx.fill()
      ctx.restore()
    }
    frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); ro.disconnect(); io.disconnect() }
  }, [still])

  useEffect(() => { setDetails(false) }, [Math.min(2, Math.floor(p * 3))]) // eslint-disable-line react-hooks/exhaustive-deps

  if (still) {
    return (
      <div className="xp-thread-still">
        {SCENES.map((s) => (
          <article key={s.id}>
            <p className="xp-thread-when">{s.when}</p>
            <h3>{s.title}</h3>
            <p className="xp-thread-role">{s.org}</p>
            <p className="xp-thread-q">“{s.question}”</p>
            <p className="xp-thread-line">{s.line}</p>
            <ul>{[...s.did, ...s.results].map((d) => <li key={d}>{d}</li>)}</ul>
          </article>
        ))}
      </div>
    )
  }

  const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2
  const s = SCENES[idx]
  const local = idx === 0 ? span(p, 0.02, 0.27) : idx === 1 ? span(p, 0.39, 0.6) : span(p, 0.72, 0.96)
  const enter = idx === 0 ? 1 : idx === 1 ? smooth(span(p, 0.33, 0.4)) : smooth(span(p, 0.66, 0.73))
  const leave = idx === 2 ? 0 : smooth(span(p, idx === 0 ? 0.27 : 0.6, idx === 0 ? 0.33 : 0.66))
  const vis = enter * (1 - leave)
  const verdict = idx === 2 ? smooth(span(local, 0.7, 0.95)) : 0

  return (
    <div ref={root} className="xp-thread">
      <div className="xp-thread-stage">
        <canvas ref={canvas} className="xp-thread-canvas" aria-hidden="true" />

        <header className="xp-thread-head" key={s.id} style={{ opacity: vis, transform: `translateY(${(1 - vis) * 14}px)`, filter: `blur(${(1 - vis) * 6}px)` }}>
          <p className="xp-thread-when">{s.when}<span>{s.org}</span></p>
          <h3>{s.title}</h3>
          <p className="xp-thread-q">“<Decoded text={s.question} />”</p>
        </header>

        {idx === 0 && (
          <p ref={sentence} className="xp-thread-sentence" aria-label="A sample review: the review praised the battery but hated the screen. Label: negative, because of hated and screen." style={{ opacity: vis }}>
            {WORDS.map((w, i) => <span key={w + i} className={RATIONALE[i] >= 0.5 && local > 0.3 + i * 0.03 ? "is-lit" : undefined}>{w}</span>)}
          </p>
        )}
        {idx === 0 && (
          <p className="xp-thread-chip" style={{ opacity: vis * smooth(span(local, 0.55, 0.8)) }}>
            label <b>negative</b> <i>because</i> <b>hated</b> · <b>screen</b>
          </p>
        )}
        {idx === 2 && (
          <>
            <p className="xp-thread-label is-versions" style={{ opacity: vis * 0.75 }}><span className="is-base">baseline</span><span className="is-cand">candidate</span></p>
            <p className="xp-thread-verdict" style={{ opacity: verdict, transform: `scale(${lerp(1.08, 1, verdict)})`, filter: `blur(${(1 - verdict) * 5}px)` }}>
              <b>BLOCK</b><small>1 case broke · policy allows 0</small>
            </p>
          </>
        )}

        <footer className="xp-thread-foot" key={`f${s.id}`} style={{ opacity: vis }}>
          <div className="xp-thread-text">
            <p className="xp-thread-line">{s.line}</p>
            <ul className="xp-thread-stack" aria-label="Tools">{s.stack.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <dl className="xp-thread-stats">
            {s.stats.map(([n, l]) => <div key={l}><dt><Count value={n} k={smooth(clamp(local * 1.6))} /></dt><dd>{l}</dd></div>)}
          </dl>
          <div className="xp-thread-actions">
            <button type="button" className="xp-thread-more" aria-expanded={details} onClick={() => setDetails((d) => !d)}>{details ? "Close" : "How I did it"}</button>
            {s.link && <Link href={s.link.href} className="xp-link">{s.link.label} <Arrow /></Link>}
          </div>
        </footer>

        <aside className={`xp-thread-details ${details ? "is-open" : ""}`} aria-hidden={!details}>
          <p className="xp-thread-when">What I did</p>
          <ul>{s.did.map((d) => <li key={d}>{d}</li>)}</ul>
          <p className="xp-thread-when">What came of it</p>
          <ul>{s.results.map((d) => <li key={d}>{d}</li>)}</ul>
        </aside>

        <p className="xp-thread-count" aria-hidden="true"><span>{String(idx + 1).padStart(2, "0")}</span> / {String(SCENES.length).padStart(2, "0")}</p>
      </div>
    </div>
  )
}
