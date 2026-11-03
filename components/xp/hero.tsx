"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { Lens } from "@/components/xp/lens"
import { Note } from "@/components/xp/note"

const resumeUrl = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"

function useTempeTime() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" })
    const tick = () => setTime(format.format(new Date()))
    tick()
    const id = window.setInterval(tick, 20_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

export function Hero() {
  const time = useTempeTime()

  // The layer beneath the greeting: the same person, written as plain fields.
  const source = [
    ["name", "Sai Rithwik Reddy Chirra"],
    ["based", `Tempe, Arizona${time ? ` · ${time} local` : ""}`],
    ["studying", "M.S. Computer Science, Arizona State → May 2027"],
    ["published", "AAAI 2026 · X-MuTeST"],
    ["works on", "evaluation, reliability, data and ML systems"],
    ["before", "IIIT Dharwad · IIT Indore · Blackcoffer"],
    ["curious about", "why things work, and when they don't"],
  ]

  return (
    <section className="xp-hero" aria-labelledby="xp-hero-title">
      <p className="xp-hero-meta"><span className="xp-dot" aria-hidden="true" />Tempe, Arizona{time && <> · <time>{time}</time></>}</p>

      <Lens
        className="xp-hero-lens"
        radius={150}
        toggleLabel={["See beneath", "Back to the surface"]}
        surface={
          <>
            <h1 id="xp-hero-title">Hi, I&apos;m <em>Rithwik</em>.</h1>
            <p className="xp-hero-line">I build the software around data and AI, and I like knowing why it works, and when it doesn&apos;t.</p>
          </>
        }
        beneath={
          <dl className="xp-source">
            {source.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        }
      />

      <div className="xp-hero-foot">
        <p className="xp-hero-sub">Software engineer and M.S. student at Arizona State. Previously research on explainable multilingual NLP, published at AAAI 2026.</p>
        <div className="xp-hero-actions">
          <Link href="/#work" className="xp-button">See the work <Arrow dir="down" /></Link>
          <a href={resumeUrl} target="_blank" rel="noreferrer" className="xp-link">Résumé <Arrow dir="out" /></a>
        </div>
      </div>

      <Note className="is-hero">The greeting has a second layer underneath. A radial mask follows your pointer; no canvas, no library.</Note>
    </section>
  )
}
