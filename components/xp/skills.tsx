"use client"

import Link from "next/link"
import { useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { Note } from "@/components/xp/note"
import { projectMeta } from "@/lib/project-highlights"

// Skills as things you can hand me, not keywords. Each one is a promise, a short first-person
// account of where I've already done it, and the work you can open to check. The tools come last
// and quietly: they're how, not what. Every fact here is from the résumé or a project page.
type Strength = {
  id: string
  promise: React.ReactNode
  proof: React.ReactNode
  receipts: { label: string; href: string; accent?: string }[]
  tools: string
}

const STRENGTHS: Strength[] = [
  {
    id: "why",
    promise: <>Ask a model <em>why</em>, and check its answer.</>,
    proof: <>At IIT Indore our classifier could get the label right for the wrong reason. I trained it to point at the words people had marked, then graded that explanation on its own instead of trusting the label. It became an <b>AAAI 2026</b> paper.</>,
    receipts: [{ label: "X-MuTeST", href: "/projects/x-mutest", accent: projectMeta["x-mutest"].accent }],
    tools: "PyTorch · Hugging Face · MuRIL · XLM-R · LLaMA 3.1",
  },
  {
    id: "ship",
    promise: <>Tell you whether a change is <em>safe to ship</em>.</>,
    proof: <>An average score can rise while the answers you care about break. AgentGuard compares each test case with itself across versions, and plain rules, not another model, decide <b>PASS, BLOCK or REVIEW</b>, with the reasons attached.</>,
    receipts: [{ label: "AgentGuard", href: "/projects/agentguard", accent: projectMeta.agentguard.accent }],
    tools: "Python · LLM evaluation · rule-based release gates",
  },
  {
    id: "data",
    promise: <>Find out what the data can <em>actually</em> support.</>,
    proof: <>At Blackcoffer the data came messy and the question came from the business. I checked every model against the method already in use, and the ad-revenue forecast landed at <b>$142</b> mean daily error, enough to move about 15% of a marketing budget. In Tensor Fusion I tested whether face and voice add anything beyond the words.</>,
    receipts: [
      { label: "Blackcoffer", href: "#path" },
      { label: "Tensor Fusion", href: "/projects/tensor-fusion", accent: projectMeta["tensor-fusion"].accent },
    ],
    tools: "Python · Pandas · time-series forecasting · scikit-learn",
  },
  {
    id: "build",
    promise: <>Build the software <em>around</em> the model.</>,
    proof: <>A model is rarely the whole job. For AgentGuard I built the Python SDK that records an AI app without ever crashing it, the API that saves each run in one transaction, the background workers that grade it, and the dashboard that shows the verdict.</>,
    receipts: [
      { label: "AgentGuard", href: "/projects/agentguard", accent: projectMeta.agentguard.accent },
      { label: "Course Catalog", href: "/projects/course-catalog", accent: projectMeta["course-catalog"].accent },
    ],
    tools: "FastAPI · PostgreSQL · Redis / ARQ · Next.js · TypeScript · Node.js · MongoDB",
  },
]

export function Skills() {
  const [open, setOpen] = useState(0)

  return (
    <div className="xp-can">
      <ol className="xp-can-list">
        {STRENGTHS.map((s, i) => {
          const on = open === i
          return (
            <li key={s.id} className={on ? "is-open" : undefined}>
              <button type="button" className="xp-can-promise" aria-expanded={on} aria-controls={`can-${s.id}`} onClick={() => setOpen(i)}>
                <span className="xp-can-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="xp-can-text">{s.promise}</span>
              </button>
              <div className="xp-can-body" id={`can-${s.id}`} role="region" aria-hidden={!on}>
                <div className="xp-can-inner">
                  <p className="xp-can-proof">{s.proof}</p>
                  <div className="xp-can-meta">
                    <p className="xp-can-receipts">
                      {s.receipts.map((r) => (
                        <Link key={r.label} href={r.href} tabIndex={on ? 0 : -1} style={r.accent ? ({ "--accent": r.accent } as React.CSSProperties) : undefined}>
                          {r.accent && <i aria-hidden="true" />}{r.label} <Arrow />
                        </Link>
                      ))}
                    </p>
                    <p className="xp-can-tools"><span>with</span> {s.tools}</p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      <Note className="is-kit">Each one points at work you can open. The tools come last on purpose: they&apos;re how, not what.</Note>
    </div>
  )
}
