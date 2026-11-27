"use client"

import Link from "next/link"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Note } from "@/components/xp/note"

// The toolkit, as a map rather than a list of claims: every tool on my résumé, grouped the way the
// résumé groups them, beside the places on this site where it was actually used. Point at a tool
// and lines draw to those places; point at a place and its tools light up. Tools with no place
// here are still listed, just without lines. Nothing is rated.
//
// Where each tool was used comes from the project stacks and résumé bullets (lib/portfolio-data.ts,
// lib/resume.json); "This site" is this repository.

type Place = { id: string; name: string; what: string; href: string }
const PLACES: Place[] = [
  { id: "agentguard", name: "AgentGuard", what: "Release checks for LLM apps", href: "/projects/agentguard" },
  { id: "xmutest", name: "X-MuTeST", what: "IIT Indore · AAAI 2026", href: "/projects/x-mutest" },
  { id: "tensor", name: "Tensor Fusion", what: "Face, voice and words", href: "/projects/tensor-fusion" },
  { id: "course", name: "Course Catalog", what: "A role-based web app", href: "/projects/course-catalog" },
  { id: "blackcoffer", name: "Blackcoffer", what: "Forecasting, 2024–25", href: "/#path" },
  { id: "site", name: "This site", what: "What you're reading", href: "https://github.com/imrithwik1908/portfolio_web" },
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
const USED = new Map(GROUPS.flatMap((g) => g.tools))

type Line = { d: string; key: string }

export function Skills() {
  const [tool, setTool] = useState<string | null>(null)
  const [place, setPlace] = useState<string | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const root = useRef<HTMLDivElement>(null)

  const lit = (t: string) => (tool ? tool === t : place ? (USED.get(t) ?? []).includes(place) : false)
  const on = (p: string) => (place ? place === p : tool ? (USED.get(tool) ?? []).includes(p) : false)

  // Draw the lines from the tool in focus to each place it was used (wide screens only).
  const draw = useCallback(() => {
    const box = root.current
    if (!box || !tool || window.innerWidth < 900) { setLines([]); return }
    const b = box.getBoundingClientRect()
    const from = box.querySelector<HTMLElement>(`[data-tool="${CSS.escape(tool)}"]`)?.getBoundingClientRect()
    if (!from) return
    const x0 = from.right - b.left + 6, y0 = from.top + from.height / 2 - b.top
    setLines((USED.get(tool) ?? []).flatMap((id) => {
      const to = box.querySelector<HTMLElement>(`[data-place="${id}"] .xp-kitmap-star`)?.getBoundingClientRect()
      if (!to) return []
      const x1 = to.left + to.width / 2 - b.left, y1 = to.top + to.height / 2 - b.top
      const mx = (x0 + x1) / 2
      return [{ key: id, d: `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}` }]
    }))
  }, [tool])
  useLayoutEffect(draw, [draw])
  useEffect(() => { window.addEventListener("resize", draw); return () => window.removeEventListener("resize", draw) }, [draw])

  return (
    <div ref={root} className={`xp-kitmap ${tool || place ? "is-focus" : ""}`} onMouseLeave={() => { setTool(null); setPlace(null) }}>
      <p className="xp-kitmap-lede">The tools from my résumé, beside the work on this site that used them. Point at one to see where. The ones without a line are on my résumé but not in anything shown here.</p>

      <div className="xp-kitmap-grid">
        <div className="xp-kitmap-tools">
          {GROUPS.map((g) => (
            <div key={g.name} className="xp-kitmap-group">
              <p>{g.name}</p>
              <ul>
                {g.tools.map(([t, where]) => (
                  <li key={t}>
                    <button
                      type="button"
                      data-tool={t}
                      className={`${lit(t) ? "is-lit" : ""} ${where.length ? "" : "is-bare"}`}
                      aria-pressed={tool === t}
                      aria-label={where.length ? `${t}: used in ${where.map((id) => PLACES.find((p) => p.id === id)?.name).join(", ")}` : `${t}: not in the work shown here`}
                      onMouseEnter={() => { setPlace(null); setTool(t) }}
                      onFocus={() => { setPlace(null); setTool(t) }}
                      onClick={() => { setPlace(null); setTool((v) => (v === t ? null : t)) }}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ul className="xp-kitmap-places" aria-label="Where they were used">
          {PLACES.map((p) => {
            const count = Array.from(USED.values()).filter((w) => w.includes(p.id)).length
            const inner = (
              <>
                <span className="xp-kitmap-star" aria-hidden="true" />
                <strong>{p.name}</strong>
                <small>{p.what} · {count} {count === 1 ? "tool" : "tools"}</small>
              </>
            )
            const props = {
              className: on(p.id) ? "is-on" : "",
              onMouseEnter: () => { setTool(null); setPlace(p.id) },
              onFocus: () => { setTool(null); setPlace(p.id) },
            }
            return (
              <li key={p.id} data-place={p.id}>
                {p.href.startsWith("http")
                  ? <a href={p.href} target="_blank" rel="noreferrer" {...props}>{inner}</a>
                  : <Link href={p.href} {...props}>{inner}</Link>}
              </li>
            )
          })}
        </ul>

        <svg className="xp-kitmap-lines" aria-hidden="true">
          {lines.map((l) => <path key={`${tool}-${l.key}`} d={l.d} pathLength={1} />)}
        </svg>
      </div>

      <Note className="is-kit">Nothing here is rated. Each line points at work you can open and check.</Note>
    </div>
  )
}
