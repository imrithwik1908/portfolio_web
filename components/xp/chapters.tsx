"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { useGlider } from "@/components/xp/use-glider"

// Work, newest first, written from Rithwik's résumé and repositories. Results are his own
// reported numbers; each question is the one the work was actually trying to answer.
const DURATION = 8000

type Chapter = { id: string; tab: string; kind: string; when: string; place: string; role: string; question?: string; body: string; results?: string[]; link?: { href: string; label: string } }

const chapters: Chapter[] = [
  {
    id: "now", tab: "Now", kind: "Graduate projects", when: "Fall 2026", place: "Arizona State", role: "M.S. Computer Science",
    question: "What changed, and is it safe to release?",
    body: "Most of my time goes into AgentGuard, a regression-testing and release gate for LLM apps, built to catch the cases an average score hides. In class, I'm training a small network to play Fog-of-War chess, where you can't see most of the board.",
    link: { href: "/projects/agentguard", label: "AgentGuard" },
  },
  {
    id: "blackcoffer", tab: "Blackcoffer", kind: "Data Science Associate", when: "Dec 2024 – May 2025", place: "Blackcoffer", role: "Data Science Associate · India",
    question: "What can this data actually support?",
    body: "Two forecasting problems that arrived as business questions. One was a 40K+ record dataset of shoppers' paths through a mall; the other was daily digital-ad revenue. Most of the work was preprocessing, feature engineering and deciding what the data could support before choosing a model.",
    results: ["18% better forecasting accuracy than the earlier approach, 82% overall", "Mean daily error on ad revenue brought down to $142, after finding three hidden patterns in user behaviour"],
  },
  {
    id: "indore", tab: "IIT Indore", kind: "Summer Research Intern", when: "Apr – Nov 2024", place: "IIT Indore", role: "Summer Research Intern · AI/ML",
    question: "Which words actually support the label?",
    body: "I worked on X-MuTeST: hate-speech detection in English, Hindi and Telugu where the model also has to point at the words that justify its answer. I built and compared MuRIL, XLM-R and LLaMA 3.1 pipelines and wrote the technical reports on the design.",
    results: ["Iterating on the pipeline cut inference latency by 20%", "The work became an AAAI 2026 paper"],
    link: { href: "/projects/x-mutest", label: "X-MuTeST" },
  },
  {
    id: "codealpha", tab: "CodeAlpha", kind: "Full Stack Developer Intern", when: "Jun – Jul 2023", place: "CodeAlpha", role: "Full Stack Developer Intern",
    body: "Early web work: responsive pages and a small Node.js / EJS application.",
  },
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

  const running = auto && visible && !paused
  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => setActive((i) => (i + 1) % chapters.length), DURATION)
    return () => window.clearTimeout(id)
  }, [running, active])

  // On narrow screens the list scrolls sideways; keep the active entry in view by scrolling the list, never the page.
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
      <div className="xp-chapter-list" role="tablist" aria-label="Experience" aria-orientation="vertical" ref={list.container as React.Ref<HTMLDivElement>} onKeyDown={onKey}>
        <span className="xp-glider is-soft" style={list.style} aria-hidden="true" />
        {chapters.map((ch, i) => (
          <button key={ch.id} id={`chapter-${ch.id}`} ref={list.register(ch.id)} type="button" role="tab" aria-selected={i === active} aria-controls="chapter-stage" tabIndex={i === active ? 0 : -1} className={i === active ? "is-active" : undefined} onClick={() => choose(i)}>
            <span className="xp-chapter-no">{ch.when.slice(-4)}</span>
            <span className="xp-chapter-name">{ch.tab}<small>{ch.kind}</small></span>
            {i === active && <span className="xp-chapter-timer" key={`${active}-${running}`} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <article id="chapter-stage" role="tabpanel" aria-labelledby={`chapter-${c.id}`} className="xp-scene" key={c.id}>
        <span className="xp-scene-no" aria-hidden="true">{String(active + 1).padStart(2, "0")}</span>
        <p className="xp-scene-kicker">{c.when}</p>
        <h3>{c.place}</h3>
        <p className="xp-scene-role">{c.role}</p>
        {c.question && <p className="xp-scene-question">“{c.question}”</p>}
        <p className="xp-scene-body">{c.body}</p>
        {c.results && <ul className="xp-scene-results">{c.results.map((r) => <li key={r}>{r}</li>)}</ul>}
        {c.link && <p className="xp-scene-result"><Link href={c.link.href} className="xp-link">{c.link.label} <Arrow /></Link></p>}
      </article>
    </div>
  )
}
