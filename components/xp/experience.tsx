"use client"

import { useState } from "react"
import { useInView } from "@/components/xp/use-in-view"
import { earlierExperience, experiences } from "@/lib/portfolio-data"

const roles = [
  ...experiences.map((e) => ({ key: e.company, year: e.year, period: e.period, role: e.role, company: e.company, summary: e.summary, note: e.aside as string | undefined })),
  { key: earlierExperience.company, year: "2023", period: earlierExperience.period, role: earlierExperience.role, company: earlierExperience.company, summary: earlierExperience.summary, note: undefined },
]

// Each role is a ticket stub: the year on a perforated stub, the role on the body.
// Tearing (clicking) a ticket opens what the work actually involved.
export function Experience() {
  const [open, setOpen] = useState<string>(roles[0].key)
  const { ref, inView } = useInView<HTMLOListElement>()

  return (
    <ol ref={ref} className={`xp-tickets ${inView ? "is-in" : ""}`}>
      {roles.map((r, i) => {
        const isOpen = open === r.key
        return (
          <li key={r.key} className={`xp-ticket ${isOpen ? "is-open" : ""}`} style={{ "--i": i } as React.CSSProperties}>
            <button type="button" className="xp-ticket-face" aria-expanded={isOpen} onClick={() => setOpen(r.key)}>
              <span className="xp-ticket-stub"><span>{r.year}</span><small>No. {String(i + 1).padStart(3, "0")}</small></span>
              <span className="xp-ticket-body">
                <span className="xp-ticket-company">{r.company}</span>
                <strong>{r.role}</strong>
                <span className="xp-ticket-period">{r.period}</span>
              </span>
            </button>
            <div className="xp-ticket-detail">
              <div>
                <p>{r.summary}</p>
                {r.note && <p className="xp-ticket-note">{r.note}</p>}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
