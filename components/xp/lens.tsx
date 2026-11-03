"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// The site's signature: a surface with a second layer beneath it. On fine pointers a circular
// lens follows the cursor and shows what's underneath; anywhere, the toggle opens it fully.
export function Lens({ surface, beneath, radius = 130, className = "", toggleLabel }: {
  surface: React.ReactNode
  beneath: React.ReactNode
  radius?: number
  className?: string
  toggleLabel?: [string, string]
}) {
  const box = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const state = useRef({ x: 0, y: 0, r: 0, target: 0 })
  const frame = useRef(0)

  const paint = useCallback(() => {
    const node = box.current
    if (!node) return
    const s = state.current
    node.style.setProperty("--lx", `${s.x}px`)
    node.style.setProperty("--ly", `${s.y}px`)
    node.style.setProperty("--lr", `${s.r}px`)
  }, [])

  // Eases the radius toward its target, one frame at a time.
  const kick = useCallback(() => {
    if (frame.current) return
    const step = () => {
      const s = state.current
      s.r += (s.target - s.r) * 0.16
      if (Math.abs(s.target - s.r) > 0.5) { paint(); frame.current = requestAnimationFrame(step) }
      else { s.r = s.target; paint(); frame.current = 0 }
    }
    frame.current = requestAnimationFrame(step)
  }, [paint])

  useEffect(() => () => { cancelAnimationFrame(frame.current); frame.current = 0 }, [])

  // Fully open: a circle large enough to cover the box, grown from its centre.
  useEffect(() => {
    const node = box.current
    if (!node) return
    const s = state.current
    if (open) {
      s.x = node.clientWidth / 2
      s.y = node.clientHeight / 2
      s.target = Math.hypot(node.clientWidth, node.clientHeight)
    } else s.target = 0
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { s.r = s.target; paint() } else kick()
  }, [open, kick, paint])

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || open) return
    const rect = event.currentTarget.getBoundingClientRect()
    state.current.x = event.clientX - rect.left
    state.current.y = event.clientY - rect.top
    state.current.target = radius
    paint()
    kick()
  }
  const onLeave = () => { if (!open) { state.current.target = 0; kick() } }

  return (
    <div className={`xp-lens ${open ? "is-open" : ""} ${className}`}>
      <div ref={box} className="xp-lens-box" onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="xp-lens-surface">{surface}</div>
        <div className="xp-lens-beneath" aria-hidden={!open}>{beneath}</div>
        <span className="xp-lens-ring" aria-hidden="true" />
      </div>
      {toggleLabel && (
        <button type="button" className="xp-lens-toggle" aria-pressed={open} onClick={() => setOpen((v) => !v)}>
          <span className="xp-eye" aria-hidden="true" />{open ? toggleLabel[1] : toggleLabel[0]}
        </button>
      )}
    </div>
  )
}
