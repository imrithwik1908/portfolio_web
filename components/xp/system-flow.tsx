"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Flow, Packet } from "@/lib/flows"

// A system-design explainer: the real components on a flat board, a token carrying the step's data
// along the live connections, and a packet inspector showing exactly what that data looks like.
// Steps advance on their own, slowly; any click takes over.

const SX = 64, SY = 60, BW = 156, BH = 58, PAD = 26
const STEP_MS = 11000
const EDGE_MS = 1300

type Box = { id: string; label: string; role: string; file: string; x: number; y: number }

function clipToBox(cx: number, cy: number, tx: number, ty: number) {
  // Where the line from a box's centre toward (tx, ty) leaves the box.
  const dx = tx - cx, dy = ty - cy
  const k = Math.min(Math.abs((BW / 2 + 6) / (dx || 1e-6)), Math.abs((BH / 2 + 6) / (dy || 1e-6)))
  return [cx + dx * Math.min(1, k), cy + dy * Math.min(1, k)]
}

export function SystemFlow({ flow, packets }: { flow: Flow; packets: Packet[] }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(0)
  const startedAt = useRef(0)
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const visible = useRef(false)
  const [reduce, setReduce] = useState(false)

  const boxes: Box[] = useMemo(() => flow.nodes.map((n) => ({ id: n.id, label: n.label, role: n.role, file: n.file, x: PAD + n.x * SX, y: PAD + n.y * SY })), [flow.nodes])
  const byId = useMemo(() => Object.fromEntries(boxes.map((b) => [b.id, b])), [boxes])
  const W = Math.max(...boxes.map((b) => b.x)) + BW + PAD
  const H = Math.max(...boxes.map((b) => b.y)) + BH + PAD

  const current = flow.steps[step]
  const packet = packets[step]
  const active = useMemo(() => new Set(current.nodes), [current])
  const live = current.edges

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setReduce(r)
    if (r) setPlaying(false)
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting }, { threshold: 0.25 })
    if (root.current) io.observe(root.current)
    let frame = 0, last = performance.now()
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (!visible.current || document.hidden) { last = now; return }
      setT((v) => v + Math.min(64, now - last)); last = now
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); io.disconnect() }
  }, [])

  useEffect(() => { startedAt.current = t }, [step]) // eslint-disable-line react-hooks/exhaustive-deps
  const elapsed = t - startedAt.current
  useEffect(() => {
    if (playing && elapsed >= STEP_MS) setStep((s) => (s + 1) % flow.steps.length)
  }, [elapsed, playing, flow.steps.length])

  // Keep the active part of the board in view on narrow screens, where the board scrolls sideways.
  useEffect(() => {
    const el = canvas.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const xs = current.nodes.map((id) => byId[id]?.x ?? 0)
    const mid = (Math.min(...xs) + Math.max(...xs) + BW) / 2
    const scale = el.scrollWidth / W
    el.scrollTo({ left: mid * scale - el.clientWidth / 2, behavior: "smooth" })
  }, [step, current.nodes, byId, W])

  const go = (i: number) => { setStep((i + flow.steps.length) % flow.steps.length); setPlaying(false) }

  // The token walks the live edges one after another, then starts again.
  let token: { x: number; y: number; o: number } | null = null
  if (live.length && !reduce) {
    const total = live.length * EDGE_MS
    const at = elapsed % (total + 600)
    const i = Math.min(live.length - 1, Math.floor(at / EDGE_MS))
    const f = Math.min(1, (at - i * EDGE_MS) / EDGE_MS)
    const e = f * f * (3 - 2 * f)
    const A = byId[live[i][0]], B = byId[live[i][1]]
    if (A && B && at < total) {
      const [x1, y1] = clipToBox(A.x + BW / 2, A.y + BH / 2, B.x + BW / 2, B.y + BH / 2)
      const [x2, y2] = clipToBox(B.x + BW / 2, B.y + BH / 2, A.x + BW / 2, A.y + BH / 2)
      token = { x: x1 + (x2 - x1) * e, y: y1 + (y2 - y1) * e, o: Math.min(1, f * 6, (1 - f) * 6) }
    }
  }
  const progress = playing ? Math.min(1, elapsed / STEP_MS) : 0

  return (
    <div ref={root} className="sf">
      <div ref={canvas} className="sf-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 860) }} role="img" aria-label={`System diagram, step ${step + 1}: ${current.title}`}>
          <defs>
            <marker id="sf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" className="sf-arrowhead" /></marker>
            <marker id="sf-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" className="sf-arrowhead is-on" /></marker>
            <pattern id="sf-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" className="sf-dot" /></pattern>
          </defs>
          <rect width={W} height={H} fill="url(#sf-dots)" />
          {flow.edges.map(([a, b]) => {
            const A = byId[a], B = byId[b]
            const on = live.some(([x, y]) => x === a && y === b)
            const [x1, y1] = clipToBox(A.x + BW / 2, A.y + BH / 2, B.x + BW / 2, B.y + BH / 2)
            const [x2, y2] = clipToBox(B.x + BW / 2, B.y + BH / 2, A.x + BW / 2, A.y + BH / 2)
            return <line key={`${a}>${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className={`sf-edge ${on ? "is-on" : ""}`} markerEnd={`url(#${on ? "sf-arrow-on" : "sf-arrow"})`} />
          })}
          {boxes.map((b) => {
            const on = active.has(b.id)
            return (
              <g key={b.id} className={`sf-node ${on ? "is-on" : ""}`} onClick={() => { const i = flow.steps.findIndex((s) => s.nodes.includes(b.id)); if (i >= 0) go(i) }}>
                <rect x={b.x} y={b.y} width={BW} height={BH} rx={12} />
                <title>{b.file}</title>
                <text x={b.x + 14} y={b.y + 25} className="sf-label">{b.label}</text>
                <text x={b.x + 14} y={b.y + 43} className="sf-role">{b.role}</text>
              </g>
            )
          })}
          {token && (
            <g className="sf-token" transform={`translate(${token.x} ${token.y})`} style={{ opacity: token.o }}>
              <circle r={11} className="sf-token-glow" />
              <circle r={5} />
            </g>
          )}
        </svg>
      </div>

      <div className="sf-panel">
        <div className="sf-story">
          <p className="sf-count"><span>{String(step + 1).padStart(2, "0")}</span> / {String(flow.steps.length).padStart(2, "0")}</p>
          <h3 key={`t${step}`}>{current.title}</h3>
          <p key={`b${step}`} className="sf-body">{current.body}</p>
          <div className="sf-controls">
            <button type="button" onClick={() => go(step - 1)} aria-label="Previous step">←</button>
            <button type="button" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</button>
            <button type="button" onClick={() => go(step + 1)} aria-label="Next step">→</button>
          </div>
          <ol className="sf-dots" aria-label="Steps">
            {flow.steps.map((s, i) => (
              <li key={s.title}><button type="button" aria-label={`Step ${i + 1}: ${s.title}`} aria-current={i === step ? "step" : undefined} className={i === step ? "is-on" : i < step ? "is-done" : undefined} onClick={() => go(i)}>{i === step && <i style={{ transform: `scaleX(${playing ? progress : 1})` }} />}</button></li>
            ))}
          </ol>
        </div>
        <figure className="sf-packet" key={`p${step}`}>
          <figcaption><span className="sf-pill">{packet.token}</span>What&apos;s moving</figcaption>
          <p className="sf-carries">{packet.carries}</p>
          <dl>
            {packet.parts.map(([k, v], i) => <div key={k} style={{ "--i": i } as React.CSSProperties}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {packet.like && <p className="sf-like">{packet.like}</p>}
          <p className="sf-src">In the repo: {current.file}</p>
        </figure>
      </div>
    </div>
  )
}
