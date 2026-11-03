"use client"

import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { useInView } from "@/components/xp/use-in-view"
import { xmutestBibtex } from "@/lib/project-repo"

// Authors, venue and abstract are taken from the X-MuTeST repository README and its BibTeX.
const authors = ["Mohammad Zia Ur Rehman", "Sai Kartheek Reddy Kasu", "Shashivardhan Reddy Koppula", "Sai Rithwik Reddy Chirra", "Shwetank Shekhar Singh", "Nagendra Kumar"]
const ME = "Sai Rithwik Reddy Chirra"

export function Publication() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(xmutestBibtex)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.open("https://github.com/ziarehman30/X-MuTeST#citation", "_blank", "noopener")
    }
  }

  return (
    <div ref={ref} className={`xp-paper ${inView ? "is-in" : ""}`}>
      <div className="xp-paper-sheet" aria-hidden="true">
        <span className="xp-paper-venue">AAAI-26</span>
        <span className="xp-paper-title">X-MuTeST: A Multilingual Benchmark for Explainable Hate Speech Detection and a Novel LLM-Consulted Explanation Framework</span>
        <span className="xp-paper-authors">{authors.join(", ")}</span>
        <span className="xp-paper-cols">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ "--i": i, width: `${72 + ((i * 37) % 28)}%` } as React.CSSProperties} />)}</span>
      </div>

      <div className="xp-paper-meta">
        <p className="xp-paper-kicker">Proceedings of the AAAI Conference on Artificial Intelligence · Vol. 40, No. 46 · March 2026 · pp. 39134–39142</p>
        <h3>X-MuTeST: A Multilingual Benchmark for Explainable Hate Speech Detection and a Novel LLM-Consulted Explanation Framework</h3>
        <p className="xp-paper-authorlist">
          {authors.map((a, i) => <span key={a}>{i > 0 && ", "}{a === ME ? <strong>{a}</strong> : a}</span>)}
        </p>
        <p className="xp-paper-abstract">Benchmark datasets with human-annotated, token-level rationales for hate-speech detection in Hindi, Telugu and English, and a framework that combines n-gram explainability with LLM-generated explanations, evaluated for plausibility and faithfulness.</p>
        <div className="xp-paper-actions">
          <a className="xp-button" href="https://doi.org/10.1609/aaai.v40i46.41261" target="_blank" rel="noreferrer">Read the paper <Arrow dir="out" /></a>
          <button type="button" className={`xp-chip-button ${copied ? "is-copied" : ""}`} onClick={copy}>{copied ? "BibTeX copied" : "Copy BibTeX"}</button>
          <a className="xp-link" href="https://github.com/ziarehman30/X-MuTeST" target="_blank" rel="noreferrer">Code <Arrow dir="out" /></a>
        </div>
      </div>
    </div>
  )
}
