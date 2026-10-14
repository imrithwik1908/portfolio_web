export type ProjectStatus = "Working build" | "Completed study" | "Completed project" | "Published research"

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
  paper?: string
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
    slug: "x-mutest",
    title: "X-MuTeST",
    shortTitle: "X-MuTeST",
    eyebrow: "Explainable multilingual NLP research",
    question: "A correct label is not the same as a useful explanation.",
    summary:
      "An AAAI 2026 paper and benchmark for explainable hate-speech detection in English, Hindi, and Telugu. The work pairs classification labels with token-level human rationales, then evaluates whether a model's explanation is both plausible and faithful.",
    image: "/xmutest-architecture.png",
    imageFit: "contain",
    status: "Published research",
    year: "2026",
    stack: ["MuRIL", "XLM-R", "LLaMA 3.1", "PyTorch", "Hugging Face"],
    capabilities: ["data", "intelligence"],
    github: "https://github.com/ziarehman30/X-MuTeST",
    paper: "https://doi.org/10.1609/aaai.v40i46.41261",
    outcome: "16,830 samples with token-level rationales",
    outcomeLabel: "Published benchmark",
    problem: [
      "Hate-speech classifiers can produce the right label for the wrong reason. That is especially difficult to inspect in lower-resource languages, where rationale-annotated benchmarks are scarce.",
      "X-MuTeST adds human-marked rationales to English, Hindi, and Telugu data, then asks two separate questions: does the explanation overlap with what people marked, and does the model actually depend on those highlighted tokens?",
    ],
    system: [
      "The training process has two stages. Human rationales guide model attention first. A second stage uses token-importance targets produced by an n-gram perturbation method, which measures how predictions change across unigrams, bigrams, and trigrams.",
      "The final rationale is the union of the model-derived tokens and LLaMA 3.1 suggestions. MuRIL is used for Telugu and English, while XLM-R is used for Hindi based on validation performance.",
    ],
    decisions: [
      {
        title: "Evaluate the explanation separately",
        body: "Token-F1 and IOU-F1 measure overlap with human rationales. Comprehensiveness and sufficiency test whether removing or keeping those tokens changes the prediction as expected.",
      },
      {
        title: "Use human and model signals",
        body: "Stage one aligns attention with human rationales. Stage two lets the model-derived n-gram signal refine that target instead of assuming either source is complete on its own.",
      },
      {
        title: "Keep the language choice empirical",
        body: "The encoder was selected per language from validation results rather than forcing one multilingual model across every dataset.",
      },
    ],
    debugging:
      "The annotation process needed more than one pass. Three native-language annotators marked rationales, reviewed disagreements in guidance sessions, and re-annotated the data. The reported overall agreement reached 81.0 for Telugu, 83.15 for Hindi, and 85.10 for English.",
    results: [
      "The benchmark contains 4,492 Telugu, 6,004 Hindi, and 6,334 English samples with token-level rationales.",
      "The reported X-MuTeST setup reached 0.8881 accuracy on Telugu, 0.8745 on Hindi, and 0.8604 on English.",
      "The paper reports explanation quality with plausibility and faithfulness metrics, then tests generalization on HateXplain and HateBRXplain.",
    ],
    limitations: [
      "The benchmark covers three languages and binary hate / not-hate labels; it does not represent every dialect, culture, or moderation policy.",
      "A rationale that looks plausible to a person is not automatically a faithful account of the model's internal decision.",
      "The final union inherits the cost and variability of consulting an LLM.",
    ],
    next:
      "I would want a follow-up to separate annotator disagreement from annotation noise more explicitly and test whether the rationale supervision transfers across language varieties, not only across benchmark datasets.",
    architecture: [
      { label: "Human rationales", detail: "Three annotators per language" },
      { label: "Stage 1", detail: "Align attention with people" },
      { label: "N-gram signal", detail: "Measure prediction changes" },
      { label: "Stage 2", detail: "Refine attention targets" },
      { label: "LLM consultation", detail: "Add contextual tokens" },
      { label: "Evaluation", detail: "Plausibility and faithfulness" },
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

export const selectedProjects = projects

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
    evidence: ["agentguard", "x-mutest", "tensor-fusion", "course-catalog"],
  },
  {
    id: "intelligence",
    index: "03",
    title: "Intelligence",
    summary: "Training and evaluating models, with the measurements and software around them.",
    tools: "PyTorch · NLP · multimodal ML · LLM evaluation",
    evidence: ["agentguard", "x-mutest", "tensor-fusion"],
  },
] as const

export const experiences = [
  {
    year: "2025",
    company: "Blackcoffer",
    role: "Data Science Associate",
    period: "Dec 2024 – May 2025",
    summary:
      "I worked on customer-trajectory analysis and digital-ad revenue forecasting. The useful part was deciding what a messy dataset could support, then building and validating a result that answered the business question rather than stopping at a model score.",
    aside: "A 40K+ record trajectory dataset; the final forecasting work improved on the earlier approach by 18%.",
  },
  {
    year: "2024",
    company: "IIT Indore",
    role: "Summer Research Intern",
    period: "Apr 2024 – Nov 2024",
    summary:
      "I worked on X-MuTeST, explainable hate-speech detection across English, Hindi, and Telugu. The work covered human rationales, multilingual encoders, model behavior, and deployment changes; it later became an AAAI 2026 paper.",
    aside: "The research became an AAAI 2026 paper with rationale-annotated data in three languages.",
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
