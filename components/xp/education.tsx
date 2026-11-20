"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { Globe } from "@/components/xp/globe"

// Education told as a journey, not two boxes. The globe stays pinned while the story scrolls past it,
// and it turns to wherever the story is: Dharwad, the flight between, then Tempe.
const GRADUATION = new Date("2027-05-15T00:00:00-07:00")
const STARTED = new Date("2025-08-21T00:00:00-07:00")

type Place = "dharwad" | "route" | "tempe"

export function Education() {
  const [months, setMonths] = useState<number | null>(null)
  const [done, setDone] = useState(0)
  const [beat, setBeat] = useState(0)
  const list = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const now = new Date()
    setMonths(Math.max(0, (GRADUATION.getFullYear() - now.getFullYear()) * 12 + GRADUATION.getMonth() - now.getMonth()))
    setDone(Math.min(1, Math.max(0, (now.getTime() - STARTED.getTime()) / (GRADUATION.getTime() - STARTED.getTime()))))
  }, [])

  // The beat crossing the middle of the screen is the one being told.
  useEffect(() => {
    const items = Array.from(list.current?.children ?? []) as HTMLElement[]
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setBeat(Number((e.target as HTMLElement).dataset.beat)) })
    }, { rootMargin: "-45% 0px -45% 0px" })
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const beats: { place: Place; when: string; body: React.ReactNode }[] = [
    {
      place: "dharwad",
      when: "2021 · Dharwad, India",
      body: (
        <>
          <h3>It started with a B.Tech in Computer Science at <em>IIIT Dharwad</em>.</h3>
          <p>Coursework included Data Analytics, Artificial Intelligence and Operating Systems.</p>
        </>
      ),
    },
    {
      place: "dharwad",
      when: "Alongside it",
      body: (
        <>
          <h3>Research at IIT Indore turned into <Link href="/projects/x-mutest" className="xp-inline-link">X-MuTeST <Arrow /></Link></h3>
          <p>An AAAI 2026 paper on explaining hate-speech decisions in English, Hindi and Telugu. Forecasting work at Blackcoffer taught the opposite lesson: messy data, no benchmark, someone waiting.</p>
        </>
      ),
    },
    {
      place: "dharwad",
      when: "May 2025 · Graduated",
      body: (
        <>
          <p className="xp-journey-stat"><b>8.94</b><span>GPA out of 10</span></p>
          <p>Four years, done.</p>
        </>
      ),
    },
    {
      place: "route",
      when: "Then",
      body: (
        <>
          <p className="xp-journey-stat"><b>14,530</b><span>kilometres, Dharwad to Tempe</span></p>
          <p>The great-circle route on the globe is the real one. The light travelling along it is me.</p>
        </>
      ),
    },
    {
      place: "tempe",
      when: "2025 → May 2027 · Tempe, Arizona",
      body: (
        <>
          <h3>An M.S. in Computer Science at <em>Arizona State</em>.</h3>
          <p>Data Mining, Data Visualization and Distributed Database Systems so far, with a GPA of <span className="xp-tip is-text" tabIndex={0} data-tip="Above 4.0 because ASU counts an A+ as 4.33.">4.22</span>.</p>
        </>
      ),
    },
    {
      place: "tempe",
      when: "Right now",
      body: (
        <>
          <h3>Building <Link href="/projects/agentguard" className="xp-inline-link">AgentGuard <Arrow /></Link> and a Fog-of-War chess agent for CSE 598.</h3>
          <div className="xp-journey-bar" role="img" aria-label={`About ${Math.round(done * 100)}% of the way through the M.S.`}>
            <span style={{ "--done": done } as React.CSSProperties} />
            <small>{Math.round(done * 100)}% through{months !== null && months > 0 && <> · {months} months to go</>}</small>
          </div>
        </>
      ),
    },
  ]

  // Tell the globe where the story is.
  const place = beats[beat]?.place ?? "dharwad"
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("xp-globe-fly", { detail: place }))
  }, [place])

  return (
    <div className="xp-journey" style={{ "--beat": beat / (beats.length - 1) } as React.CSSProperties}>
      <div className="xp-journey-globe">
        <Globe />
      </div>
      <ol ref={list} className="xp-journey-beats">
        {beats.map((b, i) => (
          <li key={b.when} data-beat={i} className={i === beat ? "is-on" : i < beat ? "is-past" : undefined}>
            <p className="xp-journey-when">{b.when}</p>
            {b.body}
          </li>
        ))}
      </ol>
    </div>
  )
}
