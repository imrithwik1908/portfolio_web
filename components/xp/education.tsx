"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { Globe } from "@/components/xp/globe"

// Degrees from the résumé, joined by the real great-circle distance between the two campuses.
const GRADUATION = new Date("2027-05-15T00:00:00-07:00")
const STARTED = new Date("2025-08-21T00:00:00-07:00")

export function Education() {
  const [months, setMonths] = useState<number | null>(null)
  const [done, setDone] = useState(0)
  useEffect(() => {
    const now = new Date()
    setMonths(Math.max(0, (GRADUATION.getFullYear() - now.getFullYear()) * 12 + GRADUATION.getMonth() - now.getMonth()))
    setDone(Math.min(1, Math.max(0, (now.getTime() - STARTED.getTime()) / (GRADUATION.getTime() - STARTED.getTime()))))
  }, [])
  const chips = (list: string[]) => <div className="xp-degree-chips">{list.map((c) => <span key={c}>{c}</span>)}</div>
  // Pointing at a card turns the globe to that campus.
  const fly = (to: "dharwad" | "tempe") => () => window.dispatchEvent(new CustomEvent("xp-globe-fly", { detail: to }))

  return (
    <div className="xp-degrees">
      <article className="xp-degree" onMouseEnter={fly("dharwad")} onFocus={fly("dharwad")} tabIndex={-1}>
        <div className="xp-degree-main">
        <p className="xp-degree-when">2021 — May 2025 <span>· Dharwad, India</span></p>
        <h3>IIIT Dharwad</h3>
        <p className="xp-degree-name">B.Tech Computer Science</p>
        <div className="xp-degree-stats">
          <div className="xp-degree-gpa"><b>8.94</b><small>GPA out of 10</small></div>
          <div className="xp-degree-progress is-done" role="img" aria-label="Completed"><span style={{ "--done": 1 } as React.CSSProperties} /><small>Completed</small></div>
        </div>
        </div>
        <div className="xp-degree-side">
        <div className="xp-degree-course"><p>Coursework</p>{chips(["Data Analytics", "Artificial Intelligence", "Operating Systems"])}</div>
        <p className="xp-degree-note"><span>Alongside it</span>A research internship at IIT Indore that became <Link href="/projects/x-mutest" className="xp-inline-link">X-MuTeST <Arrow /></Link>, and forecasting work at Blackcoffer.</p>
        </div>
      </article>

      <div className="xp-degree-route">
        <Globe />
      </div>

      <article className="xp-degree is-now" onMouseEnter={fly("tempe")} onFocus={fly("tempe")} tabIndex={-1}>
        <div className="xp-degree-main">
        <p className="xp-degree-when">2025 — May 2027 <span>· Tempe, Arizona</span></p>
        <h3>Arizona State University</h3>
        <p className="xp-degree-name">M.S. Computer Science</p>
        <div className="xp-degree-stats">
          <div className="xp-degree-gpa"><b><span className="xp-tip is-text" tabIndex={0} data-tip="Above 4.0 because ASU counts an A+ as 4.33.">4.22</span></b><small>GPA out of 4</small></div>
          <div className="xp-degree-progress" role="img" aria-label={`About ${Math.round(done * 100)}% of the way through`}>
            <span style={{ "--done": done } as React.CSSProperties} />
            <small>{Math.round(done * 100)}% through{months !== null && months > 0 && <><br />{months} months to go</>}</small>
          </div>
        </div>
        </div>
        <div className="xp-degree-side">
        <div className="xp-degree-course"><p>Coursework</p>{chips(["Data Mining", "Data Visualization", "Distributed Database Systems"])}</div>
        <p className="xp-degree-note"><span>Right now</span><Link href="/projects/agentguard" className="xp-inline-link">AgentGuard <Arrow /></Link>, and a Fog-of-War chess agent for CSE 598.</p>
        </div>
      </article>
    </div>
  )
}
