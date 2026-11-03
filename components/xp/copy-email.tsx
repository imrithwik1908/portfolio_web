"use client"

import { useEffect, useRef, useState } from "react"

export const EMAIL = "sairithwikreddy.chirra@gmail.com"

// Copies the address instead of opening a mail client; falls back to mailto when the clipboard is unavailable.
export function CopyEmail({ className = "", label = "Copy email" }: { className?: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])

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
    <button type="button" className={`xp-copy ${copied ? "is-copied" : ""} ${className}`} onClick={copy} aria-live="polite">
      <span className="xp-copy-label" aria-hidden={copied}>{label}</span>
      <span className="xp-copy-done" aria-hidden={!copied}>Copied</span>
      <span className="sr-only">{copied ? `Copied ${EMAIL}` : `Copy ${EMAIL}`}</span>
    </button>
  )
}
