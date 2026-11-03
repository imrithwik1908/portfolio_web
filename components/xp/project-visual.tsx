import demo from "@/lib/agentguard-demo.json"

// Small animated diagrams of each project's core idea. They animate while their card has `is-live`.
// AgentGuard's uses the recorded demo results; the others are labelled diagrams of the method.

function AgentGuardVisual() {
  const rows = [
    { label: "baseline", runs: demo.cases.map((c) => c.versions.baseline.answerPassed && c.versions.baseline.retrievalPassed) },
    { label: "candidate", runs: demo.cases.map((c) => c.versions.candidate.answerPassed && c.versions.candidate.retrievalPassed) },
  ]
  return (
    <svg viewBox="0 0 400 300" className="pv" role="img" aria-label="Recorded AgentGuard demo: the candidate fails 2 of 10 cases the baseline passed, so the release is blocked">
      {rows.map((row, r) => (
        <g key={row.label}>
          <text x="28" y={102 + r * 70} className="pv-label">{row.label}</text>
          {row.runs.map((pass, i) => (
            <circle key={i} cx={128 + i * 26} cy={98 + r * 70} r="8" className={`pv-dot ${pass ? "is-pass" : "is-fail"}`} style={{ "--i": i + r * 10 } as React.CSSProperties} />
          ))}
        </g>
      ))}
      <path d="M128 132 V 154 M362 132 V 154" className="pv-tick" />
      <text x="28" y="232" className="pv-label">release check</text>
      <g className="pv-verdict">
        <rect x="254" y="212" width="118" height="34" rx="17" />
        <text x="313" y="234" textAnchor="middle">BLOCK</text>
      </g>
    </svg>
  )
}

function XMutestVisual() {
  const rows = [
    { label: "English", widths: [40, 26, 58, 34, 48, 30], marked: [2, 4] },
    { label: "हिन्दी", widths: [32, 54, 24, 44, 38, 50], marked: [1, 3] },
    { label: "తెలుగు", widths: [52, 36, 42, 28, 60, 30], marked: [0, 4] },
  ]
  let k = 0
  return (
    <svg viewBox="0 0 400 300" className="pv" role="img" aria-label="Diagram: token-level rationales highlighted across English, Hindi and Telugu">
      {rows.map((row, r) => {
        let x = 120
        return (
          <g key={row.label}>
            <text x="28" y={98 + r * 62} className="pv-script">{row.label}</text>
            {row.widths.map((w, i) => {
              const at = x
              x += w + 7
              if (at + w > 380) return null
              const marked = row.marked.includes(i)
              return <rect key={i} x={at} y={78 + r * 62} width={w} height="28" rx="6" className={marked ? "pv-token is-marked" : "pv-token"} style={{ "--i": marked ? k++ : 0 } as React.CSSProperties} />
            })}
          </g>
        )
      })}
      <text x="28" y="270" className="pv-label">human-marked rationale tokens</text>
    </svg>
  )
}

function wave(seed: number, y0: number) {
  const points: string[] = []
  for (let i = 0; i <= 48; i++) {
    const t = i / 48
    const merge = 1 - t ** 1.5
    const y = 150 + (y0 - 150) * merge + Math.sin(i * (0.8 + seed * 0.3) + seed) * 12 * merge
    points.push(`${(110 + t * 210).toFixed(1)},${y.toFixed(1)}`)
  }
  return points.join(" ")
}

function TensorVisual() {
  const lanes = [["language", 72], ["acoustic", 150], ["visual", 228]] as const
  return (
    <svg viewBox="0 0 400 300" className="pv" role="img" aria-label="Diagram: language, acoustic and visual signals fused into one sentiment prediction">
      {lanes.map(([label, y], i) => (
        <g key={label}>
          <text x="28" y={y + 4} className="pv-label">{label}</text>
          <polyline points={wave(i + 1, y)} className="pv-wave" style={{ "--i": i } as React.CSSProperties} />
        </g>
      ))}
      <line x1="320" y1="150" x2="350" y2="150" className="pv-wave is-fused" />
      <circle cx="360" cy="150" r="10" className="pv-node" />
    </svg>
  )
}

function CourseVisual() {
  const paths = ["M70 150 C 130 150, 130 86, 190 86 L 260 86 C 316 86, 316 150, 340 150", "M70 150 C 130 150, 130 214, 190 214 L 260 214 C 316 214, 316 150, 340 150"]
  return (
    <svg viewBox="0 0 400 300" className="pv" role="img" aria-label="Diagram: Google sign-in routes students and professors into separate flows over one MongoDB data model">
      {paths.map((d, i) => (
        <g key={d}>
          <path d={d} className="pv-route" />
          <circle r="5" className="pv-traveller" style={{ offsetPath: `path("${d}")`, "--i": i } as React.CSSProperties} />
        </g>
      ))}
      <g className="pv-box"><rect x="22" y="132" width="76" height="36" rx="10" /><text x="60" y="155" textAnchor="middle">OAuth</text></g>
      <g className="pv-box"><rect x="180" y="68" width="92" height="36" rx="10" /><text x="226" y="91" textAnchor="middle">Student</text></g>
      <g className="pv-box"><rect x="180" y="196" width="92" height="36" rx="10" /><text x="226" y="219" textAnchor="middle">Professor</text></g>
      <g className="pv-box is-db"><rect x="332" y="128" width="54" height="44" rx="10" /><text x="359" y="155" textAnchor="middle">DB</text></g>
    </svg>
  )
}

const visuals: Record<string, () => JSX.Element> = {
  agentguard: AgentGuardVisual,
  "x-mutest": XMutestVisual,
  "tensor-fusion": TensorVisual,
  "course-catalog": CourseVisual,
}

export function ProjectVisual({ slug }: { slug: string }) {
  const Visual = visuals[slug]
  return Visual ? <Visual /> : null
}
