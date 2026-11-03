"use client"

import { useEffect, useRef, useState } from "react"

// A project's architecture as a running pipeline: a packet moves stage to stage while the diagram is
// on screen; pointing at (or focusing) a stage stops it there and shows what that stage does.
export function Pipeline({ nodes, label }: { nodes: { label: string; detail: string }[]; label: string }) {
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  const [visible, setVisible] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = root.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (held || !visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setTimeout(() => setActive((i) => (i + 1) % nodes.length), 1500)
    return () => window.clearTimeout(id)
  }, [active, held, visible, nodes.length])

  return (
    <div ref={root} className="xp-pipe" aria-label={label} onMouseLeave={() => setHeld(false)}>
      <ol className="xp-pipe-track" style={{ "--n": nodes.length } as React.CSSProperties}>
        {nodes.map((n, i) => (
          <li key={n.label} className={`${i === active ? "is-active" : ""} ${i < active ? "is-past" : ""}`}>
            <button type="button" onMouseEnter={() => { setHeld(true); setActive(i) }} onFocus={() => { setHeld(true); setActive(i) }} onBlur={() => setHeld(false)} onClick={() => { setHeld(true); setActive(i) }} aria-pressed={i === active}>
              <span className="xp-pipe-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="xp-pipe-label">{n.label}</span>
            </button>
            {i < nodes.length - 1 && <span className="xp-pipe-wire" aria-hidden="true"><i /></span>}
          </li>
        ))}
      </ol>
      <p className="xp-pipe-detail" aria-live="polite" key={active}>
        <strong>{nodes[active].label}</strong>{nodes[active].detail}
      </p>
    </div>
  )
}
