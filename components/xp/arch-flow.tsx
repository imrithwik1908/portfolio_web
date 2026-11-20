"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Flow, FlowNode } from "@/lib/flows"

// A small architectural model of the project: blocks on a floor plan, wires under the floor,
// and a narrated walk through it. Drag to turn the model; click a block to jump to its step.
// Steps advance slowly on their own (about nine seconds each) and stop the moment you take over.

const PITCH = (32 * Math.PI) / 180
const STEP_MS = 9000

type Pt = [number, number]

export function ArchFlow({ flow }: { flow: Flow }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [yaw, setYaw] = useState(40)
  const [hover, setHover] = useState<string | null>(null)
  const [t, setT] = useState(0)
  const [progress, setProgress] = useState(0)
  const lifts = useRef<Record<string, number>>({})
  const root = useRef<HTMLDivElement>(null)
  const visible = useRef(false)
  const reduce = useRef(false)
  const startedAt = useRef(0)

  // Space the floor plan out so the wires between blocks stay visible.
  const nodes = useMemo(() => flow.nodes.map((n) => ({ ...n, x: n.x * 1.45, y: n.y * 1.45 })), [flow.nodes])
  const current = flow.steps[step]
  const active = useMemo(() => new Set(current.nodes), [current])
  const activeEdges = useMemo(() => new Set(current.edges.map(([a, b]) => `${a}>${b}`)), [current])

  // One clock drives the packets, the lifting blocks and the step timer; it sleeps off-screen.
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // On narrow screens, turn the long model so it runs down the screen instead of across it.
    if (window.innerWidth < 700) setYaw(66)
    if (reduce.current) setPlaying(false)
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting }, { threshold: 0.2 })
    if (root.current) io.observe(root.current)
    let frame = 0, last = performance.now()
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (!visible.current || document.hidden) { last = now; return }
      const dt = Math.min(64, now - last); last = now
      setT((v) => v + dt)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); io.disconnect() }
  }, [])

  useEffect(() => { startedAt.current = t; setProgress(0) }, [step]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!playing) return
    const p = (t - startedAt.current) / STEP_MS
    setProgress(Math.min(1, p))
    if (p >= 1) setStep((s) => (s + 1) % flow.steps.length)
  }, [t, playing, flow.steps.length])

  const go = useCallback((i: number, stop = true) => {
    setStep((i + flow.steps.length) % flow.steps.length)
    if (stop) setPlaying(false)
  }, [flow.steps.length])

  // Ease each block toward its height: active blocks rise a little.
  for (const n of nodes) {
    const target = active.has(n.id) ? 0.45 : 0
    const cur = lifts.current[n.id] ?? 0
    lifts.current[n.id] = reduce.current ? target : cur + (target - cur) * 0.12
  }

  // Projection: turn the floor plan by yaw around its centre, then tilt it toward the viewer.
  const bounds = useMemo(() => {
    const xs = nodes.flatMap((n) => [n.x, n.x + (n.w ?? 2)])
    const ys = nodes.flatMap((n) => [n.y, n.y + (n.d ?? 2)])
    return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2 }
  }, [nodes])
  const sway = reduce.current || !playing ? 0 : Math.sin(t / 5200) * 3
  const a = ((yaw + sway) * Math.PI) / 180
  const S = 34
  const rot = (x: number, y: number): Pt => {
    const dx = x - bounds.cx, dy = y - bounds.cy
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)]
  }
  const P = (x: number, y: number, z: number): Pt => {
    const [rx, ry] = rot(x, y)
    return [rx * S, ry * S * Math.sin(PITCH) - z * S * Math.cos(PITCH) * 1.25]
  }
  const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")

  const center = (n: FlowNode): Pt => [n.x + (n.w ?? 2) / 2, n.y + (n.d ?? 2) / 2]
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes])

  // Fit the view to everything the projection can produce at this angle.
  const all: Pt[] = nodes.flatMap((n) => {
    const w = n.w ?? 2, d = n.d ?? 2, h = (n.h ?? 1) + 0.6
    return [P(n.x, n.y, 0), P(n.x + w, n.y, 0), P(n.x, n.y + d, 0), P(n.x + w, n.y + d, 0), P(n.x, n.y, h), P(n.x + w, n.y + d, h), P(n.x + w, n.y, h), P(n.x, n.y + d, h)]
  })
  const minX = Math.min(...all.map((p) => p[0])) - 30, maxX = Math.max(...all.map((p) => p[0])) + 30
  const minY = Math.min(...all.map((p) => p[1])) - 34, maxY = Math.max(...all.map((p) => p[1])) + 20

  // Painter's order: far blocks first.
  const order = [...nodes].sort((p, q) => rot(...center(p))[1] - rot(...center(q))[1])

  // Drag to turn.
  const drag = useRef<{ x: number; yaw: number } | null>(null)
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, yaw }; (e.target as Element).setPointerCapture?.(e.pointerId) }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const next = Math.max(8, Math.min(72, drag.current.yaw + (e.clientX - drag.current.x) * 0.25))
    if (Math.abs(next - yaw) > 0.01) { setYaw(next); setPlaying(false) }
  }
  const onUp = () => { drag.current = null }

  const firstStepWith = (id: string) => flow.steps.findIndex((s) => s.nodes.includes(id))
  const shown = hover ? byId[hover] : null

  return (
    <div ref={root} className="af" onKeyDown={(e) => { if (e.key === "ArrowRight") go(step + 1); if (e.key === "ArrowLeft") go(step - 1) }}>
      <div className="af-stage">
        <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} role="img" aria-label={`Architecture model. Step ${step + 1}: ${current.title}`}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          {/* Floor grid */}
          <g className="af-grid">
            {Array.from({ length: 13 }, (_, i) => {
              const x0 = bounds.cx - 18 + i * 3, y0 = bounds.cy - 12, y1 = bounds.cy + 12
              const [ax, ay] = P(x0, y0, 0), [bx, by] = P(x0, y1, 0)
              return <line key={`v${i}`} x1={ax} y1={ay} x2={bx} y2={by} />
            })}
            {Array.from({ length: 9 }, (_, i) => {
              const y0 = bounds.cy - 12 + i * 3, x0 = bounds.cx - 18, x1 = bounds.cx + 18
              const [ax, ay] = P(x0, y0, 0), [bx, by] = P(x1, y0, 0)
              return <line key={`h${i}`} x1={ax} y1={ay} x2={bx} y2={by} />
            })}
          </g>

          {/* Wires under the floor, with packets on the live ones */}
          {flow.edges.map(([from, to]) => {
            const A = center(byId[from]), B = center(byId[to])
            const [ax, ay] = P(A[0], A[1], 0), [bx, by] = P(B[0], B[1], 0)
            const on = activeEdges.has(`${from}>${to}`)
            return (
              <g key={`${from}>${to}`} className={`af-wire ${on ? "is-on" : ""}`}>
                <line x1={ax} y1={ay} x2={bx} y2={by} />
                {on && !reduce.current && [0, 1, 2].map((k) => {
                  const f = ((t / 2200) + k / 3) % 1
                  return <circle key={k} cx={ax + (bx - ax) * f} cy={ay + (by - ay) * f} r={3.2} />
                })}
              </g>
            )
          })}

          {/* Blocks */}
          {order.map((n) => {
            const w = n.w ?? 2, d = n.d ?? 2, lift = lifts.current[n.id] ?? 0
            const z0 = lift, z1 = (n.h ?? 1) + lift
            const c: Pt[] = [[n.x, n.y], [n.x + w, n.y], [n.x + w, n.y + d], [n.x, n.y + d]]
            const top = c.map(([x, y]) => P(x, y, z1))
            const on = active.has(n.id)
            // A side faces us when its outward normal points toward the viewer after the turn.
            const sides = c.map((p, i) => {
              const q = c[(i + 1) % 4]
              const mx = (p[0] + q[0]) / 2 - (n.x + w / 2), my = (p[1] + q[1]) / 2 - (n.y + d / 2)
              const facing = mx * Math.sin(a) + my * Math.cos(a) > 0
              return facing ? { pts: [P(p[0], p[1], z0), P(q[0], q[1], z0), P(q[0], q[1], z1), P(p[0], p[1], z1)], shade: i % 2 } : null
            }).filter(Boolean) as { pts: Pt[]; shade: number }[]
            const [lx, ly] = P(n.x + w / 2, n.y + d / 2, z1)
            const shadow = c.map(([x, y]) => P(x + 0.15, y + 0.15, 0))
            return (
              <g key={n.id} className={`af-block ${on ? "is-on" : ""} ${hover === n.id ? "is-hover" : ""}`}
                onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}
                onClick={() => { const i = firstStepWith(n.id); if (i >= 0) go(i) }}>
                <polygon className="af-shadow" points={pts(shadow)} />
                {sides.map((s, i) => <polygon key={i} className={s.shade ? "af-side-b" : "af-side-a"} points={pts(s.pts)} />)}
                <polygon className="af-top" points={pts(top)} />
                <text x={lx} y={ly - 12} className="af-label">{n.label}</text>
              </g>
            )
          })}
        </svg>
        <p className="af-hint">{shown ? <><b>{shown.label}</b> · <code>{shown.file}</code></> : "Drag to turn the model · click a block"}</p>
      </div>

      <div className="af-panel">
        <p className="af-count"><span>{String(step + 1).padStart(2, "0")}</span> / {String(flow.steps.length).padStart(2, "0")}</p>
        <h3 key={`h${step}`}>{current.title}</h3>
        <p key={`b${step}`} className="af-body">{current.body}</p>
        <p className="af-file"><code>{current.file}</code></p>
        <div className="af-controls">
          <button type="button" onClick={() => go(step - 1)} aria-label="Previous step">←</button>
          <button type="button" className="af-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause the walkthrough" : "Play the walkthrough"}>{playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={() => go(step + 1)} aria-label="Next step">→</button>
        </div>
        <ol className="af-dots" aria-label="Steps">
          {flow.steps.map((s, i) => (
            <li key={s.title}>
              <button type="button" onClick={() => go(i)} aria-label={`Step ${i + 1}: ${s.title}`} aria-current={i === step ? "step" : undefined} className={i === step ? "is-on" : i < step ? "is-done" : undefined}>
                {i === step && playing && <i style={{ transform: `scaleX(${progress})` }} />}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
