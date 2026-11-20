"use client"

import { useEffect, useRef, useState } from "react"

// The opening: five quiet seconds in space. Sparse grey stars drift almost imperceptibly toward
// you, one line of text breathes in and out, and the page fades up. Once per visit; any key,
// click or scroll skips it; visitors who prefer reduced motion never see it.

const LENGTH = 4200 // ms before the fade to the page begins
const FADE = 900
const NAME = "SAI RITHWIK REDDY CHIRRA"
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DECODE_AT = 1000, PER_LETTER = 75, SHUFFLE_MS = 95

// The same idea as the coded line at the end of the site, slowed down: letters shuffle quietly,
// then settle one by one, left to right, with a little unevenness so it never feels mechanical.
const noise = () => Array.from(NAME, (c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [name, setName] = useState(NAME)
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

    // A few hundred stars at varied depths; brightness and size come from depth alone, all grey.
    const stars = Array.from({ length: 320 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.85 + 0.15, tw: Math.random() * Math.PI * 2 }))
    const t0 = performance.now()
    let frame = 0

    const settleAt = Array.from(NAME, (_, i) => DECODE_AT + i * PER_LETTER + Math.random() * 140)
    let lastShuffle = 0
    setName(noise())
    const decode = (now: number) => {
      const t = now - t0
      if (now - lastShuffle < SHUFFLE_MS) return
      lastShuffle = now
      setName(Array.from(NAME, (c, i) => {
        if (c === " " || t >= settleAt[i]) return c
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }).join(""))
    }

    const end = () => {
      if (ended.current) return
      ended.current = true
      setPhase("leave")
      html.classList.remove("is-intro")
      window.setTimeout(() => setPhase("gone"), FADE)
    }

    const draw = (now: number) => {
      const t = now - t0
      if (t < DECODE_AT + NAME.length * PER_LETTER + 400) decode(now)
      const fadeIn = Math.min(1, t / 1200)
      ctx.clearRect(0, 0, W, H)
      const f = Math.max(W, H) * 0.42, cx = W / 2, cy = H / 2
      for (const s of stars) {
        s.z -= 0.00045 // a slow dolly forward, barely noticeable
        if (s.z <= 0.12) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1 }
        const x = cx + (s.x / s.z) * f, y = cy + (s.y / s.z) * f
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue
        const near = 1 - s.z
        const twinkle = 0.85 + 0.15 * Math.sin(now / 900 + s.tw)
        ctx.fillStyle = `rgba(226,230,238,${(0.15 + 0.75 * near) * twinkle * fadeIn})`
        ctx.beginPath(); ctx.arc(x, y, 0.4 + near * 1.3, 0, Math.PI * 2); ctx.fill()
      }
      if (t < LENGTH) frame = requestAnimationFrame(draw)
      else { end(); frame = requestAnimationFrame(draw) } // keep drifting while it fades
    }
    frame = requestAnimationFrame(draw)

    const skip = (e: Event) => { if (e.type === "keydown" && (e as KeyboardEvent).key === "Tab") return; end() }
    window.addEventListener("keydown", skip)
    window.addEventListener("wheel", skip, { passive: true })
    window.addEventListener("touchmove", skip, { passive: true })
    window.addEventListener("pointerdown", skip)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", fit)
      window.removeEventListener("keydown", skip)
      window.removeEventListener("wheel", skip)
      window.removeEventListener("touchmove", skip)
      window.removeEventListener("pointerdown", skip)
      html.classList.remove("is-intro")
    }
  }, [])

  if (phase === "gone") return null
  return (
    <div className={`xp-opening ${phase === "leave" ? "is-leaving" : ""}`} aria-hidden="true">
      <canvas ref={canvas} />
      <p className="xp-opening-line">
        {Array.from(name, (c, i) => <span key={i} className={c === NAME[i] ? undefined : "is-noise"}>{c}</span>)}
      </p>
    </div>
  )
}
