"use client"

import { useEffect, useState } from "react"

// Degrees as two lit cards, from the résumé.
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
        <p className="xp-degree-when">Graduating May 2027{months !== null && months > 0 && <span> · {months} months to go</span>}</p>
        <h3>Arizona State University</h3>
        <p className="xp-degree-name">M.S. Computer Science · Tempe, Arizona</p>
        <dl>
          <div><dt>GPA</dt><dd>4.22</dd></div>
          <div><dt>Coursework</dt><dd>Data Mining, Data Visualization, Distributed Database Systems</dd></div>
        </dl>
      </article>
      <article className="xp-degree">
        <p className="xp-degree-when">Graduated May 2025</p>
        <h3>IIIT Dharwad</h3>
        <p className="xp-degree-name">B.Tech Computer Science · Dharwad, India</p>
        <dl>
          <div><dt>GPA</dt><dd>8.94 / 10</dd></div>
          <div><dt>Coursework</dt><dd>Data Analytics, Artificial Intelligence, Operating Systems</dd></div>
        </dl>
      </article>
    </div>
  )
}
