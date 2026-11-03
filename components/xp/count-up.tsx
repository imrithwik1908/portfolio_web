"use client"

import { useEffect, useState } from "react"

// Counts from zero to `value` once `run` turns true, keeping the original formatting.
export function CountUp({ value, run, decimals = 0, suffix = "" }: { value: number; run: boolean; decimals?: number; suffix?: string }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!run) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(value)
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100)
      setShown(value * (1 - (1 - t) ** 3))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [run, value])
  return <>{shown.toFixed(decimals)}{suffix}</>
}
