"use client"

import { useEffect, useRef, useState } from "react"
import { MARKS, Signature } from "@/components/xp/signature"

// The opening: my name, handwritten. About four and a half seconds, silent.
//
// "Rithwik" is written with a pen, one stroke at a time, in the order a person writes it: the R's
// stem, then its bowl and leg, slowly; then i (and a dot tapped on), t (and its cross), h, w, i
// (another dot), k. The pen moves at a steady speed, so long strokes take longer, and lifts briefly
// between strokes. As the i begins, the word starts gliding towards "Hi, I'm Rithwik"; the rest is
// written on the way, and the k is finished exactly on top of the heading's own signature, which
// is the same drawing, so nothing changes shape at the handover. The dark lifts during the glide.
//
// Once per visit, homepage only. Any key, click or scroll finishes it at once; never shown with
// reduced motion (the inline script in the layout decides before the first paint).
// ?intro-at=<ms> holds a single moment, for tuning.

const START = 200 // the first touch of the pen
const R_MS = 1500 // the R, slowly
const REST_MS = 2700 // everything after the R
const LIFT = 60 // the pen lifting between strokes
const DOT_MS = 170 // a dot, tapped on
const SETTLE = 250 // the handover to the heading's signature

type Box = { left: number; top: number; width: number; height: number; from: string }

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [box, setBox] = useState<Box | null>(null)
  const marks = useRef<(SVGPathElement | SVGCircleElement | null)[]>([])
  const wrap = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const done = useRef(false)
  const endRef = useRef<(fast: boolean) => void>(() => {})

  useEffect(() => {
    const html = document.documentElement
    const forced = new URLSearchParams(window.location.search).has("intro-at")
    if (html.dataset.intro === "off" && !forced) { setPhase("gone"); return }
    if (forced) { delete html.dataset.intro; html.classList.add("is-intro") }
    const target = document.querySelector<SVGSVGElement>(".xp-hero h1 .xp-name-sig")
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
      timer = window.setTimeout(() => setPhase("gone"), fast ? 500 : SETTLE + 60)
    }

    // The heading's signature is where the handwriting has to land, exactly.
    document.fonts.ready.then(() => {
      if (!alive) return
      const r = target.getBoundingClientRect()
      const W = window.innerWidth, H = window.innerHeight
      const s = Math.min((W * (W < 700 ? 0.86 : 0.62)) / r.width, (H * 0.42) / r.height, 4.6)
      // scaled about its own top-left corner, so its centre lands on the centre of the screen
      const tx = W / 2 - r.left - (r.width / 2) * s, ty = H / 2 - r.top - (r.height / 2) * s
      setBox({ left: r.left, top: r.top, width: r.width, height: r.height, from: `translate(${tx}px, ${ty}px) scale(${s})` })
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

  // Measure the strokes and give each its moment and duration so the pen keeps a steady speed
  // (slower through the R); dots are quick taps. The glide starts with the i.
  useEffect(() => {
    if (!box || !wrap.current) return
    const len = marks.current.map((m) => (m instanceof SVGPathElement ? m.getTotalLength() : 0))
    const rLen = len[0] + len[1]
    const restMarks = MARKS.slice(2)
    const restLen = len.slice(2).reduce((a, b) => a + b, 0)
    const dots = restMarks.filter((m) => "dot" in m).length
    const restWriting = REST_MS - LIFT * (restMarks.length - 1) - DOT_MS * dots
    let t = START, glideAt = 0
    marks.current.forEach((m, i) => {
      if (!m) return
      const ms = "dot" in MARKS[i] ? DOT_MS : i < 2 ? (len[i] / rLen) * (R_MS - LIFT) : (len[i] / restLen) * restWriting
      if (i === 2) glideAt = t
      m.style.setProperty("--at", `${Math.round(t)}ms`)
      m.style.setProperty("--dur", `${Math.max(90, Math.round(ms))}ms`)
      t += ms + LIFT
    })
    const finish = t - LIFT
    const el = wrap.current
    el.style.setProperty("--glide-at", `${Math.round(glideAt)}ms`)
    el.style.setProperty("--glide", `${Math.round(finish - glideAt)}ms`)
    el.classList.add("is-go")

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
          <Signature className="xp-write-sig" pathRef={(i, el) => { marks.current[i] = el }} />
        </div>
      )}
    </div>
  )
}
