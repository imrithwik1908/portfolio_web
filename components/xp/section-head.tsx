"use client"

import { useInView } from "@/components/xp/use-in-view"

// Shared section opener: a small index and label, then a serif title whose words rise in.
export function SectionHead({ index, label, title, aside }: { index: string; label: string; title: string; aside?: React.ReactNode }) {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <header ref={ref} className={`xp-head ${inView ? "is-in" : ""}`}>
      <p className="xp-head-label"><span>{index}</span>{label}</p>
      <h2 aria-label={title}>
        {title.split(" ").map((word, i) => (
          <span key={i} className="xp-word" aria-hidden="true"><span style={{ "--i": i } as React.CSSProperties}>{word}</span></span>
        ))}
      </h2>
      {aside && <div className="xp-head-aside">{aside}</div>}
    </header>
  )
}
