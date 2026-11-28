"use client"

import Link from "next/link"
import { Fragment, useState } from "react"
import { Note } from "@/components/xp/note"

// The toolkit as a star chart: every tool on my résumé down the side, grouped the way the résumé
// groups them, and the work on this site across the top. A lit star means that project used that
// tool, so the whole thing reads at a glance with no hovering; pointing at a row or a column just
// brings it forward. Tools with no star are on my résumé but not in anything shown here. Nothing
// is rated.
//
// Where each tool was used comes from the project stacks and résumé bullets (lib/portfolio-data.ts,
// lib/resume.json); "This site" is this repository.

type Place = { id: string; name: string; href: string }
const PLACES: Place[] = [
  { id: "agentguard", name: "AgentGuard", href: "/projects/agentguard" },
  { id: "xmutest", name: "X-MuTeST", href: "/projects/x-mutest" },
  { id: "tensor", name: "Tensor Fusion", href: "/projects/tensor-fusion" },
  { id: "course", name: "Course Catalog", href: "/projects/course-catalog" },
  { id: "blackcoffer", name: "Blackcoffer", href: "/#path" },
  { id: "site", name: "This site", href: "https://github.com/imrithwik1908/portfolio_web" },
]

const GROUPS: { name: string; tools: [string, string[]][] }[] = [
  {
    name: "Languages",
    tools: [["Python", ["agentguard", "xmutest", "tensor", "blackcoffer"]], ["SQL", ["agentguard"]], ["TypeScript", ["site"]], ["JavaScript", ["course"]], ["C++", []]],
  },
  {
    name: "ML and data",
    tools: [
      ["PyTorch", ["xmutest", "tensor"]], ["Hugging Face Transformers", ["xmutest"]], ["scikit-learn", ["tensor"]], ["NLP", ["xmutest"]],
      ["LLM evaluation", ["agentguard"]], ["Explainable AI", ["xmutest"]], ["Multimodal learning", ["tensor"]], ["Time-series forecasting", ["blackcoffer"]],
    ],
  },
  {
    name: "Systems and tools",
    tools: [
      ["FastAPI", ["agentguard"]], ["PostgreSQL", ["agentguard"]], ["Redis", ["agentguard"]], ["Docker", ["agentguard"]], ["Next.js", ["agentguard", "site"]],
      ["Node.js", ["course"]], ["MongoDB", ["course"]], ["Flask", []], ["Neo4j", []], ["Git", []], ["Jenkins", []], ["AWS", []], ["GCP", []],
    ],
  },
]

export function Skills() {
  const [row, setRow] = useState<string | null>(null)
  const [col, setCol] = useState<string | null>(null)
  const focus = row || col

  return (
    <div className={`xp-chart ${focus ? "is-focus" : ""}`} onMouseLeave={() => { setRow(null); setCol(null) }}>
      <p className="xp-chart-lede">Every tool on my résumé, against the work on this site. A star means that project used it, and you can open the project to see where. The rows with no star are on my résumé but not in anything shown here.</p>

      <div className="xp-chart-scroll">
        <table className="xp-chart-table">
          <caption className="sr-only">Tools from my résumé, and which projects on this site used each one</caption>
          <thead>
            <tr>
              <td />
              {PLACES.map((p) => {
                const props = {
                  onMouseEnter: () => { setRow(null); setCol(p.id) },
                  onFocus: () => { setRow(null); setCol(p.id) },
                  onBlur: () => setCol(null),
                }
                return (
                  <th key={p.id} scope="col" className={col === p.id ? "is-on" : ""}>
                    {p.href.startsWith("http")
                      ? <a href={p.href} target="_blank" rel="noreferrer" {...props}><span>{p.name}</span></a>
                      : <Link href={p.href} {...props}><span>{p.name}</span></Link>}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <Fragment key={g.name}>
                <tr className="xp-chart-group"><th scope="rowgroup" colSpan={PLACES.length + 1}>{g.name}</th></tr>
                {g.tools.map(([t, where]) => {
                  const lit = row === t || (col !== null && where.includes(col))
                  return (
                    <tr
                      key={t}
                      className={`${lit ? "is-lit" : ""} ${where.length ? "" : "is-bare"}`}
                      onMouseEnter={() => { setCol(null); setRow(t) }}
                    >
                      <th scope="row">{t}</th>
                      {PLACES.map((p) => {
                        const used = where.includes(p.id)
                        return (
                          <td key={p.id} className={`${used ? "is-used" : ""} ${col === p.id ? "is-col" : ""}`}>
                            <i aria-hidden="true" />
                            {used && <span className="sr-only">Used in {p.name}</span>}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Note className="is-kit">Nothing here is rated. Each star points at work you can open and check.</Note>
    </div>
  )
}
