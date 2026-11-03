"use client"

import Link from "next/link"
import { useState } from "react"
import { projects } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"

// Where each tool was used comes from the projects' listed stacks and GitHub language data.
// Tools without a project here are carried over from the original site.
const rows: { title: string; tools: [string, string[]][] }[] = [
  { title: "Languages", tools: [["Python", ["agentguard", "x-mutest", "tensor-fusion"]], ["TypeScript", ["agentguard"]], ["JavaScript", ["course-catalog"]], ["SQL", []]] },
  { title: "Systems", tools: [["FastAPI", ["agentguard"]], ["PostgreSQL", ["agentguard"]], ["Redis / ARQ", ["agentguard"]], ["Next.js", ["agentguard"]], ["Node.js", ["course-catalog"]], ["Express", ["course-catalog"]], ["MongoDB", ["course-catalog"]], ["Google OAuth", ["course-catalog"]]] },
  { title: "ML", tools: [["PyTorch", ["x-mutest", "tensor-fusion"]], ["TensorFlow", ["tensor-fusion"]], ["scikit-learn", ["tensor-fusion"]], ["Hugging Face", ["x-mutest"]], ["XLM-R", ["x-mutest"]], ["MuRIL", ["x-mutest"]], ["LLaMA 3.1", ["x-mutest"]]] },
  { title: "Practice", tools: [["LLM evaluation", ["agentguard"]], ["Explainability metrics", ["x-mutest"]], ["Multimodal ML", ["tensor-fusion"]], ["Pandas", []], ["Time-series analysis", []]] },
]

const titleOf = Object.fromEntries(projects.map((p) => [p.slug, p.title]))

export function Skills() {
  const [active, setActive] = useState<{ name: string; in: string[] } | null>(null)

  return (
    <div className="xp-tags" onMouseLeave={() => setActive(null)}>
      {rows.map((row) => (
        <div key={row.title} className="xp-tag-row">
          <h3>{row.title}</h3>
          <ul>
            {row.tools.map(([name, used]) => (
              <li key={name}>
                <button
                  type="button"
                  className={`xp-tag ${active?.name === name ? "is-active" : ""} ${active && active.name !== name ? "is-quiet" : ""}`}
                  onMouseEnter={() => setActive({ name, in: used })}
                  onFocus={() => setActive({ name, in: used })}
                  onClick={() => setActive({ name, in: used })}
                >
                  {name}
                  {used.map((slug) => <i key={slug} style={{ background: projectMeta[slug].accent }} aria-hidden="true" />)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="xp-tag-readout" aria-live="polite">
        {!active ? <>Hover a tag. The dots show which projects it shipped in.</>
          : active.in.length === 0 ? <><strong>{active.name}</strong> isn&apos;t in a project shown here.</>
          : <><strong>{active.name}</strong> was used in {active.in.map((slug, i) => <span key={slug}>{i > 0 && (i === active.in.length - 1 ? " and " : ", ")}<Link href={`/projects/${slug}`} style={{ "--accent": projectMeta[slug].accent } as React.CSSProperties}>{titleOf[slug]}</Link></span>)}.</>}
      </p>
    </div>
  )
}
