"use client"

import { useEffect, useState } from "react"
import { useInView } from "@/components/xp/use-in-view"

const GRADUATION = new Date("2027-05-15T00:00:00-07:00")

function monthsUntil(date: Date) {
  const now = new Date()
  return Math.max(0, (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth())
}

// A fixed pseudo-barcode per card, so it renders identically on server and client.
function Barcode({ seed }: { seed: number }) {
  return (
    <span className="xp-barcode" aria-hidden="true">
      {Array.from({ length: 34 }, (_, i) => <i key={i} style={{ width: ((i * seed) % 3) + 1 }} />)}
    </span>
  )
}

export function Education() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [months, setMonths] = useState<number | null>(null)
  useEffect(() => setMonths(monthsUntil(GRADUATION)), [])

  return (
    <div ref={ref} className={`xp-ids ${inView ? "is-in" : ""}`}>
      <article className="xp-id is-current">
        <header><span>Graduate student</span><span>2025 – 2027</span></header>
        <h3>Arizona State University</h3>
        <p className="xp-id-degree">M.S. Computer Science</p>
        <dl>
          <div><dt>Campus</dt><dd>Tempe, Arizona</dd></div>
          <div><dt>Focus</dt><dd>Distributed systems, ML, security, software verification</dd></div>
        </dl>
        <footer><Barcode seed={7} /><span className="xp-id-stamp is-live">{months === null ? "In progress" : `${months} months to go`}</span></footer>
      </article>
      <article className="xp-id">
        <header><span>Undergraduate</span><span>2021 – 2025</span></header>
        <h3>IIIT Dharwad</h3>
        <p className="xp-id-degree">B.Tech Computer Science</p>
        <dl>
          <div><dt>Campus</dt><dd>Dharwad, India</dd></div>
          <div><dt>Focus</dt><dd>CS foundations, ML research, systems projects</dd></div>
        </dl>
        <footer><Barcode seed={11} /><span className="xp-id-stamp">Completed</span></footer>
      </article>
    </div>
  )
}
