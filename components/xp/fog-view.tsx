"use client"

import { useMemo, useState } from "react"

// White's view after 1. e4 d5 in Fog-of-War chess, the game my course bot plays. The rule, from the
// project's own rules: you see your own pieces and the squares they can move to; nothing else.
// Visibility is computed here from that rule, not drawn by hand. Hover or tap a white piece to see
// which squares it lights up; "Lift the fog" shows what is really on the board.
// Entry facts come from the entry-1 release notes (results/ENTRY1_EXPERIMENTS.md, SELF_CHECK_REPORT.md).

const START = [
  "rnbqkbnr",
  "ppp.pppp",
  "........",
  "...p....",
  "....P...",
  "........",
  "PPPP.PPP",
  "RNBQKBNR",
] // rank 8 first; uppercase is White

const GLYPH: Record<string, string> = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
const NAME: Record<string, string> = { k: "King", q: "Queen", r: "Rook", b: "Bishop", n: "Knight", p: "Pawn" }
const FILES = "abcdefgh"
const sq = (r: number, f: number) => `${FILES[f]}${8 - r}`
const inside = (r: number, f: number) => r >= 0 && r < 8 && f >= 0 && f < 8

// Squares a white piece can move to (no check in this variant, so pseudo-legal moves are the rule).
function reach(board: string[], r: number, f: number): string[] {
  const p = board[r][f].toLowerCase()
  const at = (rr: number, ff: number) => board[rr][ff]
  const enemy = (c: string) => c !== "." && c === c.toLowerCase()
  const out: string[] = []
  const slide = (dirs: number[][], far: boolean) => {
    for (const [dr, df] of dirs) {
      let rr = r + dr, ff = f + df
      while (inside(rr, ff)) {
        const c = at(rr, ff)
        if (c === ".") out.push(sq(rr, ff))
        else { if (enemy(c)) out.push(sq(rr, ff)); break }
        if (!far) break
        rr += dr; ff += df
      }
    }
  }
  const ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]], DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
  if (p === "p") {
    if (inside(r - 1, f) && at(r - 1, f) === ".") {
      out.push(sq(r - 1, f))
      if (r === 6 && at(r - 2, f) === ".") out.push(sq(r - 2, f))
    }
    for (const df of [-1, 1]) if (inside(r - 1, f + df) && enemy(at(r - 1, f + df))) out.push(sq(r - 1, f + df))
  } else if (p === "n") slide([[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]], false)
  else if (p === "b") slide(DIAG, true)
  else if (p === "r") slide(ORTH, true)
  else if (p === "q") slide([...ORTH, ...DIAG], true)
  else if (p === "k") slide([...ORTH, ...DIAG], false)
  return out
}

export function FogView() {
  const [focus, setFocus] = useState<string | null>(null)
  const [lifted, setLifted] = useState(false)

  const { seen, reachOf } = useMemo(() => {
    const seen = new Set<string>()
    const reachOf: Record<string, string[]> = {}
    START.forEach((row, r) => Array.from(row).forEach((c, f) => {
      if (c === "." || c !== c.toUpperCase()) return
      seen.add(sq(r, f))
      reachOf[sq(r, f)] = reach(START, r, f)
      reachOf[sq(r, f)].forEach((s) => seen.add(s))
    }))
    return { seen, reachOf }
  }, [])

  const blackSeen = START.flatMap((row, r) => Array.from(row).map((c, f) => (c !== "." && c === c.toLowerCase() && seen.has(sq(r, f)) ? 1 : 0))).reduce((a: number, b) => a + b, 0)
  const lit = focus ? new Set(reachOf[focus]) : null
  const focusPiece = focus ? START[8 - Number(focus[1])][FILES.indexOf(focus[0])] : null

  return (
    <figure className={`xp-fow ${lifted ? "is-lifted" : ""} ${focus ? "is-focus" : ""}`}>
      <div className="xp-fow-board" role="img" aria-label={`Chess board, White's view after 1. e4 d5. White sees ${seen.size} of 64 squares and ${blackSeen} of Black's 16 pieces.`} onMouseLeave={() => setFocus(null)}>
        {START.map((row, r) => Array.from(row).map((c, f) => {
          const id = sq(r, f)
          const white = c !== "." && c === c.toUpperCase()
          const visible = seen.has(id)
          const cls = ["xp-fow-sq", (r + f) % 2 ? "is-dark" : "is-light", visible ? "is-seen" : "is-hidden", lit?.has(id) ? "is-lit" : "", focus === id ? "is-src" : ""].join(" ")
          const glyph = c === "." ? null : <span className={white ? "is-white" : "is-black"}>{GLYPH[c.toLowerCase()]}{"︎"}</span>
          return white ? (
            <button key={id} type="button" className={cls} aria-label={`${NAME[c.toLowerCase()]} ${id}: sees ${reachOf[id].length} square${reachOf[id].length === 1 ? "" : "s"}`} onMouseEnter={() => setFocus(id)} onFocus={() => setFocus(id)} onBlur={() => setFocus(null)} onClick={() => setFocus((x) => (x === id ? null : id))}>
              {glyph}
            </button>
          ) : (
            <div key={id} className={cls} aria-hidden="true">{glyph}</div>
          )
        }))}
      </div>
      <figcaption>
        <p className="xp-fow-status" aria-live="polite">
          {focus && focusPiece
            ? <>{NAME[focusPiece.toLowerCase()]} {focus} · lights up {reachOf[focus].length} square{reachOf[focus].length === 1 ? "" : "s"}</>
            : lifted
              ? <>The real position · {16 - blackSeen} of Black&apos;s pieces were hidden</>
              : <>White after 1. e4 d5 · sees {seen.size} of 64 squares, {blackSeen} of 16 black pieces</>}
        </p>
        <p className="xp-fow-line">This is all my bot gets to see. It still has to move.</p>
        <button type="button" className="xp-fow-lift" aria-pressed={lifted} onClick={() => setLifted((v) => !v)}>{lifted ? "Bring the fog back" : "Lift the fog"}</button>
        <p className="xp-fow-facts">Entry 1 · a 314K-parameter CNN · about 40M FLOPs a move · trained on CPU and rebuilt byte-for-byte from scratch</p>
      </figcaption>
    </figure>
  )
}
