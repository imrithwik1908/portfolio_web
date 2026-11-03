"use client"

import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { EMAIL } from "@/components/xp/copy-email"
import { Note } from "@/components/xp/note"

const links = [
  ["GitHub", "https://github.com/imrithwik1908"],
  ["LinkedIn", "https://www.linkedin.com/in/sairithwikreddy"],
  ["Résumé", "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"],
] as const

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [time, setTime] = useState("")
  const timer = useRef<number>()
  useEffect(() => {
    setTime(new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" }).format(new Date()))
    return () => window.clearTimeout(timer.current)
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <div className="xp-contact">
      <h2 className="xp-contact-title">Say hello<span aria-hidden="true">.</span></h2>
      <p className="xp-contact-lede">Roles, research, or a system that fails in a way nobody can explain yet. All good reasons to write.</p>
      <button type="button" className={`xp-address ${copied ? "is-copied" : ""}`} onClick={copy} aria-live="polite">
        <span className="xp-address-text">{EMAIL}</span>
        <span className="xp-address-action">{copied ? "Copied" : "Click to copy"}</span>
      </button>
      <ul className="xp-contact-links">
        {links.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer" className="xp-link">{label} <Arrow dir="out" /></a></li>)}
        <li><a href={`mailto:${EMAIL}`} className="xp-link">Open in mail <Arrow dir="out" /></a></li>
      </ul>
      <footer className="xp-sign">
        <span>Tempe, Arizona{time && <> · it&apos;s {time} here</>}</span>
        <span className="xp-sign-secret">Press <kbd>X</kbd> to look closer.</span>
      </footer>
      <Note className="is-contact">Copy uses the Clipboard API and falls back to your mail app if the browser blocks it.</Note>
    </div>
  )
}
