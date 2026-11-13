"use client"

import { useEffect, useRef, useState } from "react"

// A pen mark drawn by hand over a phrase: an underline or a loose circle, drawn in once when it scrolls into view.
const PATHS = {
  under: "M2 8 C 30 3, 60 10, 98 5",
  circle: "M52 4 C 20 2, 3 14, 4 26 C 6 42, 40 47, 70 44 C 94 41, 99 22, 88 12 C 78 3, 52 2, 38 6",
}

export function Mark({ kind = "under", children }: { kind?: keyof typeof PATHS; children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setDrawn(true); io.disconnect() } }, { threshold: 1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <span ref={ref} className={`xp-mark-hand is-${kind} ${drawn ? "is-drawn" : ""}`}>
      {children}
      <svg viewBox={kind === "under" ? "0 0 100 12" : "0 0 100 48"} preserveAspectRatio="none" aria-hidden="true">
        <path d={PATHS[kind]} pathLength={1} vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  )
}
