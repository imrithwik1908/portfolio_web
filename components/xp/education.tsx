"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Arrow } from "@/components/xp/arrow"

// Degrees from the résumé, joined by the real great-circle distance between the two campuses.
const GRADUATION = new Date("2027-05-15T00:00:00-07:00")

export function Education() {
  const [months, setMonths] = useState<number | null>(null)
  useEffect(() => {
    const now = new Date()
    setMonths(Math.max(0, (GRADUATION.getFullYear() - now.getFullYear()) * 12 + GRADUATION.getMonth() - now.getMonth()))
  }, [])

  return (
    <div className="xp-degrees">
      <article className="xp-degree">
        <p className="xp-degree-when">2021 — May 2025 · Dharwad, India</p>
        <h3>IIIT Dharwad</h3>
        <p className="xp-degree-name">B.Tech Computer Science</p>
        <dl>
          <div><dt>GPA</dt><dd>8.94 / 10</dd></div>
          <div><dt>Coursework</dt><dd>Data Analytics, Artificial Intelligence, Operating Systems</dd></div>
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
        <dl>
          <div><dt>GPA</dt><dd>4.22</dd></div>
          <div><dt>Coursework</dt><dd>Data Mining, Data Visualization, Distributed Database Systems</dd></div>
          <div><dt>Right now</dt><dd><Link href="/projects/agentguard" className="xp-inline-link">AgentGuard <Arrow /></Link>, and a Fog-of-War chess agent for CSE 598</dd></div>
        </dl>
      </article>
    </div>
  )
}
