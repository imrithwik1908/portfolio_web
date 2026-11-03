"use client"

import Link from "next/link"
import { useState } from "react"
import { projects } from "@/lib/portfolio-data"

// Skills grouped as on the original site. Hovering or tapping one reveals the projects that
// actually list it in their stack, so every skill points at evidence.
const groups = [
  { title: "Systems", note: "APIs, state, background work and failure paths", skills: ["FastAPI", "PostgreSQL", "Redis", "Node.js", "Express", "Next.js"] },
  { title: "Data", note: "Data models, queries and knowing what the data supports", skills: ["SQL", "MongoDB", "Pandas", "Time-series analysis"] },
  { title: "Intelligence", note: "Training and evaluating models, and the software around them", skills: ["PyTorch", "Hugging Face", "NLP", "Multimodal ML", "LLM evaluation"] },
]

// Whole-word match, so "SQL" does not count PostgreSQL as evidence.
function usedIn(skill: string) {
  const pattern = new RegExp(`(^|[^a-z0-9])${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9])`)
  return projects.filter((p) => p.stack.some((tool) => pattern.test(tool.toLowerCase())))
}

export function Skills() {
  const [active, setActive] = useState<string | null>(null)
  const evidence = active ? usedIn(active) : []

  return (
    <div className="xp-skills" onPointerLeave={() => setActive(null)}>
      {groups.map((group) => (
        <section key={group.title} className="xp-skill-group">
          <h3>{group.title}</h3>
          <p>{group.note}</p>
          <ul>
            {group.skills.map((skill) => {
              const count = usedIn(skill).length
              return (
                <li key={skill}>
                  <button
                    type="button"
                    className={`xp-chip ${active === skill ? "is-active" : ""} ${count ? "has-evidence" : ""}`}
                    aria-pressed={active === skill}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(skill)}
                    onFocus={() => setActive(skill)}
                    onClick={() => setActive(skill)}
                  >
                    {skill}{count > 0 && <sup>{count}</sup>}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <p className="xp-skill-evidence" aria-live="polite">
        {!active && <>Hover or tap a skill to see where it was used.</>}
        {active && evidence.length === 0 && <><strong>{active}</strong> isn’t in the listed stack of a project shown here.</>}
        {active && evidence.length > 0 && <><strong>{active}</strong> → {evidence.map((p, i) => <span key={p.slug}>{i > 0 && ", "}<Link href={`/projects/${p.slug}`}>{p.title}</Link></span>)}</>}
      </p>
    </div>
  )
}
