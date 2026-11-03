"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Arrow } from "@/components/xp/arrow"

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
  const chips = (list: string[]) => <dd className="xp-degree-chips">{list.map((c) => <span key={c}>{c}</span>)}</dd>

  return (
    <div className="xp-degrees">
      <article className="xp-degree">
        <p className="xp-degree-when">2021 — May 2025 · Dharwad, India</p>
        <h3>IIIT Dharwad</h3>
        <p className="xp-degree-name">B.Tech Computer Science</p>
        <div className="xp-degree-progress is-done" role="img" aria-label="Completed"><span style={{ "--done": 1 } as React.CSSProperties} /><small>Completed</small></div>
        <dl>
          <div><dt>GPA</dt><dd>8.94 / 10</dd></div>
          <div><dt>Coursework</dt>{chips(["Data Analytics", "Artificial Intelligence", "Operating Systems"])}</div>
          <div><dt>Alongside it</dt><dd>A research internship at IIT Indore that became <Link href="/projects/x-mutest" className="xp-inline-link">X-MuTeST <Arrow /></Link>, and forecasting work at Blackcoffer</dd></div>
        </dl>
      </article>

      <div className="xp-degree-route" aria-hidden="true">
        <span className="xp-degree-line"><i /></span>
        <span className="xp-degree-km" title="Great-circle distance between the two campuses">14,530 km</span>
      </div>

      <article className="xp-degree is-now">
        <p className="xp-degree-when">2025 — May 2027 · Tempe, Arizona{months !== null && months > 0 && <span> · {months} months to go</span>}</p>
        <h3>Arizona State University</h3>
        <p className="xp-degree-name">M.S. Computer Science</p>
        <div className="xp-degree-progress" role="img" aria-label={`About ${Math.round(done * 100)}% of the way through`}>
          <span style={{ "--done": done } as React.CSSProperties} />
          <small>{Math.round(done * 100)}% through</small>
        </div>
        <dl>
          <div><dt>GPA</dt><dd><span className="xp-tip is-text" tabIndex={0} data-tip="Above 4.0 because ASU counts an A+ as 4.33.">4.22</span></dd></div>
          <div><dt>Coursework</dt>{chips(["Data Mining", "Data Visualization", "Distributed Database Systems"])}</div>
          <div><dt>Right now</dt><dd><Link href="/projects/agentguard" className="xp-inline-link">AgentGuard <Arrow /></Link>, and a Fog-of-War chess agent for CSE 598</dd></div>
        </dl>
      </article>
    </div>
  )
}
