"use client"

import { useState } from "react"

// A small Fog-of-War board for the 404 page: you only see the squares next to where you've looked.
export function FogBoard() {
  const [seen, setSeen] = useState<Set<number>>(() => new Set([60]))
  const reveal = (i: number) => {
    const r = Math.floor(i / 8), c = i % 8
    setSeen((prev) => {
      const next = new Set(prev)
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc
        if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) next.add(rr * 8 + cc)
      }
      return next
    })
  }
  return (
    <div className="xp-fog" role="img" aria-label="A chessboard covered in fog; squares clear where you point">
      {Array.from({ length: 64 }, (_, i) => (
        <span key={i} className={`${(Math.floor(i / 8) + i) % 2 ? "is-dark" : ""} ${seen.has(i) ? "is-seen" : ""}`} onPointerEnter={() => reveal(i)} onClick={() => reveal(i)}>
          {i === 60 && seen.has(i) ? "♔" : i === 4 && seen.has(i) ? "♚" : ""}
        </span>
      ))}
    </div>
  )
}
