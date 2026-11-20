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
      "A release check for AI features. It records what an AI app does, runs the same test questions on the old and new versions, compares them case by case, and returns PASS, BLOCK or REVIEW with reasons. Built end to end: Python SDK, API, database, background workers and dashboard.",
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
      "Teams change AI features constantly: a new prompt, a newer model, different documents to search. Each change can raise the average test score while quietly breaking questions that used to work. One number can't say which answers changed, or whether there is enough evidence to ship.",
      "AgentGuard keeps the comparison concrete: one test question, one check, one version of the app, and the recorded steps that produced the answer.",
    ],
    system: [
      "A Python SDK records each run and its nested steps (planning, document lookup, tool calls, the model's answer) from any AI application. A FastAPI service validates the whole trace and saves it to PostgreSQL in one transaction, with flexible JSON columns for inputs and outputs that differ from app to app.",
      "Grading happens in the background: jobs go onto a Redis queue and ARQ workers run rule-based checks and, optionally, an AI grader. Every grade is stored with what produced it. The release engine reads that evidence and returns PASS, BLOCK or REVIEW with reasons; an AI model never makes the final call.",
    ],
    decisions: [
      {
        title: "Relational ownership, flexible telemetry",
        body: "PostgreSQL enforces who owns what: workspaces, projects, versions, test suites and jobs. Flexible JSON columns hold each model's own inputs and outputs, so a new provider doesn't mean a database migration.",
      },
      {
        title: "Whole-trace ingestion",
        body: "A run and all its steps arrive and are saved together. Streaming steps one by one would feel faster, but saving all-or-nothing means there is never half a trace to reason about.",
      },
      {
        title: "Evidence before verdict",
        body: "Every AI-graded result is stored with its rubric, model, threshold, explanation and time. If required evidence is missing, the answer is REVIEW, never a pass by default.",
      },
    ],
    debugging:
      "Comparisons were easy to get subtly wrong. Old grading results could leak into a new comparison and make two versions look better supported than they were. The fix was to compare only the latest finished grading run for the same suite, version, check and case, and to write tests for exactly those boundaries.",
    results: [
      "A working dashboard, API, background worker, database schema and installable SDK, in one repository and deployed.",
      "Integration tests against a real PostgreSQL cover all-or-nothing saving, workspace isolation, job progress, grading provenance, paired comparisons and the release rules.",
      "A 30-question customer-support example produces old and new versions to compare without needing a paid AI API.",
    ],
    limitations: [
      "Automatic recording covers one kind of model API so far: OpenAI-compatible chat.",
      "If the network drops, the SDK doesn't keep unsent traces to retry later, and steps can't be streamed in as they happen.",
      "Failures are grouped by fixed rules, not by meaning.",
      "The public demo uses free hosting and may need time to wake after inactivity.",
    ],
    next:
      "I would make the SDK keep unsent traces and retry them before adding more integrations. Losing evidence during a network blip matters more than supporting one more framework.",
    architecture: [
      { label: "Your AI app", detail: "Assistant, search or agent" },
      { label: "Python SDK", detail: "Records every step" },
      { label: "FastAPI", detail: "Checks and saves traces" },
      { label: "PostgreSQL", detail: "Traces, tests, grades" },
      { label: "Workers", detail: "Grade answers (Redis queue)" },
      { label: "Dashboard", detail: "Compare and decide" },
    ],
  },
  {
    slug: "x-mutest",
    title: "X-MuTeST",
    shortTitle: "X-MuTeST",
    eyebrow: "Explainable multilingual NLP research",
    question: "A correct label is not the same as a useful explanation.",
    summary:
      "An AAAI 2026 paper I co-authored on hate-speech detection that shows its work, in English, Hindi and Telugu: a benchmark of about 16,800 posts with the offending words marked by native speakers, and a training method that makes models point to the right words.",
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
      "A hate-speech classifier can give the right label for the wrong reason, for example by reacting to a group's name rather than to the insult. That is hard to check in lower-resource languages, where almost no data marks which words make a post hateful.",
      "X-MuTeST adds those word-level marks to English, Hindi and Telugu posts, then asks two separate questions of any explanation: does it match the words people marked, and does the model actually depend on them?",
    ],
    system: [
      "Training runs in two rounds. First, the model learns to focus its attention on the words people marked. Then a probe feeds it every single word, pair and triple from a post, finds the words whose fragments land closest to the whole post's verdict, and the model is trained again on those.",
      "The final explanation merges the model's own words with Llama 3.1's suggestions. MuRIL is used for Telugu and English and XLM-R for Hindi, chosen per language by validation results.",
    ],
    decisions: [
      {
        title: "Evaluate the explanation separately",
        body: "Plausibility (Token-F1, IOU-F1) measures overlap with the words people marked. Faithfulness (comprehensiveness, sufficiency) hides or keeps only those words and checks the prediction moves the way it should.",
      },
      {
        title: "Use human and model signals",
        body: "Round one follows the human marks; round two lets the model's own probe refine them. Neither source is assumed complete on its own.",
      },
      {
        title: "Keep the language choice empirical",
        body: "The model was chosen per language from validation results, rather than forcing one multilingual model on every dataset.",
      },
    ],
    debugging:
      "Annotation needed more than one pass. Three native speakers marked the words, went through their disagreements in guidance sessions, and annotated again. Overall agreement reached 81.0 for Telugu, 83.15 for Hindi and 85.10 for English (Fleiss' kappa, scaled to 100).",
    results: [
      "The benchmark contains 4,492 Telugu, 6,004 Hindi, and 6,334 English samples with token-level rationales.",
      "The X-MuTeST setup reached 88.8% accuracy on Telugu, 87.5% on Hindi and 86.0% on English.",
      "The paper reports explanation quality for plausibility and faithfulness, and tests whether the method carries over to two other benchmarks, HateXplain and HateBRXplain.",
    ],
    limitations: [
      "The benchmark covers three languages and binary hate / not-hate labels; it does not represent every dialect, culture, or moderation policy.",
      "A rationale that looks plausible to a person is not automatically a faithful account of the model's internal decision.",
      "Merging in an LLM's suggestions adds its cost, and its variability, to every explanation.",
    ],
    next:
      "I would want a follow-up to separate annotator disagreement from annotation noise more explicitly and test whether the rationale supervision transfers across language varieties, not only across benchmark datasets.",
    architecture: [
      { label: "Marked posts", detail: "Three native speakers each" },
      { label: "Round 1", detail: "Focus on the marked words" },
      { label: "Phrase probe", detail: "Which words carry the verdict" },
      { label: "LLM opinion", detail: "Llama 3.1's word list" },
      { label: "Round 2", detail: "Train on the merged words" },
      { label: "Evaluation", detail: "Plausible and faithful?" },
    ],
  },
  {
    slug: "tensor-fusion",
    title: "Tensor Fusion",
    shortTitle: "Tensor Fusion",
    eyebrow: "Multimodal ML study",
    question: "Can three noisy modalities beat one?",
    summary:
      "Can an AI read sentiment better from face, voice and words together than from words alone? A PyTorch implementation of the Tensor Fusion Network on CMU-MOSI video clips, run three ways: positive or negative, five classes, and a score from −3 to +3.",
    image: "/tensor_fusion.jpg",
    imageFit: "contain",
    status: "Completed study",
    year: "2024",
    stack: ["PyTorch", "MultiBench", "CMU-MOSI", "scikit-learn"],
    capabilities: ["data", "intelligence"],
    github: "https://github.com/imrithwik1908/Tensor-Fusion-Network",
    outcome: "70.4% binary test accuracy",
    outcomeLabel: "Verified notebook output",
    problem: [
      "Sentiment isn't carried by words alone. Tone and expression can reinforce what is said, contradict it, or just add noise. The interesting part is how to combine the three so that each one's signal survives.",
      "The experiments use time-aligned face, voice and word features from CMU-MOSI, and ask the same question three ways rather than presenting one model as the answer.",
    ],
    system: [
      "Each sense gets its own small network first: face and voice are averaged over time and compressed to 32 numbers each, and the words go through an LSTM to 128. Each summary gets a 1 appended, and an outer product multiplies them into 140,481 numbers that hold every combination. Two layers compress that, and a final layer gives the answer.",
      "The repository is an experiment record, not a packaged application: three notebooks, one per task, with their outputs saved.",
    ],
    decisions: [
      {
        title: "Keep modality paths separate first",
        body: "A separate network per sense makes it possible to reason about what each one contributes before they are mixed.",
      },
      {
        title: "Ask the question more than one way",
        body: "Positive-or-negative accuracy can hide how hard fine-grained sentiment is. Running five classes and a continuous score through the same pipeline exposed weaknesses the yes-or-no version hid.",
      },
      {
        title: "Multiply, don't just stack",
        body: "Gluing the three summaries end to end only lets the next layer add their signals. The outer product represents how they interact, and the appended 1 keeps each sense's solo signal alive too.",
      },
    ],
    debugging:
      "Shapes and labels were the fragile parts: a model trains happily while samples, senses or targets are slightly out of step, so the notebooks reshape and convert explicitly. Re-reading the code for this page, I also found that the training loop checks its progress on the test set rather than the validation set. The test set influenced which model was kept, so the numbers below are likely a little optimistic.",
    results: [
      "Positive or negative: 70.4% accuracy and 0.709 F1 on a balanced test set, where guessing gets 50%.",
      "Score from −3 to +3: off by 1.10 on average, with a 0.53 correlation to the true score.",
      "Five classes: 31.9% accuracy, a much harder version of the same question.",
    ],
    limitations: [
      "The work remains in notebooks and is not packaged as a reproducible training application.",
      "The repository does not include the CMU-MOSI feature data or an automated environment setup.",
      "Model selection looked at the test set; the reported numbers would need a clean rerun to be fully trusted.",
      "The five-class result is much weaker than the yes-or-no one and needs tuning and error analysis.",
    ],
    next:
      "I would fix model selection to use validation only, rebuild the three notebooks around one reproducible configuration, and remove one sense at a time to measure what each actually adds.",
    architecture: [
      { label: "Words", detail: "What is said" },
      { label: "Voice", detail: "How it sounds" },
      { label: "Face", detail: "How it looks" },
      { label: "Small networks", detail: "One summary per sense" },
      { label: "Tensor fusion", detail: "Every combination" },
      { label: "Answer", detail: "Three ways to ask" },
    ],
  },
  {
    slug: "course-catalog",
    title: "Course Catalog",
    shortTitle: "Course Catalog",
    eyebrow: "Role-based web application",
    question: "One course system, two very different users.",
    summary:
      "A course-registration web app with separate student and professor experiences. Google sign-in works out the role from the email address; students browse, fill a cart and enroll, and professors see what they teach. Node.js, Express and MongoDB.",
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
      "Express handles Google sign-in, remembers who you are in a session, sends students and professors to their own pages, and builds those pages on the server with EJS. Mongoose defines students, professors and courses and the links between them.",
      "An enrollment is written on both sides: the student lists their courses and each course lists its students. A cart kept in the session separates choosing courses from confirming them.",
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
      "Enrollment touches both the student and the course. The single-course route checks for duplicates before enrolling; the cart's confirm route doesn't, and its saves aren't wrapped in a transaction. A crash halfway, or confirming twice, can leave the two sides disagreeing. The playground above shows exactly how.",
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
      { label: "Google sign-in", detail: "Who you are" },
      { label: "Email check", detail: "Student or professor" },
      { label: "Express", detail: "Pages, session, cart" },
      { label: "EJS", detail: "Pages built on the server" },
      { label: "Mongoose", detail: "Records and their links" },
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
