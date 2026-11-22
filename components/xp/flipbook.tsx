"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createFlipScore, type FlipScore } from "@/components/xp/flip-score"
import { FIGURE_DRAWINGS } from "@/components/xp/figures"
import { ProjectVisual } from "@/components/xp/project-visual"
import { projectMeta } from "@/lib/project-highlights"

// The flipbook: a second, optional opening, played only from the command menu. It tells the work
// in chapters: release checks, language, three senses, systems, data, chess, research. Inside a
// chapter the camera pushes into the same drawing (a cut); between chapters a page turns. The last
// second is a blur of everything before the name lands. The drawings are this site's own; the three
// photographs are openly licensed and credited on /credits; every number is one the site reports.

type Cam = { z?: number; at?: string }
type Panel = Cam & { cut?: boolean } & (
  | { kind: "vis"; slug: string }
  | { kind: "fig"; draw: keyof typeof FIGURE_DRAWINGS }
  | { kind: "img"; src: string; paper?: boolean }
  | { kind: "type"; big: string; small: string; tone: "ink" | "paper" | "lamp" }
  | { kind: "fog"; clear: number }
)

const PANELS: Panel[] = [
  // Release: what changed, and is it safe to ship?
  { kind: "vis", slug: "agentguard" },
  { kind: "fig", draw: "trace" },
  { kind: "fig", draw: "trace", z: 1.9, at: "72% 55%", cut: true },
  { kind: "fig", draw: "release" },
  { kind: "fig", draw: "release", z: 1.8, at: "60% 60%", cut: true },
  { kind: "type", big: "PASS · BLOCK · REVIEW", small: "one release decision", tone: "lamp" },
  { kind: "img", src: "/agentguard.png", z: 1.3, at: "20% 30%" },
  // Language: which words actually carry the label?
  { kind: "vis", slug: "x-mutest" },
  { kind: "vis", slug: "x-mutest", z: 1.9, at: "50% 50%", cut: true },
  { kind: "img", src: "/xmutest-annotation.png", paper: true },
  { kind: "fig", draw: "agreement" },
  { kind: "type", big: "16,830", small: "posts, marked word by word", tone: "ink" },
  { kind: "img", src: "/xmutest-architecture.png", paper: true, z: 1.15 },
  { kind: "type", big: "EN · HI · TE", small: "three languages", tone: "paper", cut: true },
  // Three senses: face, voice and words.
  { kind: "vis", slug: "tensor-fusion" },
  { kind: "img", src: "/flipbook/neuron.jpg", z: 1.1, cut: true },
  { kind: "fig", draw: "tensor" },
  { kind: "img", src: "/tensor_fusion.jpg", paper: true },
  // Systems: two writes that have to agree.
  { kind: "vis", slug: "course-catalog" },
  { kind: "fig", draw: "schema" },
  { kind: "fig", draw: "enroll", cut: true },
  { kind: "img", src: "/course_catalog.jpg", z: 1.2, at: "70% 40%" },
  // Data: shoppers and ad revenue.
  { kind: "img", src: "/flipbook/atrium.jpg" },
  { kind: "img", src: "/flipbook/fiber.jpg", cut: true },
  { kind: "type", big: "$142", small: "mean daily ad-revenue error", tone: "lamp" },
  // Chess in the fog.
  { kind: "fog", clear: 0.18 },
  { kind: "fog", clear: 0.5, cut: true },
  { kind: "fog", clear: 0.85, cut: true },
  { kind: "type", big: "25–25", small: "a draw I didn’t call a win", tone: "paper" },
  { kind: "type", big: "200 / 200", small: "games my retrain lost", tone: "ink", cut: true },
  // Research.
  { kind: "type", big: "AAAI 2026", small: "a paper with my name on it", tone: "ink" },
  { kind: "type", big: "4.22", small: "GPA at Arizona State", tone: "paper" },
]
// Pages stacked behind the one in front, seen only while the camera is at an angle.
const GHOSTS = [3, 10, 16, 19, 25]
const IMAGES = Array.from(new Set(PANELS.flatMap((p) => (p.kind === "img" ? [p.src] : []))))

// Timing: one pass through the story, each cut a little quicker than the last; at HIT the camera
// pulls back and the pages keep flipping inside a closing title box; then the name.
const HIT = 6400
const BOX = HIT + 700 // the pages have closed into the title box
const GOLD = HIT + 1100 // the name arrives
const END = HIT + 3400
const CUTS: { t: number; i: number }[] = (() => {
  const out: { t: number; i: number }[] = []
  let t = 380, gap = 600
  PANELS.forEach((_, i) => { out.push({ t: Math.round(t), i }); t += gap; gap = Math.max(40, gap * 0.9) })
  let k = 0
  while (t < BOX - 60) { out.push({ t: Math.round(t), i: (k * 7 + 3) % PANELS.length }); t += 42; k++ }
  return out
})()
const NAME = "RITHWIK"

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

function Content({ p }: { p: Panel }) {
  if (p.kind === "vis") return <span className="xp-flip-vis pc is-live" style={{ "--tint": projectMeta[p.slug].tint, "--accent": projectMeta[p.slug].accent } as React.CSSProperties}><ProjectVisual slug={p.slug} /></span>
  if (p.kind === "fig") { const D = FIGURE_DRAWINGS[p.draw]; return <span className="xp-flip-fig"><D /></span> }
  if (p.kind === "img") return <span className="xp-flip-img" style={{ backgroundImage: `url(${p.src})`, backgroundSize: p.paper ? "contain" : "cover" }} />
  if (p.kind === "fog") return <Fog clear={p.clear} />
  return <span className="xp-flip-type"><b>{p.big}</b><small>{p.small}</small></span>
}

const tone = (p: Panel) => (p.kind === "type" ? p.tone : p.kind === "fig" || (p.kind === "img" && p.paper) ? "paper" : p.kind === "vis" ? "tint" : p.kind === "fog" ? "board" : "photo")

export function Flipbook() {
  const [on, setOn] = useState(false)
  const [ready, setReady] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pages = useRef<(HTMLDivElement | null)[]>([])
  const stage = useRef<HTMLDivElement>(null)
  const rig = useRef<HTMLDivElement>(null)
  const ghosts = useRef<(HTMLDivElement | null)[]>([])
  const box = useRef<HTMLDivElement>(null)
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

  // Load every picture before the first cut, so nothing flips onto a blank page (at most ~3 s).
  useEffect(() => {
    if (!on) return
    let alive = true
    const all = IMAGES.map((src) => new Promise<void>((res) => { const i = new Image(); i.onload = i.onerror = () => res(); i.src = src }))
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
    if (!on || !ready) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.current?.classList.add("is-still")
      const id = window.setTimeout(() => close(false), 2600)
      return () => window.clearTimeout(id)
    }

    score.current = createFlipScore(CUTS.map((c) => c.t), HIT)
    score.current?.start()

    let cut = -1, start = 0, prev = -1
    const show = (k: number) => {
      const { i } = CUTS[k]
      const front = pages.current[i], back = prev >= 0 ? pages.current[prev] : null
      pages.current.forEach((p) => { if (p && p !== front && p !== back) p.classList.remove("is-front", "is-back") })
      if (back && back !== front) { back.classList.remove("is-front"); back.classList.add("is-back") }
      if (front) {
        front.classList.remove("is-back", "is-front")
        const gap = (CUTS[k + 1]?.t ?? CUTS[k].t + 42) - CUTS[k].t
        front.style.setProperty("--d", `${Math.max(60, Math.min(520, gap * 0.95))}ms`)
        front.classList.toggle("is-cut", !!PANELS[i].cut && k < PANELS.length)
        void front.offsetWidth
        front.classList.add("is-front")
      }
      prev = i
    }
    const ease = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c) }
    const W = window.innerWidth, H = window.innerHeight
    const bx = box.current?.getBoundingClientRect()
    const tick = (now: number) => {
      frame.current = requestAnimationFrame(tick)
      if (!start) start = now
      const t = now - start
      while (cut + 1 < CUTS.length && CUTS[cut + 1].t <= t) { cut++; show(cut) }
      const gap = cut >= 0 && cut + 1 < CUTS.length ? CUTS[cut + 1].t - CUTS[cut].t : 42

      // The camera: it starts low and to one side of a stack of pages, dollies in while it swings
      // round, keeps a slow handheld sway through the middle, and squares up before the pull-back.
      const settle = 1 - ease((t - (HIT - 1100)) / 1000)
      const rotY = -26 * (1 - ease(t / 2800)) + 5 * Math.sin(t / 820) * settle * ease(t / 1400)
      const rotX = 14 * (1 - ease(t / 3200)) + 2.5 * Math.sin(t / 1150 + 1) * settle * ease(t / 1400)
      const dolly = -760 * (1 - ease(t / 2800))
      const swing = Math.min(1, (Math.abs(rotY) + Math.abs(rotX)) / 14)
      if (rig.current) rig.current.style.transform = t < HIT ? `translateZ(${dolly}px) rotateX(${rotX}deg) rotateY(${rotY}deg)` : "none"
      ghosts.current.forEach((g, k) => { if (g) g.style.opacity = String(t < HIT ? Math.max(0.12, swing) * (1 - k * 0.12) : 0) })

      // The pages: motion blur and a shake as the cutting speeds up.
      const blur = t < HIT ? Math.max(0, Math.min(5, 130 / gap - 1.6)) : 0
      const shake = t > HIT - 900 && t < HIT ? (Math.random() - 0.5) * 5 : 0
      const zoom = 1 + 0.1 * Math.min(1, t / HIT)
      if (stage.current) {
        if (t < HIT) {
          stage.current.style.transform = `translate(${shake}px, ${shake * 0.6}px) scale(${zoom})`
          stage.current.style.filter = `blur(${blur}px)`
          stage.current.style.clipPath = ""
        } else if (bx) {
          // The pull-back: the pages keep flipping while the frame closes into the title box.
          const p = ease((t - HIT) / (BOX - HIT))
          stage.current.style.transform = `scale(${zoom - (zoom - 1) * p})`
          stage.current.style.filter = `blur(${2 * (1 - p)}px) brightness(${1 - 0.25 * p})`
          stage.current.style.clipPath = `inset(${bx.top * p}px ${(W - bx.right) * p}px ${(H - bx.bottom) * p}px ${bx.left * p}px)`
          stage.current.style.opacity = String(t < BOX ? 1 : Math.max(0, 1 - (t - BOX) / 450))
        }
      }
      if (t >= HIT) root.current?.classList.add("is-plate")
      if (t >= BOX - 250) root.current?.classList.add("is-box")
      if (t >= GOLD) root.current?.classList.add("is-name")
      if (t >= END) close(false)
    }
    frame.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame.current); score.current?.stop(0.3) }
  }, [on, ready, close])

  if (!on) return null
  return (
    <div ref={root} className="xp-flip" role="dialog" aria-modal="true" aria-label="The flipbook intro: my work, chapter by chapter, flipping into my name" onClick={() => close()}>
      {!ready && <p className="xp-flip-loading" aria-live="polite">Loading the pages…</p>}
      <div className="xp-flip-world" aria-hidden="true">
        <div className="xp-flip-rig" ref={rig}>
          {GHOSTS.map((i, k) => (
            <div key={i} ref={(el) => { ghosts.current[k] = el }} className={`xp-flip-ghost is-${tone(PANELS[i])}`} style={{ "--k": k } as React.CSSProperties}>
              <span className="xp-flip-cam"><Content p={PANELS[i]} /></span>
            </div>
          ))}
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
      <div className="xp-flip-flash" aria-hidden="true" />
      <div className="xp-flip-box" ref={box}>
        <p className="xp-flip-name" aria-label={NAME}><span aria-hidden="true">{NAME}</span></p>
      </div>
      <i className="xp-flip-grain" aria-hidden="true" />
      <button type="button" className="xp-opening-skip xp-flip-skip" onClick={(e) => { e.stopPropagation(); close() }}>Skip</button>
    </div>
  )
}
