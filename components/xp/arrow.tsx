// One drawn arrow used everywhere instead of text glyphs, which sit unevenly in Instrument Sans.
// "out" points up-right for external links; the others point along their direction.
const rotation = { right: 0, down: 90, left: 180, out: -45 } as const

export function Arrow({ dir = "right", className = "" }: { dir?: keyof typeof rotation; className?: string }) {
  return (
    <span className={`xp-arrow is-${dir} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" style={{ transform: `rotate(${rotation[dir]}deg)` }}>
        <path d="M2.5 8h10.5M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
