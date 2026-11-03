"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { tempeNow } from "@/components/xp/ambient"
import { Arrow } from "@/components/xp/arrow"
import { Note } from "@/components/xp/note"
import { ResumeLink } from "@/components/xp/resume"

// The opening shot: letterbox bars part once per visit, the name comes into focus, and the
// portrait settles. Nothing here waits on the visitor or blocks the page.
function Letterbox() {
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    try {
      if (sessionStorage.getItem("opened")) return
      sessionStorage.setItem("opened", "1")
    } catch { /* storage unavailable: still play */ }
    setPlay(true)
  }, [])
  if (!play) return null
  return <div className="xp-letterbox is-opening" aria-hidden="true"><span /><span /></div>
}

function Portrait() {
  const [proof, setProof] = useState(false)
  useEffect(() => {
    if (!proof) return
    const id = window.setTimeout(() => setProof(false), 2600)
    return () => window.clearTimeout(id)
  }, [proof])
  return (
    <figure className="xp-portrait" onDoubleClick={() => setProof(true)}>
      {/* A plain image: no optimizer round-trip and no filters, just the photograph. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/profile.jpg" alt="Rithwik standing outdoors at IIIT Dharwad" width={1200} height={1600} loading="eager" fetchPriority="high" decoding="async" />
      <figcaption key={String(proof)}>{proof ? "Yes, that\u2019s really me." : "IIIT Dharwad, 2024"}</figcaption>
    </figure>
  )
}

// What's on the desk, typed out one line at a time. Every line is something real and current.
const DESK = [
  "a release gate for LLM apps (AgentGuard)",
  "a chess agent that plays in the fog (CSE 598)",
  "the last stretch of an M.S. at ASU",
  "ML engineering and data science roles",
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
      <span aria-hidden="true">{line === DESK.length - 1 ? "Looking for" : "Working on"}</span>
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
      <Letterbox />
      <div className="xp-hero-text">
        <p className="xp-hero-meta">
          <span className="xp-tip" tabIndex={0} role="img" aria-label="Arizona skips daylight saving, so Tempe\u2019s clock never jumps." data-tip="Arizona skips daylight saving, so Tempe’s clock never jumps."><span className={`xp-sky ${now?.day ? "is-day" : "is-night"}`} /></span>
          Tempe, Arizona{now && <> · <Offset label={`${now.part}, ${now.time}`} /></>}
        </p>
        <h1 id="xp-hero-title">Hi, I&apos;m <em className="xp-name" tabIndex={0} data-full="Sai Rithwik Reddy Chirra, in full.">Rithwik</em>.</h1>
        <p className="xp-hero-line">I build machine learning systems and the software around them, and I care more about why a model fails than about its best score.</p>
        <p className="xp-hero-sub">I&apos;m doing my M.S. in Computer Science at Arizona State, graduating May 2027. Before that, research at IIT Indore that became an <span className="xp-tip is-text" tabIndex={0} data-tip="X-MuTeST: explainable hate-speech detection in English, Hindi and Telugu.">AAAI 2026 paper</span>, and forecasting work at Blackcoffer. I&apos;m looking for ML engineering and data science roles.</p>
        <Typed />
        <div className="xp-hero-actions">
          <Link href="/#work" className="xp-button">See what I&apos;ve built <Arrow dir="down" /></Link>
          <ResumeLink>Open my résumé <Arrow /></ResumeLink>
        </div>
      </div>

      <Portrait />

      <a href="#work" className="xp-scroll-cue" aria-label="Scroll to the work"><span /></a>
      <Note className="is-hero">The letterbox plays once per visit and is skipped entirely if you prefer reduced motion. The sky icon follows the real hour in Tempe.</Note>
    </section>
  )
}
