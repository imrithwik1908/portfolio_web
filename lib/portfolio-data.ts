export type ProjectStatus = "Working build" | "Completed study" | "Completed project"

export type Project = {
  slug: string
  title: string
  shortTitle: string
  eyebrow: string
  question: string
  summary: string
  image: string
  imageFit: "cover" | "contain"
  status: ProjectStatus
  year: string
  stack: string[]
  capabilities: Array<"systems" | "data" | "intelligence">
  github: string
  live?: string
  outcome: string
  outcomeLabel: string
  problem: string[]
  system: string[]
  decisions: Array<{ title: string; body: string }>
  debugging: string
  results: string[]
  limitations: string[]
  next: string
  architecture: Array<{ label: string; detail: string }>
}

export const projects: Project[] = [
  {
    slug: "agentguard",
    title: "AgentGuard",
    shortTitle: "AgentGuard",
    eyebrow: "LLM reliability platform",
    question: "What changed, and is it safe to release?",
    summary:
      "A regression-testing and observability platform for LLM applications. It records traces, reruns representative cases, compares a candidate with a baseline, and turns stored evidence into a conservative release recommendation.",
    image: "/agentguard.png",
    imageFit: "cover",
    status: "Working build",
    year: "2026",
    stack: ["FastAPI", "PostgreSQL", "Redis / ARQ", "Next.js", "Python SDK"],
    capabilities: ["systems", "data", "intelligence"],
    github: "https://github.com/imrithwik1908/AgentGuard",
    live: "https://agentguard-platform.vercel.app",
    outcome: "Instrument → evaluate → compare → release",
    outcomeLabel: "Implemented workflow",
    problem: [
      "Changing a prompt, model, retriever, tool, or workflow can improve an average score while breaking cases that used to work. A single evaluation number does not explain which behavior changed or whether the evidence is complete enough to release.",
      "AgentGuard keeps the unit of comparison concrete: one test case, one evaluator, one application version, and the trace that produced the result.",
    ],
    system: [
      "A Python SDK captures runs and nested steps from an LLM, RAG, or agent application. FastAPI validates and stores each complete trace atomically in PostgreSQL, while JSONB fields preserve heterogeneous inputs, outputs, and metadata.",
      "Evaluation work runs outside the request path through Redis and ARQ. Deterministic evaluators and optional LLM judges produce versioned evidence. The release engine reads that evidence and returns PASS, BLOCK, or REVIEW with reasons; an LLM never makes the final release decision.",
    ],
    decisions: [
      {
        title: "Relational ownership, flexible telemetry",
        body: "PostgreSQL enforces workspace, project, version, suite, and job relationships. JSONB holds model-specific payloads without turning every provider variation into a migration.",
      },
      {
        title: "Whole-trace ingestion",
        body: "Runs and spans arrive as one validated transaction. Streaming would feel faster, but atomic ingestion keeps the v1 consistency model and failure behavior easier to defend.",
      },
      {
        title: "Evidence before verdict",
        body: "Judge outputs are stored with evaluator, rubric, provider, model, threshold, explanation, and timestamp. Missing required evidence produces REVIEW instead of an invented pass.",
      },
    ],
    debugging:
      "Comparison semantics were deceptively easy to get wrong. Historical evaluations could leak into a current comparison and make two versions look better supported than they were. The fix was to scope pairing to the latest terminal job execution for the same suite, version, evaluator, and case, then test those boundaries directly.",
    results: [
      "A working web application, async API, worker, PostgreSQL schema, and installable SDK live in one repository.",
      "The integration suite covers atomic ingestion, workspace isolation, job progress, evaluator provenance, paired comparisons, and release-policy behavior.",
      "A 30-case support-policy RAG example can generate baseline and candidate evidence without requiring a paid model API.",
    ],
    limitations: [
      "One production-quality automatic provider integration: OpenAI-compatible chat completions.",
      "No persistent SDK-side retry queue or streaming span ingestion.",
      "Failure grouping is deterministic, not embedding-based semantic clustering.",
      "The public demo uses free hosting and may need time to wake after inactivity.",
    ],
    next:
      "I would add a durable client queue before broadening integrations. Losing telemetry during a network interruption is a more important gap than supporting another framework wrapper.",
    architecture: [
      { label: "Application", detail: "LLM, RAG, or agent code" },
      { label: "Python SDK", detail: "Runs, spans, fail-open delivery" },
      { label: "FastAPI", detail: "Validation, auth, atomic ingestion" },
      { label: "PostgreSQL", detail: "Traces, suites, jobs, evidence" },
      { label: "Worker", detail: "Redis / ARQ evaluation jobs" },
      { label: "Decision UI", detail: "Compare, diagnose, release" },
    ],
  },
  {
    slug: "tensor-fusion",
    title: "Tensor Fusion",
    shortTitle: "Tensor Fusion",
    eyebrow: "Multimodal ML study",
    question: "Can three noisy modalities beat one?",
    summary:
      "A notebook-based study of sentiment analysis from language, acoustic, and visual representations. The work compares fusion setups across binary classification, five-class classification, and regression.",
    image: "/tensor_fusion.jpg",
    imageFit: "contain",
    status: "Completed study",
    year: "2024",
    stack: ["PyTorch", "TensorFlow", "CMU-MOSEI", "scikit-learn"],
    capabilities: ["data", "intelligence"],
    github: "https://github.com/imrithwik1908/Tensor-Fusion-Network",
    outcome: "70.4% binary test accuracy",
    outcomeLabel: "Verified notebook output",
    problem: [
      "Sentiment is not carried by words alone. Tone and expression can reinforce the transcript, contradict it, or add noise. The useful question was not simply whether more modalities helped, but how fusion choices changed the result.",
      "The experiments use aligned language, acoustic, and visual feature sequences from CMU-MOSEI and evaluate several prediction setups rather than presenting one final model as universal.",
    ],
    system: [
      "Each modality is encoded independently before the representations are combined. The notebooks cover binary sentiment, five-class classification, and continuous regression, with separate training, validation, and held-out test flows.",
      "The repository is an experimental record, not a packaged application. That distinction matters: the useful artifact is the comparison work and the saved evaluation output, not a claim of production readiness.",
    ],
    decisions: [
      {
        title: "Keep modality paths separate first",
        body: "Independent encoders make it possible to reason about what each representation contributes before fusion changes the feature space.",
      },
      {
        title: "Evaluate more than one target shape",
        body: "Binary accuracy can hide the difficulty of fine-grained sentiment. Running classification and regression exposed different weaknesses in the same representation pipeline.",
      },
      {
        title: "Report the artifact honestly",
        body: "The notebooks record a 70.4% binary test accuracy and 0.7087 F1 for one run. Higher numbers mentioned in old notes are not used here because the public output does not verify them cleanly.",
      },
    ],
    debugging:
      "Sequence alignment and label handling were the fragile parts. A model can train normally while samples, modalities, or target shapes are slightly out of step. The notebooks include explicit reshaping, target conversion, and held-out checks to catch those quiet errors.",
    results: [
      "The checked-in binary notebook records 70.4% test accuracy and a 0.7087 F1 score.",
      "The same feature pipeline was exercised as binary classification, five-class classification, and regression.",
      "The experiments made the tradeoff between richer fusion and harder debugging visible rather than treating multimodality as an automatic improvement.",
    ],
    limitations: [
      "The work remains in notebooks and is not packaged as a reproducible training application.",
      "The repository does not include the CMU-MOSEI feature data or an automated environment setup.",
      "The five-class result is substantially weaker than the binary setup and needs better tuning and error analysis.",
    ],
    next:
      "I would rebuild the experiments around a single reproducible configuration, add per-modality ablations, and log alignment checks before trying a more complicated fusion layer.",
    architecture: [
      { label: "Language", detail: "Transcript representation" },
      { label: "Acoustic", detail: "Voice and prosody features" },
      { label: "Visual", detail: "Frame-level expression features" },
      { label: "Encoders", detail: "Independent sequence paths" },
      { label: "Fusion", detail: "Combined representation" },
      { label: "Heads", detail: "Classify or regress sentiment" },
    ],
  },
  {
    slug: "course-catalog",
    title: "Course Catalog",
    shortTitle: "Course Catalog",
    eyebrow: "Role-based web application",
    question: "One course system, two very different users.",
    summary:
      "A server-rendered course application with separate student and professor flows. Google authentication selects the role; MongoDB holds people, courses, and enrollment relationships.",
    image: "/course_catalog.jpg",
    imageFit: "cover",
    status: "Completed project",
    year: "2024",
    stack: ["Node.js", "Express", "MongoDB", "EJS", "Google OAuth"],
    capabilities: ["systems", "data"],
    github: "https://github.com/imrithwik1908/course_catalog",
    outcome: "Two role-specific workflows on one data model",
    outcomeLabel: "Implemented scope",
    problem: [
      "Students and professors touch the same course records for different reasons. Students need discovery, a cart, and enrollment state. Professors need to see the offerings associated with their account.",
      "The project was about keeping those flows distinct without duplicating the underlying course and identity data.",
    ],
    system: [
      "Express handles Google OAuth, session state, role-based redirects, and server-rendered EJS views. Mongoose models students, professors, courses, and their references.",
      "Enrollment updates both sides of the relationship: the student stores enrolled courses and each course stores enrolled students. A session-backed cart keeps selection separate from confirmation.",
    ],
    decisions: [
      {
        title: "Role-specific entry points",
        body: "The OAuth callback redirects students and professors into separate workflows instead of forcing one overloaded dashboard to serve both.",
      },
      {
        title: "References over embedded copies",
        body: "Courses, professors, and students keep ObjectId relationships, avoiding duplicated identity and course records across views.",
      },
      {
        title: "Server-rendered interaction",
        body: "EJS kept the application small and made the request, session, database, and rendered-page lifecycle visible during the project.",
      },
    ],
    debugging:
      "Enrollment touches both the student and course documents. The first implementation made it easy to create duplicates or update only one side. Explicit duplicate checks and grouped save operations made the state transition easier to follow, though a database transaction would be the stronger production solution.",
    results: [
      "Google authentication and role-aware routing are implemented.",
      "Students can browse, collect, and confirm course enrollment; professors see courses tied to their account.",
      "The repository contains separate Student, Professor, and Course models with enrollment references.",
    ],
    limitations: [
      "The session store and hard-coded session secret are development choices, not production deployment settings.",
      "Enrollment updates are not wrapped in a MongoDB transaction.",
      "There is no verified public user count or performance benchmark, so none is claimed here.",
    ],
    next:
      "I would move secrets and sessions into production-safe infrastructure, enforce authorization in reusable middleware, and make enrollment a transactional operation.",
    architecture: [
      { label: "Google OAuth", detail: "Identity and callback" },
      { label: "Role routing", detail: "Student or professor flow" },
      { label: "Express", detail: "Sessions and application logic" },
      { label: "EJS", detail: "Server-rendered interfaces" },
      { label: "Mongoose", detail: "Schemas and references" },
      { label: "MongoDB", detail: "People, courses, enrollments" },
    ],
  },
]

export const selectedProjects = projects.slice(0, 3)

export const capabilities = [
  {
    id: "systems",
    index: "01",
    title: "Systems",
    summary: "APIs, state, background work, and the failure paths between them.",
    tools: "FastAPI · PostgreSQL · Redis · Node.js",
    evidence: ["agentguard", "course-catalog"],
  },
  {
    id: "data",
    index: "02",
    title: "Data",
    summary: "Data models, queries, pipelines, and knowing what the data can actually support.",
    tools: "SQL · MongoDB · Pandas · time-series analysis",
    evidence: ["agentguard", "tensor-fusion", "course-catalog"],
  },
  {
    id: "intelligence",
    index: "03",
    title: "Intelligence",
    summary: "Training and evaluating models, with the measurements and software around them.",
    tools: "PyTorch · NLP · multimodal ML · LLM evaluation",
    evidence: ["agentguard", "tensor-fusion"],
  },
] as const

export const experiences = [
  {
    company: "Blackcoffer",
    role: "Data Science Associate",
    period: "Dec 2024 – May 2025",
    summary:
      "I worked on customer-trajectory analysis and digital-ad revenue forecasting. The useful part was deciding what a messy dataset could support, then building and validating a result that answered the business question rather than stopping at a model score.",
    metrics: [
      { value: "40K+", label: "trajectory records" },
      { value: "18%", label: "forecast improvement" },
    ],
  },
  {
    company: "IIT Indore",
    role: "Summer Research Intern",
    period: "Apr 2024 – Nov 2024",
    summary:
      "I worked on X-MuTeST, explainable hate-speech detection across English, Hindi, and Telugu. The work covered human rationales, multilingual encoders, model behavior, and deployment changes; it later became an AAAI 2026 paper.",
    metrics: [
      { value: "3", label: "languages" },
      { value: "20%", label: "lower inference latency" },
    ],
  },
] as const

export const earlierExperience = {
  company: "CodeAlpha",
  role: "Full Stack Developer Intern",
  period: "Jun 2023 – Jul 2023",
  summary: "Early web work across responsive pages and a small Node.js / EJS application.",
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

