"use client"

import { useEffect, useRef, useState } from "react"
import { createScore, trackAvailable, TRACK_CREDIT, type Score } from "@/components/xp/score"

// The opening, six seconds cut to the music's pulse (a note lands every second, from 0.06 s):
//   beat 1–3: three short title cards → beat 4: the name decodes as the camera pushes in and the
//   other letters soften away → beat 5: the R lifts off → beat 6: it lands as the R of "Rithwik" in
//   the hero and the name unfolds as the page fades up. The music fades out as the page arrives.
// Every movement after the decode runs on the browser's compositor (Web Animations), not on React
// renders, so nothing waits on JavaScript mid-motion. Esc, scrolling or Skip skip it; a click or key
// press turns the sound on. Once per visit; never shown to visitors who prefer reduced motion.

const NAME = "SAI RITHWIK REDDY CHIRRA"
const R_AT = 4 // the R of RITHWIK
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const BEAT = (n: number) => 60 + n * 1000  // the track's pulse, in ms from the start
const CARDS = ["Tempe, Arizona", "Machine learning systems", "and the software around them"] // beats 1–3
const NAME_AT = BEAT(4), PER_LETTER = 16, SHUFFLE_MS = 70
const PUSH_AT = BEAT(4), PUSH_MS = 1700    // push-in on the whole name
const ISOLATE_AT = BEAT(4) + 480           // other letters soften (CSS, 0.55 s)
const FLY_AT = BEAT(5), FLY_MS = 1000      // the R lifts off on beat 5 and lands on beat 6
const FADE = 1000                          // the intro fading away under the glide
const CINEMA = "cubic-bezier(0.45, 0, 0.2, 1)"

const noise = () => Array.from(NAME, (c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [isolate, setIsolate] = useState(false)
  const [card, setCard] = useState(-1)
  const [nameOn, setNameOn] = useState(false)
  const [name, setName] = useState(NAME)
  const [hasTrack, setHasTrack] = useState(false)
  const [sound, setSound] = useState(false)
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
    const t0 = performance.now()
    const timers: number[] = []
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    // Music only if a track file has been added; try to start at once, else on the first gesture.
    // Join the music at the intro's current moment, so the beats keep landing on the text.
    const startSound = () => {
      const at = (performance.now() - t0) / 1000
      if (at * 1000 > FLY_AT + FLY_MS) return
      score.current?.start(Math.max(0, at)).then((ok) => setSound(ok))
    }
    trackAvailable().then((ok) => {
      if (!ok || ended.current) return
      setHasTrack(true)
      score.current = createScore()
      startSound()
    })
    const musicOut = (s = 3) => score.current?.fadeOut(s)

    const el = canvas.current!
    const ctx = el.getContext("2d")!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0, H = 0
    const fit = () => { W = window.innerWidth; H = window.innerHeight; el.width = W * dpr; el.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    fit()
    window.addEventListener("resize", fit)

    const stars = Array.from({ length: 320 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.85 + 0.15, tw: Math.random() * Math.PI * 2 }))
    let frame = 0

    const settleAt = Array.from(NAME, (_, i) => NAME_AT + 60 + i * PER_LETTER + Math.random() * 80)
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
      musicOut(2.5)
    }

    // A slow push-in on the whole name, centred on the R so the R holds still as everything grows.
    let push: Animation | null = null
    later(PUSH_AT, () => {
      if (ended.current) return
      const p = line.current, r = rSpan.current
      if (!p || !r) return
      const pr = p.getBoundingClientRect(), rr = r.getBoundingClientRect()
      p.style.transformOrigin = `${rr.left - pr.left + rr.width / 2}px ${rr.top - pr.top + rr.height / 2}px`
      push = p.animate([{ transform: "scale(1)" }, { transform: "scale(1.45)" }], { duration: PUSH_MS, easing: CINEMA, fill: "forwards" })
    })
    later(ISOLATE_AT, () => { if (!ended.current) setIsolate(true) })
    CARDS.forEach((_, i) => later(BEAT(i + 1), () => { if (!ended.current) setCard(i) }))
    later(NAME_AT, () => { if (!ended.current) { setCard(-1); setNameOn(true) } })

    // The R glides to the hero's R and becomes it.
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
      if (!dst.width || dst.bottom < 0 || dst.top > window.innerHeight) { html.classList.remove("is-handoff"); leave(); musicOut(); return }
      target.style.setProperty("--r-w", `${dst.width + 2}px`)

      const cs = getComputedStyle(target)
      const ghost = document.createElement("span")
      ghost.className = "xp-opening-flight"
      Object.assign(ghost.style, { left: `${dst.left}px`, top: `${dst.top}px`, width: `${dst.width}px`, height: `${dst.height}px`, font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} / ${dst.height}px ${cs.fontFamily}` })
      ghost.innerHTML = "<b>R</b><em>R</em>"
      document.body.appendChild(ghost)
      r.style.visibility = "hidden"
      push?.pause()

      // A gentle arc: the midpoint lifts a little above the straight line, like a camera move.
      const dx = src.left + src.width / 2 - (dst.left + dst.width / 2)
      const dy = src.top + src.height / 2 - (dst.top + dst.height / 2)
      const k = src.height / dst.height
      const lift = Math.min(60, Math.hypot(dx, dy) * 0.06)
      const mk = k + (1 - k) * 0.55
      ghost.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${k})`, filter: "blur(0px)" },
        { transform: `translate(${dx * 0.42}px, ${dy * 0.42 - lift}px) scale(${mk})`, filter: "blur(0.6px)", offset: 0.55 },
        { transform: "translate(0px, 0px) scale(1)", filter: "blur(0px)" },
      ], { duration: FLY_MS, easing: CINEMA, fill: "forwards" })
      ghost.querySelector("b")!.animate([{ opacity: 1 }, { opacity: 1, offset: 0.2 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: FLY_MS, fill: "forwards" })
      ghost.querySelector("em")!.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.8 }, { opacity: 1 }], { duration: FLY_MS, fill: "forwards" })
      later(120, leave)

      later(FLY_MS, () => {
        html.classList.add("is-landed")
        musicOut(3) // the page has arrived: let the music go, slowly
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: "ease-out", fill: "forwards" }).onfinish = () => ghost.remove()
        later(1500, () => html.classList.remove("is-handoff", "is-landed"))
      })
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
      {card >= 0 && <p key={card} className="xp-opening-line xp-opening-card">{CARDS[card]}</p>}
      <p ref={line} className={`xp-opening-line ${isolate ? "is-isolate" : ""} ${nameOn ? "is-on" : ""}`}>
        {Array.from(name, (c, i) => (
          <span key={i} ref={i === R_AT ? rSpan : undefined} className={[c === NAME[i] ? "" : "is-noise", i === R_AT ? "is-r" : ""].join(" ").trim() || undefined}>{c}</span>
        ))}
      </p>
      {hasTrack && (
        <p className={`xp-opening-sound ${sound ? "is-on" : ""}`}>
          <span aria-hidden="true"><i /><i /><i /></span>{sound ? (TRACK_CREDIT || "Sound on") : "Click anywhere for sound"}
        </p>
      )}
      <button type="button" className="xp-opening-skip" tabIndex={-1} onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}>Skip</button>
    </div>
  )
}
