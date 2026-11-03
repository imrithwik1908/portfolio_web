"use client"

import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { Note } from "@/components/xp/note"

// The three passages quote Rithwik's own writing from the original site. The line about what
// he's drawn to comes from his own description of himself.
const passages = [
  { place: "IIT Indore", text: "Getting the label right was only half the problem; we also needed to inspect which words supported it.", link: { href: "/projects/x-mutest", label: "X-MuTeST" } },
  { place: "Blackcoffer", text: "Questions arrived as business questions first, modelling problems second. It made me care about the data and assumptions behind an answer, not only the score at the end." },
  { place: "Arizona State", text: "What started as an LLM-testing idea became a system about traces, stored evidence, and release decisions.", link: { href: "/projects/agentguard", label: "AgentGuard" } },
]

export function About() {
  return (
    <div className="xp-about">
      <div className="xp-about-side">
        <p className="xp-about-lede">I came to computer science through machine learning, but the engineering around the models kept pulling me in.</p>
      </div>

      <div className="xp-about-text">
        <p className="xp-about-off">Off the clock, I&apos;m drawn to mysteries, slow-burning suspense and the kind of horror that makes you pay attention. The pull is the same as in engineering: the satisfying part is finally understanding what was happening underneath.</p>

        <ol className="xp-passages">
          {passages.map((p) => (
            <li key={p.place}>
              <p className="xp-passage-place">{p.place}</p>
              <blockquote>{p.text}</blockquote>
              {p.link && <Link href={p.link.href} className="xp-link">{p.link.label} <Arrow /></Link>}
            </li>
          ))}
        </ol>
      </div>
      <Note className="is-about">The three passages are quoted from my own earlier writing about each of these places.</Note>
    </div>
  )
}
