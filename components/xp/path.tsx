"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { experiences, earlierExperience } from "@/lib/portfolio-data"

// One progression for study and work. Each question is taken from Rithwik's own writing or the
// project it led to; stages without one simply don't have a question.
const [blackcoffer, iitIndore] = experiences

type Stage = {
  when: string
  place: string
  role: string
  kind: "study" | "work"
  where: string
  question?: string
  body: string
  result?: string
  link?: { href: string; label: string }
}

const stages: Stage[] = [
  { when: "2021 — 2025", place: "IIIT Dharwad", role: "B.Tech Computer Science", kind: "study", where: "Dharwad, India", body: "Computer science foundations, ML research and systems projects." },
  { when: earlierExperience.period, place: earlierExperience.company, role: earlierExperience.role, kind: "work", where: "Internship", body: earlierExperience.summary },
  { when: iitIndore.period, place: iitIndore.company, role: iitIndore.role, kind: "work", where: "Research", question: "Which words actually support the label?", body: iitIndore.summary, link: { href: "/projects/x-mutest", label: "X-MuTeST" } },
  { when: blackcoffer.period, place: blackcoffer.company, role: blackcoffer.role, kind: "work", where: "Data science", question: "What can this data actually support?", body: blackcoffer.summary, result: blackcoffer.aside },
  { when: "2025 — May 2027", place: "Arizona State University", role: "M.S. Computer Science", kind: "study", where: "Tempe, Arizona", question: "What changed, and is it safe to release?", body: "Distributed systems, machine learning, security and software verification. Most of the work has moved into APIs, databases, background jobs and evaluation systems.", link: { href: "/projects/agentguard", label: "AgentGuard" } },
]

export function Path() {
  const list = useRef<HTMLOListElement>(null)
  const [lit, setLit] = useState(-1)

  // The line fills with scroll; a stage lights up once the line reaches it.
  useEffect(() => {
    const node = list.current
    if (!node) return
    const items = Array.from(node.querySelectorAll<HTMLElement>(".xp-stage"))
    let frame = 0
    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      const reach = window.innerHeight * 0.62 - rect.top
      const progress = Math.min(1, Math.max(0, reach / rect.height))
      node.style.setProperty("--progress", progress.toFixed(4))
      let last = -1
      items.forEach((item, i) => { if (item.offsetTop + 24 <= reach) last = i })
      setLit(last)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll) }
  }, [])

  return (
    <ol ref={list} className="xp-path">
      {stages.map((s, i) => (
        <li key={s.place + s.role} className={`xp-stage is-${s.kind} ${i <= lit ? "is-lit" : ""}`}>
          <span className="xp-stage-node" aria-hidden="true" />
          <p className="xp-stage-when">{s.when}<span>{s.kind === "study" ? "Study" : s.where}</span></p>
          <h3><span>{s.place}</span><small>{s.role}{s.kind === "study" && ` · ${s.where}`}</small></h3>
          {s.question && <p className="xp-stage-question">“{s.question}”</p>}
          <p className="xp-stage-body">{s.body}</p>
          {(s.result || s.link) && (
            <p className="xp-stage-result">
              {s.result}
              {s.link && <Link href={s.link.href} className="xp-link">{s.link.label} <Arrow /></Link>}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}
