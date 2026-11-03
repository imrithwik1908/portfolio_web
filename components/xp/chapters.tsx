"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { useGlider } from "@/components/xp/use-glider"

// Work, newest first. Each entry says what the problem was, what I built and how, and what came
// of it. Sources: the résumé, the AgentGuard and X-MuTeST repositories, and the paper.
const DURATION = 9000

type Chapter = { id: string; year: string; tab: string; kind: string; when: string; place: string; role: string; question: string; summary: string; did: string[]; results?: string[]; link?: { href: string; label: string } }

const chapters: Chapter[] = [
  {
    id: "now", year: "2026", tab: "Now", kind: "Graduate work", when: "2025 – present", place: "Arizona State", role: "M.S. Computer Science · AgentGuard",
    question: "What changed, and is it safe to release?",
    summary: "I'm building AgentGuard end to end: a release gate that tells you which cases a new LLM version broke, not just whether the average moved.",
    did: [
      "A Python SDK that captures runs and nested spans, and fails open so it can never take down the app it instruments",
      "A FastAPI service that ingests each trace in one transaction into PostgreSQL, with evaluation pushed to Redis / ARQ workers off the request path",
      "Pairing logic that compares the same case and evaluator across versions, and a policy engine that returns PASS, BLOCK or REVIEW with reasons, never an LLM's opinion",
    ],
    results: ["Found and fixed a comparison bug where older runs leaked into current results, by scoping pairs to the latest finished job", "Integration tests cover atomic ingestion, workspace isolation, pairing and release policy"],
    link: { href: "/projects/agentguard", label: "AgentGuard" },
  },
  {
    id: "blackcoffer", year: "2025", tab: "Blackcoffer", kind: "Data Science Associate", when: "Dec 2024 – May 2025", place: "Blackcoffer", role: "Data Science Associate · India",
    question: "What can this data actually support?",
    summary: "Two forecasting problems that arrived as business questions, with no clean benchmark to lean on.",
    did: [
      "Built time-series models in Python on a 40K+ record dataset of shoppers' paths through a mall, and validated them against the approach already in use",
      "Did the preprocessing and feature engineering to make the data trustworthy before modelling, and kept the pipeline reproducible",
      "Forecast daily digital-ad revenue, and traced the remaining error back to three patterns in user behaviour",
    ],
    results: ["Trajectory forecasts 18% more accurate than the earlier method, 82% overall", "Ad-revenue mean daily error down to $142, which freed about 15% of the marketing budget to be reallocated"],
  },
  {
    id: "indore", year: "2024", tab: "IIT Indore", kind: "Research Intern", when: "Apr – Nov 2024", place: "IIT Indore", role: "Summer Research Intern · AI/ML",
    question: "Which words actually support the label?",
    summary: "Hate-speech detection in English, Hindi and Telugu, where a correct label isn't enough: the model also has to point at the words that justify it.",
    did: [
      "Trained with two-stage attention supervision: human rationales first, then n-gram perturbation scores that measure how predictions shift",
      "Chose the encoder per language from validation results (MuRIL for English and Telugu, XLM-R for Hindi) and merged model rationales with LLaMA 3.1 suggestions",
      "Evaluated explanations for plausibility (Token-F1, IOU-F1) and faithfulness (comprehensiveness, sufficiency), not just accuracy",
    ],
    results: ["Cut inference latency by 20% across pipeline iterations", "Published at AAAI 2026"],
    link: { href: "/projects/x-mutest", label: "X-MuTeST" },
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
            <span className="xp-chapter-no">{ch.year}</span>
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
        <p className="xp-scene-question">“{c.question}”</p>
        <p className="xp-scene-body">{c.summary}</p>
        <ul className="xp-scene-did">{c.did.map((d) => <li key={d}>{d}</li>)}</ul>
        {c.results && <ul className="xp-scene-results">{c.results.map((r) => <li key={r}>{r}</li>)}</ul>}
        {c.link && <p className="xp-scene-result"><Link href={c.link.href} className="xp-link">{c.link.label} <Arrow /></Link></p>}
      </article>
    </div>
  )
}
