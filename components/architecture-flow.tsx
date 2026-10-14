"use client"

import { useEffect, useState } from "react"
import type { Project } from "@/lib/portfolio-data"

export function ArchitectureFlow({ project }: { project: Project }) {
  const [notes, setNotes] = useState(false)

  useEffect(() => {
    const down = (event: KeyboardEvent) => { if (event.key === "Alt") setNotes(true) }
    const up = (event: KeyboardEvent) => { if (event.key === "Alt") setNotes(false) }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up) }
  }, [])

  return (
    <div className="architecture-wrap">
      <div className="architecture-flow" aria-label={`${project.title} architecture flow`}>
        {project.architecture.map((node, index) => (
          <div className="architecture-node" key={node.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{node.label}</strong>
            <small>{node.detail}</small>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-expanded={notes}
        onClick={() => setNotes((value) => !value)}
      >
        {notes ? "Hide implementation note" : <>Hold <kbd>Option</kbd> or click for implementation notes</>}
      </button>
      {notes && <p className="architecture-note">The arrows describe responsibility, not a claim that every hop is synchronous. The case-study text calls out where work leaves the request path.</p>}
    </div>
  )
}
