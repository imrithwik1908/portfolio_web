"use client"

import Link from "next/link"
import { useState } from "react"
import { useGlider } from "@/components/xp/use-glider"
import { projects } from "@/lib/portfolio-data"
import { projectMeta } from "@/lib/project-highlights"

// Where each tool was used comes from the projects' listed stacks and GitHub language data
// (AgentGuard is Python and TypeScript; X-MuTeST and Tensor Fusion are Python notebooks;
// Course Catalog is JavaScript). Tools without a project here came from the original site.
const groups: { title: string; tools: { name: string; in: string[] }[] }[] = [
  {
    title: "Languages",
    tools: [
      { name: "Python", in: ["agentguard", "x-mutest", "tensor-fusion"] },
      { name: "TypeScript", in: ["agentguard"] },
      { name: "JavaScript", in: ["course-catalog"] },
      { name: "SQL", in: [] },
    ],
  },
  {
    title: "Systems & web",
    tools: [
      { name: "FastAPI", in: ["agentguard"] },
      { name: "PostgreSQL", in: ["agentguard"] },
      { name: "Redis / ARQ", in: ["agentguard"] },
      { name: "Next.js", in: ["agentguard"] },
      { name: "Node.js", in: ["course-catalog"] },
      { name: "Express", in: ["course-catalog"] },
      { name: "MongoDB", in: ["course-catalog"] },
      { name: "Google OAuth", in: ["course-catalog"] },
    ],
  },
  {
    title: "Machine learning",
    tools: [
      { name: "PyTorch", in: ["x-mutest", "tensor-fusion"] },
      { name: "TensorFlow", in: ["tensor-fusion"] },
      { name: "scikit-learn", in: ["tensor-fusion"] },
      { name: "Hugging Face", in: ["x-mutest"] },
      { name: "XLM-R", in: ["x-mutest"] },
      { name: "MuRIL", in: ["x-mutest"] },
      { name: "LLaMA 3.1", in: ["x-mutest"] },
    ],
  },
  {
    title: "Data & evaluation",
    tools: [
      { name: "LLM evaluation", in: ["agentguard"] },
      { name: "Explainability metrics", in: ["x-mutest"] },
      { name: "Multimodal ML", in: ["tensor-fusion"] },
      { name: "Pandas", in: [] },
      { name: "Time-series analysis", in: [] },
    ],
  },
]

const titleOf = Object.fromEntries(projects.map((p) => [p.slug, p.title]))

export function Skills() {
  const [filter, setFilter] = useState<string>("all")
  const [hovered, setHovered] = useState<string | null>(null)
  const tabs = useGlider<HTMLButtonElement>(filter)

  return (
    <div className="xp-skills">
      <div className="xp-skill-filter" ref={tabs.container as React.Ref<HTMLDivElement>} role="toolbar" aria-label="Show tools used in a project">
        <span className="xp-glider" style={tabs.style} aria-hidden="true" />
        <button ref={tabs.register("all")} type="button" className={filter === "all" ? "is-active" : undefined} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Everything</button>
        {projects.map((p) => (
          <button key={p.slug} ref={tabs.register(p.slug)} type="button" className={filter === p.slug ? "is-active" : undefined} aria-pressed={filter === p.slug} onClick={() => setFilter(p.slug)}>
            <i style={{ background: projectMeta[p.slug].accent }} aria-hidden="true" />{p.title}
          </button>
        ))}
      </div>

      <div className="xp-skill-groups">
        {groups.map((group) => (
          <section key={group.title} className="xp-skill-group">
            <h3>{group.title}</h3>
            <ul>
              {group.tools.map((tool) => {
                const dim = filter !== "all" && !tool.in.includes(filter)
                const open = hovered === tool.name
                return (
                  <li
                    key={tool.name}
                    tabIndex={0}
                    className={`xp-tool ${dim ? "is-dim" : ""} ${open ? "is-open" : ""}`}
                    onMouseEnter={() => setHovered(tool.name)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(tool.name)}
                    onBlur={() => setHovered(null)}
                  >
                    <span className="xp-tool-name">{tool.name}</span>
                    <span className="xp-tool-dots" aria-label={tool.in.length ? `Used in ${tool.in.map((s) => titleOf[s]).join(", ")}` : "Not tied to a project shown here"}>
                      {tool.in.map((slug) => <i key={slug} style={{ background: projectMeta[slug].accent }} />)}
                    </span>
                    <span className="xp-tool-where" aria-hidden="true">
                      <span>
                        {tool.in.length ? tool.in.map((slug, i) => <span key={slug}>{i > 0 && " · "}<Link href={`/projects/${slug}`} tabIndex={-1}>{titleOf[slug]}</Link></span>) : "Not tied to a project shown here"}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
