"use client"

import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { Lens } from "@/components/xp/lens"
import { Note } from "@/components/xp/note"

// The three passages quote Rithwik's own writing from the original site. The line about what
// he's drawn to comes from his own description of himself.
const passages = [
  { place: "IIT Indore", text: "Getting the label right was only half the problem; we also needed to inspect which words supported it.", link: { href: "/projects/x-mutest", label: "X-MuTeST" } },
  { place: "Blackcoffer", text: "Questions arrived as business questions first, modelling problems second. It made me care about the data and assumptions behind an answer, not only the score at the end." },
  { place: "Arizona State", text: "What started as an LLM-testing idea became a system about traces, stored evidence, and release decisions.", link: { href: "/projects/agentguard", label: "AgentGuard" } },
]

function Photo({ negative = false }: { negative?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/profile.jpg" alt={negative ? "" : "Rithwik standing outdoors at IIIT Dharwad"} width={1200} height={1600} loading="lazy" decoding="async" className={negative ? "is-negative" : undefined} />
  )
}

export function About() {
  return (
    <div className="xp-about">
      <figure className="xp-about-photo">
        <Lens radius={90} surface={<Photo />} beneath={<Photo negative />} toggleLabel={["See the negative", "See the photo"]} />
        <figcaption>Dharwad, 2024</figcaption>
      </figure>

      <div className="xp-about-text">
        <p className="xp-about-lede">I came to computer science through machine learning, but the engineering around the models kept pulling me in.</p>
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
      <Note className="is-about">The negative is the same photo with an inverted filter, revealed through the same lens as the greeting.</Note>
    </div>
  )
}
