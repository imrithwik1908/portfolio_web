"use client"

import { useEffect, useRef, useState } from "react"
import { createScore, trackAvailable, type Score } from "@/components/xp/score"

// The opening, about twelve seconds cut to the music's pulse (a note every second, from 0.06 s,
// with swells at 8 s and 12 s):
//   beats 1, 3, 5: three title cards, two beats each → beat 7: the name decodes, settling into the
//   8 s swell → beat 8: a slow push-in on the whole name → beat 9.5: the other letters soften away,
//   leaving the R → beat 10.5: the R glides to the hero → beat 12: it lands on the second swell as
//   the R of "Rithwik", the name unfolds, and the intro dissolves into the page.
// Motion after the decode runs on the browser's compositor (Web Animations), and the page under the
// intro stays still until the R lands, so the hand-off is a slow dissolve rather than a cut.
// Sound starts on its own wherever the browser allows it; otherwise on the first click or key.
// Esc, scrolling or Skip skip. Once per visit; never shown to visitors who prefer reduced motion.

const NAME = "SAI RITHWIK REDDY CHIRRA"
const R_AT = 4 // the R of RITHWIK
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const BEAT = (n: number) => 60 + n * 1000  // the track's pulse, in ms from the start
const CARDS = ["Tempe, Arizona", "Machine learning systems", "and the software around them"]
const CARD_BEATS = [1, 3, 5]               // each card holds for two beats
const NAME_AT = BEAT(7), PER_LETTER = 45, SHUFFLE_MS = 110
const PUSH_AT = BEAT(8), PUSH_MS = 3400    // slow push-in on the whole name
const ISOLATE_AT = BEAT(9) + 500           // other letters soften (CSS, 1.3 s)
const READY_AT = BEAT(10)                  // measure and stage the hero, quietly, before the glide
const FLY_AT = BEAT(10) + 500, FLY_MS = 1500 // the R lands on the 12 s swell
const FADE = 2200                          // the intro dissolving into the page
const CINEMA = "cubic-bezier(0.45, 0, 0.2, 1)"

const noise = () => Array.from(NAME, (c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [isolate, setIsolate] = useState(false)
  const [card, setCard] = useState(-1)
  const [nameOn, setNameOn] = useState(false)
  const [name, setName] = useState(NAME)
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
      score.current?.start(Math.max(0, at))
    }
    trackAvailable().then((ok) => {
      if (!ok || ended.current) return
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

    const leave = (keepPageStill = false) => {
      if (!keepPageStill) html.classList.remove("is-intro")
      setPhase("leave")
      later(FADE, () => setPhase("gone"))
    }
    const skip = () => {
      if (ended.current) return
      ended.current = true
      html.classList.add("intro-done")
      html.classList.remove("is-handoff")
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
      push = p.animate([{ transform: "scale(1)" }, { transform: "scale(1.5)" }], { duration: PUSH_MS, easing: "cubic-bezier(0.35, 0, 0.25, 1)", fill: "forwards" })
    })
    later(ISOLATE_AT, () => { if (!ended.current) setIsolate(true) })
    CARDS.forEach((_, i) => later(BEAT(CARD_BEATS[i]), () => { if (!ended.current) setCard(i) }))
    later(NAME_AT, () => { if (!ended.current) { setCard(-1); setNameOn(true) } })

    // Half a beat early, stage the hero under the intro (heading visible, name clipped to its R) and
    // measure where the R must land, so the glide itself starts with no layout work at all.
    let dst: DOMRect | null = null
    let target: HTMLElement | null = null
    later(READY_AT, () => {
      if (ended.current) return
      target = document.querySelector<HTMLElement>(".xp-hero h1 .xp-name")
      const text = target?.firstChild
      if (!target || !text || text.nodeType !== Node.TEXT_NODE) return
      html.classList.add("is-handoff", "intro-done")
      const range = document.createRange(); range.setStart(text, 0); range.setEnd(text, 1)
      const box = range.getBoundingClientRect()
      if (!box.width || box.bottom < 0 || box.top > window.innerHeight) { html.classList.remove("is-handoff"); return }
      dst = box
      target.style.setProperty("--r-w", `${box.width + 2}px`)
    })

    // The R glides to the hero's R and becomes it.
    later(FLY_AT, () => {
      if (ended.current) return
      const r = rSpan.current
      if (!dst || !target || !r) return skip()
      ended.current = true
      const src = r.getBoundingClientRect()

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
      const lift = Math.min(70, Math.hypot(dx, dy) * 0.07)
      const mk = k + (1 - k) * 0.5
      ghost.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(${mk})`, offset: 0.55 },
        { transform: "translate(0px, 0px) scale(1)" },
      ], { duration: FLY_MS, easing: CINEMA, fill: "forwards" })
      ghost.querySelector("b")!.animate([{ opacity: 1 }, { opacity: 1, offset: 0.2 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: FLY_MS, fill: "forwards" })
      ghost.querySelector("em")!.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.8 }, { opacity: 1 }], { duration: FLY_MS, fill: "forwards" })
      // The intro dissolves slowly under the glide; the page beneath stays still until the landing.
      later(250, () => leave(true))

      later(FLY_MS, () => {
        html.classList.add("is-landed")
        html.classList.remove("is-intro") // now the rest of the hero comes in
        musicOut(3.5) // the page has arrived: let the music go, slowly
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: "ease-out", fill: "forwards" }).onfinish = () => ghost.remove()
        later(1800, () => html.classList.remove("is-handoff", "is-landed"))
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
      <button type="button" className="xp-opening-skip" tabIndex={-1} onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}>Skip</button>
    </div>
  )
}
