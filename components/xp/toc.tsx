"use client"

import { useEffect, useState } from "react"

// A sticky contents rail for long project pages; the current chapter lights up as you read.
export function Toc({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (hit) setActive(hit.target.id.replace("ch-", ""))
    }, { rootMargin: "-20% 0px -65% 0px" })
    items.forEach((item) => { const node = document.getElementById(`ch-${item.id}`); if (node) observer.observe(node) })
    return () => observer.disconnect()
  }, [items])
  return (
    <nav className="xp-toc" aria-label="On this page">
      <p>On this page</p>
      <ol>
        {items.map((item, i) => (
          <li key={item.id} className={active === item.id ? "is-active" : undefined}>
            <a href={`#ch-${item.id}`}><span>{String(i + 1).padStart(2, "0")}</span>{item.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
