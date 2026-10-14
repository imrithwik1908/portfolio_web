"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Command, FileText, FlaskConical, Mail, Moon, Search, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"

const resumeUrl = "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"
const projectSlugs = ["agentguard", "x-mutest", "tensor-fusion", "course-catalog"] as const

export function PortfolioInteractions() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [engineerMode, setEngineerMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const actions = useMemo(() => [
    { label: "Projects", hint: "Homepage", icon: Search, run: () => router.push("/#work") },
    { label: "All projects", hint: "Case studies", icon: Command, run: () => router.push("/projects") },
    { label: "About Rithwik", hint: "Point of view", icon: Command, run: () => router.push("/#about") },
    { label: "Email Rithwik", hint: "Start a conversation", icon: Mail, run: () => window.location.href = "mailto:sairithwikreddy.chirra@gmail.com" },
    { label: "Open resume", hint: "Google Drive", icon: FileText, run: () => window.open(resumeUrl, "_blank", "noopener,noreferrer") },
    { label: "Open the lab", hint: "Small experiments", icon: FlaskConical, run: () => router.push("/lab") },
    {
      label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      hint: "Theme",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    },
    {
      label: "Surprise me",
      hint: "Random project",
      icon: Command,
      run: () => router.push(`/projects/${projectSlugs[Math.floor(Math.random() * projectSlugs.length)]}`),
    },
  ], [resolvedTheme, router, setTheme])

  const filtered = actions.filter((action) => `${action.label} ${action.hint}`.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    let sequence = ""
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
        return
      }
      if (event.key === "Escape") setOpen(false)
      if (event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      sequence = `${sequence}${event.key.toLowerCase()}`.slice(-5)
      if (sequence === "stack") setEngineerMode((value) => !value)
    }

    const openCommand = () => setOpen(true)
    const toggleEngineer = () => setEngineerMode((value) => !value)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("portfolio:command", openCommand)
    window.addEventListener("portfolio:engineer", toggleEngineer)
    console.info("%cYou found the quiet part.", "font-weight:700;color:#27785d")
    console.info("Type %cstack%c anywhere on the page for an implementation overlay.", "font-family:monospace;color:#27785d", "")
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("portfolio:command", openCommand)
      window.removeEventListener("portfolio:engineer", toggleEngineer)
    }
  }, [])

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 20)
    else setQuery("")
  }, [open])

  const run = (action: (typeof actions)[number]) => {
    setOpen(false)
    action.run()
  }

  return (
    <>
      {open && (
        <div className="command-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="command-menu" role="dialog" aria-modal="true" aria-label="Quick navigation" onMouseDown={(event) => event.stopPropagation()}>
            <div className="command-search">
              <Search aria-hidden="true" />
              <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Where to?" aria-label="Filter commands" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close command menu"><X /></button>
            </div>
            <div className="command-list">
              {filtered.map((action) => {
                const Icon = action.icon
                return <button key={action.label} type="button" onClick={() => run(action)}><Icon aria-hidden="true" /><span>{action.label}<small>{action.hint}</small></span></button>
              })}
              {filtered.length === 0 && <p>No match. The site is smaller than the command menu makes it look.</p>}
            </div>
            <footer><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></footer>
          </section>
        </div>
      )}

      {engineerMode && (
        <aside className="engineer-overlay" aria-live="polite">
          <div><strong>Engineer mode</strong><button type="button" onClick={() => setEngineerMode(false)} aria-label="Close engineer mode"><X /></button></div>
          <dl>
            <div><dt>Rendering</dt><dd>Server-first App Router</dd></div>
            <div><dt>Project data</dt><dd>Static, typed, initial HTML</dd></div>
            <div><dt>Motion</dt><dd>CSS, reduced-motion aware</dd></div>
            <div><dt>Secret</dt><dd>You typed “stack”</dd></div>
          </dl>
        </aside>
      )}
    </>
  )
}

export function BuildMark() {
  const clicks = useRef(0)
  return (
    <button
      type="button"
      className="build-mark"
      title="Click five times. Curiosity is a valid test strategy."
      onClick={() => {
        clicks.current += 1
        if (clicks.current >= 5) {
          window.dispatchEvent(new Event("portfolio:engineer"))
          clicks.current = 0
        }
      }}
    >
      SRRC · build 2026.10
    </button>
  )
}
