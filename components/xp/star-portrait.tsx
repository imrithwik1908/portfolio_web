"use client"

import { useEffect, useRef, useState } from "react"
import { currentPalette } from "@/components/xp/palette"

// The portrait arrives as starlight: a few thousand points sampled from the photograph fly in from
// across the frame, settle into the face, hold for a breath, and then the real photo fades up through them.
// Skipped for reduced motion. The photograph is always underneath, so nothing is lost if this never runs.
export function StarPortrait({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDone(true); return }
    const ctx = el.getContext("2d")!
    let frame = 0, cancelled = false
    const img = new Image()
    img.decoding = "async"
    img.src = src
    // Start only once the portrait is actually on screen (on phones it sits below the fold).
    let io: IntersectionObserver | null = null
    img.onload = () => {
      if (cancelled) return
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io?.disconnect(); run() } }, { threshold: 0.35 })
      io.observe(el)
    }
    const run = () => {
      if (cancelled) return
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) { setDone(true); return }
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      el.width = w * dpr; el.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Draw the photo with the same cover crop as the <img> (object-position 50% 30%) and sample it.
      const off = document.createElement("canvas"); off.width = w; off.height = h
      const o = off.getContext("2d", { willReadFrequently: true })!
      const s = Math.max(w / img.width, h / img.height)
      const dw = img.width * s, dh = img.height * s
      o.drawImage(img, (w - dw) * 0.5, (h - dh) * 0.3, dw, dh)
      const data = o.getImageData(0, 0, w, h).data
      const step = w < 360 ? 4 : 5
      const lamp = currentPalette().lampRgb.split(",").map(Number)
      type P = { x: number; y: number; sx: number; sy: number; r: number; c: string; d: number }
      const pts: P[] = []
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (Math.floor(y) * w + Math.floor(x)) * 4
          const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
          if (lum < 0.08) continue
          const jx = x + (Math.random() - 0.5) * step * 0.6, jy = y + (Math.random() - 0.5) * step * 0.6
          // Tint toward the accent: bright skin and shirt read as starlight, shadows stay dim.
          const mix = 0.55
          const r = Math.round(data[i] * (1 - mix) + lamp[0] * mix * lum + 255 * mix * (1 - lum) * 0.3)
          const g = Math.round(data[i + 1] * (1 - mix) + lamp[1] * mix * lum + 255 * mix * (1 - lum) * 0.3)
          const b = Math.round(data[i + 2] * (1 - mix) + lamp[2] * mix * lum + 255 * mix * (1 - lum) * 0.3)
          const a = Math.min(1, 0.25 + lum * 0.9)
          const ang = Math.random() * Math.PI * 2, dist = (0.7 + Math.random()) * Math.max(w, h)
          pts.push({ x: jx, y: jy, sx: w / 2 + Math.cos(ang) * dist, sy: h * 0.4 + Math.sin(ang) * dist, r: 0.5 + lum * (step * 0.32), c: `rgba(${r},${g},${b},${a.toFixed(2)})`, d: Math.random() * 0.35 })
        }
      }
      const start = performance.now() + (window.scrollY < 40 ? 700 : 0)  // on first load, let the opening letterbox lift first
      const FLY = 1700, HOLD = 900, FADE = 900
      const ease = (t: number) => 1 - Math.pow(1 - t, 4)
      const draw = (now: number) => {
        const t = now - start
        ctx.clearRect(0, 0, w, h)
        const fade = t > FLY + HOLD ? Math.max(0, 1 - (t - FLY - HOLD) / FADE) : 1
        if (t > FLY + HOLD) el.style.opacity = String(fade)
        for (const p of pts) {
          const k = ease(Math.min(1, Math.max(0, (t / FLY - p.d) / (1 - p.d))))
          const x = p.sx + (p.x - p.sx) * k, y = p.sy + (p.y - p.sy) * k
          ctx.fillStyle = p.c
          ctx.beginPath(); ctx.arc(x, y, p.r * (0.6 + 0.4 * k), 0, 6.283); ctx.fill()
        }
        if (t >= FLY + HOLD - 200 && !el.dataset.reveal) { el.dataset.reveal = "1"; el.parentElement?.classList.add("is-revealed") }
        if (fade <= 0) { setDone(true); return }
        frame = requestAnimationFrame(draw)
      }
      el.parentElement?.classList.add("is-starring")
      frame = requestAnimationFrame(draw)
    }
    img.onerror = () => setDone(true)
    return () => { cancelled = true; cancelAnimationFrame(frame); io?.disconnect() }
  }, [src])

  if (done) return null
  return <canvas ref={ref} className="xp-star-portrait" aria-hidden="true" />
}
