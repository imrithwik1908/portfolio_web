"use client"

import { useEffect, useState } from "react"
import { useInView } from "@/components/xp/use-in-view"

const GRADUATION = new Date("2027-05-15T00:00:00-07:00")

function monthsUntil(date: Date) {
  const now = new Date()
  return Math.max(0, (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth())
}

export function Education() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [months, setMonths] = useState<number | null>(null)
  useEffect(() => setMonths(monthsUntil(GRADUATION)), [])

  return (
    <div ref={ref} className={`xp-schools ${inView ? "is-in" : ""}`}>
      <article className="xp-school is-current">
        <p className="xp-school-years">2025 — May 2027</p>
        <h3>Arizona State University</h3>
        <p className="xp-school-degree">M.S. Computer Science · Tempe, Arizona</p>
        <p className="xp-school-focus">Distributed systems, machine learning, security, software verification</p>
        <p className="xp-school-status"><i aria-hidden="true" />{months === null ? "In progress" : months === 0 ? "Graduating this month" : `In progress · ${months} months to graduation`}</p>
      </article>
      <article className="xp-school">
        <p className="xp-school-years">2021 — 2025</p>
        <h3>IIIT Dharwad</h3>
        <p className="xp-school-degree">B.Tech Computer Science · Dharwad, India</p>
        <p className="xp-school-focus">Computer science foundations, ML research and systems projects</p>
        <p className="xp-school-status is-done"><i aria-hidden="true" />Completed</p>
      </article>
    </div>
  )
}
