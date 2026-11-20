"use client"

import { useEffect, useRef, useState } from "react"
import { createScore, type Score } from "@/components/xp/score"

// The opening, about six and a half quiet seconds:
//   stars fade up → the name decodes → the whole name drifts slowly closer → only then do the other
//   letters soften away, leaving the R of RITHWIK → that R glides to the R of "Rithwik" in the hero,
//   and the rest of the name unfolds from it as the page fades up.
// Sound: browsers only allow audio after the visitor interacts, so the first click or key press
// during the intro starts an original ambient score (it does not skip). Esc, scrolling or the Skip
// button skip. Once per visit; never shown to visitors who prefer reduced motion.

const NAME = "SAI RITHWIK REDDY CHIRRA"
const R_AT = 4 // the R of RITHWIK
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DECODE_AT = 900, PER_LETTER = 60, SHUFFLE_MS = 95
const ZOOM_AT = 2600    // the whole name starts drifting closer (CSS: 2.2 s)
const ISOLATE_AT = 3500 // the other letters begin to soften away (CSS: 1.3 s)
const FLY_AT = 5000     // the R glides to the hero
const FLY_MS = 1300
const FADE = 1100

const noise = () => Array.from(NAME, (c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [stage, setStage] = useState<"" | "zoom" | "isolate">("")
  const [name, setName] = useState(NAME)
  const [sound, setSound] = useState<"off" | "on" | "blocked">("off")
  const canvas = useRef<HTMLCanvasElement>(null)
  const line = useRef<HTMLParagraphElement>(null)
  const rSpan = useRef<HTMLSpanElement>(null)
  const ended = useRef(false)
  const score = useRef<Score | null>(null)

  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.intro === "off") { setPhase("gone"); return }
    try { sessionStorage.setItem("xp-intro", "1") } catch { /* storage blocked: it just plays again */ }
    html.classList.add("is-intro")
    const timers: number[] = []
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    // Sound: try right away (some browsers allow it for returning visitors), else wait for a gesture.
    score.current = createScore()
    const startSound = () => score.current?.start().then((ok) => setSound(ok ? "on" : "blocked"))
    startSound()

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

    const settleAt = Array.from(NAME, (_, i) => DECODE_AT + i * PER_LETTER + Math.random() * 140)
    let lastShuffle = 0, decoding = true
    setName(noise())
    const decode = (now: number) => {
      const t = now - t0
      if (now - lastShuffle < SHUFFLE_MS) return
      lastShuffle = now
      const next = Array.from(NAME, (c, i) => (c === " " || t >= settleAt[i] ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")
      setName(next)
      if (next === NAME) decoding = false
    }

    const fadeMusicLater = (ms: number) => later(ms, () => score.current?.stop(4))
    const leave = () => {
      html.classList.remove("is-intro")
      setPhase("leave")
      later(FADE, () => setPhase("gone"))
    }
    const skip = () => {
      if (ended.current) return
      ended.current = true
      html.classList.add("intro-done")
      leave()
      fadeMusicLater(1500)
    }

    // Stage one: the whole name drifts closer, centred on the R so the R stays put as it grows.
    later(ZOOM_AT, () => {
      if (ended.current) return
      const p = line.current, r = rSpan.current
      if (p && r) {
        const pr = p.getBoundingClientRect(), rr = r.getBoundingClientRect()
        p.style.transformOrigin = `${rr.left - pr.left + rr.width / 2}px ${rr.top - pr.top + rr.height / 2}px`
      }
      setStage("zoom")
    })
    // Stage two: well into the zoom, everything but the R softens away, slowly.
    later(ISOLATE_AT, () => { if (!ended.current) setStage("isolate") })

    // Stage three: the R glides to the hero's R and becomes it.
    later(FLY_AT, () => {
      if (ended.current) return
      const target = document.querySelector<HTMLElement>(".xp-hero h1 .xp-name")
      const text = target?.firstChild
      const r = rSpan.current
      if (!target || !text || text.nodeType !== Node.TEXT_NODE || !r) return skip()
      ended.current = true
      html.classList.add("is-handoff", "intro-done")
      const range = document.createRange(); range.setStart(text, 0); range.setEnd(text, 1)
      const dst = range.getBoundingClientRect()
      const src = r.getBoundingClientRect()
      if (!dst.width || dst.bottom < 0 || dst.top > window.innerHeight) { html.classList.remove("is-handoff"); leave(); fadeMusicLater(1500); return }
      target.style.setProperty("--r-w", `${dst.width + 2}px`)

      // A stand-in R, built outside React and animated by the browser's compositor, so the glide
      // never waits on a re-render. It sits where the hero's R is and starts transformed to where
      // the intro's R was.
      const cs = getComputedStyle(target)
      const ghost = document.createElement("span")
      ghost.className = "xp-opening-flight"
      Object.assign(ghost.style, { left: `${dst.left}px`, top: `${dst.top}px`, width: `${dst.width}px`, height: `${dst.height}px`, font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} / ${dst.height}px ${cs.fontFamily}` })
      ghost.innerHTML = "<b>R</b><em>R</em>"
      document.body.appendChild(ghost)
      r.style.visibility = "hidden"

      const dx = src.left + src.width / 2 - (dst.left + dst.width / 2)
      const dy = src.top + src.height / 2 - (dst.top + dst.height / 2)
      const k = src.height / dst.height
      const ease = "cubic-bezier(0.5, 0, 0.15, 1)"
      ghost.animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${k})` }, { transform: "translate(0, 0) scale(1)" }],
        { duration: FLY_MS, easing: ease, fill: "forwards" },
      )
      ghost.querySelector("b")!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FLY_MS * 0.6, easing: "ease-in-out", fill: "forwards" })
      ghost.querySelector("em")!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FLY_MS * 0.6, delay: FLY_MS * 0.15, easing: "ease-in-out", fill: "forwards" })
      leave()

      later(FLY_MS, () => {
        html.classList.add("is-landed")
        // The hero's own R is now visible under the stand-in; let the stand-in melt into it.
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: "ease-out", fill: "forwards" }).onfinish = () => ghost.remove()
        later(1300, () => html.classList.remove("is-handoff", "is-landed"))
      })
      fadeMusicLater(FLY_MS + 5000)
    })

    const draw = (now: number) => {
      const t = now - t0
      if (decoding) decode(now)
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

    // A click or key press turns the sound on; Esc, scrolling or the Skip button skip.
    const onGesture = (e: Event) => {
      if ((e.target as Element | null)?.closest?.(".xp-opening-skip")) return
      if (e.type === "keydown" && (e as KeyboardEvent).key === "Escape") return skip()
      startSound()
    }
    const onScroll = () => skip()
    window.addEventListener("pointerdown", onGesture)
    window.addEventListener("keydown", onGesture)
    window.addEventListener("wheel", onScroll, { passive: true })
    window.addEventListener("touchmove", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      timers.forEach((t) => window.clearTimeout(t))
      window.removeEventListener("resize", fit)
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown", onGesture)
      window.removeEventListener("wheel", onScroll)
      window.removeEventListener("touchmove", onScroll)
      html.classList.remove("is-intro")
    }
  }, [])

  if (phase === "gone") return null
  return (
    <div className={`xp-opening ${phase === "leave" ? "is-leaving" : ""}`} aria-hidden="true">
      <canvas ref={canvas} />
      <p ref={line} className={`xp-opening-line ${stage ? `is-${stage}` : ""} ${stage === "isolate" ? "is-zoom" : ""}`}>
        {Array.from(name, (c, i) => (
          <span key={i} ref={i === R_AT ? rSpan : undefined} className={[c === NAME[i] ? "" : "is-noise", i === R_AT ? "is-r" : ""].join(" ").trim() || undefined}>{c}</span>
        ))}
      </p>
      <p className={`xp-opening-sound ${sound === "on" ? "is-on" : ""}`}>
        <span aria-hidden="true"><i /><i /><i /></span>{sound === "on" ? "Sound on" : "Click anywhere for sound"}
      </p>
      <button type="button" className="xp-opening-skip" tabIndex={-1} onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}>Skip</button>
    </div>
  )
}
