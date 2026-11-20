"use client"

import { useEffect, useRef, useState } from "react"
import { playScore } from "@/components/xp/score"

// The opening, about five and a half quiet seconds:
//   stars fade up → the name decodes letter by letter → it drifts closer while everything but the
//   R of RITHWIK falls out of focus → that R travels to the R of "Rithwik" in the hero, and the
//   rest of the name unfolds from it as the page fades up.
// Once per visit; any key, click or scroll skips it (except during the short hand-off); visitors
// who prefer reduced motion never see it. Sound is opt-in: browsers only allow audio after a
// click, so a small toggle starts an original ambient score.

const NAME = "SAI RITHWIK REDDY CHIRRA"
const R_AT = 4 // the R of RITHWIK
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DECODE_AT = 900, PER_LETTER = 60, SHUFFLE_MS = 95
const FOCUS_AT = 2700   // name drifts closer, focus narrows to the R
const FLY_AT = 4000     // the R travels to the hero; the overlay fades
const FLY_MS = 1000
const FADE = 900

const noise = () => Array.from(NAME, (c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")

type Flight = { left: number; top: number; width: number; height: number; font: string; dx: number; dy: number; k: number }

export function Intro() {
  const [phase, setPhase] = useState<"play" | "focus" | "leave" | "gone">("play")
  const [name, setName] = useState(NAME)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [flying, setFlying] = useState(false)
  const [sound, setSound] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const line = useRef<HTMLParagraphElement>(null)
  const rSpan = useRef<HTMLSpanElement>(null)
  const ended = useRef(false)
  const handing = useRef(false)
  const score = useRef<ReturnType<typeof playScore>>(null)

  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.intro === "off") { setPhase("gone"); return }
    try { sessionStorage.setItem("xp-intro", "1") } catch { /* storage blocked: it just plays again */ }
    html.classList.add("is-intro")
    const timers: number[] = []
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    const el = canvas.current!
    const ctx = el.getContext("2d")!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0, H = 0
    const fit = () => { W = window.innerWidth; H = window.innerHeight; el.width = W * dpr; el.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    fit()
    window.addEventListener("resize", fit)

    const stars = Array.from({ length: 320 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.85 + 0.15, tw: Math.random() * Math.PI * 2 }))
    const t0 = performance.now()
    let frame = 0

    // Decode: letters shuffle quietly, then settle left to right with a little unevenness.
    const settleAt = Array.from(NAME, (_, i) => DECODE_AT + i * PER_LETTER + Math.random() * 140)
    let lastShuffle = 0
    setName(noise())
    const decode = (now: number) => {
      const t = now - t0
      if (now - lastShuffle < SHUFFLE_MS) return
      lastShuffle = now
      setName(Array.from(NAME, (c, i) => (c === " " || t >= settleAt[i] ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""))
    }

    const finish = () => {
      html.classList.remove("is-intro")
      setPhase("leave")
      later(FADE, () => setPhase("gone"))
      later(FADE + 4000, () => score.current?.stop(4))
    }
    // Skip: a plain fade to the page, no hand-off.
    const end = () => {
      if (ended.current || handing.current) return
      ended.current = true
      html.classList.add("intro-done")
      finish()
    }

    // Focus: zoom about the R while everything else falls away.
    const focus = () => {
      if (ended.current) return
      const p = line.current, r = rSpan.current
      if (p && r) {
        const pr = p.getBoundingClientRect(), rr = r.getBoundingClientRect()
        p.style.transformOrigin = `${rr.left - pr.left + rr.width / 2}px ${rr.top - pr.top + rr.height / 2}px`
      }
      setPhase("focus")
    }

    // Hand-off: the R travels to the hero's R and becomes it.
    const handoff = () => {
      if (ended.current) return
      const target = document.querySelector<HTMLElement>(".xp-hero h1 .xp-name")
      const text = target?.firstChild
      const r = rSpan.current
      if (!target || !text || text.nodeType !== Node.TEXT_NODE || !r) return end()
      handing.current = true
      ended.current = true
      html.classList.add("is-handoff", "intro-done")
      const range = document.createRange(); range.setStart(text, 0); range.setEnd(text, 1)
      const dst = range.getBoundingClientRect()
      const src = r.getBoundingClientRect()
      if (!dst.width || dst.bottom < 0 || dst.top > window.innerHeight) { handing.current = false; html.classList.remove("is-handoff"); return finish() }
      target.style.setProperty("--r-w", `${dst.width + 2}px`)
      const cs = getComputedStyle(target)
      setFlight({
        left: dst.left, top: dst.top, width: dst.width, height: dst.height,
        font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} / ${dst.height}px ${cs.fontFamily}`,
        dx: src.left + src.width / 2 - (dst.left + dst.width / 2),
        dy: src.top + src.height / 2 - (dst.top + dst.height / 2),
        k: src.height / dst.height,
      })
      requestAnimationFrame(() => requestAnimationFrame(() => setFlying(true)))
      finish()
      later(FLY_MS, () => {
        html.classList.add("is-landed")
        later(140, () => setFlight(null))
        later(1100, () => html.classList.remove("is-handoff", "is-landed"))
      })
    }

    later(FOCUS_AT, focus)
    later(FLY_AT, handoff)

    const draw = (now: number) => {
      const t = now - t0
      if (t < DECODE_AT + NAME.length * PER_LETTER + 400) decode(now)
      const fadeIn = Math.min(1, t / 1200)
      ctx.clearRect(0, 0, W, H)
      const f = Math.max(W, H) * 0.42, cx = W / 2, cy = H / 2
      for (const s of stars) {
        s.z -= 0.00045
        if (s.z <= 0.12) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1 }
        const x = cx + (s.x / s.z) * f, y = cy + (s.y / s.z) * f
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue
        const near = 1 - s.z
        const twinkle = 0.85 + 0.15 * Math.sin(now / 900 + s.tw)
        ctx.fillStyle = `rgba(226,230,238,${(0.15 + 0.75 * near) * twinkle * fadeIn})`
        ctx.beginPath(); ctx.arc(x, y, 0.4 + near * 1.3, 0, Math.PI * 2); ctx.fill()
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    const skip = (e: Event) => {
      if (e.type === "keydown" && (e as KeyboardEvent).key === "Tab") return
      if ((e.target as Element | null)?.closest?.(".xp-opening-sound")) return
      end()
    }
    window.addEventListener("keydown", skip)
    window.addEventListener("wheel", skip, { passive: true })
    window.addEventListener("touchmove", skip, { passive: true })
    window.addEventListener("pointerdown", skip)
    return () => {
      cancelAnimationFrame(frame)
      timers.forEach((t) => window.clearTimeout(t))
      window.removeEventListener("resize", fit)
      window.removeEventListener("keydown", skip)
      window.removeEventListener("wheel", skip)
      window.removeEventListener("touchmove", skip)
      window.removeEventListener("pointerdown", skip)
      html.classList.remove("is-intro")
    }
  }, [])

  const toggleSound = () => {
    if (score.current) { score.current.stop(1.2); score.current = null; setSound(false); return }
    score.current = playScore()
    setSound(Boolean(score.current))
  }

  return (
    <>
      {phase !== "gone" && (
        <div className={`xp-opening ${phase === "leave" ? "is-leaving" : ""}`} aria-hidden="true">
          <canvas ref={canvas} />
          <p ref={line} className={`xp-opening-line ${phase === "focus" || phase === "leave" ? "is-focus" : ""}`}>
            {Array.from(name, (c, i) => (
              <span key={i} ref={i === R_AT ? rSpan : undefined} className={[c === NAME[i] ? "" : "is-noise", i === R_AT ? "is-r" : ""].join(" ").trim() || undefined}>{c}</span>
            ))}
          </p>
          <button type="button" className={`xp-opening-sound ${sound ? "is-on" : ""}`} onClick={toggleSound} aria-pressed={sound} tabIndex={-1}>
            <span aria-hidden="true"><i /><i /><i /></span>{sound ? "Sound on" : "Sound"}
          </button>
        </div>
      )}
      {flight && (
        <span className={`xp-opening-flight ${flying ? "is-flying" : ""}`} aria-hidden="true"
          style={{ left: flight.left, top: flight.top, width: flight.width, height: flight.height, font: flight.font, "--dx": `${flight.dx}px`, "--dy": `${flight.dy}px`, "--k": flight.k } as React.CSSProperties}>
          <b>R</b><em>R</em>
        </span>
      )}
    </>
  )
}
