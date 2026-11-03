"use client"

import Link from "next/link"
import { Fragment, useState } from "react"
import { Note } from "@/components/xp/note"
import { projects } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"

// The toolkit as a few sentences. Each tool links only to projects whose stack or GitHub
// language data includes it; tools without a project are carried over from the original site.
type Tool = [string, string[]]
const lines: { lead: string; tools: Tool[]; tail?: string }[] = [
  { lead: "I write", tools: [["Python", ["agentguard", "x-mutest", "tensor-fusion"]], ["TypeScript", ["agentguard"]], ["JavaScript", ["course-catalog"]], ["SQL", []]], tail: "." },
  { lead: "I build services with", tools: [["FastAPI", ["agentguard"]], ["PostgreSQL", ["agentguard"]], ["Redis / ARQ", ["agentguard"]], ["Next.js", ["agentguard"]], ["Node.js", ["course-catalog"]], ["Express", ["course-catalog"]], ["MongoDB", ["course-catalog"]]], tail: "." },
  { lead: "I train and probe models with", tools: [["PyTorch", ["x-mutest", "tensor-fusion"]], ["TensorFlow", ["tensor-fusion"]], ["scikit-learn", ["tensor-fusion"]], ["Hugging Face", ["x-mutest"]], ["XLM-R", ["x-mutest"]], ["MuRIL", ["x-mutest"]], ["LLaMA 3.1", ["x-mutest"]]], tail: "." },
  { lead: "And I measure them with", tools: [["LLM evaluation", ["agentguard"]], ["explainability metrics", ["x-mutest"]], ["multimodal benchmarks", ["tensor-fusion"]], ["Pandas", []], ["time-series analysis", []]], tail: "." },
]

const titleOf = Object.fromEntries(projects.map((p) => [p.slug, p.title]))

// Punctuation travels with the word before it, so a comma never starts a line.
function after(index: number, total: number, tail = "") {
  if (index === total - 1) return tail
  return index === total - 2 ? " and" : ","
}

export function Skills() {
  const [active, setActive] = useState<Tool | null>(null)

  return (
    <div className="xp-kit">
      <div className="xp-kit-text" onMouseLeave={() => setActive(null)}>
        {lines.map((line) => (
          <p key={line.lead}>
            {line.lead}{" "}
            {line.tools.map((tool, i) => (
              <Fragment key={tool[0]}>
                <span className="xp-kit-chunk"><button
                  type="button"
                  className={`xp-kit-tool ${active?.[0] === tool[0] ? "is-active" : ""} ${tool[1].length ? "" : "is-plain"}`}
                  onMouseEnter={() => setActive(tool)}
                  onFocus={() => setActive(tool)}
                  onClick={() => setActive(tool)}
                >
                  {tool[0]}
                </button>{after(i, line.tools.length, line.tail)}</span>{i < line.tools.length - 1 && " "}
              </Fragment>
            ))}
          </p>
        ))}
      </div>

      <aside className="xp-kit-panel" aria-live="polite">
        <p className="xp-kit-label">{active ? active[0] : "Where it was used"}</p>
        <ul>
          {projects.map((p) => {
            const on = !!active && active[1].includes(p.slug)
            return (
              <li key={p.slug} className={on ? "is-on" : active ? "is-off" : ""} style={{ "--accent": projectMeta[p.slug].accent } as React.CSSProperties}>
                <i aria-hidden="true" /><Link href={`/projects/${p.slug}`}>{titleOf[p.slug]}</Link>
              </li>
            )
          })}
        </ul>
        <p className="xp-kit-hint">{!active ? "Point at any tool." : active[1].length ? `Used in ${active[1].length} of these.` : "Not in a project shown here."}</p>
      </aside>
      <Note className="is-kit">A tool lights a project only if that project&apos;s repository lists it, so nothing here is claimed without a receipt.</Note>
    </div>
  )
}
