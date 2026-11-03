"use client"

import { useEffect, useRef, useState } from "react"
import { Arrow } from "@/components/xp/arrow"
import { EMAIL } from "@/components/xp/copy-email"

const links = [
  ["GitHub", "https://github.com/imrithwik1908"],
  ["LinkedIn", "https://www.linkedin.com/in/sairithwikreddy"],
  ["Résumé", "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"],
] as const

// A postcard addressed to the visitor's next message: the postmark carries today's date in Tempe.
export function Contact() {
  const [date, setDate] = useState("")
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()
  useEffect(() => {
    setDate(new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Phoenix" }).format(new Date()).toUpperCase())
    return () => window.clearTimeout(timer.current)
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <div className="xp-postcard">
      <div className="xp-postcard-left">
        <p className="xp-postcard-greeting">Say hello.</p>
        <p>Roles, research, or an interesting engineering problem are all good reasons to write.</p>
        <ul className="xp-postcard-links">
          {links.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer" className="xp-link">{label} <Arrow dir="out" /></a></li>)}
        </ul>
      </div>
      <div className="xp-postcard-right">
        <div className="xp-postmark" aria-hidden="true">
          <span>Tempe AZ</span>
          <strong>{date || "TODAY"}</strong>
          <span>Arizona</span>
        </div>
        <div className="xp-stamp" aria-hidden="true"><span>R</span></div>
        <p className="xp-postcard-to">To</p>
        <a className="xp-postcard-address" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <div className="xp-postcard-actions">
          <button type="button" className={`xp-button ${copied ? "is-copied" : ""}`} onClick={copy}>{copied ? "Copied to clipboard" : "Copy address"}</button>
          <a className="xp-link" href={`mailto:${EMAIL}`}>Open in mail <Arrow dir="out" /></a>
        </div>
      </div>
    </div>
  )
}
