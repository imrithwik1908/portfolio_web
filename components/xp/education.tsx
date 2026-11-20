"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { Globe } from "@/components/xp/globe"

// A product-reveal for two degrees. The section pins and the scroll plays it like a film:
// a headline rushes past, the globe rises out of the dark, Dharwad speaks, the globe leans in
// and flies the real route, Tempe arrives, and everything settles back as the page moves on.
const GRADUATION = new Date("2027-05-15T00:00:00-07:00")
const STARTED = new Date("2025-08-21T00:00:00-07:00")

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const mix = (a: number, b: number, t: number) => a + (b - a) * t

export function Education() {
  const [months, setMonths] = useState<number | null>(null)
  const [done, setDone] = useState(0)
  const [p, setP] = useState(0)
  const scrub = useRef(0)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const now = new Date()
    setMonths(Math.max(0, (GRADUATION.getFullYear() - now.getFullYear()) * 12 + GRADUATION.getMonth() - now.getMonth()))
    setDone(clamp((now.getTime() - STARTED.getTime()) / (GRADUATION.getTime() - STARTED.getTime())))
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = root.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const v = clamp(-r.top / Math.max(1, r.height - window.innerHeight))
      scrub.current = span(v, 0.4, 0.66)
      setP(v)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])

  // Scene timings, as fractions of the pinned scroll.
  const rise = ease(span(p, 0, 0.16))                 // globe comes up out of the dark
  const lean = ease(span(p, 0.4, 0.55)) - ease(span(p, 0.6, 0.74)) // leans in during the flight
  const leave = ease(span(p, 0.9, 1))                 // settles away at the end
  const scale = mix(0.42, 1, rise) * (1 + lean * 0.14) * (1 - leave * 0.12)
  const lift = mix(30, 0, rise) - leave * 6

  const headA = 1 - span(p, 0.06, 0.16)               // "Dharwad, 2021." rushes past
  const dharwad = span(p, 0.15, 0.21) * (1 - span(p, 0.33, 0.39))
  const headB = span(p, 0.62, 0.68) * (1 - span(p, 0.74, 0.8))
  const tempe = span(p, 0.76, 0.83)
  // The globe steps aside for whichever story is speaking (wide screens only; phones stack instead).
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const m = window.matchMedia("(min-width: 901px)")
    const on = () => setWide(m.matches)
    on(); m.addEventListener("change", on)
    return () => m.removeEventListener("change", on)
  }, [])
  const shift = wide ? (ease(dharwad) - ease(tempe)) * 15 : 0

  return (
    <div ref={root} className="xp-reveal">
      <div className="xp-reveal-stage">
        <h3 className="xp-reveal-head" aria-hidden={headA < 0.5} style={{ opacity: headA, transform: `scale(${mix(1, 1.9, 1 - headA)})`, filter: `blur(${(1 - headA) * 8}px)` }}>
          Dharwad, <em>2021</em>.
        </h3>

        <div className="xp-reveal-globe" style={{ transform: `translate(${shift}vw, ${lift}vh) scale(${scale})`, opacity: mix(0.2, 1, rise) * (1 - leave * 0.4) }}>
          <Globe scrub={scrub} />
          <i className="xp-reveal-halo" style={{ opacity: 0.35 + lean * 0.65 }} aria-hidden="true" />
        </div>

        <article className="xp-reveal-card is-left" style={{ opacity: dharwad, transform: `translateX(${(1 - dharwad) * -28}px)`, visibility: dharwad < 0.02 ? "hidden" : undefined }} aria-hidden={dharwad < 0.5}>
          <p className="xp-reveal-when">2021 – May 2025</p>
          <h4>IIIT Dharwad</h4>
          <p className="xp-reveal-degree">B.Tech, Computer Science</p>
          <p className="xp-reveal-stat"><b>8.94</b><span>GPA out of 10</span></p>
          <p>Data Analytics, Artificial Intelligence, Operating Systems. Alongside it, research at IIT Indore that became <Link href="/projects/x-mutest" className="xp-inline-link" tabIndex={dharwad < 0.5 ? -1 : 0}>X-MuTeST <Arrow /></Link></p>
        </article>

        <h3 className="xp-reveal-head is-b" aria-hidden={headB < 0.5} style={{ opacity: headB, transform: `scale(${mix(0.86, 1, headB)})` }}>
          Tempe, <em>2025</em>.
        </h3>

        <article className="xp-reveal-card is-right" style={{ opacity: tempe, transform: `translateX(${(1 - tempe) * 28}px)`, visibility: tempe < 0.02 ? "hidden" : undefined }} aria-hidden={tempe < 0.5}>
          <p className="xp-reveal-when">2025 – May 2027</p>
          <h4>Arizona State University</h4>
          <p className="xp-reveal-degree">M.S., Computer Science</p>
          <p className="xp-reveal-stat"><b><span className="xp-tip is-text" tabIndex={tempe < 0.5 ? -1 : 0} data-tip="Above 4.0 because ASU counts an A+ as 4.33.">4.22</span></b><span>GPA out of 4</span></p>
          <p>Data Mining, Data Visualization, Distributed Database Systems. Right now, <Link href="/projects/agentguard" className="xp-inline-link" tabIndex={tempe < 0.5 ? -1 : 0}>AgentGuard <Arrow /></Link></p>
          <div className="xp-reveal-bar" role="img" aria-label={`About ${Math.round(done * 100)}% of the way through`}>
            <span style={{ "--done": done * tempe } as React.CSSProperties} />
            <small>{Math.round(done * 100)}% through{months !== null && months > 0 && <> · {months} months to go</>}</small>
          </div>
        </article>
      </div>
    </div>
  )
}
