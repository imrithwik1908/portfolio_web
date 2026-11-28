"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

// The toolkit as one sentence that rewrites itself: "For <project> I used <its tools>." Click the
// project (or one of the names below) to switch; while nobody has touched it and it's on screen,
// it moves on by itself every few seconds. Every sentence is in the page at once, stacked in one
// grid cell, so the block is as tall as the longest and nothing jumps. The tools on my résumé that
// none of this work used sit in a quiet line underneath. Nothing is rated.
//
// Where each tool was used comes from the project stacks and résumé bullets (lib/portfolio-data.ts,
// lib/resume.json); "This site" is this repository.

type Project = { name: string; href: string; tools: string[]; for?: string }
const PROJECTS: Project[] = [
  { name: "AgentGuard", href: "/projects/agentguard", tools: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Next.js", "SQL"], for: "LLM evaluation" },
  { name: "X-MuTeST", href: "/projects/x-mutest", tools: ["Python", "PyTorch", "Hugging Face Transformers"], for: "NLP and explainable AI" },
  { name: "Tensor Fusion", href: "/projects/tensor-fusion", tools: ["Python", "PyTorch", "scikit-learn"], for: "multimodal learning" },
  { name: "Course Catalog", href: "/projects/course-catalog", tools: ["JavaScript", "Node.js", "MongoDB"] },
  { name: "Blackcoffer", href: "/#path", tools: ["Python"], for: "time-series forecasting" },
  { name: "this site", href: "https://github.com/imrithwik1908/portfolio_web", tools: ["TypeScript", "Next.js"] },
]
const ALSO = ["C++", "Flask", "Neo4j", "Git", "Jenkins", "AWS", "GCP"]
const EVERY = 4800

function list(words: string[]) {
  return words.map((w, i) => (
    <span key={w} className="xp-say-w" style={{ "--i": i } as React.CSSProperties}>
      {w}{i < words.length - 2 ? ", " : i === words.length - 2 ? " and " : ""}
    </span>
  ))
}

const plain = (words: string[]) => words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`

export function Skills() {
  const [at, setAt] = useState(0)
  const [auto, setAuto] = useState(true)
  const root = useRef<HTMLDivElement>(null)

  // Move on by itself only while on screen, untouched, and motion is welcome.
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timer = 0
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer)
      if (e.isIntersecting) timer = window.setInterval(() => setAt((v) => (v + 1) % PROJECTS.length), EVERY)
    }, { threshold: 0.6 })
    if (root.current) io.observe(root.current)
    return () => { io.disconnect(); window.clearInterval(timer) }
  }, [auto])

  const pick = (i: number) => { setAuto(false); setAt(i) }
  const p = PROJECTS[at]

  return (
    <div ref={root} className="xp-say" onMouseEnter={() => setAuto(false)} onFocus={() => setAuto(false)}>
      <div className="xp-say-stack" aria-live={auto ? "off" : "polite"}>
        {PROJECTS.map((q, i) => (
          <p key={q.name} className={`xp-say-line ${i === at ? "is-on" : ""}`} aria-hidden={i !== at}>
            For{" "}
            <button type="button" className="xp-say-pick" tabIndex={i === at ? 0 : -1} onClick={() => pick((at + 1) % PROJECTS.length)} aria-label={`${q.name}. Show the next project`}>
              {q.name}<span aria-hidden="true">↻</span>
            </button>{" "}
            I used {i === at
              ? <>{list(q.tools)}{q.for && <span className="xp-say-w xp-say-for" style={{ "--i": q.tools.length } as React.CSSProperties}>, for {q.for}</span>}</>
              : <>{plain(q.tools)}{q.for && `, for ${q.for}`}</>}.
          </p>
        ))}
      </div>

      <div className="xp-say-nav">
        <ol aria-label="Projects">
          {PROJECTS.map((q, i) => (
            <li key={q.name}>
              <button type="button" className={i === at ? "is-on" : ""} aria-current={i === at} onClick={() => pick(i)}>{q.name}</button>
            </li>
          ))}
        </ol>
        {p.href.startsWith("http")
          ? <a className="xp-say-open" href={p.href} target="_blank" rel="noreferrer">See the code →</a>
          : <Link className="xp-say-open" href={p.href}>See {p.name} →</Link>}
      </div>

      <p className="xp-say-also">Also on my résumé, though not in the work here: {ALSO.join(" · ")}.</p>
    </div>
  )
}
