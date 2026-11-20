"use client"

import { useEffect, useRef, useState } from "react"
import { currentPalette } from "@/components/xp/palette"

// The opening titles: about three and a half seconds of drifting, then accelerating, through the
// stars while a credit line plays, and then the page. Once per visit; any key, click or scroll
// skips it; visitors who prefer reduced motion never see it (the head script hides it first).

const LENGTH = 3400 // ms of travel before the hand-off
const FADE = 650

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const canvas = useRef<HTMLCanvasElement>(null)
  const ended = useRef(false)

  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.intro === "off") { setPhase("gone"); return }
    try { sessionStorage.setItem("xp-intro", "1") } catch { /* storage blocked: it just plays again */ }
    html.classList.add("is-intro")

    const el = canvas.current!
    const ctx = el.getContext("2d")!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0, H = 0
    const fit = () => { W = window.innerWidth; H = window.innerHeight; el.width = W * dpr; el.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    fit()
    window.addEventListener("resize", fit)

    const lamp = currentPalette().lampRgb
    const stars = Array.from({ length: 700 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.9 + 0.1, tint: Math.random() < 0.25 }))
    const t0 = performance.now()
    let frame = 0

    const end = () => {
      if (ended.current) return
      ended.current = true
      window.dispatchEvent(new Event("xp-warp")) // the page's own starfield carries the motion on
      setPhase("leave")
      html.classList.remove("is-intro")
      window.setTimeout(() => setPhase("gone"), FADE)
    }

    const draw = (now: number) => {
      const t = now - t0
      // Speed: a slow drift, then a smooth surge, easing off just before the hand-off.
      const surge = Math.min(1, Math.max(0, (t - 500) / 2100))
      const speed = 0.0018 + 0.05 * surge * surge * surge * (1 - 0.35 * Math.max(0, (t - 2900) / 500))
      ctx.fillStyle = `rgba(5,5,7,${0.55 - 0.35 * surge})` // shorter fade = longer streaks as it speeds up
      ctx.fillRect(0, 0, W, H)
      const f = Math.min(W, H) * 0.6, cx = W / 2, cy = H / 2
      for (const s of stars) {
        const px = cx + (s.x / s.z) * f, py = cy + (s.y / s.z) * f
        s.z -= speed
        if (s.z <= 0.02) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; continue }
        const x = cx + (s.x / s.z) * f, y = cy + (s.y / s.z) * f
        if (x < -50 || x > W + 50 || y < -50 || y > H + 50) { s.z = 1; continue }
        const a = Math.min(1, (1 - s.z) * 1.4)
        ctx.strokeStyle = s.tint ? `rgba(${lamp},${a})` : `rgba(232,236,244,${a})`
        ctx.lineWidth = Math.max(0.6, (1 - s.z) * 2.2)
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke()
      }
      if (t < LENGTH) frame = requestAnimationFrame(draw)
      else end()
    }
    frame = requestAnimationFrame(draw)

    const skip = (e: Event) => { if (e.type === "keydown" && (e as KeyboardEvent).key === "Tab") return; end() }
    window.addEventListener("keydown", skip)
    window.addEventListener("wheel", skip, { passive: true })
    window.addEventListener("touchmove", skip, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", fit)
      window.removeEventListener("keydown", skip)
      window.removeEventListener("wheel", skip)
      window.removeEventListener("touchmove", skip)
      html.classList.remove("is-intro")
    }
  }, [])

  if (phase === "gone") return null
  return (
    <div className={`xp-intro ${phase === "leave" ? "is-leaving" : ""}`} onClick={() => !ended.current && window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))} aria-hidden="true">
      <canvas ref={canvas} />
      <div className="xp-intro-credits">
        <p className="xp-intro-kicker">a portfolio by</p>
        <p className="xp-intro-name">Sai Rithwik Reddy Chirra</p>
        <p className="xp-intro-sub">machine learning systems, and the software around them</p>
      </div>
      <div className="xp-intro-foot">
        <span className="xp-intro-coords">33.42° N, 111.93° W · Tempe</span>
        <span className="xp-intro-skip">press any key to skip</span>
      </div>
      <i className="xp-intro-bar" />
    </div>
  )
}
