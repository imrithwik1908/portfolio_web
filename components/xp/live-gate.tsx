"use client"

import { useEffect, useRef, useState } from "react"

// Ask the deployed AgentGuard for a real verdict. The free API sleeps when idle, so the first step
// is waking it, and the card says so while it waits. Hidden entirely when the live connection
// isn't configured on this deployment.

type Result = {
  ms: number; host: string; decision: string; exitCode: number; summary: string; reasons: string[]; allowed: number
  baseline: { pass: number; total: number }; candidate: { pass: number; total: number }
}
type Phase = "idle" | "waking" | "asking" | "done" | "down" | "off" | "error"

const STEPS = ["Wake the server", "Ask the release gate", "Read the verdict"]

export function LiveGate() {
  const [show, setShow] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [allowed, setAllowed] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState("")
  const timer = useRef<number>(0)

  useEffect(() => {
    fetch("/api/agentguard?step=config").then((r) => r.json()).then((c) => setShow(Boolean(c.configured || c.preview))).catch(() => {})
    return () => window.clearInterval(timer.current)
  }, [])

  const run = async () => {
    setResult(null); setError(""); setElapsed(0); setPhase("waking")
    const t0 = Date.now()
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 250)
    try {
      let awake = false
      for (let i = 0; i < 4 && !awake; i++) awake = (await (await fetch("/api/agentguard?step=wake")).json()).awake
      if (!awake) { setPhase("down"); return }
      setPhase("asking")
      const res = await fetch(`/api/agentguard?step=gate&max=${allowed}`)
      const body = await res.json()
      if (body.configured === false) { setPhase("off"); return }
      if (!res.ok) { setError(body.error ?? "Something went wrong."); setPhase("error"); return }
      setResult(body); setPhase("done")
    } catch {
      setError("Couldn't reach the proxy."); setPhase("error")
    } finally {
      window.clearInterval(timer.current)
    }
  }

  if (!show) return null
  const at = phase === "waking" ? 0 : phase === "asking" ? 1 : phase === "done" ? 3 : -1
  const busy = phase === "waking" || phase === "asking"

  return (
    <div className="xp-live">
      <div className="xp-live-head">
        <p className="xp-live-badge"><span className={busy ? "is-busy" : phase === "done" ? "is-ok" : undefined} /> Live</p>
        <h3>Now ask the real one.</h3>
        <p>Everything above replays a recorded run. This button asks the deployed AgentGuard API for its verdict on two real versions, right now. It runs on a free server that sleeps when nobody&apos;s using it, so the first answer can take up to a minute.</p>
      </div>

      <div className="xp-live-controls">
        <label>Regressions you&apos;ll accept
          <span className="ex-stepper">
            <button type="button" onClick={() => setAllowed((v) => Math.max(0, v - 1))} disabled={busy} aria-label="Fewer">−</button>
            <b>{allowed}</b>
            <button type="button" onClick={() => setAllowed((v) => Math.min(5, v + 1))} disabled={busy} aria-label="More">+</button>
          </span>
        </label>
        <button type="button" className="xp-button" onClick={run} disabled={busy}>{busy ? `Working… ${elapsed}s` : phase === "done" ? "Ask again" : "Ask the deployed AgentGuard"}</button>
      </div>

      <ol className="xp-live-track" style={{ "--at": Math.max(0, at) } as React.CSSProperties}>
        {STEPS.map((s, i) => (
          <li key={s} className={at > i ? "is-done" : at === i ? "is-on" : undefined}>
            <i />
            <span>{s}</span>
            {i === 0 && phase === "waking" && <small>{elapsed < 8 ? "knocking…" : "the server is waking up"}</small>}
          </li>
        ))}
      </ol>

      {phase === "done" && result && (
        <div className={`ex-verdict is-${result.decision === "PASS" ? "pass" : "block"} xp-live-verdict`} role="status">
          <p className="ex-verdict-label">The deployed release gate says</p>
          <b>{result.decision}</b>
          <p className="ex-verdict-why">{result.reasons.length ? result.reasons.map((r) => <span key={r}>{r}</span>) : <span>{result.summary}</span>}</p>
          <p className="xp-live-numbers">
            <span>Baseline <b>{result.baseline.pass}/{result.baseline.total}</b> checks passing</span>
            <span>Candidate <b>{result.candidate.pass}/{result.candidate.total}</b></span>
            <span>Exit code <b>{result.exitCode}</b></span>
          </p>
          <p className="ex-verdict-pipe">Answered in {(result.ms / 1000).toFixed(1)} s by {result.host}.</p>
        </div>
      )}
      {phase === "down" && <p className="xp-live-note">The server didn&apos;t wake up in time. Free hosting has its moods; try once more in a minute.</p>}
      {phase === "off" && <p className="xp-live-note">The live connection isn&apos;t configured on this deployment yet, so there&apos;s nothing real to ask.</p>}
      {phase === "error" && <p className="xp-live-note">{error}</p>}
    </div>
  )
}
