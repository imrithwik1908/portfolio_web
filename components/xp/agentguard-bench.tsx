"use client"

import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { useEffect, useRef, useState } from "react"
import demo from "@/lib/agentguard-demo.json"
import { useGlider } from "@/components/xp/use-glider"

type Side = "baseline" | "candidate"
type Run = { answer: string; retrieved: string[]; answerPassed: boolean; retrievalPassed: boolean }

const cases = demo.cases
const corpus = demo.corpus as Record<string, { title: string; body: string }>
const sides: Side[] = ["baseline", "candidate"]
const sideLabel: Record<Side, string> = { baseline: "Baseline", candidate: "Candidate" }
const sideConfig: Record<Side, string> = {
  baseline: `${demo.configs.baseline.top_k} documents · policy-weighted · careful answers`,
  candidate: `${demo.configs.candidate.top_k} documents · recency-weighted · direct answers`,
}
// The one document in the corpus that describes itself as a marketing page.
const MARKETING = "marketing-laptop-sale"

const ok = (run: Run) => run.answerPassed && run.retrievalPassed
const sentence = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

function Mark({ pass, shown }: { pass: boolean; shown: boolean }) {
  return <i className={`xp-mark ${shown ? (pass ? "is-pass" : "is-fail") : ""}`} aria-hidden="true" />
}

function Column({ side, run, required, expected, hidden }: { side: Side; run: Run; required: string; expected: string; hidden?: boolean }) {
  const regressed = side === "candidate" && !ok(run)
  const long = run.answer.length > 170
  const [full, setFull] = useState(false)
  return (
    <div className={`xp-col ${hidden ? "is-hidden-mobile" : ""}`}>
      <header className="xp-col-head">
        <strong>{sideLabel[side]}</strong>
        <span className={`xp-status ${regressed ? "is-fail" : "is-pass"}`}>{regressed ? "Regressed" : "Passed both checks"}</span>
        <span className="xp-col-config">{sideConfig[side]}</span>
      </header>

      <p className="xp-col-label">Read</p>
      <ol className="xp-slips">
        {run.retrieved.map((id, i) => (
          <li key={id} tabIndex={0} className={`${id === required ? "is-required" : ""} ${id === MARKETING ? "is-marketing" : ""}`} style={{ "--i": i } as React.CSSProperties}>
            <span className="xp-slip-title">{corpus[id].title}{id === MARKETING && <em>marketing page</em>}{id === required && <em>required</em>}</span>
            <span className="xp-slip-body">{corpus[id].body}</span>
          </li>
        ))}
      </ol>

      <p className="xp-col-label">Said</p>
      <blockquote className={`xp-answer ${long && !full ? "is-clamped" : ""}`}>{run.answer}</blockquote>
      {long && <button type="button" className="xp-more" onClick={() => setFull((v) => !v)}>{full ? "Show less" : "Show the full answer"}</button>}

      <ul className="xp-checks">
        <li className={run.answerPassed ? "is-pass" : "is-fail"}><Mark pass={run.answerPassed} shown />Answer mentions “{expected}”</li>
        <li className={run.retrievalPassed ? "is-pass" : "is-fail"}><Mark pass={run.retrievalPassed} shown />Retrieved {corpus[required].title}</li>
      </ul>
    </div>
  )
}

export function AgentGuardBench() {
  const [selected, setSelected] = useState(0)
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]))
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle")
  const [scanned, setScanned] = useState(0)
  const [mobileSide, setMobileSide] = useState<Side>("candidate")
  const [runs, setRuns] = useState(0)
  const timer = useRef<number>()
  const list = useGlider<HTMLButtonElement>(String(selected))
  const toggle = useGlider<HTMLButtonElement>(mobileSide)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = (index: number) => {
    if (phase === "running") return
    setSelected(index)
    setSeen((prev) => new Set(prev).add(index))
  }

  const runCheck = () => {
    window.clearTimeout(timer.current)
    setRuns((n) => n + 1)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setSeen(new Set())
    if (reduce) {
      setSeen(new Set(cases.map((_, i) => i)))
      setScanned(cases.length)
      setSelected(0)
      setPhase("done")
      return
    }
    setPhase("running")
    let i = 0
    const step = () => {
      setSelected(i)
      setSeen((prev) => new Set(prev).add(i))
      setScanned(i + 1)
      i += 1
      if (i < cases.length) timer.current = window.setTimeout(step, 190)
      else timer.current = window.setTimeout(() => { setSelected(0); setPhase("done") }, 420)
    }
    step()
  }

  const onListKey = (event: React.KeyboardEvent) => {
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = (selected + delta + cases.length) % cases.length
    choose(next)
    document.getElementById(`xp-case-${next}`)?.focus()
  }

  const current = cases[selected]
  const scannedCases = cases.slice(0, scanned)
  const checks = scannedCases.length * 2
  const regressed = scannedCases.reduce((n, c) => n + Number(!c.versions.candidate.answerPassed) + Number(!c.versions.candidate.retrievalPassed), 0)

  return (
    <div className={`xp-bench ${phase === "running" ? "is-running" : ""}`}>
      <div className="xp-bench-body">
        <div className="xp-cases">
          <p className="xp-col-label">Ten questions, asked of both versions</p>
          <ol className="xp-case-list" role="listbox" aria-label="Test cases" ref={list.container as React.Ref<HTMLOListElement>} onKeyDown={onListKey}>
            <span className="xp-glider" style={list.style} aria-hidden="true" />
            {cases.map((c, i) => (
              <li key={c.name} role="presentation">
                <button
                  id={`xp-case-${i}`}
                  ref={list.register(String(i))}
                  type="button"
                  role="option"
                  aria-selected={i === selected}
                  tabIndex={i === selected ? 0 : -1}
                  className={i === selected ? "is-active" : undefined}
                  onClick={() => choose(i)}
                >
                  <span>{sentence(c.name)}</span>
                  <span className="xp-case-marks" aria-label={seen.has(i) ? `Baseline ${ok(c.versions.baseline) ? "passed" : "failed"}, candidate ${ok(c.versions.candidate) ? "passed" : "failed"}` : "Not checked yet"}>
                    <Mark pass={ok(c.versions.baseline)} shown={seen.has(i)} />
                    <Mark pass={ok(c.versions.candidate)} shown={seen.has(i)} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <footer className={`xp-release is-${phase}`}>
            <div className="xp-release-tally">
              <p className="xp-col-label">Release check</p>
              {phase === "idle" ? (
                <p className="xp-tally">Pairs every case and evaluator across both versions, then applies the release policy.</p>
              ) : (
                <dl className="xp-tally-grid">
                  <div><dt>checks</dt><dd>{checks}</dd></div>
                  <div><dt>unchanged</dt><dd>{checks - regressed}</dd></div>
                  <div className="is-fail"><dt>regressed</dt><dd>{regressed}</dd></div>
                  <div><dt>improved</dt><dd>{demo.pairedCounts.improved}</dd></div>
                </dl>
              )}
            </div>
            {phase === "done" ? (
              <div className="xp-verdict" role="status">
                <p className="xp-verdict-word">{demo.release.decision}</p>
                <div>
                  <p>{demo.release.summary}</p>
                  <ul>{demo.release.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                </div>
              </div>
            ) : (
              <button type="button" className="xp-button" onClick={runCheck} disabled={phase === "running"}>
                {phase === "running" ? `Checking ${scanned} of ${cases.length}` : "Run the release check"}
              </button>
            )}
          </footer>
        </div>

        <div className="xp-case" key={selected} aria-live="polite">
          <p className="xp-question">“{current.question}”</p>
          <div className="xp-toggle" ref={toggle.container as React.Ref<HTMLDivElement>} role="tablist" aria-label="Version">
            <span className="xp-glider" style={toggle.style} aria-hidden="true" />
            {sides.map((side) => (
              <button key={side} ref={toggle.register(side)} type="button" role="tab" aria-selected={mobileSide === side} className={mobileSide === side ? "is-active" : undefined} onClick={() => setMobileSide(side)}>{sideLabel[side]}</button>
            ))}
          </div>
          <div className="xp-cols">
            {sides.map((side) => (
              <Column key={side} side={side} run={current.versions[side]} required={current.requiredDoc} expected={current.expected} hidden={mobileSide !== side} />
            ))}
          </div>
        </div>
      </div>


      {phase === "done" && (
        <p className="xp-insight">
          Both regressions have one cause: the candidate&apos;s recency weighting pulled the spring-sale marketing page into context, and its direct answer style leaned on it. The baseline never retrieved that page for the refund question.
          <button type="button" className="xp-link" onClick={runCheck}>Run it again</button>
          {runs >= 3 && <span className="xp-determinism">Run {runs}. Same inputs, same verdict, every time. A release gate that changed its mind would be the bug.</span>}
        </p>
      )}

      <p className="xp-source">
        Recorded output of the AgentGuard repository&apos;s demo app (<code>examples/alice-llm-app</code>, deterministic mock model). Every answer above is regenerated from that code and matches the recording.{" "}
        <Link href="/projects/agentguard" className="xp-link">Case study <Arrow /></Link>{" "}
        <a href="https://github.com/imrithwik1908/AgentGuard" target="_blank" rel="noreferrer" className="xp-link">Source <Arrow dir="out" /></a>
      </p>
    </div>
  )
}
