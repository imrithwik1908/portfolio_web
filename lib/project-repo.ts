// Detail drawn directly from each GitHub repository: README, file tree, source files, notebook
// outputs and GitHub's language breakdown. Nothing here is paraphrased beyond what the repo states.

export type RepoDetail = {
  languages: { name: string; share: number }[]
  files: number
  facts: { value: string; label: string }[]
  features: { title: string; body: string }[]
  layout: { path: string; role: string }[]
  table?: { caption: string; head: string[]; rows: string[][] }
  run?: { label: string; code: string }
  note?: string
}

export const repoDetail: Record<string, RepoDetail> = {
  agentguard: {
    languages: [{ name: "Python", share: 54.8 }, { name: "TypeScript", share: 44.5 }, { name: "Other", share: 0.7 }],
    files: 208,
    facts: [
      { value: "6", label: "steps: instrument, run, evaluate, compare, diagnose, release" },
      { value: "4", label: "pairing outcomes: regressed, improved, unchanged, not comparable" },
      { value: "8", label: "API test modules, including PostgreSQL integration tests" },
    ],
    features: [
      { title: "Fail-open Python SDK", body: "Decorators and context managers capture runs, retrievals and LLM calls. If AgentGuard is down, the SDK logs a structured warning instead of crashing the app it instruments." },
      { title: "OpenAI-compatible auto-instrumentation", body: "Wrapping the client records model, provider, latency, token usage and errors. Provider secrets are never copied into telemetry." },
      { title: "Deterministic and LLM-judge evaluators", body: "Exact answer, required content, structured output, keyword coverage, expected and forbidden tools, required source, runtime and latency, plus rubric-based judges whose provenance is stored as evidence, not ground truth." },
      { title: "Release policy with reasons", body: "PASS, BLOCK or REVIEW from paired regressions, critical cases, pass rate, score drop, coverage, runtime failures and required evidence. Missing evidence produces REVIEW, never an invented pass." },
      { title: "Runs without a paid model", body: "Deterministic-only mode is the default; an optional local Ollama judge uses its OpenAI-compatible endpoint with no API key." },
      { title: "Deployed", body: "Next.js frontend on Vercel; FastAPI, PostgreSQL and Redis defined for Render. The free API can take up to a minute to wake." },
    ],
    layout: [
      { path: "apps/api", role: "Async FastAPI + SQLAlchemy service, Alembic migrations, worker and tests" },
      { path: "apps/web", role: "Next.js web app for suites, comparisons and release decisions" },
      { path: "packages/python-sdk", role: "Installable SDK and OpenAI-compatible integration" },
      { path: "apps/demo-agent", role: "Deterministic demo application" },
      { path: "examples/", role: "Customer-support RAG (30 cases), Alice's support assistant, incident briefing" },
      { path: "docs/", role: "Architecture, evaluations, deployment, SDK and ADRs" },
    ],
    run: { label: "Run locally (Docker Compose)", code: "cp .env.example .env\ndocker compose up --build" },
  },
  "x-mutest": {
    languages: [{ name: "Jupyter Notebook", share: 100 }],
    files: 17,
    facts: [
      { value: "~16.8K", label: "samples: over 4.5K Telugu, 6K Hindi and 6.3K English" },
      { value: "3", label: "native-speaker annotators per sample" },
      { value: "1st", label: "token-level rationale benchmark for Telugu hate speech, per the paper" },
    ],
    features: [
      { title: "Two-stage explainability", body: "Stage one guides model attention with human rationales; stage two refines it with n-gram explainability scores computed from prediction changes across unigrams, bigrams and trigrams." },
      { title: "LLM-consulted explanations", body: "Model-derived rationales are combined with explanations from LLaMA 3.1. The repository also contains notebooks for GPT-4o and Mistral rationales." },
      { title: "Explanation metrics", body: "Plausibility through Token-F1 and IOU-F1, faithfulness through comprehensiveness and sufficiency, each in its own notebook." },
      { title: "Built on shared tasks", body: "Extends HASOC 2020, HASOC 2021 and HOLD-Telugu 2024 data. The dataset is released for research only, through a controlled-access request form." },
    ],
    layout: [
      { path: "codes/training_with_rationales.ipynb", role: "Stage one: training with human rationales" },
      { path: "codes/proposed_explainability_method.ipynb", role: "The n-gram explainability method" },
      { path: "codes/MuriL.ipynb · xlmr.ipynb", role: "Encoder baselines per language" },
      { path: "codes/Llama.ipynb · GPT-4o.ipynb · mistral.ipynb", role: "LLM rationale generation" },
      { path: "codes/Token-F1.ipynb · IOU_F1.ipynb", role: "Plausibility metrics" },
    ],
    table: {
      caption: "Inter-annotator agreement (Cohen's kappa pairwise, Fleiss' kappa overall), from the repository README",
      head: ["Language", "A1 & A2", "A2 & A3", "A3 & A1", "Overall"],
      rows: [["Telugu", "82.50", "87.75", "88.25", "81.00"], ["Hindi", "86.45", "88.00", "79.20", "83.15"], ["English", "87.60", "82.00", "89.30", "85.10"]],
    },
    note: "The dataset contains offensive text and is available to researchers on request; this site shows no samples from it.",
  },
  "tensor-fusion": {
    languages: [{ name: "Jupyter Notebook", share: 100 }],
    files: 4,
    facts: [
      { value: "0.7040", label: "binary test accuracy, F1 0.7087" },
      { value: "0.3192", label: "five-class test accuracy" },
      { value: "1.1014", label: "regression test MAE, with correlation r = 0.5282" },
    ],
    features: [
      { title: "Three target shapes", body: "The same fused representation is trained for binary sentiment, five-class sentiment and continuous regression, each in its own notebook." },
      { title: "Sequence encoders per modality", body: "Language, acoustic and visual feature sequences are encoded with LSTM layers before fusion." },
      { title: "An honest record", body: "The repository is an experimental notebook record, not a packaged application, and it does not include the CMU-MOSEI features." },
    ],
    layout: [
      { path: "Combination_binary.ipynb", role: "Binary sentiment: positive or negative" },
      { path: "LA_combination_5class.ipynb", role: "Five-class sentiment" },
      { path: "Combination_regression.ipynb", role: "Continuous sentiment score" },
    ],
    table: {
      caption: "Held-out results printed in the checked-in notebooks",
      head: ["Task", "Metric", "Result"],
      rows: [["Binary", "Accuracy / F1", "0.7040 / 0.7087"], ["Five-class", "Accuracy", "0.3192"], ["Regression", "MAE / r", "1.1014 / 0.5282"]],
    },
  },
  "course-catalog": {
    languages: [{ name: "JavaScript", share: 56.9 }, { name: "EJS", share: 37.4 }, { name: "CSS", share: 5.7 }],
    files: 12,
    facts: [
      { value: "10", label: "Express routes, from sign-in to enrollment" },
      { value: "3", label: "Mongoose models: Student, Professor, Course" },
      { value: "25", label: "default student credit limit in the Student schema" },
    ],
    features: [
      { title: "Role chosen at sign-in", body: "Passport's Google strategy checks the email against the IIIT Dharwad student address pattern, creates a Student or Professor record on first sign-in, and the callback routes each to their own home." },
      { title: "Cart before commitment", body: "Courses are added to a session-backed cart, reviewed at checkout, then confirmed. Confirmation enrolls each course and clears the cart." },
      { title: "Two-sided references", body: "Course keeps enrolledStudents and Student keeps enrolledCourses, both as ObjectId references, with a duplicate check before enrolling." },
      { title: "Seeded catalog", body: "On start, the server seeds five courses (CS101 to CS105) with codes and credits." },
    ],
    layout: [
      { path: "server.js", role: "Express app, sessions, Passport and all routes" },
      { path: "config/passport.js", role: "Google OAuth strategy; email pattern decides the role" },
      { path: "models/", role: "Student, Professor and Course schemas" },
      { path: "views/", role: "EJS pages: landing, student home and checkout, professor home" },
      { path: "seedCourses.js", role: "Seeds the five demo courses" },
    ],
    table: {
      caption: "Routes defined in server.js",
      head: ["Method", "Path", "Purpose"],
      rows: [
        ["GET", "/", "Landing page"],
        ["GET", "/auth/google", "Start Google sign-in"],
        ["GET", "/google/callback", "Route by role after sign-in"],
        ["GET", "/student/home", "Enrolled and available courses"],
        ["GET", "/professor/home", "Courses taught by this professor"],
        ["GET", "/student/course/:id", "Course detail as JSON"],
        ["POST", "/student/addToCart", "Add a course to the session cart"],
        ["GET", "/student/checkout", "Review the cart"],
        ["POST", "/student/confirm", "Enroll in every course in the cart"],
        ["POST", "/student/enroll/:courseId", "Enroll in one course"],
      ],
    },
  },
}

export const xmutestBibtex = `@article{Rehman_Kasu_Koppula_Chirra_Singh_Kumar_2026,
title={X-MuTeST: A Multilingual Benchmark for Explainable Hate Speech Detection and a Novel LLM-Consulted Explanation Framework},
volume={40},
url={https://ojs.aaai.org/index.php/AAAI/article/view/41261},
DOI={10.1609/aaai.v40i46.41261}, number={46},
journal={Proceedings of the AAAI Conference on Artificial Intelligence},
author={Rehman, Mohammad Zia Ur and Kasu, Sai Kartheek Reddy and Koppula, Shashivardhan Reddy and Chirra, Sai Rithwik Reddy and Singh, Shwetank Shekhar and Kumar, Nagendra},
year={2026},
month={Mar.},
pages={39134-39142} }`
