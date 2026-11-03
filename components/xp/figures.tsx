"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// Technical figures for each project. Diagrams are drawn from the repositories' code and READMEs;
// images are the projects' own figures. Click a figure to enlarge it.

const INK = "#1a1917", MUTED = "#7c776e", LINE = "rgba(26,25,23,0.22)", RED = "#c4432a", AMBER = "#b7791f", GREEN = "#2e7a55"

function Box({ x, y, w, h, title, lines = [], tone }: { x: number; y: number; w: number; h: number; title: string; lines?: string[]; tone?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" fill={tone ? `${tone}14` : "#fffdf8"} stroke={tone ?? LINE} />
      <text x={x + 14} y={y + 24} fontSize="14" fontWeight="600" fill={tone ?? INK}>{title}</text>
      {lines.map((l, i) => <text key={l} x={x + 14} y={y + 46 + i * 19} fontSize="12.5" fill={MUTED}>{l}</text>)}
    </g>
  )
}

function Arrowhead({ id, color = INK }: { id: string; color?: string }) {
  return <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill={color} /></marker>
}

function ReleaseLogic() {
  return (
    <svg viewBox="0 0 820 400" role="img" aria-label="AgentGuard release decision: blocking checks lead to BLOCK, missing evidence to REVIEW, otherwise PASS">
      <defs><Arrowhead id="ra" /></defs>
      <Box x={20} y={150} w={150} h={90} title="Paired evidence" lines={["same case + evaluator", "baseline vs candidate"]} />
      <Box x={230} y={30} w={290} h={170} title="Any blocking check?" lines={["paired regressions > maximum", "a critical case regressed", "pass rate below minimum", "score drop beyond allowed", "runtime failures"]} />
      <Box x={230} y={230} w={290} h={130} title="Evidence incomplete?" lines={["a case has evidence for one version", "comparison coverage too low", "a required evaluator is missing"]} />
      <Box x={600} y={80} w={190} h={70} title="BLOCK" lines={["should not ship"]} tone={RED} />
      <Box x={600} y={240} w={190} h={70} title="REVIEW" lines={["not enough to decide"]} tone={AMBER} />
      <Box x={600} y={330} w={190} h={60} title="PASS" lines={["meets the policy"]} tone={GREEN} />
      <path d="M170 195 H200 V115 H226" fill="none" stroke={INK} markerEnd="url(#ra)" />
      <path d="M520 115 H596" fill="none" stroke={RED} markerEnd="url(#ra)" /><text x="535" y="107" fontSize="12" fill={RED}>yes</text>
      <path d="M375 200 V226" fill="none" stroke={INK} markerEnd="url(#ra)" /><text x="383" y="218" fontSize="12" fill={MUTED}>no</text>
      <path d="M520 275 H596" fill="none" stroke={AMBER} markerEnd="url(#ra)" /><text x="535" y="267" fontSize="12" fill={AMBER}>yes</text>
      <path d="M375 360 V375 H560 V360 H596" fill="none" stroke={GREEN} markerEnd="url(#ra)" /><text x="470" y="371" fontSize="12" fill={GREEN}>no</text>
    </svg>
  )
}

function TraceLife() {
  const lanes = ["Your app + SDK", "FastAPI", "PostgreSQL", "Redis / ARQ", "Worker"]
  const x = (i: number) => 80 + i * 165
  const steps: [number, number, string][] = [
    [0, 1, "1  POST the whole trace: run + nested spans"],
    [1, 2, "2  validate, write in one transaction"],
    [1, 3, "3  enqueue an evaluation job"],
    [3, 4, "4  worker picks up the job"],
    [4, 2, "5  store results with evaluator provenance"],
    [2, 1, "6  release engine reads paired evidence"],
  ]
  return (
    <svg viewBox="0 0 820 400" role="img" aria-label="Life of a trace in AgentGuard across the SDK, API, database, queue and worker">
      <defs><Arrowhead id="ta" /></defs>
      {lanes.map((l, i) => (
        <g key={l}>
          <rect x={x(i) - 70} y={16} width={140} height={34} rx="17" fill="#fffdf8" stroke={LINE} />
          <text x={x(i)} y={38} fontSize="13" fontWeight="600" fill={INK} textAnchor="middle">{l}</text>
          <line x1={x(i)} x2={x(i)} y1={52} y2={384} stroke={LINE} strokeDasharray="4 5" />
        </g>
      ))}
      {steps.map(([a, b, label], i) => {
        const y = 92 + i * 50
        return (
          <g key={label}>
            <path d={`M${x(a)} ${y} H${x(b) + (b > a ? -6 : 6)}`} stroke={i === 5 ? AMBER : INK} fill="none" markerEnd="url(#ta)" />
            <text x={(x(a) + x(b)) / 2} y={y - 8} fontSize="12" fill={MUTED} textAnchor="middle">{label}</text>
          </g>
        )
      })}
      <text x={14} y={396} fontSize="11.5" fill={GREEN}>SDK fails open: it never crashes the app</text>
    </svg>
  )
}

function Agreement() {
  const rows = [["Telugu", [82.5, 87.75, 88.25, 81.0]], ["Hindi", [86.45, 88.0, 79.2, 83.15]], ["English", [87.6, 82.0, 89.3, 85.1]]] as const
  const series = ["A1 & A2", "A2 & A3", "A3 & A1", "Overall"]
  const colors = ["#d9c7a3", "#c9a96b", "#b7791f", INK]
  const y = (v: number) => 340 - ((v - 70) / 25) * 280
  // Pointing at a bar or legend entry lights that annotator pair across all three languages.
  const [hot, setHot] = useState<number | null>(null)
  const dim = (i: number) => (hot !== null && hot !== i ? 0.22 : 1)
  return (
    <svg viewBox="0 0 820 400" role="img" aria-label="Inter-annotator agreement for Telugu, Hindi and English" onMouseLeave={() => setHot(null)}>
      {[70, 75, 80, 85, 90, 95].map((t) => <g key={t}><line x1="70" x2="800" y1={y(t)} y2={y(t)} stroke={LINE} strokeWidth="0.6" /><text x="60" y={y(t) + 4} fontSize="11" fill={MUTED} textAnchor="end">{t}</text></g>)}
      {rows.map(([lang, vals], g) => (
        <g key={lang}>
          {vals.map((v, i) => {
            const bx = 110 + g * 240 + i * 44
            return <g key={i} opacity={dim(i)} style={{ transition: "opacity 250ms ease" }} onMouseEnter={() => setHot(i)}><rect x={bx} y={y(v)} width="36" height={340 - y(v)} rx="4" fill={colors[i]} /><text x={bx + 18} y={y(v) - 6} fontSize="10.5" fill={INK} textAnchor="middle">{v}</text></g>
          })}
          <text x={110 + g * 240 + 86} y="366" fontSize="13" fontWeight="600" fill={INK} textAnchor="middle">{lang}</text>
        </g>
      ))}
      {series.map((s, i) => <g key={s} opacity={dim(i)} onMouseEnter={() => setHot(i)}><rect x={110 + i * 120} y="384" width="10" height="10" rx="2" fill={colors[i]} /><text x={126 + i * 120} y="393" fontSize="11.5" fill={MUTED}>{s}</text></g>)}
    </svg>
  )
}

function TensorResults() {
  const bar = (x: number, label: string, v: number, color: string) => (
    <g>
      <rect x={x} y={70} width="44" height="230" rx="6" fill="rgba(26,25,23,0.05)" />
      <rect x={x} y={70 + 230 * (1 - v)} width="44" height={230 * v} rx="6" fill={color} />
      <text x={x + 22} y={62 + 230 * (1 - v)} fontSize="12" fontWeight="600" fill={INK} textAnchor="middle">{v.toFixed(3)}</text>
      <text x={x + 22} y="322" fontSize="11.5" fill={MUTED} textAnchor="middle">{label}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 820 400" role="img" aria-label="Tensor Fusion held-out results for binary, five-class and regression tasks">
      <text x="120" y="36" fontSize="14" fontWeight="600" fill={INK} textAnchor="middle">Binary</text>
      {bar(70, "accuracy", 0.704, "#13806f")}{bar(126, "F1", 0.7087, "#4aa894")}
      <text x="400" y="36" fontSize="14" fontWeight="600" fill={INK} textAnchor="middle">Five-class</text>
      {bar(378, "accuracy", 0.3192, "#13806f")}
      <line x1="350" x2="450" y1={70 + 230 * 0.8} y2={70 + 230 * 0.8} stroke={RED} strokeDasharray="5 4" />
      <text x="456" y={74 + 230 * 0.8} fontSize="11" fill={RED}>uniform guess 0.20</text>
      <text x="680" y="36" fontSize="14" fontWeight="600" fill={INK} textAnchor="middle">Regression</text>
      {bar(630, "Pearson r", 0.5282, "#13806f")}
      <text x="720" y="160" fontSize="26" fill={INK} fontFamily="Georgia, serif">1.101</text>
      <text x="720" y="180" fontSize="11.5" fill={MUTED}>test MAE</text>
      <text x="410" y="372" fontSize="12" fill={MUTED} textAnchor="middle">Held-out results printed in the three checked-in notebooks</text>
    </svg>
  )
}

function CourseSchema() {
  return (
    <svg viewBox="0 0 820 400" role="img" aria-label="Course Catalog data model: Student, Course and Professor with two-sided references">
      <defs><Arrowhead id="ca" color={INK} /></defs>
      <Box x={20} y={60} w={230} h={240} title="Student" lines={["name", "rollNo · unique", "email · unique", "phone, semester, branch", "enrolledCourses → [Course]", "creditLimit = 25"]} />
      <Box x={295} y={60} w={230} h={190} title="Course" lines={["name", "courseCode · unique", "credits", "professor → Professor", "enrolledStudents → [Student]"]} />
      <Box x={570} y={60} w={230} h={190} title="Professor" lines={["name", "email · unique", "department, phone", "coursesTaught → [Course]"]} />
      <path d="M250 150 H291" stroke={AMBER} fill="none" markerEnd="url(#ca)" markerStart="url(#ca)" />
      <path d="M525 150 H566" stroke={INK} fill="none" markerEnd="url(#ca)" markerStart="url(#ca)" />
      <text x="272" y="140" fontSize="11" fill={AMBER} textAnchor="middle">m : n</text>
      <text x="410" y="300" fontSize="12.5" fill={MUTED} textAnchor="middle">An enrollment is stored on both sides, so confirming one means two writes.</text>
      <text x="410" y="322" fontSize="12.5" fill={MUTED} textAnchor="middle">The code checks for duplicates first; a transaction would be the stronger fix.</text>
    </svg>
  )
}

function Enrollment() {
  const steps = ["Google sign-in", "Email pattern → role", "Add to session cart", "Review at checkout", "Confirm", "Write course + student", "Clear cart"]
  return (
    <svg viewBox="0 0 820 220" role="img" aria-label="Course Catalog enrollment flow from sign-in to confirmation">
      <defs><Arrowhead id="ea" /></defs>
      {steps.map((s, i) => {
        const x = 14 + i * 115
        return (
          <g key={s}>
            <rect x={x} y={70} width="100" height="64" rx="12" fill={i === 5 ? `${AMBER}14` : "#fffdf8"} stroke={i === 5 ? AMBER : LINE} />
            <text x={x + 50} y="64" fontSize="11" fill={MUTED} textAnchor="middle">{String(i + 1).padStart(2, "0")}</text>
            {s.split(" ").reduce<string[]>((acc, w) => { const last = acc[acc.length - 1]; if (last && (last + " " + w).length <= 13) acc[acc.length - 1] = last + " " + w; else acc.push(w); return acc }, []).map((line, j, all) => (
              <text key={line} x={x + 50} y={106 - (all.length - 1) * 8 + j * 16} fontSize="12" fontWeight="500" fill={INK} textAnchor="middle">{line}</text>
            ))}
            {i < steps.length - 1 && <path d={`M${x + 100} 102 H${x + 113}`} stroke={INK} markerEnd="url(#ea)" />}
          </g>
        )
      })}
      <text x="410" y="176" fontSize="12.5" fill={MUTED} textAnchor="middle">From server.js and config/passport.js</text>
    </svg>
  )
}

type Figure = { chapter: string; title: string; caption: string; source: string; draw?: () => JSX.Element; src?: string; alt?: string }

const figures: Record<string, Figure[]> = {
  agentguard: [
    { chapter: "decisions", title: "How a release decision is made", caption: "Blocking checks win over everything; missing evidence asks for a human instead of guessing.", source: "apps/api/agentguard_api/services/evaluations.py", draw: ReleaseLogic },
    { chapter: "system", title: "The life of a trace", caption: "Ingestion is one transaction; evaluation happens off the request path on a queue.", source: "README architecture and the API services", draw: TraceLife },
  ],
  "x-mutest": [
    { chapter: "system", title: "The LLM-consulted explanation framework", caption: "Human rationales and n-gram scores guide attention; LLaMA 3.1 adds contextual rationale tokens.", source: "X-MuTeST repository README", src: "/xmutest-architecture.png", alt: "X-MuTeST framework overview diagram" },
    { chapter: "debugging", title: "The iterative annotation process", caption: "Guidelines, three annotators, review and feedback until agreement held.", source: "X-MuTeST paper", src: "/xmutest-annotation.png", alt: "Iterative annotation process" },
    { chapter: "debugging", title: "How much the annotators agreed", caption: "Pairwise Cohen's kappa and overall Fleiss' kappa per language, after iterative re-annotation.", source: "X-MuTeST repository README", draw: Agreement },
  ],
  "tensor-fusion": [
    { chapter: "results", title: "Where each task landed", caption: "Binary sentiment is solid; five-class is far harder, though still above a uniform guess.", source: "Combination_binary, LA_combination_5class and Combination_regression notebooks", draw: TensorResults },
    { chapter: "system", title: "The fusion architecture", caption: "Modality-specific extractors feed a single fusion model.", source: "Project reference diagram", src: "/tensor_fusion.jpg", alt: "Tensor fusion network architecture" },
  ],
  "course-catalog": [
    { chapter: "system", title: "The data model", caption: "Three Mongoose schemas with references instead of copies.", source: "models/Student.js, Course.js, Professor.js", draw: CourseSchema },
    { chapter: "debugging", title: "Enrolling in a course", caption: "Selection lives in the session until the student confirms.", source: "server.js, config/passport.js", draw: Enrollment },
    { chapter: "problem", title: "The landing page", caption: "Server-rendered with EJS.", source: "Project screenshot", src: "/course_catalog.jpg", alt: "Course Catalog landing page" },
  ],
}

function FigureBody({ fig }: { fig: Figure }) {
  // eslint-disable-next-line @next/next/no-img-element
  return fig.draw ? <fig.draw /> : <img src={fig.src} alt={fig.alt ?? ""} loading="lazy" decoding="async" />
}

const ORDER = ["problem", "system", "decisions", "debugging", "results", "limits", "next"]

// Figures placed inside the chapter they explain, numbered across the page.
export function ChapterFigures({ slug, chapter }: { slug: string; chapter: string }) {
  // Numbered in reading order, whatever order they're listed in.
  const all = [...(figures[slug] ?? [])].sort((a, b) => ORDER.indexOf(a.chapter) - ORDER.indexOf(b.chapter))
  const [open, setOpen] = useState<number | null>(null)
  const back = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null) }
    window.addEventListener("keydown", onKey)
    document.documentElement.classList.add("is-dossier-open")
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.classList.remove("is-dossier-open"); back.current?.focus() }
  }, [open])

  const here = all.map((fig, n) => ({ fig, n })).filter(({ fig }) => fig.chapter === chapter)
  if (!here.length) return null

  return (
    <>
      {here.map(({ fig, n }) => (
        <figure key={fig.title} className="xp-fig is-inline">
          <button type="button" className="xp-fig-frame" onClick={(e) => { back.current = e.currentTarget; setOpen(n) }} aria-label={`Enlarge figure ${n + 1}: ${fig.title}`}>
            <FigureBody fig={fig} />
          </button>
          <figcaption><strong>Fig. {n + 1} · {fig.title}</strong>{fig.caption}<span>Source: {fig.source}</span></figcaption>
        </figure>
      ))}
      {open !== null && createPortal(
        <div className="xp-lightbox" role="dialog" aria-modal="true" aria-label={all[open].title} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(null) }}>
          <figure>
            <div className="xp-lightbox-frame"><FigureBody fig={all[open]} /></div>
            <figcaption><strong>Fig. {open + 1} · {all[open].title}</strong> {all[open].caption}</figcaption>
          </figure>
          <button type="button" className="xp-dossier-close" onClick={() => setOpen(null)} autoFocus>Close <kbd>Esc</kbd></button>
        </div>,
        document.body,
      )}
    </>
  )
}
