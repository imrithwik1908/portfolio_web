"use client"

import Link from "next/link"
import { Fragment, useEffect, useRef, useState } from "react"

// "Ask about me": a small glass pill in the corner that opens a panel. Answers stream in from
// /api/ask, which only knows what this site says. Also opens from ⌘K and the 30-second view.

type Turn = { role: "user" | "assistant"; content: string }

const STARTERS = [
  "What has he actually shipped?",
  "Explain AgentGuard like I'm not an engineer",
  "What did he do on the AAAI paper?",
  "Which roles is he looking for?",
]

// Tiny Markdown: [links](/path), **bold**, and "- " bullets. Everything else is plain text.
function inline(text: string, key: string) {
  const out: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g
  let last = 0, m: RegExpExecArray | null, n = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1]) {
      const href = m[2]
      out.push(href.startsWith("/")
        ? <Link key={`${key}-${n++}`} href={href} className="xp-ask-link">{m[1]}</Link>
        : /^https?:\/\//.test(href) ? <a key={`${key}-${n++}`} href={href} target="_blank" rel="noreferrer" className="xp-ask-link">{m[1]}</a> : m[1])
    } else out.push(<b key={`${key}-${n++}`}>{m[3]}</b>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
function Rich({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n")
        if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ""), `${i}-${j}`)}</li>)}</ul>
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l, `${i}-${j}`)}</Fragment>)}</p>
      })}
    </>
  )
}

export function Ask() {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [q, setQ] = useState("")
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLTextAreaElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true)
      const question = (e as CustomEvent<string | undefined>).detail
      if (question) window.setTimeout(() => send(question), 250)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("xp:ask", onOpen)
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("xp:ask", onOpen); window.removeEventListener("keydown", onKey) }
  }) // re-binds each render so `send` sees the latest conversation

  useEffect(() => { if (open) requestAnimationFrame(() => input.current?.focus()) }, [open])
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }) }, [turns])

  async function send(text: string) {
    const question = text.trim()
    if (!question || busy) return
    const history: Turn[] = [...turns, { role: "user", content: question }]
    setTurns([...history, { role: "assistant", content: "" }])
    setQ(""); setBusy(true)
    abort.current = new AbortController()
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }), signal: abort.current.signal })
      if (!res.body) throw new Error("no body")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        setTurns([...history, { role: "assistant", content: answer }])
      }
      if (!answer) setTurns([...history, { role: "assistant", content: "No answer came back. Try again, or email him." }])
    } catch (err) {
      if ((err as Error).name !== "AbortError") setTurns([...history, { role: "assistant", content: "I couldn't reach the assistant. Everything it knows is on this page." }])
    } finally {
      setBusy(false)
    }
  }

  const close = () => { setOpen(false); abort.current?.abort() }

  return (
    <>
      <button type="button" className={`xp-ask-pill ${open ? "is-hidden" : ""}`} onClick={() => setOpen(true)} aria-label="Ask a question about Rithwik" data-cursor="Ask">
        <span className="xp-ask-spark" aria-hidden="true">✦</span><span className="xp-ask-pill-text">Ask about me</span>
      </button>

      <section className={`xp-ask ${open ? "is-open" : ""}`} role="dialog" aria-modal="false" aria-label="Ask about Rithwik" aria-hidden={!open}>
        <header className="xp-ask-head">
          <div>
            <p className="xp-ask-title"><span className="xp-ask-spark" aria-hidden="true">✦</span> Ask about Rithwik</p>
            <p className="xp-ask-sub">Answers come only from this site. If it isn&apos;t here, it says so.</p>
          </div>
          <button type="button" className="xp-ask-close" onClick={close} aria-label="Close" tabIndex={open ? 0 : -1}>×</button>
        </header>

        <div ref={scroller} className="xp-ask-body" aria-live="polite">
          {turns.length === 0 ? (
            <div className="xp-ask-empty">
              <p>Try one of these, or ask your own.</p>
              <ul>{STARTERS.map((s, i) => <li key={s} style={{ "--i": i } as React.CSSProperties}><button type="button" tabIndex={open ? 0 : -1} onClick={() => send(s)}>{s}</button></li>)}</ul>
            </div>
          ) : turns.map((t, i) => (
            <div key={i} className={`xp-ask-msg is-${t.role}`}>
              {t.role === "user" ? <p>{t.content}</p> : t.content ? <Rich text={t.content} /> : <span className="xp-ask-dots" aria-label="Thinking"><i /><i /><i /></span>}
              {t.role === "assistant" && busy && i === turns.length - 1 && t.content && <i className="xp-ask-caret" aria-hidden="true" />}
            </div>
          ))}
        </div>

        <form className="xp-ask-form" onSubmit={(e) => { e.preventDefault(); send(q) }}>
          <textarea ref={input} rows={1} value={q} maxLength={600} tabIndex={open ? 0 : -1} placeholder="Ask about his projects, research or experience" aria-label="Your question"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(q) } }} />
          <button type="submit" disabled={busy || !q.trim()} tabIndex={open ? 0 : -1} aria-label="Send">↑</button>
        </form>
      </section>
    </>
  )
}
