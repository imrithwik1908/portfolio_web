"use client"

import { useState } from "react"

// Small hands-on versions of ideas from the case studies. The rules mirror the repositories;
// the toggles are hypothetical inputs, not recorded runs.

const blocking = [
  "Paired regressions above the maximum",
  "A critical case regressed",
  "Pass rate below the minimum",
  "Score dropped more than allowed",
  "Runtime failures",
]
const incomplete = [
  "A case has evidence for only one version",
  "Comparison coverage too low",
  "A required evaluator is missing",
]

// Same precedence as evaluations.py: any blocker → BLOCK; otherwise any gap in evidence → REVIEW; else PASS.
export function PolicyPlayground() {
  const [on, setOn] = useState<Set<string>>(() => new Set())
  const flip = (k: string) => setOn((prev) => { const next = new Set(prev); if (!next.delete(k)) next.add(k); return next })
  const blockers = blocking.filter((b) => on.has(b))
  const gaps = incomplete.filter((g) => on.has(g))
  const decision = blockers.length ? "BLOCK" : gaps.length ? "REVIEW" : "PASS"
  const why = blockers.length
    ? `${blockers[0]}${blockers.length > 1 ? ` (and ${blockers.length - 1} more)` : ""}. Blocking checks win, even when evidence is also missing.`
    : gaps.length
      ? `${gaps[0]}. Not enough to call it either way, so a person decides.`
      : "Every check holds and the evidence is complete."

  return (
    <div className="xp-play">
      <p className="xp-col-label">Try the policy · flip what went wrong in a release</p>
      <div className="xp-play-grid">
        {[{ name: "Blocking checks", items: blocking }, { name: "Evidence gaps", items: incomplete }].map((group) => (
          <fieldset key={group.name}>
            <legend>{group.name}</legend>
            {group.items.map((item) => (
              <label key={item} className={on.has(item) ? "is-on" : undefined}>
                <input type="checkbox" checked={on.has(item)} onChange={() => flip(item)} />
                <span>{item}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <div className={`xp-play-out is-${decision.toLowerCase()}`} role="status">
        <strong key={decision}>{decision}</strong>
        <p>{why}</p>
      </div>
    </div>
  )
}

// Enrollment writes to two documents. If the process stops between the writes, the two sides disagree.
export function EnrollmentDemo() {
  const [student, setStudent] = useState<string[]>([])
  const [course, setCourse] = useState<string[]>([])
  const [crash, setCrash] = useState(false)
  const [note, setNote] = useState("Press enroll to write both sides of the relationship.")
  const enrolled = student.includes("CSE 512")
  const consistent = enrolled === course.includes("student 42")

  const enroll = () => {
    if (enrolled) { setNote("Already enrolled. The duplicate check stops a second write."); return }
    setStudent((s) => [...s, "CSE 512"])
    if (crash) { setNote("The server stopped after the first write. The student thinks they're enrolled; the course has never heard of them."); return }
    setCourse((c) => [...c, "student 42"])
    setNote("Both documents updated. In production this belongs inside one transaction.")
  }
  const reset = () => { setStudent([]); setCourse([]); setNote("Press enroll to write both sides of the relationship.") }

  return (
    <div className="xp-play">
      <p className="xp-col-label">Try it · one enrollment, two documents</p>
      <div className="xp-play-docs">
        <pre className={!consistent ? "is-bad" : undefined}>{`student 42 {\n  enrolledCourses: [${student.map((c) => `"${c}"`).join(", ")}]\n}`}</pre>
        <pre className={!consistent ? "is-bad" : undefined}>{`course CSE 512 {\n  enrolledStudents: [${course.map((c) => `"${c}"`).join(", ")}]\n}`}</pre>
      </div>
      <div className="xp-play-actions">
        <button type="button" className="xp-button" onClick={enroll}>Enroll</button>
        <label className="xp-play-crash"><input type="checkbox" checked={crash} onChange={(e) => setCrash(e.target.checked)} /> Crash between the writes</label>
        <button type="button" className="xp-link" onClick={reset}>Reset</button>
      </div>
      <p className={`xp-play-note ${consistent ? "" : "is-bad"}`} role="status">{note}</p>
    </div>
  )
}
