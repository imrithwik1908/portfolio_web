"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { tempeNow } from "@/components/xp/ambient"
import { Arrow } from "@/components/xp/arrow"
import { Note } from "@/components/xp/note"
import { ResumeLink } from "@/components/xp/resume"
import { BriefLink } from "@/components/xp/brief"

function Portrait() {
  const [proof, setProof] = useState(false)
  useEffect(() => {
    if (!proof) return
    const id = window.setTimeout(() => setProof(false), 2600)
    return () => window.clearTimeout(id)
  }, [proof])
  return (
    <div className="xp-portrait-wrap">
    
    <figure className="xp-portrait" onDoubleClick={() => setProof(true)}>
      {/* A plain image: no optimizer round-trip and no filters, just the photograph. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" width={1200} height={1600} loading="eager" fetchPriority="high" decoding="async" />
      <figcaption key={String(proof)}>{proof ? "Yes, that\u2019s really me." : "IIIT Dharwad, 2024"}</figcaption>
    </figure>
    </div>
  )
}

// The roles, as a small status pill under the name. The role word slides up through a clipped
// slot, and the pill eases to the new word's width.
const ROLES = ["ML engineering", "Data science", "ML research"]

function Roles() {
  const [k, setK] = useState(0)
  const [widths, setWidths] = useState<number[]>([])
  const sizer = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const measure = () => setWidths(Array.from(sizer.current?.children ?? []).map((c) => (c as HTMLElement).getBoundingClientRect().width))
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener("resize", measure)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => window.removeEventListener("resize", measure)
    const id = window.setInterval(() => { if (!document.hidden) setK((v) => v + 1) }, 3000)
    return () => { window.clearInterval(id); window.removeEventListener("resize", measure) }
  }, [])
  const now = k % ROLES.length, before = (k + ROLES.length - 1) % ROLES.length
  return (
    <p className="xp-roles" aria-label={`Open to ${ROLES.join(", ")} roles`}>
      <span className="xp-roles-pulse" aria-hidden="true" />
      <span aria-hidden="true">Open to</span>
      <span className="xp-roles-slot" aria-hidden="true" style={widths[now] ? { width: Math.ceil(widths[now]) } : undefined}>
        {k > 0 && <span key={`o${k}`} className="xp-roles-word is-out">{ROLES[before]}</span>}
        <span key={`i${k}`} className={`xp-roles-word ${k > 0 ? "is-in" : ""}`}>{ROLES[now]}</span>
      </span>
      <span aria-hidden="true">roles</span>
      <span ref={sizer} className="xp-roles-sizer" aria-hidden="true">{ROLES.map((r) => <span key={r}>{r}</span>)}</span>
    </p>
  )
}

// What's on the desk, typed out one line at a time. Every line is something real and current.
const DESK = [
  "a release gate for LLM apps (AgentGuard)",
  "a chess agent that plays in the fog (CSE 598)",
  "the last stretch of an M.S. at ASU",
]

function Typed() {
  const [line, setLine] = useState(0)
  const [chars, setChars] = useState(0)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setChars(DESK[line].length); return }
    const full = DESK[line].length
    const id = chars < full
      ? window.setTimeout(() => setChars((c) => c + 1), 38 + Math.random() * 50)
      : window.setTimeout(() => { setChars(0); setLine((l) => (l + 1) % DESK.length) }, 2600)
    return () => window.clearTimeout(id)
  }, [chars, line])
  return (
    <p className="xp-typed" aria-label={`Right now: ${DESK.join("; ")}`}>
      <span aria-hidden="true">Working on</span>
      <span aria-hidden="true">{DESK[line].slice(0, chars)}<i className="xp-caret" /></span>
    </p>
  )
}

// Click the clock and it tells you how far your day is from Tempe's.
function Offset({ label }: { label: string }) {
  const [diff, setDiff] = useState<string | null>(null)
  const show = () => {
    const mine = -new Date().getTimezoneOffset() / 60
    const d = mine - -7
    const abs = Math.abs(d), h = Math.floor(abs), m = Math.round((abs - h) * 60)
    const span = `${h ? `${h} hour${h === 1 ? "" : "s"}` : ""}${h && m ? " " : ""}${m ? `${m} minutes` : ""}`
    setDiff(d === 0 ? "Same time as you, apparently." : `You're ${span} ${d > 0 ? "ahead of" : "behind"} Tempe.`)
    window.setTimeout(() => setDiff(null), 3600)
  }
  return (
    <>
      <button type="button" className="xp-clock" onClick={show}>{label}</button>
      <span className={`xp-offset ${diff ? "is-on" : ""}`} role="status">{diff}</span>
    </>
  )
}

export function Hero() {
  const [now, setNow] = useState<ReturnType<typeof tempeNow> | null>(null)
  useEffect(() => {
    const tick = () => setNow(tempeNow())
    tick()
    const id = window.setInterval(tick, 20_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="xp-hero" aria-labelledby="xp-hero-title">
      <div className="xp-hero-text">
        <p className="xp-hero-meta">
          <span className="xp-tip" tabIndex={0} role="img" aria-label="Arizona skips daylight saving, so Tempe\u2019s clock never jumps." data-tip="Arizona skips daylight saving, so Tempe’s clock never jumps."><span className={`xp-sky ${now?.day ? "is-day" : "is-night"}`} /></span>
          Tempe, Arizona{now && <> · <Offset label={`${now.part}, ${now.time}`} /></>}
        </p>
        <h1 id="xp-hero-title">Hi, I&apos;m <em className="xp-name">Rithwik</em>.</h1>
        <Roles />
        <p className="xp-hero-line">I build machine learning systems and the software around them, and I care more about why a model fails than about its best score.</p>
        <ul className="xp-hero-proof" aria-label="In short">
          <li><Link href="/projects/agentguard">Built and deployed AgentGuard</Link>, a release gate for LLM apps</li>
          <li>Co-authored an <Link href="/#research">AAAI 2026 paper</Link> from research at IIT Indore</li>
          <li>M.S. Computer Science, Arizona State · May 2027</li>
        </ul>
        <div className="xp-hero-actions">
          <Link href="/#work" className="xp-button">See what I&apos;ve built <Arrow dir="down" /></Link>
          <ResumeLink>Open my résumé <Arrow /></ResumeLink>
        </div>
        <BriefLink />
        <Typed />
      </div>

      <Portrait />

      <a href="#work" className="xp-scroll-cue" aria-label="Scroll to the work"><span /></a>
      <Note className="is-hero">The opening titles play once per visit, skip on any key, and never play if you prefer reduced motion. The sky icon follows the real hour in Tempe.</Note>
    </section>
  )
}
