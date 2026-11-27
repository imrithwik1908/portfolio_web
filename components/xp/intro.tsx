"use client"

import { useEffect, useRef, useState } from "react"

// The opening: my name, written in. About three and three-quarter seconds, silent.
//
// "Rithwik" is drawn stroke by stroke in the hero's own italic, large and centred. The R is written
// alone and slowly; as the i begins, the word starts gliding down towards "Hi, I'm Rithwik" and the
// rest is written on the way, each letter's ink settling just behind its pen, so the k is finished
// as the word lands. The dark lifts during the glide and the real heading takes over underneath.
// Every letter is positioned from the hero's own layout, so the handover lands on the exact glyphs.
//
// Once per visit, homepage only. Any key, click or scroll finishes it at once; never shown with
// reduced motion (the inline script in the layout decides before the first paint).

type Letter = { ch: string; x: number }
type Geo = { letters: Letter[]; y: number; font: string; size: number; from: string }

// The R is written alone, slowly. From the second letter on, the word is already travelling: the
// rest are written on the way, and the k's ink settles just as the word lands in the heading.
const R_AT = 150, R_DRAW = 1450
const REST_AT = 1500, STEP = 260, LETTER_DRAW = 620, INK = 500
const GLIDE_AT = REST_AT // the glide itself is a CSS animation on the same timeline
const GLIDE = REST_AT + 5 * STEP + LETTER_DRAW * 0.6 + INK + 40 - GLIDE_AT

export function Intro() {
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play")
  const [geo, setGeo] = useState<Geo | null>(null)
  const done = useRef(false)

  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.intro === "off") { setPhase("gone"); return }
    const target = document.querySelector<HTMLElement>(".xp-hero h1 .xp-name")
    const text = target?.firstChild
    if (!target || !text || text.nodeType !== Node.TEXT_NODE) {
      html.classList.remove("is-intro"); setPhase("gone"); return
    }
    try { sessionStorage.setItem("xp-intro", "1") } catch { /* storage blocked: it plays again next time */ }
    html.classList.add("is-writing", "intro-done")
    window.scrollTo(0, 0)

    let alive = true
    const timers: number[] = []
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    const finish = (fast: boolean) => {
      if (done.current) return
      done.current = true
      html.classList.remove("is-intro", "is-writing")
      document.querySelector(".xp-write")?.classList.add("is-skip")
      setPhase("leave")
      later(fast ? 500 : 260, () => setPhase("gone"))
    }

    // Measure the heading's own glyphs once the font is in, then lay the big word out from them.
    document.fonts.ready.then(() => {
      if (!alive) return
      const box = target.getBoundingClientRect()
      const cs = getComputedStyle(target)
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const ctx = document.createElement("canvas").getContext("2d")
      let ascent = parseFloat(cs.fontSize) * 0.8
      if (ctx) { ctx.font = font; ascent = ctx.measureText("R").fontBoundingBoxAscent || ascent }
      const letters: Letter[] = Array.from(text.textContent ?? "", (ch, i) => {
        const range = document.createRange(); range.setStart(text, i); range.setEnd(text, i + 1)
        return { ch, x: range.getBoundingClientRect().left }
      })
      const W = window.innerWidth, H = window.innerHeight
      const scale = Math.min((W * 0.62) / box.width, (H * 0.34) / box.height, 4.2)
      const tx = W / 2 - (box.left + box.width / 2) * scale
      const ty = H / 2 - (box.top + box.height / 2) * scale
      setGeo({ letters, y: box.top + ascent, font, size: parseFloat(cs.fontSize), from: `translate(${tx}px, ${ty}px) scale(${scale})` })
    })
    const skip = () => finish(true)
    const onKey = (e: KeyboardEvent) => { if (!e.metaKey && !e.ctrlKey) skip() }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", skip)
    window.addEventListener("wheel", skip, { passive: true })
    window.addEventListener("touchmove", skip, { passive: true })
    return () => {
      alive = false
      timers.forEach(clearTimeout)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", skip)
      window.removeEventListener("wheel", skip)
      window.removeEventListener("touchmove", skip)
      html.classList.remove("is-intro", "is-writing")
    }
  }, [])

  if (phase === "gone") return null
  return (
    <div className={`xp-write ${phase === "leave" ? "is-leaving" : ""}`} aria-hidden="true">
      {geo && (
        <svg className="xp-write-svg">
          <g
            className="xp-write-word"
            style={{ "--from": geo.from, "--glide-at": `${GLIDE_AT}ms`, "--glide": `${GLIDE}ms`, font: geo.font } as React.CSSProperties}
            onAnimationStart={(e) => { if (e.animationName === "xp-write-glide") { document.documentElement.classList.remove("is-intro"); setPhase("leave") } }}
            onAnimationEnd={(e) => { if (e.animationName === "xp-write-glide") { done.current = true; document.documentElement.classList.remove("is-writing"); setPhase("gone") } }}
          >
            {geo.letters.map((l, i) => {
              const at = i === 0 ? R_AT : REST_AT + (i - 1) * STEP
              const draw = i === 0 ? R_DRAW : LETTER_DRAW
              return (
                <text key={i} x={l.x} y={geo.y} style={{ "--at": `${at}ms`, "--draw": `${draw}ms`, "--ink": `${INK}ms`, "--dash": geo.size * 7, strokeWidth: Math.max(0.6, geo.size / 70) } as React.CSSProperties}>{l.ch}</text>
              )
            })}
          </g>
        </svg>
      )}
    </div>
  )
}
