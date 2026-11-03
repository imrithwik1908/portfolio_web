"use client"

import { useEffect } from "react"

// The room: a still light from above, a vignette and film grain. Plus a few quiet details for
// people who wander: X shows how things were built, the tab speaks when you leave, and the
// console keeps a case file.
export function Ambient() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.metaKey || event.ctrlKey || event.altKey || target.closest("input, textarea, [contenteditable]")) return
      if (event.key.toLowerCase() === "x") toggleCloser()
    }
    window.addEventListener("keydown", onKey)

    let title = document.title
    const onVisibility = () => {
      if (document.hidden) {
        title = document.title
        document.title = "The lights are still on."
      } else document.title = title
    }
    document.addEventListener("visibilitychange", onVisibility)

    console.info(
      "%cCase file #001%c\nSubject opened the developer tools.\nMotive: curiosity. Verdict: welcome.\n\nA few more things are hidden on the page. One answers to a single key,\none waits until the credits have rolled, and one lives past the edge of the map.",
      "font: 600 14px/1.8 Georgia, serif; color: #e9c27b",
      "font: 12px/1.6 ui-monospace, monospace; color: #b4ada1",
    )

    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <>
      <div className="xp-light" aria-hidden="true" />
      <div className="xp-grain" aria-hidden="true" />
    </>
  )
}

export function toggleCloser() {
  const root = document.documentElement
  const on = root.dataset.closer !== "true"
  root.dataset.closer = String(on)
  window.dispatchEvent(new CustomEvent("closer", { detail: on }))
}

// Tempe's local time and whether it is day there, for the small sun/moon details.
export function tempeNow() {
  const date = new Date()
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Phoenix" }).format(date)
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Phoenix" }).format(date)) % 24
  const part = hour < 5 ? "late night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night"
  return { time, day: hour >= 6 && hour < 19, part }
}
