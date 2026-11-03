"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { useGlider } from "@/components/xp/use-glider"
import { earlierExperience, experiences } from "@/lib/portfolio-data"

// Study and work as chapters you can select, like scenes on a disc menu. Each question is taken
// from Rithwik's own writing or the project it led to; chapters without one simply have none.
const [blackcoffer, iitIndore] = experiences
const DURATION = 7000

type Chapter = { id: string; kind: string; when: string; place: string; role: string; where: string; question?: string; body: string; result?: string; link?: { href: string; label: string } }

const chapters: Chapter[] = [
  { id: "dharwad", kind: "Study", when: "2021 — 2025", place: "IIIT Dharwad", role: "B.Tech Computer Science", where: "Dharwad, India", body: "Computer science foundations, ML research and systems projects." },
  { id: "codealpha", kind: "Internship", when: earlierExperience.period, place: earlierExperience.company, role: earlierExperience.role, where: "Web development", body: earlierExperience.summary },
  { id: "indore", kind: "Research", when: iitIndore.period, place: iitIndore.company, role: iitIndore.role, where: "Explainable NLP", question: "Which words actually support the label?", body: iitIndore.summary, link: { href: "/projects/x-mutest", label: "X-MuTeST" } },
  { id: "blackcoffer", kind: "Work", when: blackcoffer.period, place: blackcoffer.company, role: blackcoffer.role, where: "Data science", question: "What can this data actually support?", body: blackcoffer.summary, result: blackcoffer.aside },
  { id: "asu", kind: "Study · now", when: "2025 — May 2027", place: "Arizona State", role: "M.S. Computer Science", where: "Tempe, Arizona", question: "What changed, and is it safe to release?", body: "Distributed systems, machine learning, security and software verification. Most of the work has moved into APIs, databases, background jobs and evaluation systems.", link: { href: "/projects/agentguard", label: "AgentGuard" } },
]

export function Chapters() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const list = useGlider<HTMLButtonElement>(chapters[active].id)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false)
    const node = root.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.45 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Auto-advance only while on screen and untouched; the progress bar is the same timer in CSS.
  const running = auto && visible && !paused
  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => setActive((i) => (i + 1) % chapters.length), DURATION)
    return () => window.clearTimeout(id)
  }, [running, active])

  // On narrow screens the chapter list scrolls sideways; keep the active chapter in view
  // by scrolling the list itself, never the page.
  useEffect(() => {
    const strip = list.container.current
    const button = document.getElementById(`chapter-${chapters[active].id}`)
    if (!strip || !button || strip.scrollWidth <= strip.clientWidth) return
    strip.scrollTo({ left: button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2, behavior: "smooth" })
  }, [active, list.container])

  const choose = (i: number) => { setAuto(false); setActive(i) }
  const onKey = (event: React.KeyboardEvent) => {
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = (active + delta + chapters.length) % chapters.length
    choose(next)
    document.getElementById(`chapter-${chapters[next].id}`)?.focus()
  }

  const c = chapters[active]

  return (
    <div ref={root} className={`xp-chapters-ui ${running ? "is-running" : ""}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="xp-chapter-list" role="tablist" aria-label="Chapters" aria-orientation="vertical" ref={list.container as React.Ref<HTMLDivElement>} onKeyDown={onKey}>
        <span className="xp-glider is-soft" style={list.style} aria-hidden="true" />
        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            id={`chapter-${ch.id}`}
            ref={list.register(ch.id)}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="chapter-stage"
            tabIndex={i === active ? 0 : -1}
            className={i === active ? "is-active" : undefined}
            onClick={() => choose(i)}
          >
            <span className="xp-chapter-no">{String(i + 1).padStart(2, "0")}</span>
            <span className="xp-chapter-name">{ch.place}<small>{ch.kind}</small></span>
            {i === active && <span className="xp-chapter-timer" key={`${active}-${running}`} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <article id="chapter-stage" role="tabpanel" aria-labelledby={`chapter-${c.id}`} className="xp-scene" key={c.id}>
        <span className="xp-scene-no" aria-hidden="true">{String(active + 1).padStart(2, "0")}</span>
        <p className="xp-scene-kicker">{c.kind} · {c.when} · {c.where}</p>
        <h3>{c.place}</h3>
        <p className="xp-scene-role">{c.role}</p>
        {c.question && <p className="xp-scene-question">“{c.question}”</p>}
        <p className="xp-scene-body">{c.body}</p>
        {(c.result || c.link) && (
          <p className="xp-scene-result">
            {c.result && <span>{c.result}</span>}
            {c.link && <Link href={c.link.href} className="xp-link">{c.link.label} <Arrow /></Link>}
          </p>
        )}
      </article>
    </div>
  )
}
