"use client"

import { useEffect, useRef, useState } from "react"

// The opening: my name, handwritten. About four and a half seconds, silent.
//
// "Rithwik" is written with a pen, one stroke at a time, in the order a person writes it: the R's
// stem, then its bowl and leg, slowly; then i (and its dot), t (and its cross), h, w, i, k. The pen
// moves at a steady speed, so long strokes take longer, and lifts briefly between strokes. As the i
// begins, the word starts gliding towards "Hi, I'm Rithwik"; the rest is written on the way, and
// when the k is finished the handwriting is sitting over the heading's own "Rithwik" and dissolves
// into it. The dark lifts during the glide.
//
// Once per visit, homepage only. Any key, click or scroll finishes it at once; never shown with
// reduced motion (the inline script in the layout decides before the first paint).

// Single-line strokes, drawn by hand on a 660 × 220 box (baseline y = 220, x-height y = 120).
const STROKES = [
  "M 92 44 C 88 100 82 165 74 222", // R: stem
  "M 90 46 C 140 28 196 40 192 82 C 189 116 140 132 92 128 C 128 140 150 190 176 216 C 186 226 200 224 212 210", // R: bowl and leg
  "M 236 126 C 232 160 226 198 232 216 C 238 228 254 222 266 206", // i
  "M 242 84 C 244 79 249 78 251 83", // i: dot
  "M 290 56 C 284 112 276 172 280 210 C 284 228 304 224 316 206", // t
  "M 274 110 C 290 108 306 106 322 104", // t: cross
  "M 346 34 C 338 100 326 170 316 222 C 330 160 356 122 380 124 C 400 126 392 168 388 196 C 386 216 396 226 420 208", // h
  "M 434 124 C 428 160 428 200 440 218 C 452 230 466 196 472 160 C 474 194 482 224 498 220 C 518 214 530 168 526 122", // w
  "M 560 126 C 556 160 550 198 556 216 C 562 228 578 222 590 206", // i
  "M 566 84 C 568 79 573 78 575 83", // i: dot
  "M 622 34 C 614 100 602 170 592 222 C 606 176 640 128 662 134 C 680 140 660 168 606 172 C 636 180 646 214 668 220 C 682 224 694 214 702 204", // k
]
const VB = { x: 60, y: 20, w: 660, h: 220 }
const BASE = (220 - VB.y) / VB.h // where the baseline sits in the box

const START = 200 // the first touch of the pen
const R_MS = 1500 // the R, slowly
const REST_MS = 2700 // everything after the R
const LIFT = 60 // the pen lifting between strokes
const SETTLE = 650 // the handwriting dissolving into the heading

type Box = { left: number; top: number; width: number; height: number; from: string }

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [box, setBox] = useState<Box | null>(null)
  const paths = useRef<(SVGPathElement | null)[]>([])
  const wrap = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const done = useRef(false)
  const endRef = useRef<(fast: boolean) => void>(() => {})

  useEffect(() => {
    const html = document.documentElement
    const forced = new URLSearchParams(window.location.search).has("intro-at")
    if (html.dataset.intro === "off" && !forced) { setPhase("gone"); return }
    if (forced) { delete html.dataset.intro; html.classList.add("is-intro") }
    const target = document.querySelector<HTMLElement>(".xp-hero h1 .xp-name")
    if (!target) { html.classList.remove("is-intro"); setPhase("gone"); return }
    try { sessionStorage.setItem("xp-intro", "1") } catch { /* storage blocked: it plays again next time */ }
    html.classList.add("is-writing", "intro-done")
    window.scrollTo(0, 0)

    let alive = true
    let timer = 0
    endRef.current = (fast) => {
      if (done.current) return
      done.current = true
      html.classList.remove("is-intro", "is-writing")
      if (fast) root.current?.classList.add("is-skip")
      setPhase("leave")
      timer = window.setTimeout(() => setPhase("gone"), fast ? 500 : SETTLE + 50)
    }

    // Where the handwriting has to end up: over the heading's "Rithwik", sitting on its baseline.
    document.fonts.ready.then(() => {
      if (!alive) return
      const r = target.getBoundingClientRect()
      const cs = getComputedStyle(target)
      const ctx = document.createElement("canvas").getContext("2d")
      let ascent = parseFloat(cs.fontSize) * 0.8
      if (ctx) { ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; ascent = ctx.measureText("R").fontBoundingBoxAscent || ascent }
      const width = r.width * 1.02, height = (width * VB.h) / VB.w
      const left = r.left - r.width * 0.01, top = r.top + ascent - height * BASE
      const W = window.innerWidth, H = window.innerHeight
      const s = Math.min((W * 0.6) / width, (H * 0.4) / height, 4.4)
      // scaled about its own top-left corner, so its centre lands on the centre of the screen
      const tx = W / 2 - left - (width / 2) * s, ty = H / 2 - top - (height / 2) * s
      setBox({ left, top, width, height, from: `translate(${tx}px, ${ty}px) scale(${s})` })
    })

    const skip = () => endRef.current(true)
    const onKey = (e: KeyboardEvent) => { if (!e.metaKey && !e.ctrlKey) skip() }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", skip)
    window.addEventListener("wheel", skip, { passive: true })
    window.addEventListener("touchmove", skip, { passive: true })
    return () => {
      alive = false
      window.clearTimeout(timer)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", skip)
      window.removeEventListener("wheel", skip)
      window.removeEventListener("touchmove", skip)
      html.classList.remove("is-intro", "is-writing")
    }
  }, [])

  // Once the strokes are on the page: measure them and give each its moment and duration so the pen
  // keeps a steady speed (slower through the R), then start the glide with the i.
  useEffect(() => {
    if (!box || !wrap.current) return
    const len = paths.current.map((p) => p?.getTotalLength() ?? 0)
    const rLen = len[0] + len[1], restLen = len.slice(2).reduce((a, b) => a + b, 0)
    const restWriting = REST_MS - LIFT * (STROKES.length - 3)
    let t = START, glideAt = 0
    paths.current.forEach((p, i) => {
      if (!p) return
      const ms = i < 2 ? (len[i] / rLen) * (R_MS - LIFT) : (len[i] / restLen) * restWriting
      if (i === 2) glideAt = t
      p.style.setProperty("--at", `${Math.round(t)}ms`)
      p.style.setProperty("--dur", `${Math.max(90, Math.round(ms))}ms`)
      t += ms + LIFT
    })
    const finish = t - LIFT
    const el = wrap.current
    el.style.setProperty("--glide-at", `${Math.round(glideAt)}ms`)
    el.style.setProperty("--glide", `${Math.round(finish - glideAt)}ms`)
    el.classList.add("is-go")
    // ?intro-at=1200 holds the opening still at that moment (for tuning it frame by frame).
    const hold = Number(new URLSearchParams(window.location.search).get("intro-at"))
    if (hold > 0) {
      requestAnimationFrame(() => {
        root.current?.querySelectorAll<HTMLElement | SVGElement>("*").forEach((n) => n.getAnimations().forEach((a) => { a.pause(); a.currentTime = hold }))
        if (hold >= glideAt) { document.documentElement.classList.remove("is-intro"); setPhase("leave") }
      })
      return
    }
    const timers = [
      window.setTimeout(() => { if (done.current) return; document.documentElement.classList.remove("is-intro"); setPhase("leave") }, glideAt),
      window.setTimeout(() => endRef.current(false), finish),
    ]
    return () => timers.forEach(clearTimeout)
  }, [box])

  if (phase === "gone") return null
  return (
    <div ref={root} className={`xp-write ${phase === "leave" ? "is-leaving" : ""}`} aria-hidden="true">
      {box && (
        <div ref={wrap} className="xp-write-hand" style={{ left: box.left, top: box.top, width: box.width, height: box.height, "--from": box.from } as React.CSSProperties}>
          <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} width="100%" height="100%" overflow="visible">
            {STROKES.map((d, i) => <path key={i} ref={(el) => { paths.current[i] = el }} d={d} pathLength={1} />)}
          </svg>
        </div>
      )}
    </div>
  )
}
