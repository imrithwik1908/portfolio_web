"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createFlipScore, type FlipScore } from "@/components/xp/flip-score"

// The flipbook: a second, optional opening, played only from the command menu. Pages from my own
// work flip past faster and faster, blur, and slam into the name. Every image is from this site and
// every number is one the site already reports. The music is an original cue (flip-score.ts).

type Panel =
  | { kind: "img"; src: string; pos: string; zoom: number; tone?: "paper" }
  | { kind: "type"; big: string; small: string; tone: "ink" | "paper" | "lamp" }

const PANELS: Panel[] = [
  { kind: "img", src: "/agentguard.png", pos: "18% 30%", zoom: 1.52 },
  { kind: "type", big: "AAAI 2026", small: "a paper with my name on it", tone: "ink" },
  { kind: "img", src: "/xmutest-annotation.png", pos: "30% 50%", zoom: 1.2, tone: "paper" },
  { kind: "type", big: "25–25", small: "a draw I didn’t call a win", tone: "paper" },
  { kind: "img", src: "/profile.jpg", pos: "50% 22%", zoom: 1.28 },
  { kind: "type", big: "PASS · BLOCK · REVIEW", small: "one release decision", tone: "lamp" },
  { kind: "img", src: "/course_catalog.jpg", pos: "70% 40%", zoom: 1.36 },
  { kind: "type", big: "16,830", small: "posts, marked word by word", tone: "ink" },
  { kind: "img", src: "/xmutest-architecture.png", pos: "60% 50%", zoom: 1.28, tone: "paper" },
  { kind: "type", big: "200 / 200", small: "games my retrain lost", tone: "paper" },
  { kind: "img", src: "/agentguard.png", pos: "80% 70%", zoom: 1.92 },
  { kind: "type", big: "$142", small: "mean daily ad-revenue error", tone: "lamp" },
  { kind: "img", src: "/tensor_fusion.jpg", pos: "50% 50%", zoom: 1, tone: "paper" },
  { kind: "type", big: "140,481", small: "numbers per clip", tone: "ink" },
  { kind: "img", src: "/profile.jpg", pos: "50% 70%", zoom: 1 },
  { kind: "type", big: "4.22", small: "GPA at Arizona State", tone: "paper" },
  { kind: "img", src: "/xmutest-annotation.png", pos: "80% 40%", zoom: 1.76, tone: "paper" },
  { kind: "type", big: "EN · HI · TE", small: "three languages", tone: "ink" },
  { kind: "img", src: "/course_catalog.jpg", pos: "20% 60%", zoom: 1.76 },
  { kind: "type", big: "+18%", small: "forecast accuracy", tone: "lamp" },
]
const IMG_PANELS = PANELS.filter((p): p is Extract<Panel, { kind: "img" }> => p.kind === "img")
const IMAGES = Array.from(new Set(PANELS.flatMap((p) => (p.kind === "img" ? [p.src] : []))))

// The cut list: slow page turns that keep speeding up until they're a blur.
const CUTS: number[] = (() => {
  const out: number[] = []
  let t = 260, gap = 440
  while (t < 3900) { out.push(Math.round(t)); t += gap; gap = Math.max(42, gap * 0.86) }
  return out
})()
const HIT = 4000
const GOLD = 5000
const END = 7000
const NAME = "RITHWIK"

export function Flipbook() {
  const [on, setOn] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pages = useRef<(HTMLDivElement | null)[]>([])
  const stage = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const score = useRef<FlipScore | null>(null)
  const frame = useRef(0)
  const closing = useRef(false)

  const close = useCallback((fast = true) => {
    if (closing.current) return
    closing.current = true
    score.current?.stop(fast ? 0.6 : 1.4)
    root.current?.classList.add("is-out")
    window.setTimeout(() => { cancelAnimationFrame(frame.current); setOn(false) }, fast ? 450 : 800)
  }, [])

  useEffect(() => {
    const open = () => { closing.current = false; setOn(true) }
    window.addEventListener("xp:flipbook", open)
    return () => window.removeEventListener("xp:flipbook", open)
  }, [])

  useEffect(() => {
    if (!on) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    IMAGES.forEach((src) => { const i = new Image(); i.src = src })
    document.documentElement.style.overflow = "hidden"

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === " " || e.key === "Enter") { e.preventDefault(); close() } }
    window.addEventListener("keydown", onKey)

    if (reduce) {
      root.current?.classList.add("is-still")
      const id = window.setTimeout(() => close(false), 2600)
      return () => { window.clearTimeout(id); window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = "" }
    }

    score.current = createFlipScore(CUTS, HIT)
    score.current?.start()

    let cut = -1, plateCut = -1, start = 0
    const show = (k: number) => {
      const front = pages.current[k % PANELS.length]
      const back = pages.current[(k - 1 + PANELS.length) % PANELS.length]
      pages.current.forEach((p) => p && p !== front && p !== back && (p.className = p.className.replace(/ is-(front|back)/g, "")))
      if (back) { back.classList.remove("is-front"); back.classList.add("is-back") }
      if (front) {
        front.classList.remove("is-back", "is-front")
        const gap = (CUTS[k + 1] ?? CUTS[k] + 42) - CUTS[k]
        front.style.setProperty("--d", `${Math.max(60, Math.min(420, gap * 0.95))}ms`)
        void front.offsetWidth
        front.classList.add("is-front")
      }
    }
    const tick = (now: number) => {
      frame.current = requestAnimationFrame(tick)
      if (!start) start = now
      const t = now - start
      // The montage.
      while (cut + 1 < CUTS.length && CUTS[cut + 1] <= t) { cut++; show(cut) }
      const gap = cut >= 0 && cut + 1 < CUTS.length ? CUTS[cut + 1] - CUTS[cut] : 42
      const blur = t < HIT ? Math.max(0, Math.min(7, 170 / gap - 1.2)) : 0
      const zoom = 1 + 0.16 * Math.min(1, t / HIT) + (t > HIT - 400 ? (t - (HIT - 400)) / 400 * 0.5 : 0)
      const shake = t > 3000 && t < HIT ? (Math.random() - 0.5) * 6 : 0
      if (stage.current) {
        stage.current.style.transform = `translate(${shake}px, ${shake * 0.6}px) scale(${zoom})`
        stage.current.style.filter = `blur(${blur}px) brightness(${1 + (t > HIT - 300 ? (t - (HIT - 300)) / 300 : 0) * 1.4})`
        stage.current.style.opacity = t < HIT ? "1" : String(Math.max(0, 1 - (t - HIT) / 220))
      }
      // The name: panels keep flipping inside the letters, then it turns to gold.
      if (t >= HIT - 60) {
        root.current?.classList.add("is-plate")
        const k = Math.floor((t - HIT) / 70)
        if (t < GOLD && k !== plateCut && fill.current) {
          plateCut = k
          const p = IMG_PANELS[k % IMG_PANELS.length]
          if (p) { fill.current.style.backgroundImage = `url(${p.src})`; fill.current.style.backgroundPosition = p.pos }
        }
        if (t >= GOLD) root.current?.classList.add("is-gold")
        if (plate.current) plate.current.style.transform = `scale(${1.18 - 0.18 * Math.min(1, (t - HIT) / 2400) ** 0.5})`
      }
      if (t >= END) close(false)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = ""
      score.current?.stop(0.3)
    }
  }, [on, close])

  if (!on) return null
  return (
    <div ref={root} className="xp-flip" role="dialog" aria-modal="true" aria-label="The flipbook intro: pages from my work flipping into my name" onClick={() => close()}>
      <div className="xp-flip-stage" ref={stage} aria-hidden="true">
        {PANELS.map((p, i) => (
          <div key={i} ref={(el) => { pages.current[i] = el }} className={`xp-flip-page is-${p.kind === "type" ? p.tone : p.tone ?? "photo"}`}>
            {p.kind === "img"
              ? <span className="xp-flip-img" style={{ backgroundImage: `url(${p.src})`, backgroundPosition: p.pos, transformOrigin: p.pos, transform: `scale(${p.zoom})` }} />
              : <span className="xp-flip-type"><b>{p.big}</b><small>{p.small}</small></span>}
            <i className="xp-flip-shade" />
          </div>
        ))}
      </div>
      <div className="xp-flip-flash" aria-hidden="true" />
      <div className="xp-flip-plate" ref={plate}>
        <p className="xp-flip-name" aria-label={NAME}>
          <span ref={fill} className="xp-flip-fill" aria-hidden="true">{NAME}</span>
          <span className="xp-flip-gold" aria-hidden="true">{NAME}</span>
        </p>
        <p className="xp-flip-sub">Sai Rithwik Reddy Chirra · ML systems, and the software around them</p>
      </div>
      <i className="xp-flip-grain" aria-hidden="true" />
      <button type="button" className="xp-opening-skip xp-flip-skip" onClick={(e) => { e.stopPropagation(); close() }}>Skip</button>
    </div>
  )
}
