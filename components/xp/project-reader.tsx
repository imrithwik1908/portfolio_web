"use client"

import { useEffect, useRef, useState } from "react"
import { useGlider } from "@/components/xp/use-glider"

// Two ways to read a project: the full write-up, or a 60-second brief that keeps the technical
// detail (pipeline, decisions, results, limits) and drops the narration.
export function ProjectReader({ brief, children }: { brief: React.ReactNode; children: React.ReactNode }) {
  const [mode, setMode] = useState<"full" | "brief">("full")
  const tabs = useGlider<HTMLButtonElement>(mode)
  const top = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    const node = top.current
    if (node && node.getBoundingClientRect().top < 0) node.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [mode])

  return (
    <div ref={top} className={`xp-reader is-${mode}`}>
      <div className="xp-reader-switch">
        <p>{mode === "full" ? "Too long? Fair. There's a 60-second version with every technical detail kept." : "The short version. Switch back any time for the full story."}</p>
        <div className="xp-reader-tabs" role="tablist" aria-label="Reading mode" ref={tabs.container as React.Ref<HTMLDivElement>}>
          <span className="xp-glider" style={tabs.style} aria-hidden="true" />
          <button ref={tabs.register("full")} type="button" role="tab" aria-selected={mode === "full"} className={mode === "full" ? "is-active" : undefined} onClick={() => setMode("full")}>Full write-up</button>
          <button ref={tabs.register("brief")} type="button" role="tab" aria-selected={mode === "brief"} className={mode === "brief" ? "is-active" : undefined} onClick={() => setMode("brief")}>60-second brief</button>
        </div>
      </div>
      {mode === "brief" ? <div className="xp-brief" key="brief">{brief}</div> : <div key="full" className="xp-full">{children}</div>}
    </div>
  )
}
