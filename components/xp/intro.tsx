"use client"

import { useEffect, useRef, useState } from "react"
import { beat, createScore, type Score } from "@/components/xp/score"

// The opening: about nine seconds, cut to an original score on one shared clock (96 BPM, a beat =
// 0.625 s). The camera is moving from the first frame: a slow drift through three depths of stars
// and a faint nebula haze, a planet's dark horizon already low in frame and rising the whole time,
// and every beat of the pulse breathing a little light into the stars and the horizon's rim.
//
//   beat 0      the pulse starts with the picture; stars and haze surface within a second
//   beat 2      "TEMPE, ARIZONA", a light sweeping across it as the piano figure enters
//   beat 4      "MACHINE LEARNING SYSTEMS", as the figure answers
//   beat 6      the name decodes as the pad comes in
//   beat 6.5    a slow push-in on the whole name
//   beat 8.5    everything but the R of RITHWIK softens away
//   beat 9–10   dawn: stars dim, the rim warms, and the sun breaks the horizon on the resolving chord
//               with a bloom, a lens streak, slow rays and dust drifting through the light
//   beat 10–12.5 the shot holds: the lone R glows warm above the sunrise
//   beat 12.5   the R lifts off through the light (a high bell marks it)
//   beat 14.5   it lands as the R of "Rithwik" in the hero and the name unfolds; the scene
//               dissolves into the page and the music breathes out
//
// Motion after the decode runs on the compositor (Web Animations); the hero is staged and measured
// a beat before the glide, and the page under the intro stays still until the landing.
// Sound starts on its own where the browser allows, otherwise on the first click or key, joining in
// time. Esc, scrolling or Skip skip. Once per visit; never shown with reduced motion.

const NAME = "SAI RITHWIK REDDY CHIRRA"
const R_AT = 4
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const CARDS: [number, string][] = [[2, "Tempe, Arizona"], [4, "Machine learning systems"]]
const NAME_AT = beat(6), PER_LETTER = 22, SHUFFLE_MS = 90
const PUSH_AT = beat(6.5), PUSH_MS = beat(3.6)
const ISOLATE_AT = beat(8.5)
const DAWN_AT = beat(9)                      // the sun begins to crest…
const CREST_AT = beat(10)                    // …and breaks the horizon on the resolving chord
const READY_AT = beat(12)
const FLY_AT = beat(12.5), FLY_MS = beat(2)  // after a held sunrise shot; lands on beat 14.5
const DISSOLVE_AT = beat(13), FADE = 1500
const RISE_MS = beat(10)                     // the horizon rises until the sun crests, then holds
const PULSE_UNTIL = beat(12)                 // the picture breathes with the pulse until lift-off
const CINEMA = "cubic-bezier(0.45, 0, 0.2, 1)"

const noise = () => Array.from(NAME, (c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")
const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t))

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [isolate, setIsolate] = useState(false)
  const [dawn, setDawn] = useState(false)
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

    // Music: start at once where allowed; otherwise the first gesture joins it at the current moment.
    score.current = createScore()
    const startSound = () => {
      const at = (performance.now() - t0) / 1000
      if (at * 1000 > FLY_AT + FLY_MS) return
      score.current?.start(Math.max(0, at))
    }
    startSound()
    const musicOut = (s = 2.5) => score.current?.fadeOut(s)

    // The name decode, driven by the scene's frame loop.
    const settleAt = Array.from(NAME, (_, i) => NAME_AT + 40 + i * PER_LETTER + Math.random() * 60)
    let lastShuffle = 0, decoding = true
    setName(noise())
    const decode = (now: number) => {
      if (now - lastShuffle < SHUFFLE_MS) return
      lastShuffle = now
      const t = now - t0
      if (t < NAME_AT - 200) return
      const next = Array.from(NAME, (c, i) => (c === " " || t >= settleAt[i] ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")
      setName(next)
      if (next === NAME) decoding = false
    }

    // The scene: stars at three depths, a planet's limb, a whisper of film grain.
    const el = canvas.current!
    const ctx = el.getContext("2d")!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0, H = 0
    const fit = () => { W = window.innerWidth; H = window.innerHeight; el.width = W * dpr; el.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    fit()
    window.addEventListener("resize", fit)
    const stars = Array.from({ length: 360 }, (_, i) => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.85 + 0.15, tw: Math.random() * 6.28, layer: i % 3 }))
    const cities = Array.from({ length: 70 }, () => ({ a: (Math.random() - 0.5) * 0.5, d: 0.001 + Math.pow(Math.random(), 2) * 0.03, b: 0.25 + Math.random() * 0.75 }))
    const motes = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random() * 0.45, vx: 0.004 + Math.random() * 0.01, vy: 0.002 + Math.random() * 0.006, r: 0.5 + Math.random() * 1.2 }))
    const grains = Array.from({ length: 3 }, () => {
      const g = document.createElement("canvas"); g.width = g.height = 160
      const gx = g.getContext("2d")!, img = gx.createImageData(160, 160)
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255 }
      gx.putImageData(img, 0, 0)
      return ctx.createPattern(g, "repeat")!
    })

    let frame = 0, fi = 0
    const draw = (now: number) => {
      const t = now - t0
      if (decoding) decode(now)
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H)
      // The camera: a slow drift and the gentlest roll, so the frame is never static.
      const k = Math.min(1, t / beat(12))
      const cx = W * (0.54 - 0.05 * ease(k)), cy = H * (0.5 - 0.06 * ease(k))
      const f = Math.max(W, H) * 0.42
      // Each pulse beat breathes a little light into the scene, fading before the next.
      const phase = (t % beat(1)) / beat(1)
      const breath = t < PULSE_UNTIL ? 1 + 0.14 * Math.exp(-phase * 6) : 1
      // Nebula haze: two soft, grey-blue clouds drifting across the back of the frame.
      const haze = ease(t / 1200)
      for (const [hx, hy, hr, ha] of [[0.3 - 0.06 * k, 0.32, 0.55, 0.05], [0.74 + 0.04 * k, 0.6, 0.45, 0.035]] as const) {
        const g = ctx.createRadialGradient(W * hx, H * hy, 0, W * hx, H * hy, Math.max(W, H) * hr)
        g.addColorStop(0, `rgba(120,135,170,${ha * haze * breath})`); g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      }
      // Stars: all three depths surface within the first second, far to near; they dim as the sun rises.
      const starsDim = 1 - 0.55 * ease((t - DAWN_AT) / beat(2))
      for (const s of stars) {
        const show = ease((t - s.layer * 280) / 700)
        if (!show) continue
        s.z -= 0.00038
        if (s.z <= 0.12) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1 }
        const x = cx + (s.x / s.z) * f, y = cy + (s.y / s.z) * f
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue
        const near = 1 - s.z
        const tw = 0.85 + 0.15 * Math.sin(now / 900 + s.tw)
        ctx.fillStyle = `rgba(226,230,238,${Math.min(1, (0.12 + 0.7 * near) * tw * show * breath * starsDim)})`
        ctx.beginPath(); ctx.arc(x, y, 0.35 + near * 1.25, 0, 6.283); ctx.fill()
      }
      // The planet: a vast dark disc whose limb rises into frame, rim-lit, catching sunrise at beat 12.
      // The horizon is there from the first second, low and dim, and rises until the sun crests.
      const rise = ease(t / RISE_MS)
      const lit = ease(t / 1400) * (0.35 + 0.65 * rise) * breath
      const dawn = ease((t - DAWN_AT) / (CREST_AT - DAWN_AT))          // 0 → 1 as the sun crests
      const flash = t > CREST_AT ? Math.exp(-(t - CREST_AT) / 700) : 0  // a soft bloom on the chord
      if (lit > 0) {
        const R = Math.max(W, H) * 1.35
        const settle = ease((t - CREST_AT) / beat(4)) * H * 0.012       // a breath of camera rise after the crest
        const pcx = W / 2 + W * 0.03 * (1 - rise), pcy = H + R - H * (0.03 + 0.17 * rise) - settle
        const top = pcy - R
        const sx = W / 2 + W * 0.02, sy = top                            // where the sun breaks
        // The rim: cool blue in the dark, warming toward the sun as it crests.
        const rim = ctx.createRadialGradient(pcx, pcy, R * 0.985, pcx, pcy, R * 1.05)
        const warm = dawn
        rim.addColorStop(0, `rgba(${170 + 85 * warm},${190 + 30 * warm},${235 - 45 * warm},${(0.55 + 0.25 * warm) * lit})`)
        rim.addColorStop(0.25, `rgba(120,140,200,${0.18 * lit * (1 + warm)})`); rim.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(pcx, pcy, R * 1.05, 0, 6.283); ctx.fill()
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(pcx, pcy, R, 0, 6.283); ctx.fill()
        // Night side: a sparse scatter of warm city lights near the horizon, fading as day arrives.
        const night = ease(t / 1600) * (1 - dawn) * 0.9
        if (night > 0.01) for (const c of cities) {
          const a = -Math.PI / 2 + c.a, rr = R * (1 - c.d)
          const x = pcx + Math.cos(a) * rr, y = pcy + Math.sin(a) * rr
          if (y > H + 4) continue
          ctx.fillStyle = `rgba(255,196,130,${night * c.b * (0.8 + 0.2 * Math.sin(now / 700 + c.a * 40))})`
          ctx.fillRect(x, y, 1.2, 1.2)
        }
        if (dawn > 0) {
          ctx.save(); ctx.globalCompositeOperation = "lighter"
          // A wide atmospheric glow hugging the limb.
          const band = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.6)
          band.addColorStop(0, `rgba(255,226,190,${0.42 * dawn})`); band.addColorStop(0.12, `rgba(255,190,140,${0.16 * dawn})`); band.addColorStop(1, "rgba(0,0,0,0)")
          ctx.save(); ctx.translate(sx, sy); ctx.scale(1, 0.12); ctx.translate(-sx, -sy)
          ctx.fillStyle = band; ctx.fillRect(0, sy - W * 0.6, W, W * 1.2); ctx.restore()
          // Light rays fanning up from the sun, turning very slowly.
          const rays = 0.026 * dawn
          for (let i = 0; i < 9; i++) {
            const ang = -Math.PI / 2 + (i - 4) * 0.2 + Math.sin(now / 4000 + i) * 0.03
            const len = H * (0.45 + 0.2 * Math.sin(i * 1.7))
            const g = ctx.createLinearGradient(sx, sy, sx + Math.cos(ang) * len, sy + Math.sin(ang) * len)
            g.addColorStop(0, `rgba(255,228,196,${rays})`); g.addColorStop(1, "rgba(0,0,0,0)")
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx, sy)
            ctx.lineTo(sx + Math.cos(ang - 0.06) * len, sy + Math.sin(ang - 0.06) * len)
            ctx.lineTo(sx + Math.cos(ang + 0.06) * len, sy + Math.sin(ang + 0.06) * len); ctx.closePath(); ctx.fill()
          }
          // The sun itself, with bloom that swells on the chord and settles.
          const bloomR = W * (0.04 + 0.05 * flash) * dawn
          const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, bloomR * 3)
          bloom.addColorStop(0, `rgba(255,250,240,${0.95 * dawn})`); bloom.addColorStop(0.08, `rgba(255,236,205,${0.6 * dawn})`); bloom.addColorStop(0.35, `rgba(255,200,150,${0.12 * dawn})`); bloom.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = bloom; ctx.beginPath(); ctx.arc(sx, sy, bloomR * 3, 0, 6.283); ctx.fill()
          // An anamorphic streak across the frame, the way a lens catches a bright point.
          const streak = ctx.createLinearGradient(0, 0, W, 0)
          streak.addColorStop(0, "rgba(0,0,0,0)"); streak.addColorStop(0.5, `rgba(200,220,255,${(0.32 + 0.3 * flash) * dawn})`); streak.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = streak; ctx.fillRect(0, sy - 1, W, 2)
          ctx.globalAlpha = 0.35; ctx.fillRect(0, sy - 6, W, 12); ctx.globalAlpha = 1
          // Dust drifting through the light, lit warm when it passes near the sun.
          for (const m of motes) {
            const mx = (m.x * W + now * m.vx) % W, my = sy - H * m.y - ((now * m.vy) % (H * 0.4))
            const near = Math.max(0, 1 - Math.hypot(mx - sx, (my - sy) * 1.8) / (W * 0.35))
            if (near <= 0) continue
            ctx.fillStyle = `rgba(255,226,190,${0.5 * near * dawn})`
            ctx.beginPath(); ctx.arc(mx, my, m.r, 0, 6.283); ctx.fill()
          }
          ctx.restore()
        }
      }
      // Grain, barely there.
      fi = (fi + 1) % 3
      ctx.globalAlpha = 0.035; ctx.fillStyle = grains[fi]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

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
      musicOut(2)
    }

    CARDS.forEach(([b], i) => later(beat(b), () => { if (!ended.current) setCard(i) }))
    later(NAME_AT, () => { if (!ended.current) { setCard(-1); setNameOn(true) } })

    let push: Animation | null = null
    later(PUSH_AT, () => {
      if (ended.current) return
      const p = line.current, r = rSpan.current
      if (!p || !r) return
      const pr = p.getBoundingClientRect(), rr = r.getBoundingClientRect()
      p.style.transformOrigin = `${rr.left - pr.left + rr.width / 2}px ${rr.top - pr.top + rr.height / 2}px`
      push = p.animate([{ transform: "scale(1)" }, { transform: "scale(1.4)" }], { duration: PUSH_MS, easing: "cubic-bezier(0.35, 0, 0.25, 1)", fill: "forwards" })
    })
    later(ISOLATE_AT, () => { if (!ended.current) setIsolate(true) })
    later(CREST_AT, () => { if (!ended.current) setDawn(true) })

    // A beat early: stage the hero under the intro and measure where the R lands.
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

    // Beat 12: the R lifts off and glides home.
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

      const dx = src.left + src.width / 2 - (dst.left + dst.width / 2)
      const dy = src.top + src.height / 2 - (dst.top + dst.height / 2)
      const k = src.height / dst.height
      const lift = Math.min(70, Math.hypot(dx, dy) * 0.07)
      ghost.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(${k + (1 - k) * 0.5})`, offset: 0.55 },
        { transform: "translate(0px, 0px) scale(1)" },
      ], { duration: FLY_MS, easing: CINEMA, fill: "forwards" })
      ghost.querySelector("b")!.animate([{ opacity: 1 }, { opacity: 1, offset: 0.2 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: FLY_MS, fill: "forwards" })
      ghost.querySelector("em")!.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.8 }, { opacity: 1 }], { duration: FLY_MS, fill: "forwards" })
      later(DISSOLVE_AT - FLY_AT, () => leave(true))

      later(FLY_MS, () => {
        html.classList.add("is-landed")
        html.classList.remove("is-intro")
        later(250, () => musicOut(2.5))
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, easing: "ease-out", fill: "forwards" }).onfinish = () => ghost.remove()
        later(1700, () => html.classList.remove("is-handoff", "is-landed"))
      })
    })

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
      {card >= 0 && <p key={card} className="xp-opening-line xp-opening-card">{CARDS[card][1]}</p>}
      <p ref={line} className={`xp-opening-line ${isolate ? "is-isolate" : ""} ${dawn ? "is-dawn" : ""} ${nameOn ? "is-on" : ""}`}>
        {Array.from(name, (c, i) => (
          <span key={i} ref={i === R_AT ? rSpan : undefined} className={[c === NAME[i] ? "" : "is-noise", i === R_AT ? "is-r" : ""].join(" ").trim() || undefined}>{c}</span>
        ))}
      </p>
      <button type="button" className="xp-opening-skip" tabIndex={-1} onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}>Skip</button>
    </div>
  )
}
