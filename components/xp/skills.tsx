"use client"

import Link from "next/link"
import { Fragment, useState } from "react"
import { Note } from "@/components/xp/note"
import { projects } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"

// The toolkit told as a few true sentences about why each tool was picked. A tool links to a
// project only when that project's repository uses it; otherwise the panel says where it came from.
type Tool = { name: string; in: string[]; where?: string }
type Segment = string | Tool
const t = (name: string, used: string[] = [], where?: string): Tool => ({ name, in: used, where })

const story: Segment[][] = [
  [t("Python", ["agentguard", "x-mutest", "tensor-fusion"]), " is home. Almost everything I've built starts there, from the X-MuTeST training runs to AgentGuard's API, with ", t("TypeScript", ["agentguard"]), " and ", t("JavaScript", ["course-catalog"]), " when the work needs a front end."],
  ["For AgentGuard, the app being tested should never wait on the tester, so evaluations run on a ", t("Redis / ARQ", ["agentguard"]), " queue behind ", t("FastAPI", ["agentguard"]), ", ", t("PostgreSQL", ["agentguard"]), " keeps every trace and verdict, and ", t("Next.js", ["agentguard"]), " shows the result."],
  ["In research I trained and compared ", t("MuRIL", ["x-mutest"]), ", ", t("XLM-R", ["x-mutest"]), " and ", t("LLaMA 3.1", ["x-mutest"]), " with ", t("PyTorch", ["x-mutest", "tensor-fusion"]), " and ", t("Hugging Face", ["x-mutest"]), ", and fused text, voice and video with ", t("TensorFlow", ["tensor-fusion"]), " and ", t("scikit-learn", ["tensor-fusion"]), "."],
  ["At Blackcoffer it was ", t("time-series forecasting", [], "Blackcoffer forecasting work"), " on messy business data. On the web side I've used ", t("Node.js", ["course-catalog"]), ", ", t("Express", ["course-catalog"]), " and ", t("MongoDB", ["course-catalog"]), " behind Google sign-in, plus ", t("Flask", [], "a Flask practice repo on GitHub"), " and ", t("Neo4j", [], "a Python + Cypher notebook on GitHub"), " when a problem looked like a graph."],
]

const titleOf = Object.fromEntries(projects.map((p) => [p.slug, p.title]))

export function Skills() {
  const [active, setActive] = useState<Tool | null>(null)

  return (
    <div className="xp-kit">
      <div className={`xp-kit-text ${active ? "has-active" : ""}`} onMouseLeave={() => setActive(null)}>
        {story.map((line, li) => (
          <p key={li}>
            {line.map((seg, si) => {
              if (typeof seg === "string") {
                // Punctuation that follows a tool is rendered with the tool, so it never starts a line.
                const prev = line[si - 1]
                return <Fragment key={si}>{prev && typeof prev !== "string" ? seg.replace(/^[,.;:]+/, "") : seg}</Fragment>
              }
              const next = line[si + 1]
              const punct = typeof next === "string" ? next.match(/^[,.;:]+/)?.[0] ?? "" : ""
              return (
                <span key={si} className="xp-kit-chunk">
                  <button
                    type="button"
                    className={`xp-kit-tool ${active?.name === seg.name ? "is-active" : ""} ${seg.in.length ? "" : "is-plain"}`}
                    onMouseEnter={() => setActive(seg)}
                    onFocus={() => setActive(seg)}
                    onClick={() => setActive(seg)}
                  >
                    {seg.name}
                  </button>{punct}
                </span>
              )
            })}
          </p>
        ))}
      </div>

      <aside className={`xp-kit-panel ${active ? "is-active" : ""}`} aria-live="polite">
        <p className="xp-kit-label" key={active?.name ?? "none"}>{active ? active.name : "Where it was used"}</p>
        <ul>
          {projects.map((p) => {
            const on = !!active && active.in.includes(p.slug)
            return (
              <li key={p.slug} className={on ? "is-on" : active ? "is-off" : ""} style={{ "--accent": projectMeta[p.slug].accent } as React.CSSProperties}>
                <i aria-hidden="true" /><Link href={`/projects/${p.slug}`}>{titleOf[p.slug]}</Link>
              </li>
            )
          })}
        </ul>
        <p className="xp-kit-hint">{!active ? "Point at, or tap, any tool." : active.in.length ? `Used in ${active.in.length} of ${projects.length} projects.` : active.where ?? "Not in a project shown here."}</p>
      </aside>
      <Note className="is-kit">A tool lights a project only if that project&apos;s repository lists it, so every claim here has code behind it.</Note>
    </div>
  )
}
