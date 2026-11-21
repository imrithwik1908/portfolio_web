"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { Globe } from "@/components/xp/globe"

// A product-reveal for two degrees, played by the scroll as one continuous shot:
// "Dharwad, 2021." rushes past, the globe rises, the first degree tells its four years,
// the globe flies the real route, "Tempe, 2025." lands in the middle of the screen and then
// slides into its own card while the globe steps aside.
const GRADUATION = new Date("2027-05-15T00:00:00-07:00")
const STARTED = new Date("2025-08-21T00:00:00-07:00") // first day of ASU's fall 2025 classes

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)
const ZOOM = 4 // how far the camera dives into each campus

// Camera zoom along the scroll: in to Dharwad while its story plays, out for the flight,
// in to Tempe after landing, out as the section ends. Smoothstep both ways, so it never snaps.
function zoomAt(p: number) {
  const dharwad = smooth(span(p, 0.13, 0.25)) * (1 - smooth(span(p, 0.32, 0.42)))
  const tempe = smooth(span(p, 0.72, 0.85)) * (1 - smooth(span(p, 0.91, 1)))
  return 1 + (ZOOM - 1) * Math.max(dharwad, tempe)
}

type Mark = { when: string; what: React.ReactNode }

function Timeline({ marks, at }: { marks: Mark[]; at: number }) {
  // `at` (0..1) draws the line and lights each mark in turn.
  return (
    <ol className="xp-tl" style={{ "--draw": at } as React.CSSProperties}>
      {marks.map((m, i) => {
        const on = at >= (i + 0.35) / marks.length
        return (
          <li key={i} className={on ? "is-on" : undefined}>
            <span>{m.when}</span>
            <p>{m.what}</p>
          </li>
        )
      })}
    </ol>
  )
}

function Ring({ value, max, fill, label }: { value: number; max: number; fill: number; label: string }) {
  const C = 2 * Math.PI * 30
  return (
    <div className="xp-ring" role="img" aria-label={`GPA ${value} ${label}`}>
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="30" className="xp-ring-track" />
        <circle cx="36" cy="36" r="30" className="xp-ring-fill" strokeDasharray={C} strokeDashoffset={C * (1 - (value / max) * fill)} />
      </svg>
      <b>{value.toFixed(2)}</b>
      <small>{label}</small>
    </div>
  )
}

export function Education() {
  const [done, setDone] = useState(0)
  const [months, setMonths] = useState<number | null>(null)
  const [p, setP] = useState(0)
  const [wide, setWide] = useState(true)
  const scrub = useRef(0)
  const zoom = useRef(1)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const now = new Date()
    setMonths(Math.max(0, (GRADUATION.getFullYear() - now.getFullYear()) * 12 + GRADUATION.getMonth() - now.getMonth()))
    setDone(clamp((now.getTime() - STARTED.getTime()) / (GRADUATION.getTime() - STARTED.getTime())))
    const m = window.matchMedia("(min-width: 901px)")
    const on = () => setWide(m.matches)
    on(); m.addEventListener("change", on)
    return () => m.removeEventListener("change", on)
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = root.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const v = clamp(-r.top / Math.max(1, r.height - window.innerHeight))
      scrub.current = span(v, 0.42, 0.64)
      zoom.current = zoomAt(v)
      setP(v)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])

  // Scene timings, as fractions of the pinned scroll.
  const rise = ease(span(p, 0, 0.14))
  const headA = 1 - span(p, 0.05, 0.14)                          // "Dharwad, 2021." rushes past
  const dharwad = span(p, 0.13, 0.19) * (1 - span(p, 0.36, 0.41))
  const dharwadDraw = span(p, 0.17, 0.33)                         // ring fills, the four years draw
  const lean = ease(span(p, 0.42, 0.52)) - ease(span(p, 0.58, 0.66))
  const headIn = ease(span(p, 0.62, 0.69))                        // "Tempe, 2025." lands in the middle
  const headOut = ease(span(p, 0.74, 0.81))                       // then glides into its card
  const headB = headIn * (1 - span(p, 0.77, 0.81))
  const tempe = span(p, 0.77, 0.84)
  const tempeDraw = span(p, 0.8, 0.92)
  const leave = ease(span(p, 0.94, 1))

  const hush = headIn * (1 - headOut)                             // the globe dims while the headline speaks
  const side = ease(dharwad) - ease(Math.max(tempe, headOut))     // which way the globe steps aside
  const shift = wide ? side * 15 : 0
  const card = Math.max(dharwad, tempe)
  const scale = mix(0.42, 1, rise) * (1 + lean * 0.14) * (1 - hush * 0.1) * (1 - leave * 0.12) * (wide ? 1 : 1 - card * 0.32)
  const lift = mix(30, 0, rise) - leave * 6 - (wide ? 0 : card * 10)
  const glow = mix(0.2, 1, rise) * (1 - hush * 0.6) * (1 - leave * 0.4)

  // The landed headline travels toward where the card's own heading sits.
  const headMove = wide ? `translate(${headOut * 20}vw, ${headOut * -26}vh)` : `translate(0, ${headOut * 26}vh)`

  return (
    <div ref={root} className="xp-reveal">
      <div className="xp-reveal-stage">
        <h3 className="xp-reveal-head" aria-hidden={headA < 0.5} style={{ opacity: headA, transform: `scale(${mix(1, 1.9, 1 - headA)})`, filter: `blur(${(1 - headA) * 8}px)` }}>
          Dharwad, <em>2021</em>.
        </h3>

        <div className="xp-reveal-globe" style={{ transform: `translate(${shift}vw, ${lift}vh) scale(${scale})`, opacity: glow }}>
          <Globe scrub={scrub} zoom={zoom} />
          <i className="xp-reveal-halo" style={{ opacity: 0.35 + lean * 0.65 }} aria-hidden="true" />
        </div>

        <article className="xp-reveal-card is-left" style={{ opacity: dharwad, transform: `translateX(${(1 - dharwad) * -28}px)`, visibility: dharwad < 0.02 ? "hidden" : undefined }} aria-hidden={dharwad < 0.5}>
          <p className="xp-reveal-when">2021 – 2025 · Dharwad, India</p>
          <h4>Indian Institute of Information Technology, Dharwad</h4>
          <p className="xp-reveal-degree">B.Tech in Computer Science</p>
          <div className="xp-reveal-row">
            <Ring value={8.94} max={10} fill={ease(span(dharwadDraw, 0, 0.5))} label="GPA · of 10" />
            <p className="xp-reveal-course">Data Analytics, Artificial Intelligence, Operating Systems</p>
          </div>
          <Timeline at={dharwadDraw} marks={[
            { when: "2023", what: "Web development internship" },
            { when: "2024", what: <>Research at IIT Indore that became <Link href="/projects/x-mutest" className="xp-inline-link" tabIndex={dharwad < 0.5 ? -1 : 0}>X-MuTeST <Arrow /></Link></> },
            { when: "Dec 2024", what: "Data science role alongside the final semester" },
            { when: "May 2025", what: "Graduated" },
          ]} />
        </article>

        <h3 className="xp-reveal-head is-b" aria-hidden={headB < 0.5} style={{ opacity: headB, transform: `${headMove} scale(${mix(1.3, 1, headIn) * mix(1, 0.42, headOut)})`, filter: `blur(${(1 - headIn) * 8}px)` }}>
          Tempe, <em>2025</em>.
        </h3>

        <article className="xp-reveal-card is-right" style={{ opacity: tempe, transform: `translateX(${(1 - tempe) * 28}px)`, visibility: tempe < 0.02 ? "hidden" : undefined }} aria-hidden={tempe < 0.5}>
          <p className="xp-reveal-when">2025 – 2027 · Tempe, Arizona</p>
          <h4>Arizona State University</h4>
          <p className="xp-reveal-degree">M.S. in Computer Science</p>
          <div className="xp-reveal-row">
            <p className="xp-reveal-gpa">
              <b>{(4.22 * ease(span(tempeDraw, 0, 0.5))).toFixed(2)}</b>
              <small>GPA out of 4 <span className="xp-tip is-text" tabIndex={tempe < 0.5 ? -1 : 0} data-tip="Above 4.0 because ASU counts an A+ as 4.33.">why above 4?</span></small>
            </p>
            <p className="xp-reveal-course">Data Mining, Data Visualization, Distributed Database Systems</p>
          </div>
          <Timeline at={tempeDraw} marks={[
            { when: "Fall 2025", what: "Started the master's" },
            { when: "2026", what: <>Building <Link href="/projects/agentguard" className="xp-inline-link" tabIndex={tempe < 0.5 ? -1 : 0}>AgentGuard <Arrow /></Link></> },
            { when: "Now", what: <>{Math.round(done * 100)}% of the way through{months !== null && months > 0 && <>, {months} months to go</>}</> },
            { when: "May 2027", what: "Graduation" },
          ]} />
        </article>
      </div>
    </div>
  )
}
