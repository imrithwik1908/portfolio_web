"use client"

import { useState } from "react"
import { useGlider } from "@/components/xp/use-glider"
import { earlierExperience, experiences } from "@/lib/portfolio-data"

const roles = [
  ...experiences.map((e) => ({ key: e.company, period: e.period, role: e.role, company: e.company, summary: e.summary, note: e.aside as string | undefined })),
  { key: earlierExperience.company, period: earlierExperience.period, role: earlierExperience.role, company: earlierExperience.company, summary: earlierExperience.summary, note: undefined },
]

// Roles as rows. The shared glider follows the pointer; a row opens to show what the work involved.
export function Experience() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(roles[0].key)
  const glider = useGlider<HTMLLIElement>(hovered)

  return (
    <ol className="xp-roles" ref={glider.container as React.Ref<HTMLOListElement>} onPointerLeave={() => setHovered(null)}>
      <span className="xp-glider is-soft" style={glider.style} aria-hidden="true" />
      {roles.map((r) => {
        const isOpen = open === r.key
        return (
          <li key={r.key} ref={glider.register(r.key)} className={isOpen ? "is-open" : undefined} onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(r.key)}>
            <button type="button" className="xp-role-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.key)}>
              <span className="xp-role-period">{r.period}</span>
              <span className="xp-role-title"><strong>{r.role}</strong><span>{r.company}</span></span>
              <span className="xp-role-icon" aria-hidden="true" />
            </button>
            <div className="xp-role-detail">
              <div>
                <p>{r.summary}</p>
                {r.note && <p className="xp-role-note">{r.note}</p>}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
