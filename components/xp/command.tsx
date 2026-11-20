"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "@/components/xp/ambient"
import { EMAIL } from "@/components/xp/copy-email"
import { RESUME_PDF, openResume } from "@/components/xp/resume"
import { projects } from "@/lib/portfolio-data"

type Item = { group: string; label: string; hint?: string; run: () => void }

// ⌘K / Ctrl+K: jump anywhere, open the résumé, copy the email. Type to filter, arrows to move, Enter to go.
export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [i, setI] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  const go = (id: string) => () => {
    if (window.location.pathname !== "/") { router.push(`/#${id}`); return }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  const items: Item[] = useMemo(() => [
    { group: "Actions", label: "The 30-second version", hint: "Roles, proof, contact", run: () => window.dispatchEvent(new Event("xp:brief")) },
    { group: "Actions", label: "Open my résumé", hint: "Read it here, or print", run: openResume },
    { group: "Actions", label: "Download my résumé", hint: "One-page PDF, ATS-friendly", run: () => { const a = document.createElement("a"); a.href = RESUME_PDF; a.download = ""; a.click() } },
    { group: "Actions", label: "Copy my email", hint: EMAIL, run: () => { navigator.clipboard?.writeText(EMAIL).then(() => toast("Email copied."), () => { window.location.href = `mailto:${EMAIL}` }) } },
    { group: "Actions", label: "Change colours", hint: "Amber, Nebula, Aurora, Mars", run: () => document.querySelector<HTMLButtonElement>(".xp-swatch")?.click() },
    ...projects.map((p) => ({ group: "Projects", label: p.title, hint: p.eyebrow, run: () => router.push(`/projects/${p.slug}`) })),
    { group: "Projects", label: "All projects", run: () => router.push("/projects") },
    ...([["work", "Projects on the home page"], ["research", "Research"], ["path", "Experience"], ["education", "Education"], ["toolkit", "Toolkit"], ["about", "About"], ["contact", "Contact"]] as const)
      .map(([id, label]) => ({ group: "Go to", label, run: go(id) })),
    { group: "Elsewhere", label: "GitHub", hint: "imrithwik1908", run: () => window.open("https://github.com/imrithwik1908", "_blank", "noopener") },
    { group: "Elsewhere", label: "LinkedIn", hint: "sairithwikreddy", run: () => window.open("https://www.linkedin.com/in/sairithwikreddy", "_blank", "noopener") },
    { group: "Elsewhere", label: "This site's source code", run: () => window.open("https://github.com/imrithwik1908/portfolio_web", "_blank", "noopener") },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [router])

  const shown = useMemo(() => {
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean)
    return items.filter((it) => words.every((w) => `${it.label} ${it.hint ?? ""} ${it.group}`.toLowerCase().includes(w)))
  }, [q, items])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v) }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener("xp:command", onOpen)
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("xp:command", onOpen) }
  }, [])

  useEffect(() => {
    if (open) { returnTo.current = document.activeElement as HTMLElement; setQ(""); setI(0); requestAnimationFrame(() => input.current?.focus()) }
    else returnTo.current?.focus?.()
  }, [open])
  useEffect(() => setI(0), [q])

  if (!open) return null
  const run = (it?: Item) => { if (!it) return; setOpen(false); it.run() }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); setOpen(false) }
    else if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => Math.min(shown.length - 1, v + 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => Math.max(0, v - 1)) }
    else if (e.key === "Enter") { e.preventDefault(); run(shown[i]) }
  }
  let lastGroup = ""
  return (
    <div className="xp-cmd" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="xp-cmd-box" role="dialog" aria-modal="true" aria-label="Command menu" onKeyDown={onKey}>
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Where to? Try “résumé” or “agent”" aria-label="Search" aria-controls="xp-cmd-list" aria-activedescendant={shown[i] ? `xp-cmd-${i}` : undefined} />
        <ul id="xp-cmd-list" role="listbox">
          {shown.length === 0 && <li className="xp-cmd-empty">Nothing by that name. Try “projects”.</li>}
          {shown.map((it, k) => {
            const head = it.group !== lastGroup ? it.group : null
            lastGroup = it.group
            return (
              <li key={`${it.group}-${it.label}`} role="presentation">
                {head && <p className="xp-cmd-group">{head}</p>}
                <button id={`xp-cmd-${k}`} type="button" role="option" aria-selected={k === i} className={k === i ? "is-on" : undefined} onMouseMove={() => setI(k)} onClick={() => run(it)}>
                  <span>{it.label}</span>{it.hint && <small>{it.hint}</small>}
                </button>
              </li>
            )
          })}
        </ul>
        <p className="xp-cmd-foot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open <kbd>esc</kbd> close</p>
      </div>
    </div>
  )
}

// The small ⌘K button that sits in the nav on wide screens.
export function CommandButton() {
  const [mac, setMac] = useState(true)
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), [])
  return (
    <button type="button" className="xp-cmd-button" onClick={() => window.dispatchEvent(new Event("xp:command"))} aria-label="Open the command menu" data-cursor="Search">
      <kbd>{mac ? "⌘" : "Ctrl"}</kbd><kbd>K</kbd>
    </button>
  )
}
