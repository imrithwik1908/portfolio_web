"use client"

import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { useInView } from "@/components/xp/use-in-view"

// Every note quotes Rithwik's own words from the original site; nothing here is invented.
const notes = [
  { place: "IIT Indore · 2024", text: "Getting the label right was only half the problem; we also needed to inspect which words supported it.", link: { href: "/projects/x-mutest", label: "That became X-MuTeST" } },
  { place: "Blackcoffer · 2025", text: "Business questions first, modelling problems second. It made me care about the data and assumptions behind an answer, not only the score at the end." },
  { place: "ASU · now", text: "What started as an LLM-testing idea became a system about traces, stored evidence, and release decisions.", link: { href: "/projects/agentguard", label: "That's AgentGuard" } },
]

const askMe = ["Why averages hide regressions", "Rationales in Telugu and Hindi", "Fusing voice, text and video", "Release gates for LLM apps"]

export function About() {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`xp-board ${inView ? "is-in" : ""}`}>
      <figure className="xp-board-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile.jpg" alt="Rithwik at IIIT Dharwad" width={1200} height={1600} loading="lazy" decoding="async" />
        <figcaption>Dharwad, 2024</figcaption>
        <span className="xp-tape" aria-hidden="true" />
      </figure>

      <div className="xp-board-lede">
        <p>I came to computer science through machine learning, but <em>the surrounding engineering</em> kept pulling me in.</p>
      </div>

      <div className="xp-notes">
      {notes.map((note, i) => (
        <article key={note.place} className="xp-note" style={{ "--i": i } as React.CSSProperties}>
          <span className="xp-pin" aria-hidden="true" />
          <p className="xp-note-place">{note.place}</p>
          <p className="xp-note-text">{note.text}</p>
          {note.link && <Link href={note.link.href} className="xp-note-link">{note.link.label} <Arrow /></Link>}
        </article>
      ))}
      </div>

      <div className="xp-askme">
        <p>Ask me about</p>
        <ul>{askMe.map((topic) => <li key={topic}>{topic}</li>)}</ul>
      </div>
    </div>
  )
}
