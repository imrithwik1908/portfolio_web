// A margin note that only appears in "look closer" mode. Every note describes how this
// site or the project actually works.
export function Note({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <aside className={`xp-xnote ${className}`}><span aria-hidden="true">◌</span>{children}</aside>
}
