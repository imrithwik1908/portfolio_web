"use client"

import { useEffect, useState } from "react"

export function TempeTime() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Phoenix",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date()))
    update()
    const timer = window.setInterval(update, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return <span className="tempe-time" tabIndex={0}><span>Tempe, AZ</span><strong>{time || "Mountain time"}</strong></span>
}

export function ProjectSignal({ project }: { project: "agentguard" | "x-mutest" | "tensor-fusion" | "course-catalog" }) {
  const [role, setRole] = useState<"student" | "professor">("student")

  if (project === "agentguard") {
    return (
      <div className="signal signal-trace" aria-label="A request trace moving through model and tool calls">
        <div className="trace-path"><i /><i /><i data-failure /><i /><i /></div>
        <div className="trace-labels"><span>request</span><span>model</span><span>tool</span><span>model</span><span>response</span></div>
        <p><b>candidate</b><span>regression found at tool call</span></p>
      </div>
    )
  }

  if (project === "tensor-fusion") {
    return (
      <div className="signal signal-fusion" aria-label="Language, audio, and vision representations converging">
        <div><span>language</span><i /></div><div><span>audio</span><i /></div><div><span>vision</span><i /></div>
        <strong>fused<br />representation</strong>
      </div>
    )
  }

  if (project === "x-mutest") {
    return (
      <div className="signal signal-rationale" aria-label="Example of token-level rationale inspection">
        <p><span>This</span> <mark>kind of language</mark> <span>needs context before a label can be explained.</span></p>
        <div><span>human rationale</span><span>model rationale</span><span>overlap</span></div>
      </div>
    )
  }

  return (
    <div className="signal signal-roles">
      <div className="role-switch" aria-label="Course Catalog preview role">
        <button type="button" className={role === "student" ? "is-active" : ""} onClick={() => setRole("student")}>Student</button>
        <button type="button" className={role === "professor" ? "is-active" : ""} onClick={() => setRole("professor")}>Professor</button>
      </div>
      <div className="role-preview" aria-live="polite">
        <strong>{role === "student" ? "Browse → collect → enroll" : "Offer → manage → review"}</strong>
        <span>{role === "student" ? "Course state follows the student." : "Offerings stay tied to the professor."}</span>
      </div>
    </div>
  )
}

