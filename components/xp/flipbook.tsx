"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createFlipScore, type FlipScore } from "@/components/xp/flip-score"
import { FIGURE_DRAWINGS } from "@/components/xp/figures"
import { ProjectVisual } from "@/components/xp/project-visual"
import { projectMeta } from "@/lib/project-highlights"

// The flipbook: a second, optional opening, played only from the command menu.
//
// Act one tells the work in chapters (release checks, language, three senses, systems, data, chess,
// research), one card each, and every chapter gets its own camera move. Act two is the title: the
// camera starts deep inside the R with the pages still flipping through it, pulls back until the
// whole name is on screen with the work playing inside every letter, then the letters set solid.
//
// The drawings are this site's own; three photographs are openly licensed and credited on /credits;
// every number is one the site already reports. The music is an original cue (flip-score.ts).

type Panel = { z?: number; at?: string; cut?: boolean; chapter?: string } & (
  | { kind: "vis"; slug: string }
  | { kind: "fig"; draw: keyof typeof FIGURE_DRAWINGS }
  | { kind: "img"; src: string; paper?: boolean }
  | { kind: "type"; big: string; small: string; tone: "ink" | "paper" | "lamp" }
  | { kind: "fog"; clear: number }
  | { kind: "sentence" }
  | { kind: "paper" }
)

const PANELS: Panel[] = [
  { kind: "vis", slug: "agentguard", chapter: "release" },
  { kind: "fig", draw: "trace" },
  { kind: "fig", draw: "release" },
  { kind: "type", big: "PASS · BLOCK · REVIEW", small: "one release decision", tone: "lamp" },
  { kind: "img", src: "/agentguard.png", z: 1.25, at: "20% 30%" },

  { kind: "vis", slug: "x-mutest", chapter: "language" },
  { kind: "sentence" },
  { kind: "img", src: "/xmutest-annotation.png", paper: true },
  { kind: "fig", draw: "agreement" },
  { kind: "type", big: "16,830", small: "posts, marked word by word", tone: "ink" },
  { kind: "img", src: "/xmutest-architecture.png", paper: true, z: 1.1 },
  { kind: "type", big: "EN · HI · TE", small: "three languages", tone: "paper" },

  { kind: "vis", slug: "tensor-fusion", chapter: "senses" },
  { kind: "img", src: "/flipbook/neuron.jpg", cut: true },
  { kind: "fig", draw: "tensor" },
  { kind: "img", src: "/tensor_fusion.jpg", paper: true },

  { kind: "vis", slug: "course-catalog", chapter: "systems" },
  { kind: "fig", draw: "schema" },
  { kind: "fig", draw: "enroll", cut: true },
  { kind: "img", src: "/course_catalog.jpg", z: 1.15, at: "70% 40%" },

  { kind: "img", src: "/flipbook/atrium.jpg", chapter: "data" },
  { kind: "img", src: "/flipbook/fiber.jpg", cut: true },
  { kind: "type", big: "$142", small: "mean daily ad-revenue error", tone: "lamp" },

  { kind: "fog", clear: 0.18, chapter: "chess" },
  { kind: "fog", clear: 0.5, cut: true },
  { kind: "fog", clear: 0.85, cut: true },
  { kind: "type", big: "25–25", small: "a draw I didn’t call a win", tone: "paper" },
  { kind: "type", big: "200 / 200", small: "games my retrain lost", tone: "ink", cut: true },

  { kind: "paper", chapter: "research" },
  { kind: "type", big: "4.22", small: "GPA at Arizona State", tone: "paper" },
]
const IMAGES = Array.from(new Set(PANELS.flatMap((p) => (p.kind === "img" ? [p.src] : []))))

// Act one: one pass through the cards, each a little quicker than the last.
// Act two: the title, with the pages still flipping (steadier now) inside the letters.
const HIT = 6000 // the camera is inside the R
const REVEAL = HIT + 2600 // the whole name is on screen
const SOLID = HIT + 3000 // the letters start to set
const LEAVE = HIT + 5200 // the R lifts off for the homepage
const FLY_MS = 1700
const END = LEAVE + FLY_MS + 200
const CUTS: { t: number; i: number }[] = (() => {
  const out: { t: number; i: number }[] = []
  let t = 140, gap = 560
  PANELS.forEach((_, i) => { out.push({ t: Math.round(t), i }); t += gap; gap = Math.max(48, gap * 0.9) })
  let k = 0
  while (t < HIT - 40) { out.push({ t: Math.round(t), i: (k * 7 + 3) % PANELS.length }); t += 46; k++ }
  // Inside the letters, the boldest pages: photographs, the board, the tinted project drawings.
  const bold = [13, 23, 0, 20, 5, 25, 21, 12, 3, 16, 4, 28, 19, 22, 24]
  t = HIT; k = 0
  while (t < SOLID + 300) { out.push({ t: Math.round(t), i: bold[k % bold.length] }); t += 120; k++ }
  return out
})()

// The camera: one move per chapter, eased from each to the next so it never jumps. Scale stays
// above 1.12 so the edges of the page never show. rx/ry/rz in degrees, s = scale, x/y = drift in %.
type Shot = { rx: number; ry: number; rz: number; s: number; x: number; y: number }
const MOVES: Record<string, Shot> = {
  open: { rx: 7, ry: -9, rz: -1.5, s: 1.42, x: -4, y: 3 }, // low and to the left, close in
  release: { rx: 0, ry: 0, rz: 0, s: 1.14, x: 0, y: 0 }, // settles square
  language: { rx: -7, ry: 3, rz: 1, s: 1.26, x: 2, y: -3 }, // craning down
  senses: { rx: 2, ry: 8, rz: 0, s: 1.24, x: -3, y: 0 }, // orbiting right
  systems: { rx: 4, ry: -5, rz: 2.5, s: 1.3, x: 3, y: 2 }, // a slow roll
  data: { rx: -6, ry: 0, rz: 0, s: 1.2, x: 0, y: 3 }, // tilting up
  chess: { rx: 22, ry: 0, rz: -3, s: 1.38, x: 0, y: -4 }, // looking down at the board
  research: { rx: 0, ry: -5, rz: 1, s: 1.2, x: 1, y: 0 }, // a gentle pan
  end: { rx: 0, ry: 0, rz: 0, s: 1.12, x: 0, y: 0 },
}
const KEYS: { t: number; shot: Shot }[] = (() => {
  const keys = [{ t: 0, shot: MOVES.open }]
  CUTS.slice(0, PANELS.length).forEach(({ t, i }) => { const c = PANELS[i].chapter; if (c) keys.push({ t: t + 700, shot: MOVES[c] }) })
  keys.push({ t: HIT - 500, shot: MOVES.end })
  return keys
})()
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * c * (c * (c * 6 - 15) + 10) }
function shotAt(t: number): Shot {
  let a = KEYS[0], b = KEYS[KEYS.length - 1]
  for (let k = 0; k < KEYS.length - 1; k++) if (t >= KEYS[k].t && t < KEYS[k + 1].t) { a = KEYS[k]; b = KEYS[k + 1]; break }
  if (t >= b.t) return b.shot
  const e = smooth((t - a.t) / (b.t - a.t))
  const m = (k: keyof Shot) => a.shot[k] + (b.shot[k] - a.shot[k]) * e
  return { rx: m("rx"), ry: m("ry"), rz: m("rz"), s: m("s"), x: m("x"), y: m("y") }
}

const NAME = "RITHWIK"
const DEPTH = 14 // layers of extrusion behind the letters

// A chessboard in fog: squares clear outward from the white king as `clear` grows.
const PIECES: Record<number, string> = { 60: "♔", 51: "♙", 52: "♙", 53: "♙", 45: "♘", 61: "♗", 4: "♚", 12: "♟", 11: "♟", 21: "♞", 27: "♟", 36: "♙", 2: "♝", 0: "♜", 63: "♖" }
function Fog({ clear }: { clear: number }) {
  return (
    <svg viewBox="0 0 800 800" className="xp-flip-fog" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8), c = i % 8
        const d = Math.hypot(r - 7.5, c - 4) / 8.6
        const seen = d < clear + 0.05 * Math.sin(i * 1.7)
        return (
          <g key={i}>
            <rect x={c * 100} y={r * 100} width="100" height="100" fill={(r + c) % 2 ? "#a8754a" : "#ecd9b6"} />
            {seen && PIECES[i] && <text x={c * 100 + 50} y={r * 100 + 72} textAnchor="middle" fontSize="70" fill={i > 31 ? "#fffaf0" : "#1a120a"} stroke={i > 31 ? "#2b1c0e" : "none"} strokeWidth="1.5">{PIECES[i]}</text>}
            {!seen && <rect x={c * 100} y={r * 100} width="100" height="100" fill="#141210" opacity={0.9} />}
          </g>
        )
      })}
    </svg>
  )
}

// The sample sentence from "Where I've worked", with the words that carry the label lit.
const WORDS = ["the", "review", "praised", "the", "battery", "but", "hated", "the", "screen"]
const LIT: Record<number, number> = { 6: 1, 8: 0.72, 2: 0.2 }
const AUTHORS = ["Mohammad Zia Ur Rehman", "Sai Kartheek Reddy Kasu", "Shashivardhan Reddy Koppula", "Sai Rithwik Reddy Chirra", "Shwetank Shekhar Singh", "Nagendra Kumar"]

function Content({ p }: { p: Panel }) {
  switch (p.kind) {
    case "vis": return <span className="xp-flip-vis pc is-live" style={{ "--tint": projectMeta[p.slug].tint, "--accent": projectMeta[p.slug].accent } as React.CSSProperties}><ProjectVisual slug={p.slug} /></span>
    case "fig": { const D = FIGURE_DRAWINGS[p.draw]; return <span className="xp-flip-fig"><D /></span> }
    case "img": return <span className="xp-flip-img" style={{ backgroundImage: `url(${p.src})`, backgroundSize: p.paper ? "contain" : "cover" }} />
    case "fog": return <Fog clear={p.clear} />
    case "sentence": return (
      <span className="xp-flip-sentence">
        <span>{WORDS.map((w, i) => <i key={i} style={{ "--lit": LIT[i] ?? 0, "--n": i } as React.CSSProperties}>{w}</i>)}</span>
        <small>label <b>negative</b> · because <b>hated</b>, <b>screen</b></small>
      </span>
    )
    case "paper": return (
      <span className="xp-flip-paper">
        <span className="xp-flip-sheet">
          <em>AAAI-26</em>
          <strong>X-MuTeST: A Multilingual Benchmark for Explainable Hate Speech Detection and a Novel LLM-Consulted Explanation Framework</strong>
          <span>{AUTHORS.map((a, i) => <span key={a}>{i > 0 && ", "}{a.startsWith("Sai Rithwik") ? <b>{a}</b> : a}</span>)}</span>
          <i aria-hidden="true">{Array.from({ length: 9 }, (_, k) => <u key={k} style={{ width: `${70 + ((k * 37) % 28)}%` }} />)}</i>
        </span>
      </span>
    )
    default: return <span className="xp-flip-type"><b>{p.big}</b><small>{p.small}</small></span>
  }
}

const tone = (p: Panel) =>
  p.kind === "type" ? p.tone : p.kind === "fig" || p.kind === "sentence" || (p.kind === "img" && p.paper) ? "paper" : p.kind === "vis" ? "tint" : p.kind === "fog" ? "board" : p.kind === "paper" ? "desk" : "photo"

export function Flipbook() {
  const [on, setOn] = useState(false)
  const [ready, setReady] = useState(false)
  const [geo, setGeo] = useState<{ w: number; h: number; size: number } | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const pages = useRef<(HTMLDivElement | null)[]>([])
  const rig = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const clip = useRef<SVGTextElement>(null)
  const word = useRef<SVGGElement>(null)
  const sheen = useRef<SVGLinearGradientElement>(null)
  const rLetter = useRef<SVGTSpanElement>(null)
  const titleCam = useRef<HTMLDivElement>(null)
  const depth = useRef<(SVGGElement | null)[]>([])
  const stars = useRef<HTMLCanvasElement>(null)
  const score = useRef<FlipScore | null>(null)
  const frame = useRef(0)
  const closing = useRef(false)

  const close = useCallback((fast = true) => {
    if (closing.current) return
    closing.current = true
    score.current?.stop(fast ? 0.6 : 1.6)
    root.current?.classList.add("is-out")
    window.setTimeout(() => { cancelAnimationFrame(frame.current); setOn(false); setReady(false) }, fast ? 450 : 800)
  }, [])

  useEffect(() => {
    const open = () => { closing.current = false; setOn(true) }
    window.addEventListener("xp:flipbook", open)
    return () => window.removeEventListener("xp:flipbook", open)
  }, [])

  // Load every picture and the title's font before the first cut (at most ~3 s), and size the
  // name to the screen.
  useEffect(() => {
    if (!on) return
    let alive = true
    const w = window.innerWidth, h = window.innerHeight
    setGeo({ w, h, size: Math.min(w * 0.2, h * 0.46) })
    const family = getComputedStyle(document.body).getPropertyValue("--font-oswald").trim() || "sans-serif"
    const all = [
      ...IMAGES.map((src) => new Promise<void>((res) => { const i = new Image(); i.onload = i.onerror = () => res(); i.src = src })),
      document.fonts?.load(`600 100px ${family}`).catch(() => undefined),
    ]
    Promise.race([Promise.all(all), new Promise((r) => window.setTimeout(r, 3000))]).then(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [on])

  useEffect(() => {
    if (!on) return
    document.documentElement.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === " " || e.key === "Enter") { e.preventDefault(); close() } }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = "" }
  }, [on, close])

  useEffect(() => {
    if (!on || !ready || !geo) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.current?.classList.add("is-still", "is-solid")
      const id = window.setTimeout(() => close(false), 2600)
      return () => window.clearTimeout(id)
    }

    score.current = createFlipScore(CUTS.filter((c) => c.t < HIT).map((c) => c.t), HIT)
    score.current?.start()

    // Where to start inside the R: a point in its upright stroke.
    let ox = geo.w * 0.2, oy = geo.h / 2
    try {
      const r = clip.current?.getExtentOfChar(0)
      if (r) { ox = r.x + r.width * 0.2; oy = r.y + r.height * 0.55 }
    } catch { /* keep the estimate */ }

    let cut = -1, start = 0, prev = -1, left = false, prepped = false

    // The handoff: the R lifts off the title and glides onto the R of the name on the homepage,
    // turning into it on the way, along one continuous curve; the rest of the name fades away and
    // the black opens onto the page. The page is scrolled and staged under the black beforehand.
    const html = document.documentElement
    const target = document.querySelector<HTMLElement>(".xp-hero h1 .xp-name")
    const prep = () => {
      if (!target) return
      window.scrollTo(0, 0)
      html.classList.add("is-handoff")
    }
    const handoff = () => {
      const textNode = target?.firstChild
      if (!target || !textNode || textNode.nodeType !== Node.TEXT_NODE || !rLetter.current) { close(false); return }
      score.current?.stop(2.8)
      const range = document.createRange(); range.setStart(textNode, 0); range.setEnd(textNode, 1)
      const dst = range.getBoundingClientRect()
      target.style.setProperty("--r-w", `${dst.width + 2}px`)
      const src = rLetter.current.getBoundingClientRect()
      const cs = getComputedStyle(target)
      const ghost = document.createElement("span")
      ghost.className = "xp-opening-flight is-flip"
      Object.assign(ghost.style, { left: `${dst.left}px`, top: `${dst.top}px`, width: `${dst.width}px`, height: `${dst.height}px`, font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} / ${dst.height}px ${cs.fontFamily}` })
      ghost.innerHTML = "<b>R</b><em>R</em>"
      document.body.appendChild(ghost)
      root.current?.classList.add("is-leaving")
      // A quadratic curve that rises a little on its way, sampled finely and eased once over the
      // whole path, so speed changes smoothly from lift-off to landing.
      const sx = src.left + src.width / 2 - (dst.left + dst.width / 2)
      const sy = src.top + src.height / 2 - (dst.top + dst.height / 2)
      const k = src.height / dst.height
      const lift = Math.min(120, Math.hypot(sx, sy) * 0.14)
      const cx = sx * 0.45, cy = sy * 0.45 - lift
      const frames: Keyframe[] = []
      for (let n = 0; n <= 48; n++) {
        const e = smooth(n / 48), q = 1 - e
        const x = q * q * sx + 2 * q * e * cx, y = q * q * sy + 2 * q * e * cy
        frames.push({ transform: `translate(${x}px, ${y}px) scale(${k + (1 - k) * e})` })
      }
      ghost.animate(frames, { duration: FLY_MS, easing: "linear", fill: "forwards" })
      ghost.querySelector("b")!.animate([{ opacity: 1 }, { opacity: 1, offset: 0.28 }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: FLY_MS, easing: "ease-in-out", fill: "forwards" })
      ghost.querySelector("em")!.animate([{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1, offset: 0.72 }, { opacity: 1 }], { duration: FLY_MS, easing: "ease-in-out", fill: "forwards" })
      window.setTimeout(() => {
        html.classList.add("is-landed")
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: "ease-out", fill: "forwards" }).onfinish = () => ghost.remove()
        cancelAnimationFrame(frame.current)
        window.setTimeout(() => html.classList.remove("is-handoff", "is-landed"), 1800)
        setOn(false); setReady(false)
      }, FLY_MS)
    }

    // A quiet field of stars for the last frame, drawn on the same clock; nearer stars drift a
    // little faster and lean with the camera.
    const sc = stars.current, sctx = sc?.getContext("2d")
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    if (sc) { sc.width = geo.w * dpr; sc.height = geo.h * dpr }
    const field = Array.from({ length: 260 }, (_, n) => {
      const z = Math.pow(((n * 0.6180339) % 1), 2.2) // most stars far away
      return { x: (n * 0.7548776) % 1, y: (n * 0.5698403) % 1, z, r: 0.35 + z * 1.3, ph: n * 2.39 }
    })
    const drawStars = (t: number, lean: number) => {
      if (!sctx || !sc) return
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sctx.clearRect(0, 0, geo.w, geo.h)
      for (const s of field) {
        const x = ((s.x * geo.w + t * 0.004 * (0.3 + s.z) + lean * s.z * 14) % geo.w + geo.w) % geo.w
        const y = s.y * geo.h
        const a = (0.25 + 0.6 * s.z) * (0.75 + 0.25 * Math.sin(t / 900 + s.ph))
        sctx.fillStyle = `rgba(226, 232, 245, ${a})`
        sctx.beginPath(); sctx.arc(x, y, s.r, 0, Math.PI * 2); sctx.fill()
      }
    }
    const show = (k: number) => {
      const { i } = CUTS[k]
      const front = pages.current[i], back = prev >= 0 ? pages.current[prev] : null
      pages.current.forEach((p) => { if (p && p !== front && p !== back) p.classList.remove("is-front", "is-back") })
      if (back && back !== front) { back.classList.remove("is-front"); back.classList.add("is-back") }
      if (front) {
        front.classList.remove("is-back", "is-front")
        const gap = (CUTS[k + 1]?.t ?? CUTS[k].t + 46) - CUTS[k].t
        front.style.setProperty("--d", `${Math.max(60, Math.min(520, gap * 0.95))}ms`)
        front.classList.toggle("is-cut", !!PANELS[i].cut && k < PANELS.length)
        void front.offsetWidth
        front.classList.add("is-front")
      }
      prev = i
    }
    const tick = (now: number) => {
      frame.current = requestAnimationFrame(tick)
      if (!start) start = now
      const t = now - start
      while (cut + 1 < CUTS.length && CUTS[cut + 1].t <= t) { cut++; show(cut) }
      const gap = cut >= 0 && cut + 1 < CUTS.length ? CUTS[cut + 1].t - CUTS[cut].t : 46

      if (t < HIT) {
        // Act one: the chapter camera, a breath of handheld on top, blur once the cutting races.
        const c = shotAt(t)
        const hand = (Math.sin(t / 610) + Math.sin(t / 1730 + 2)) * 0.35
        if (rig.current) rig.current.style.transform = `translate(${c.x}%, ${c.y}%) scale(${c.s}) rotateX(${c.rx + hand * 0.6}deg) rotateY(${c.ry + hand}deg) rotateZ(${c.rz}deg)`
        if (stage.current) stage.current.style.filter = `blur(${Math.max(0, Math.min(4, 120 / gap - 1.7))}px)`
      } else {
        // Act two: from deep inside the R out to the whole name.
        root.current?.classList.add("is-title")
        if (rig.current) rig.current.style.transform = "none"
        if (stage.current) stage.current.style.filter = "none"
        // Log-scale with an ease at both ends: a slow drift inside the R, a long glide out, a soft
        // arrival, so the name is never simply "there".
        const p = Math.min(1, (t - HIT) / (REVEAL - HIT))
        const e = smooth(p)
        const s = Math.exp(Math.log(26) * (1 - e))
        const tf = `translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`
        clip.current?.setAttribute("transform", tf)
        word.current?.setAttribute("transform", tf)
        depth.current.forEach((g) => g?.setAttribute("transform", tf))
        // The camera orbits the name as it pulls back, then drifts a few degrees and comes home
        // square just before the R lifts off.
        const hold = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - REVEAL) / (LEAVE - 500 - REVEAL))))
        const ry = -24 * (1 - e) + 6 * hold, rx = 10 * (1 - e) - 2 * hold
        if (titleCam.current) titleCam.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
        if (t >= REVEAL - 1400) { root.current?.classList.add("is-dawn"); drawStars(t, ry / 10) }
        if (t >= LEAVE - 900 && !prepped) { prepped = true; prep() }
        if (t >= SOLID) root.current?.classList.add("is-solid")
        // One pass of light across the set letters.
        const sw = Math.min(1, Math.max(0, (t - SOLID - 500) / 1900))
        sheen.current?.setAttribute("gradientTransform", `translate(${-1.2 + 2.4 * smooth(sw)} 0)`)
        if (left) drawStars(t, 0)
        if (t >= LEAVE && !left) { left = true; handoff() }
      }
      if (t >= END && !left) close(false)
    }
    frame.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame.current); score.current?.stop(0.3) }
  }, [on, ready, geo, close])

  if (!on) return null
  const text = geo && {
    x: geo.w / 2, y: geo.h / 2, fontSize: geo.size, textAnchor: "middle" as const, dominantBaseline: "central" as const,
    letterSpacing: geo.size * 0.05, style: { fontFamily: "var(--font-oswald), 'Arial Narrow', sans-serif", fontWeight: 600 },
  }
  return (
    <div ref={root} className="xp-flip" role="dialog" aria-modal="true" aria-label={`The flipbook intro: my work, chapter by chapter, flipping into the name ${NAME}`} onClick={() => close()}>
      {!ready && <p className="xp-flip-loading" aria-live="polite">Loading the pages…</p>}
      {geo && text && (
        <svg className="xp-flip-defs" width="0" height="0" aria-hidden="true">
          <defs>
            <clipPath id="xp-flip-letters" clipPathUnits="userSpaceOnUse"><text ref={clip} {...text}>{NAME}</text></clipPath>
            <linearGradient id="xp-flip-silver" x1="0" y1="0" x2="1" y2="0.35">
              <stop offset="0" stopColor="#8a8d95" /><stop offset="0.42" stopColor="#e6e8ec" /><stop offset="0.5" stopColor="#ffffff" /><stop offset="0.58" stopColor="#e6e8ec" /><stop offset="1" stopColor="#7c7f87" />
            </linearGradient>
            <linearGradient id="xp-flip-sheen" ref={sheen} x1="0" y1="0" x2="1" y2="0.2" gradientTransform="translate(-1.2 0)">
              <stop offset="0.38" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.5" /><stop offset="0.62" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <div className="xp-flip-bg" aria-hidden="true">
        <canvas ref={stars} className="xp-flip-stars" />
      </div>
      <div className="xp-flip-view">
      <div className="xp-flip-title3d" ref={titleCam}>
      {geo && text && Array.from({ length: DEPTH }, (_, k) => (
        <svg key={k} className="xp-flip-depth" viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true" style={{ transform: `translateZ(${-(k + 1) * geo.size * 0.011}px)` }}>
          <g ref={(el) => { depth.current[k] = el }}><text {...text} fill={`hsl(220 6% ${26 - k * 1.2}%)`}>{NAME}</text></g>
        </svg>
      ))}
      <div className="xp-flip-world" aria-hidden="true">
        <div className="xp-flip-rig" ref={rig}>
          <div className="xp-flip-stage" ref={stage}>
            {PANELS.map((p, i) => (
              <div key={i} ref={(el) => { pages.current[i] = el }} className={`xp-flip-page is-${tone(p)}`}>
                <span className="xp-flip-cam" style={{ "--z": p.z ?? 1, transformOrigin: p.at ?? "50% 50%" } as React.CSSProperties}><Content p={p} /></span>
                <i className="xp-flip-shade" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {geo && text && (
        <svg className="xp-flip-word" viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
          <g ref={word}>
            <text {...text} className="xp-flip-edge">{NAME}</text>
            <text {...text} className="xp-flip-solid" fill="url(#xp-flip-silver)">
              {NAME.split("").map((c, i) => <tspan key={i} ref={i === 0 ? rLetter : undefined} style={{ "--i": i } as React.CSSProperties}>{c}</tspan>)}
            </text>
            <text {...text} className="xp-flip-sheen" fill="url(#xp-flip-sheen)">{NAME}</text>
          </g>
        </svg>
      )}
      </div>
      </div>
      <i className="xp-flip-grain" aria-hidden="true" />
      <button type="button" className="xp-opening-skip xp-flip-skip" onClick={(e) => { e.stopPropagation(); close() }}>Skip</button>
    </div>
  )
}
