"use client"

import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import resume from "@/lib/resume.json"

export const RESUME_PDF = "/Sai_Rithwik_Reddy_Chirra_Resume.pdf"
export const RESUME_DOCX = "/Sai_Rithwik_Reddy_Chirra_Resume.docx"

// Opens the résumé as a case file on the page instead of sending people to a PDF viewer.
export function openResume() {
  window.dispatchEvent(new Event("resume:open"))
}

export function ResumeLink({ className = "xp-link", children }: { className?: string; children: React.ReactNode }) {
  return (
    <a href={RESUME_PDF} target="_blank" rel="noreferrer" className={className} onClick={(event) => { event.preventDefault(); openResume() }}>
      {children}
    </a>
  )
}

// Content follows the résumé; project figures use the values verified in each repository.
export function ResumeDossier() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onOpen = () => { returnTo.current = document.activeElement as HTMLElement; setOpen(true) }
    window.addEventListener("resume:open", onOpen)
    return () => window.removeEventListener("resume:open", onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add("is-dossier-open")
    dialog.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
      if (event.key !== "Tab" || !dialog.current) return
      const focusable = dialog.current.querySelectorAll<HTMLElement>("a, button")
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.documentElement.classList.remove("is-dossier-open")
      window.removeEventListener("keydown", onKey)
      returnTo.current?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="xp-dossier" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <div className="xp-dossier-bar">
        <span>Résumé · Sai Rithwik Reddy Chirra</span>
        <div>
          <button type="button" className="xp-link" onClick={() => window.print()}>Print</button>
          <a className="xp-link" href={RESUME_PDF} download>Download PDF <Arrow dir="down" /></a>
          <a className="xp-link" href={RESUME_DOCX} download>Word <Arrow dir="down" /></a>
          <button type="button" className="xp-dossier-close" onClick={() => setOpen(false)} aria-label="Close the résumé">Close <kbd>Esc</kbd></button>
        </div>
      </div>

      <div ref={dialog} className="xp-sheet" role="dialog" aria-modal="true" aria-label="Résumé" tabIndex={-1}>
        <ResumeSheet />
      </div>
    </div>
  )
}

// The résumé body, shared by the on-page case file and the print copy below. It reads the same
// lib/resume.json that scripts/build_resume.py turns into the downloadable PDF and DOCX.
function ResumeSheet() {
  const r = resume
  return (
    <>
    <header className="xp-sheet-head">
      <div>
        <h2>{r.name}</h2>
        <p>{r.contact.map((c, i) => <span key={c.label}>{i > 0 && " · "}{c.href ? <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{c.label}</a> : c.label}</span>)}</p>
      </div>
      <span className="xp-sheet-stamp" aria-hidden="true">Seeking ML /<br />DS roles</span>
    </header>

    <p className="xp-sheet-summary">{r.summary}</p>

    <section>
      <h3>Experience</h3>
      {r.experience.map((x) => (
        <article key={x.org}>
          <div className="xp-sheet-row"><strong>{x.role}, {x.org}</strong><span>{x.when}</span></div>
          <ul>{x.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        </article>
      ))}
    </section>

    <section>
      <h3>Projects</h3>
      {r.projects.map((p) => (
        <article key={p.name}>
          <div className="xp-sheet-row"><strong><a href={p.href} target="_blank" rel="noreferrer">{p.name}</a>: {p.what}</strong><span>{p.when}</span></div>
          <p className="xp-sheet-stack">{p.stack}</p>
          <ul>{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        </article>
      ))}
    </section>

    <section>
      <h3>Publication</h3>
      <p><strong>{r.publication.title}.</strong> {r.publication.authors}. {r.publication.venue}. <a href={r.publication.href} target="_blank" rel="noreferrer">DOI</a></p>
    </section>

    <section className="xp-sheet-split">
      <div>
        <h3>Education</h3>
        {r.education.map((e) => <p key={e.school}><strong>{e.degree}</strong>, {e.school} · {e.when} · {e.gpa}</p>)}
      </div>
      <div>
        <h3>Skills</h3>
        {r.skills.map((s) => <p key={s.group}><strong>{s.group}:</strong> {s.items}</p>)}
      </div>
    </section>
    </>
  )
}

// Always in the page but only visible on paper: Cmd/Ctrl+P anywhere prints the résumé, not a dark website.
export function PrintResume() {
  return (
    <div className="xp-print-resume" aria-hidden="true">
      <div className="xp-sheet"><ResumeSheet /></div>
    </div>
  )
}
