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
//   beat 6      the name is revealed as the pad comes in: by default a transit (a band of light drifts
//               behind it and the letters catch the light in turn), or the letter-by-letter decode
//   beat 6.5    a slow push-in on the whole name
//   beat 8.5    everything but the R of RITHWIK softens away
//   beat 8–10.5 the camera tilts down: the stars rise out of frame and the planet's dark limb rises in
//   beat 10     on the resolving chord, a small soft glint of sun at the limb, nothing more
//   beat 10–12.5 the shot holds with a slow pan along the limb; the lone R catches the light
//   beat 12.5   the R lifts off through the light (a high bell marks it)
//   beat 14.5   it lands as the R of "Rithwik" in the hero and the name unfolds; the scene
//               dissolves into the page and the music breathes out
//
// Camera language throughout: a dolly forward, a sideways truck with parallax and foreground bokeh,
// a gentle dolly-zoom and rack focus onto the name, a tilt-down reveal during which the widescreen
// letterbox retracts so the frame opens up, and a slow pan along the limb while sunrise light runs
// along the rim. Small things for whoever notices: a satellite whose light blinks "HI" in Morse, one
// shooting star, lens ghosts opposite the sun, colour
// fringing on bright edge stars, handheld float, a film timecode, and a reel-change cue mark
// flashed in the corner just before lift-off.
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
const CREST_AT = beat(10)                    // the resolving chord: a glint of sun at the limb
const READY_AT = beat(12)
const FLY_AT = beat(12.5), FLY_MS = beat(2)  // after a held sunrise shot; lands on beat 14.5
const DISSOLVE_AT = beat(13), FADE = 1500
const PULSE_UNTIL = beat(12)                 // the picture breathes with the pulse until lift-off
const CINEMA = "cubic-bezier(0.45, 0, 0.2, 1)"

// The satellite's light spells "HIRE ME" in Morse, once, as it crosses: standard timing, a dot is one
// unit (110 ms), a dash three, one unit between signals, three between letters, seven between words.
const CODE: Record<string, string> = { H: "....", I: "..", R: ".-.", E: ".", M: "--" }
const MORSE: number[] = (() => {
  const out: number[] = []
  "HIRE ME".split(" ").forEach((word, w) => {
    if (w) out.push(0, 0, 0, 0)
    word.split("").forEach((ch, c) => {
      if (c) out.push(0, 0)
      CODE[ch].split("").forEach((sym, k) => { if (k) out.push(0); out.push(...(sym === "." ? [1] : [1, 1, 1])) })
    })
  })
  return out
})()
const MORSE_UNIT = 110
const morseOn = (ms: number) => MORSE[Math.floor(ms / MORSE_UNIT)] === 1
const noise = () => Array.from(NAME, (c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("")
const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t))
// Smootherstep: zero velocity and zero acceleration at both ends, for moves that must never feel cut.
const glide = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t * t * t * (t * (t * 6 - 15) + 10))

// How the name is revealed. "transit": the name waits in black and a band of light drifts behind it,
// so it appears in silhouette and each letter catches the light as it passes. "decode": the earlier
// letter-by-letter decode. Switch the default here, or compare with ?reveal=decode / ?reveal=transit.
const DEFAULT_REVEAL: "transit" | "decode" = "transit"
const TRANSIT_AT = beat(6.1), TRANSIT_MS = beat(2.3)

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [isolate, setIsolate] = useState(false)
  const [dawn, setDawn] = useState(false)
  const [card, setCard] = useState(-1)
  const [nameOn, setNameOn] = useState(false)
  const [name, setName] = useState(NAME)
  const [reveal, setReveal] = useState<"transit" | "decode">(DEFAULT_REVEAL)
  const canvas = useRef<HTMLCanvasElement>(null)
  const line = useRef<HTMLParagraphElement>(null)
  const rSpan = useRef<HTMLSpanElement>(null)
  const tc = useRef<HTMLSpanElement>(null)
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
    const param = new URLSearchParams(window.location.search).get("reveal")
    const mode: "transit" | "decode" = param === "decode" || param === "transit" ? param : DEFAULT_REVEAL
    setReveal(mode)
    const settleAt = Array.from(NAME, (_, i) => NAME_AT + 40 + i * PER_LETTER + Math.random() * 60)
    let lastShuffle = 0, decoding = mode === "decode"
    if (decoding) setName(noise())
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
    const stars = Array.from({ length: 380 }, (_, i) => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.85 + 0.15, tw: Math.random() * 6.28, layer: i % 3 }))
    // Out-of-focus particles very close to the lens: they slide past faster than the stars.
    const near = Array.from({ length: 14 }, () => ({ x: Math.random(), y: Math.random(), r: 6 + Math.random() * 18, v: 0.6 + Math.random() * 0.8 }))
    const grains = Array.from({ length: 3 }, () => {
      const g = document.createElement("canvas"); g.width = g.height = 160
      const gx = g.getContext("2d")!, img = gx.createImageData(160, 160)
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255 }
      gx.putImageData(img, 0, 0)
      return ctx.createPattern(g, "repeat")!
    })

    // ── The camera, as a shot list ──
    //   dolly:  forward through space from the first frame, settling as the name arrives
    //   truck:  a slow sideways slide across beats 2–6 (parallax between depths)
    //   focus:  a rack focus onto the name (background softens), released by the reveal
    //   tilt:   beats 8–10.5 the camera tilts down; stars rise out of frame, the planet's limb rises in
    //   pan:    during the hold, a slow pan along the limb
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k
    let lastT = 0
    let frame = 0, fi = 0
    const draw = (now: number) => {
      const t = now - t0
      const dt = Math.min(48, t - lastT); lastT = t
      if (decoding) decode(now)
      const transit = mode === "transit" ? (t - TRANSIT_AT) / TRANSIT_MS : -1
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H)

      const truck = ease((t - beat(1.5)) / beat(5))
      const tilt = ease((t - beat(8)) / beat(2.5))
      const settle = ease((t - beat(5)) / beat(3))
      const speed = lerp(0.0016, 0.00028, settle)                       // dolly speed per ms-ish frame
      const focus = ease((t - beat(6)) / beat(1.2)) * (1 - tilt)          // rack focus onto the name
      const pan = ease((t - beat(10)) / beat(4.5))
      const phase = (t % beat(1)) / beat(1)
      const breath = t < PULSE_UNTIL ? 1 + 0.1 * Math.exp(-phase * 6) : 1
      const glint = ease((t - beat(9.6)) / beat(0.8))
      const flash = t > CREST_AT ? Math.exp(-(t - CREST_AT) / 900) : 0

      // Vanishing point: trucks right-to-left, then rises as the camera tilts down.
      const cx = W * lerp(0.42, 0.56, truck) - W * 0.03 * pan
      const cy = H * lerp(0.5, 0.28, tilt)
      // A gentle dolly-zoom: the lens widens as the camera settles, so depth shifts under the name.
      const f = Math.max(W, H) * lerp(0.42, 0.5, settle)

      // Framing: a widescreen letterbox that, as the planet is revealed, grows into a tall large-format frame.
      // The gate: a 2.39:1 scope frame that grows into a tall 1.43:1 large-format frame for the reveal,
      // then opens all the way to the screen as the page arrives. The picture inside is a lifted,
      // projector-lit black and the matte outside is true black, so the frame reads without any line.
      // Width and height glide together between the two frames (interpolating the ratio itself would
      // make one side stop while the other starts, which reads as a cut). Same for the final opening.
      const open = glide((t - beat(8)) / beat(3))
      const toScreen = glide((t - beat(12.3)) / beat(2.2))
      const scopeW = W, scopeH = Math.min(H, W / 2.39)
      const largeW = Math.min(W, H * 1.43), largeH = Math.min(H, W / 1.43)
      const fw = lerp(lerp(scopeW, largeW, open), W, toScreen), fh = lerp(lerp(scopeH, largeH, open), H, toScreen)
      const aspect = fw / fh
      const fx = (W - fw) / 2, fy = (H - fh) / 2
      const lamp = ease(t / 900) * (1 - 0.6 * toScreen)               // the projector lamp warming up
      const base = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(fw, fh) / 2)
      base.addColorStop(0, `rgba(12,13,18,${lamp})`); base.addColorStop(0.7, `rgba(8,9,13,${lamp})`); base.addColorStop(1, `rgba(5,6,8,${lamp})`)
      ctx.fillStyle = base; ctx.fillRect(fx, fy, fw, fh)
      // A soft feather at the gate's edges, so it reads as light falling off, not a drawn border.
      const feather = Math.max(6, Math.min(fw, fh) * 0.02)
      for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [
        [fx, 0, fx + feather, 0, fx, fy, feather, fh], [fx + fw, 0, fx + fw - feather, 0, fx + fw - feather, fy, feather, fh],
        [0, fy, 0, fy + feather, fx, fy, fw, feather], [0, fy + fh, 0, fy + fh - feather, fx, fy + fh - feather, fw, feather],
      ] as const) {
        const g = ctx.createLinearGradient(x0, y0, x1, y1)
        g.addColorStop(0, `rgba(0,0,0,${0.85 * (1 - toScreen)})`); g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh)
      }
      ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip()
      // A whisper of handheld float, so the frame always feels filmed rather than rendered.
      ctx.translate(Math.sin(t / 1700) * 1.6 + Math.sin(t / 2900) * 1.1, Math.sin(t / 2100) * 1.2 + Math.cos(t / 3300) * 0.9)

      // Faint nebula haze, far away, so it barely moves.
      const haze = ease(t / 1200) * (1 - 0.4 * tilt)
      for (const [hx, hy, hr, ha] of [[0.32, 0.34, 0.55, 0.045], [0.72, 0.58, 0.45, 0.03]] as const) {
        const x = W * hx + (cx - W / 2) * 0.15, y = H * hy + (cy - H / 2) * 0.15
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * hr)
        g.addColorStop(0, `rgba(118,132,168,${ha * haze * breath})`); g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      }

      // Stars: three depths surfacing within the first second; the dolly carries them past.
      const dim = 1 - 0.25 * glint
      for (const s of stars) {
        const show = ease((t - s.layer * 280) / 700)
        if (!show) continue
        s.z -= speed * dt / 16
        if (s.z <= 0.1) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1 }
        const x = cx + (s.x / s.z) * f, y = cy + (s.y / s.z) * f
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue
        const close = 1 - s.z
        const tw = 0.85 + 0.15 * Math.sin(now / 900 + s.tw)
        const soft = 1 + 1.2 * focus * (0.4 + close)                     // defocused stars grow and fade
        const a = Math.min(1, (0.12 + 0.7 * close) * tw * show * breath * dim / (1 + 0.9 * focus))
        const rad = (0.35 + close * 1.25) * soft
        // Lens fringing: the brightest stars near the frame's edge split very slightly into colour.
        const edge = Math.hypot(x - W / 2, y - H / 2) / Math.hypot(W / 2, H / 2)
        if (close > 0.55 && edge > 0.55) {
          const o = (edge - 0.55) * 6
          ctx.fillStyle = `rgba(255,110,110,${a * 0.5})`; ctx.beginPath(); ctx.arc(x - o, y, rad, 0, 6.283); ctx.fill()
          ctx.fillStyle = `rgba(110,150,255,${a * 0.5})`; ctx.beginPath(); ctx.arc(x + o, y, rad, 0, 6.283); ctx.fill()
        }
        ctx.fillStyle = `rgba(226,230,238,${a})`
        ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283); ctx.fill()
      }

      // Transit reveal: a soft band of distant light drifts behind the name, left to right. The letters,
      // still black, show as silhouettes against it, and each catches the light as the band passes.
      if (transit > -0.2 && transit < 1.3 && line.current) {
        const box = line.current.getBoundingClientRect()
        const p = glide(transit)
        const bx = lerp(box.left - box.width * 0.3, box.right + box.width * 0.2, p)
        const env = Math.min(1, Math.max(0, (transit + 0.2) / 0.35), Math.max(0, (1.3 - transit) / 0.45))
        const bw = Math.max(box.width * 0.3, 140), by = box.top + box.height / 2
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, bw)
        g.addColorStop(0, `rgba(205,216,238,${0.3 * env})`); g.addColorStop(0.35, `rgba(150,168,205,${0.12 * env})`); g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.18); ctx.scale(0.55, 2.4); ctx.translate(-bx, -by)
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, bw, 0, 6.283); ctx.fill(); ctx.restore()
        for (const sp of Array.from(line.current.children) as HTMLElement[]) {
          if (sp.classList.contains("is-lit")) continue
          const r = sp.getBoundingClientRect()
          if (r.left + r.width / 2 < bx - 6 || transit >= 1.05) sp.classList.add("is-lit")
        }
      }

      // A satellite crossing high in the frame, its light blinking "HIRE ME" in Morse as it goes.
      const sat = (t - beat(2.5)) / beat(8)
      if (sat > 0 && sat < 1) {
        const x = W * lerp(0.12, 0.88, sat) + (cx - W / 2) * 0.05, y = H * lerp(0.19, 0.3, sat) - (H * 0.22) * tilt
        const fade = Math.min(1, sat * 6, (1 - sat) * 6)
        ctx.fillStyle = `rgba(226,232,244,${0.85 * fade})`; ctx.beginPath(); ctx.arc(x, y, 1.1, 0, 6.283); ctx.fill()
        if (morseOn(t - beat(2.5) - 250)) {
          const g = ctx.createRadialGradient(x, y, 0, x, y, 5)
          g.addColorStop(0, `rgba(255,150,120,${0.95 * fade})`); g.addColorStop(1, "rgba(255,150,120,0)")
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.283); ctx.fill()
        }
      }

      // One shooting star, quick and thin, on its way somewhere else.
      const mt = (t - beat(5.3)) / 520
      if (mt > 0 && mt < 1) {
        const x0 = W * 0.18 + (cx - W / 2) * 0.1, y0 = H * 0.16, len = W * 0.16
        const hx = x0 + len * ease(mt), hy = y0 + len * 0.42 * ease(mt)
        const g = ctx.createLinearGradient(hx - len * 0.35, hy - len * 0.147, hx, hy)
        g.addColorStop(0, "rgba(226,232,244,0)"); g.addColorStop(1, `rgba(236,240,250,${0.7 * Math.sin(Math.PI * mt)})`)
        ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.lineCap = "round"
        ctx.beginPath(); ctx.moveTo(hx - len * 0.35, hy - len * 0.147); ctx.lineTo(hx, hy); ctx.stroke()
      }

      // Foreground bokeh: a few large soft discs sliding past the lens with the truck and dolly.
      const nearA = ease(t / 900) * (1 - ease((t - beat(8)) / beat(2)))
      if (nearA > 0) for (const p of near) {
        const x = ((p.x + truck * 0.5 * p.v + t * 0.00002 * p.v) % 1.2) * W - W * 0.1
        const y = (p.y + (cy / H - 0.5) * 0.6 * p.v) * H
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.r)
        g.addColorStop(0, `rgba(210,218,236,${0.05 * nearA})`); g.addColorStop(0.7, `rgba(210,218,236,${0.035 * nearA})`); g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283); ctx.fill()
      }

      // The planet: revealed by the tilt, then panned along during the hold.
      if (tilt > 0) {
        const R = Math.max(W, H) * 1.4
        const pcx = W * 0.5 - W * 0.06 * pan, pcy = H * lerp(1.12, 0.8, tilt) + R
        const rim = ctx.createRadialGradient(pcx, pcy, R * 0.988, pcx, pcy, R * 1.04)
        const warm = 0.35 * glint
        rim.addColorStop(0, `rgba(${150 + 90 * warm},${172 + 30 * warm},${222 - 50 * warm},${0.5 * tilt * breath})`)
        rim.addColorStop(0.3, `rgba(100,118,170,${0.12 * tilt})`); rim.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(pcx, pcy, R * 1.04, 0, 6.283); ctx.fill()
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(pcx, pcy, R, 0, 6.283); ctx.fill()

        // Sunrise from orbit: a small glint just beyond the limb, then the light runs along the rim in
        // both directions, a thin warm inner band under a soft blue outer one.
        if (glint > 0) {
          const off = W * 0.08
          const sAng = -Math.PI / 2 + Math.asin(Math.min(0.99, off / R))
          const sx = pcx + Math.cos(sAng) * R, sy = pcy + Math.sin(sAng) * R
          const run = ease((t - CREST_AT) / beat(3))
          ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"
          const spread = 0.04 + 0.32 * run
          for (let k = 0; k < 28; k++) {
            const u = k / 27, fall = Math.pow(1 - u, 1.6)
            for (const dir of [-1, 1]) {
              const a0 = sAng + dir * spread * u, a1 = sAng + dir * spread * (u + 1 / 27)
              ctx.strokeStyle = `rgba(255,226,190,${0.5 * fall * glint})`; ctx.lineWidth = 1.2
              ctx.beginPath(); ctx.arc(pcx, pcy, R * 1.0004, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke()
              ctx.strokeStyle = `rgba(140,175,255,${0.14 * fall * glint})`; ctx.lineWidth = 6
              ctx.beginPath(); ctx.arc(pcx, pcy, R * 1.006, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke()
            }
          }
          const r0 = W * (0.011 + 0.007 * flash)
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r0 * 4)
          g.addColorStop(0, `rgba(255,246,232,${0.6 * glint})`); g.addColorStop(0.18, `rgba(255,226,196,${0.18 * glint})`); g.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r0 * 4, 0, 6.283); ctx.fill()
          const streak = ctx.createLinearGradient(sx - W * 0.2, 0, sx + W * 0.2, 0)
          streak.addColorStop(0, "rgba(0,0,0,0)"); streak.addColorStop(0.5, `rgba(200,218,255,${0.1 * glint * (1 + flash)})`); streak.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = streak; ctx.fillRect(sx - W * 0.2, sy - 0.75, W * 0.4, 1.5)
          // Lens ghosts: faint reflections on the line through the frame's centre, opposite the sun.
          for (const [kk, rr, col] of [[0.55, 10, "160,200,255"], [1.15, 22, "255,210,170"], [1.6, 6, "190,255,220"]] as const) {
            const gx = sx + (W / 2 - sx) * 2 * kk / 1.6, gy = sy + (H / 2 - sy) * 2 * kk / 1.6
            const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr)
            gg.addColorStop(0, `rgba(${col},${0.035 * glint})`); gg.addColorStop(0.8, `rgba(${col},${0.02 * glint})`); gg.addColorStop(1, "rgba(0,0,0,0)")
            ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx, gy, rr, 0, 6.283); ctx.fill()
          }
          ctx.restore()
        }
      }
      ctx.restore() // end of the letterboxed, hand-held frame

      // Reel-change cue marks: the dots old projectionists watched for, twice, just before lift-off.
      for (const at of [beat(11), beat(11.9)]) {
        const cue = t - at
        if (cue < 0 || cue > 170) continue
        const k = Math.sin(Math.PI * cue / 170)
        const x = fx + fw - Math.max(52, fw * 0.06), y = fy + Math.max(48, fh * 0.08)
        const g = ctx.createRadialGradient(x, y, 0, x, y, 15)
        g.addColorStop(0, `rgba(240,242,248,${0.75 * k})`); g.addColorStop(0.62, `rgba(240,242,248,${0.6 * k})`); g.addColorStop(0.8, `rgba(240,242,248,${0.12 * k})`); g.addColorStop(1, "rgba(240,242,248,0)")
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 15, 0, 6.283); ctx.fill()
      }
      // A film timecode in the corner, at 24 frames a second, for anyone who looks.
      if (tc.current) {
        const fr = Math.floor(t / (1000 / 24)), sec = Math.floor(fr / 24)
        tc.current.textContent = `00:00:${String(sec).padStart(2, "0")}:${String(fr % 24).padStart(2, "0")}   ${toScreen > 0.5 ? "" : aspect > 1.9 ? "2.39 : 1" : "1.43 : 1"}`
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
      <p ref={line} className={`xp-opening-line ${reveal === "transit" ? "is-transit" : ""} ${isolate ? "is-isolate" : ""} ${dawn ? "is-dawn" : ""} ${nameOn ? "is-on" : ""}`}>
        {Array.from(name, (c, i) => (
          <span key={i} ref={i === R_AT ? rSpan : undefined} className={[c === NAME[i] ? "" : "is-noise", i === R_AT ? "is-r" : ""].join(" ").trim() || undefined}>{c}</span>
        ))}
      </p>
      <span ref={tc} className="xp-opening-tc" aria-hidden="true">00:00:00:00</span>
      <button type="button" className="xp-opening-skip" tabIndex={-1} onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}>Skip</button>
    </div>
  )
}
