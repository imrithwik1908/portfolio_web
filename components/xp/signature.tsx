// "Rithwik", handwritten: single-line pen strokes drawn by hand on a 660 × 220 box (baseline
// y = 220, x-height y = 120), in the order a person writes them. The hero shows it still; the
// opening writes it stroke by stroke and lands on exactly these lines.

export type Mark = { d: string } | { dot: [number, number] }

export const MARKS: Mark[] = [
  { d: "M 92 44 C 88 100 82 165 74 222" }, // R: stem
  { d: "M 90 46 C 140 28 196 40 192 82 C 189 116 140 132 92 128 C 128 140 150 190 176 216 C 186 226 200 224 212 210" }, // R: bowl and leg
  { d: "M 236 126 C 232 160 226 198 232 216 C 238 228 254 222 266 206" }, // i
  { dot: [246, 82] }, // i: dot
  { d: "M 290 56 C 284 112 276 172 280 210 C 284 228 304 224 316 206" }, // t
  { d: "M 274 110 C 290 108 306 106 322 104" }, // t: cross
  { d: "M 346 34 C 338 100 326 170 316 222 C 330 160 356 122 380 124 C 400 126 392 168 388 196 C 386 216 396 226 420 208" }, // h
  { d: "M 434 124 C 428 160 428 200 440 218 C 452 230 466 196 472 160 C 474 194 482 224 498 220 C 518 214 530 168 526 122" }, // w
  { d: "M 560 126 C 556 160 550 198 556 216 C 562 228 578 222 590 206" }, // i
  { dot: [570, 82] }, // i: dot
  { d: "M 622 34 C 614 100 602 170 592 222 C 606 176 640 128 662 134 C 680 140 660 168 606 172 C 636 180 646 214 668 220 C 682 224 694 214 702 204" }, // k
]

export const VB = { x: 60, y: 20, w: 660, h: 220 }
export const DOT_R = 6

type Props = { className?: string; pathRef?: (i: number, el: SVGPathElement | SVGCircleElement | null) => void }

export function Signature({ className, pathRef }: Props) {
  return (
    <svg className={className} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} overflow="visible" aria-hidden="true" focusable="false">
      {MARKS.map((m, i) =>
        "d" in m
          ? <path key={i} ref={pathRef ? (el) => pathRef(i, el) : undefined} d={m.d} pathLength={1} />
          : <circle key={i} ref={pathRef ? (el) => pathRef(i, el) : undefined} cx={m.dot[0]} cy={m.dot[1]} r={DOT_R} />,
      )}
    </svg>
  )
}
