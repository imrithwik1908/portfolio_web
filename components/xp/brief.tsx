"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "@/components/xp/ambient"
import { EMAIL } from "@/components/xp/copy-email"
import { RESUME_PDF, openResume } from "@/components/xp/resume"

// The 30-second version, for anyone skimming: who, what roles, when, three pieces of proof, and
// every way to follow up. Opens from the hero, from ⌘K, or by pressing "b".

const PROOF = [
  { big: "AAAI 2026", line: "Co-authored a paper on hate-speech detection that explains itself, in English, Hindi and Telugu.", href: "/projects/x-mutest", cta: "X-MuTeST" },
  { big: "Shipped", line: "AgentGuard: a release check for AI apps, built end to end and deployed. SDK, API, workers, dashboard.", href: "/projects/agentguard", cta: "AgentGuard" },
  { big: "4.22", line: "GPA in the M.S. at Arizona State, after 8.94 / 10 in the B.Tech at IIIT Dharwad.", href: "/#education", cta: "Education" },
]
const PATH = [
  ["Dec 2024 – May 2025", "Data Science Associate, Blackcoffer", "forecasting work that improved on the earlier approach by 18%"],
  ["Apr – Nov 2024", "Summer Research Intern, IIT Indore", "the research that became the AAAI paper"],
  ["Jun – Jul 2023", "Full Stack Developer Intern, CodeAlpha", "web apps with Node.js and EJS"],
]
const STACK = ["Python", "PyTorch", "Hugging Face", "SQL", "FastAPI", "PostgreSQL", "Redis", "TypeScript", "Next.js"]

export function Brief() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key === "Escape") setOpen(false)
      if (e.key.toLowerCase() === "b" && !e.metaKey && !e.ctrlKey && !e.altKey && !t?.closest?.("input, textarea, [contenteditable]")) setOpen((v) => !v)
    }
    window.addEventListener("xp:brief", onOpen)
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("xp:brief", onOpen); window.removeEventListener("keydown", onKey) }
  }, [])

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement
      document.documentElement.classList.add("has-brief")
      requestAnimationFrame(() => box.current?.focus())
    } else {
      document.documentElement.classList.remove("has-brief")
      returnTo.current?.focus?.()
    }
  }, [open])

  const copy = () => navigator.clipboard?.writeText(EMAIL).then(() => toast("Email copied."), () => { window.location.href = `mailto:${EMAIL}` })
  const go = () => setOpen(false)

  return (
    <div className={`xp-brief ${open ? "is-open" : ""}`} aria-hidden={!open} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div ref={box} className="xp-brief-sheet" role="dialog" aria-modal="true" aria-label="The 30-second version" tabIndex={-1}>
        <button type="button" className="xp-sheet-close xp-brief-close" onClick={() => setOpen(false)} aria-label="Close" tabIndex={open ? 0 : -1}>×</button>
        <p className="xp-brief-kicker" style={{ "--i": 0 } as React.CSSProperties}><span className="xp-roles-pulse" aria-hidden="true" /> The 30-second version</p>
        <h2 style={{ "--i": 1 } as React.CSSProperties}>Sai Rithwik Reddy Chirra builds ML systems and the software around them.</h2>
        <p className="xp-brief-facts" style={{ "--i": 2 } as React.CSSProperties}>
          <span>Open to <b>ML engineering</b> and <b>data science</b> roles</span>
          <span>M.S. Computer Science, Arizona State · graduating <b>May 2027</b></span>
          <span>Tempe, Arizona</span>
        </p>

        <div className="xp-brief-proof">
          {PROOF.map((p, i) => (
            <Link key={p.big} href={p.href} onClick={go} tabIndex={open ? 0 : -1} style={{ "--i": 3 + i } as React.CSSProperties}>
              <strong>{p.big}</strong>
              <span>{p.line}</span>
              <em>{p.cta} →</em>
            </Link>
          ))}
        </div>

        <ol className="xp-brief-path" style={{ "--i": 6 } as React.CSSProperties}>
          {PATH.map(([when, what, note]) => <li key={what}><span>{when}</span><p><b>{what}</b>, {note}</p></li>)}
        </ol>

        <ul className="xp-brief-stack" style={{ "--i": 7 } as React.CSSProperties} aria-label="Tools">{STACK.map((s) => <li key={s}>{s}</li>)}</ul>

        <div className="xp-brief-actions" style={{ "--i": 8 } as React.CSSProperties}>
          <button type="button" className="xp-button" tabIndex={open ? 0 : -1} onClick={() => { setOpen(false); openResume() }}>Open the résumé</button>
          <a className="xp-brief-ghost" href={RESUME_PDF} download tabIndex={open ? 0 : -1}>Download PDF ↓</a>
          <button type="button" className="xp-brief-ghost" tabIndex={open ? 0 : -1} onClick={copy}>Copy email</button>
          <a className="xp-brief-ghost" href="https://www.linkedin.com/in/sairithwikreddy" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>LinkedIn ↗</a>
          <a className="xp-brief-ghost" href="https://github.com/imrithwik1908" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>GitHub ↗</a>
        </div>
      </div>
    </div>
  )
}

// The quiet link in the hero that opens it.
export function BriefLink() {
  return (
    <button type="button" className="xp-brief-link" onClick={() => window.dispatchEvent(new Event("xp:brief"))}>
      Short on time? <span>The 30-second version</span> <kbd>B</kbd>
    </button>
  )
}
