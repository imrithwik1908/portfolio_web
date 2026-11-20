"use client"

import { toast } from "@/components/xp/ambient"
import { useInView } from "@/components/xp/use-in-view"

// Shared section opener: a small index and label, then a serif title whose words rise in.
export function SectionHead({ index, label, title, aside }: { index: string; label: string; title: string; aside?: React.ReactNode }) {
  const { ref, inView } = useInView<HTMLElement>()
  // Copies a link straight to this section, for sending one part of the site to someone.
  const copyLink = () => {
    const id = ref.current?.closest("section")?.id
    if (!id) return
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    history.replaceState(null, "", `#${id}`)
    navigator.clipboard?.writeText(url).then(() => toast(`Link to ${label} copied.`), () => toast(url))
  }
  return (
    <header ref={ref} className={`xp-head ${inView ? "is-in" : ""}`}>
      <p className="xp-head-label"><span>{index}</span>{label}<button type="button" className="xp-anchor" onClick={copyLink} aria-label={`Copy a link to ${label}`} data-cursor="Link">#</button></p>
      <h2 aria-label={title}>
        {title.split(" ").map((word, i) => (
          <span key={i} className="xp-word" aria-hidden="true"><span style={{ "--i": i } as React.CSSProperties}>{word}</span></span>
        ))}
      </h2>
      {aside && <div className="xp-head-aside">{aside}</div>}
    </header>
  )
}
