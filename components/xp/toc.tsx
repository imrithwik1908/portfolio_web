"use client"

import { useEffect, useState } from "react"

// A sticky contents rail for long project pages; the current chapter lights up as you read.
export function Toc({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)
  // The current chapter is the last heading that has passed a line a third of the way down the screen.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.33
      let current = items[0]?.id
      for (const item of items) {
        const node = document.getElementById(`ch-${item.id}`)
        if (node && node.getBoundingClientRect().top <= line) current = item.id
      }
      setActive(current)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll) }
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
