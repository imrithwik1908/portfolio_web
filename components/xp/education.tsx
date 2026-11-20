"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { Globe } from "@/components/xp/globe"

// The section pins while you scroll through it, and the scroll itself turns the globe:
// Dharwad first, then the real route, then Tempe. Each degree speaks only while its campus faces you.
const GRADUATION = new Date("2027-05-15T00:00:00-07:00")
const STARTED = new Date("2025-08-21T00:00:00-07:00")

const clamp = (v: number) => Math.min(1, Math.max(0, v))

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
      scrub.current = v
      setP(v)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])

  // Dharwad holds the stage until the flight begins; Arizona State arrives as it lands.
  const first = 1 - clamp((p - 0.3) / 0.14)
  const second = clamp((p - 0.62) / 0.14)

  return (
    <div ref={root} className="xp-orbit">
      <div className="xp-orbit-stage">
        <article className="xp-orbit-card is-left" style={{ opacity: first, transform: `translateY(${(1 - first) * -24}px)`, visibility: first < 0.02 ? "hidden" : undefined }} aria-hidden={first < 0.5}>
          <p className="xp-orbit-when">2021 – May 2025 · Dharwad, India</p>
          <h3>IIIT Dharwad</h3>
          <p className="xp-orbit-degree">B.Tech, Computer Science <span>· GPA 8.94 / 10</span></p>
          <p>Data Analytics, Artificial Intelligence, Operating Systems. Alongside it, research at IIT Indore that became <Link href="/projects/x-mutest" className="xp-inline-link" tabIndex={first < 0.5 ? -1 : 0}>X-MuTeST <Arrow /></Link>, and forecasting at Blackcoffer.</p>
        </article>

        <div className="xp-orbit-globe"><Globe scrub={scrub} /></div>

        <article className="xp-orbit-card is-right" style={{ opacity: second, transform: `translateY(${(1 - second) * 24}px)`, visibility: second < 0.02 ? "hidden" : undefined }} aria-hidden={second < 0.5}>
          <p className="xp-orbit-when">2025 – May 2027 · Tempe, Arizona</p>
          <h3>Arizona State University</h3>
          <p className="xp-orbit-degree">M.S., Computer Science <span>· GPA <span className="xp-tip is-text" tabIndex={second < 0.5 ? -1 : 0} data-tip="Above 4.0 because ASU counts an A+ as 4.33.">4.22</span></span></p>
          <p>Data Mining, Data Visualization, Distributed Database Systems. Right now, <Link href="/projects/agentguard" className="xp-inline-link" tabIndex={second < 0.5 ? -1 : 0}>AgentGuard <Arrow /></Link> and a Fog-of-War chess agent for CSE 598.</p>
          <div className="xp-orbit-bar" role="img" aria-label={`About ${Math.round(done * 100)}% of the way through`}>
            <span style={{ "--done": done * second } as React.CSSProperties} />
            <small>{Math.round(done * 100)}% through{months !== null && months > 0 && <> · {months} months to go</>}</small>
          </div>
        </article>

        <p className="xp-orbit-hint" style={{ opacity: 1 - clamp(p / 0.12) }}>Keep scrolling</p>
      </div>
    </div>
  )
}
