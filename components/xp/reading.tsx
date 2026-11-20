"use client"

import { useEffect, useRef } from "react"

// A hairline across the top of a case study that fills as you read.
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      bar.current?.style.setProperty("--read", String(max > 0 ? Math.min(1, window.scrollY / max) : 0))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])
  return <div ref={bar} className="xp-progress" aria-hidden="true" />
}
