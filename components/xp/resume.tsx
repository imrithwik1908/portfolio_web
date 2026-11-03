"use client"

import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { EMAIL } from "@/components/xp/copy-email"

export const RESUME_PDF = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"

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
        <span>Case file · Chirra, S. R. R.</span>
        <div>
          <button type="button" className="xp-link" onClick={() => window.print()}>Print</button>
          <a className="xp-link" href={RESUME_PDF} target="_blank" rel="noreferrer">PDF <Arrow dir="out" /></a>
          <button type="button" className="xp-dossier-close" onClick={() => setOpen(false)} aria-label="Close the résumé">Close <kbd>Esc</kbd></button>
        </div>
      </div>

      <div ref={dialog} className="xp-sheet" role="dialog" aria-modal="true" aria-label="Résumé" tabIndex={-1}>
        <header className="xp-sheet-head">
          <div>
            <h2>Sai Rithwik Reddy Chirra</h2>
            <p>ML engineering and data science · Tempe, Arizona · {EMAIL}</p>
          </div>
          <span className="xp-sheet-stamp" aria-hidden="true">Seeking ML /<br />DS roles</span>
        </header>

        <p className="xp-sheet-summary">Published ML researcher (AAAI 2026) and M.S. Computer Science student who builds models and the systems around them: forecasting pipelines, explainable NLP, and evaluation tooling that decides whether an LLM change is safe to ship.</p>

        <section>
          <h3>Experience</h3>
          <article>
            <div className="xp-sheet-row"><strong>Data Science Associate, Blackcoffer</strong><span>Dec 2024 – May 2025</span></div>
            <ul>
              <li>Built time-series forecasting models in Python on a 40K+ record mall-trajectory dataset; 18% more accurate than the earlier method, 82% overall.</li>
              <li>Brought ad-revenue mean daily error down to $142 by finding three hidden patterns in user behaviour, enabling 15% more efficient budget allocation.</li>
              <li>Conducted preprocessing, feature engineering and validation so results stayed reproducible.</li>
            </ul>
          </article>
          <article>
            <div className="xp-sheet-row"><strong>Summer Research Intern (AI/ML), IIT Indore</strong><span>Apr – Nov 2024</span></div>
            <ul>
              <li>Developed X-MuTeST, explainable hate-speech detection for English, Hindi and Telugu, with human-rationale supervision and MuRIL, XLM-R and LLaMA 3.1.</li>
              <li>Wrote the technical reports on model design and deployment; pipeline iterations cut inference latency by 20%.</li>
            </ul>
          </article>
        </section>

        <section>
          <h3>Projects</h3>
          <article>
            <div className="xp-sheet-row"><strong>AgentGuard</strong><span>2026</span></div>
            <ul><li>Regression testing and release gate for LLM apps: Python SDK, FastAPI, PostgreSQL, Redis / ARQ workers, Next.js. Paired baseline/candidate evaluation with PASS, BLOCK or REVIEW decisions.</li></ul>
          </article>
          <article>
            <div className="xp-sheet-row"><strong>Tensor Fusion</strong><span>2024</span></div>
            <ul><li>Multimodal sentiment analysis on CMU-MOSEI fusing text, audio and video; 70.4% binary accuracy, F1 0.709.</li></ul>
          </article>
          <article>
            <div className="xp-sheet-row"><strong>Course Catalog</strong><span>2024</span></div>
            <ul><li>Role-based course system with Google sign-in, Express and MongoDB; separate student and professor flows over one data model.</li></ul>
          </article>
        </section>

        <section>
          <h3>Publication</h3>
          <p><strong>X-MuTeST: A Multilingual Benchmark for Explainable Hate Speech Detection and a Novel LLM-Consulted Explanation Framework.</strong> Proceedings of the AAAI Conference on Artificial Intelligence, 40(46), 2026.</p>
        </section>

        <section className="xp-sheet-split">
          <div>
            <h3>Education</h3>
            <p><strong>M.S. Computer Science</strong>, Arizona State University · May 2027 · GPA 4.22</p>
            <p><strong>B.Tech Computer Science</strong>, IIIT Dharwad · May 2025 · GPA 8.94/10</p>
          </div>
          <div>
            <h3>Skills</h3>
            <p>Python, C++, JavaScript, TypeScript · PyTorch, TensorFlow, scikit-learn, Hugging Face · FastAPI, Flask, Node.js · PostgreSQL, MongoDB, Neo4j, Redis · GCP, AWS, IBM Cloud, Jenkins, Power BI</p>
          </div>
        </section>
      </div>
    </div>
  )
}
