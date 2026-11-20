// Architecture walkthroughs, one per project. Every block, edge and sentence was written from the
// repository's own code; file paths point at where each step actually happens.

export type FlowNode = { id: string; label: string; file: string; x: number; y: number; w?: number; d?: number; h?: number }
export type FlowStep = { title: string; body: string; file: string; nodes: string[]; edges: [string, string][] }
export type Flow = { nodes: FlowNode[]; edges: [string, string][]; steps: FlowStep[] }

export const flows: Record<string, Flow> = {
  agentguard: {
    nodes: [
      { id: "app", label: "Your LLM app", file: "apps/demo-agent/demo_agent/agent.py", x: 0, y: 3, h: 1.1 },
      { id: "sdk", label: "Python SDK", file: "packages/python-sdk/agentguard/client.py", x: 3, y: 3, h: 0.8 },
      { id: "api", label: "FastAPI", file: "apps/api/agentguard_api/services/trace_ingestion.py", x: 6, y: 3, h: 1.4 },
      { id: "redact", label: "Redaction", file: "apps/api/agentguard_api/services/redaction.py", x: 6, y: 6, w: 1.6, d: 1.6, h: 0.6 },
      { id: "db", label: "PostgreSQL", file: "apps/api/agentguard_api/models/", x: 9, y: 3, h: 1.9 },
      { id: "suite", label: "Test suites", file: "apps/api/agentguard_api/services/datasets.py", x: 9, y: 6, w: 1.8, d: 1.8, h: 0.9 },
      { id: "queue", label: "Redis queue", file: "apps/api/agentguard_api/services/evaluation_jobs.py", x: 6, y: 0, w: 1.8, d: 1.8, h: 0.7 },
      { id: "worker", label: "Worker", file: "apps/api/agentguard_api/worker.py", x: 9, y: 0, h: 1.2 },
      { id: "evals", label: "13 evaluators", file: "apps/api/agentguard_api/services/evaluator_runner.py", x: 12, y: 0, h: 1 },
      { id: "judge", label: "LLM judge", file: "apps/api/agentguard_api/services/llm_judge.py", x: 15, y: 0, w: 1.6, d: 1.6, h: 0.7 },
      { id: "compare", label: "Pairing", file: "apps/api/agentguard_api/services/evaluations.py", x: 12, y: 3, h: 1.2 },
      { id: "gate", label: "Release gate", file: "apps/api/agentguard_api/api/ci.py", x: 15, y: 3, h: 1.6 },
    ],
    edges: [["app", "sdk"], ["sdk", "api"], ["api", "redact"], ["api", "db"], ["suite", "db"], ["api", "queue"], ["queue", "worker"], ["worker", "db"], ["worker", "evals"], ["evals", "judge"], ["db", "compare"], ["compare", "gate"]],
    steps: [
      {
        title: "Instrument the app",
        body: "The app opens a trace and nests spans inside it: plan, retrieve, a summarize-documents tool call inside retrieve, then generate. A context variable keeps a stack of open spans, so each span's parent is simply the one beneath it.",
        file: "packages/python-sdk/agentguard/client.py",
        nodes: ["app", "sdk"], edges: [["app", "sdk"]],
      },
      {
        title: "One request per run",
        body: "When the trace closes, the SDK sends the whole run, every span included, in a single POST to /api/v1/traces with a five-second timeout. If AgentGuard is down, the failure is logged and your app carries on, unless you asked it to raise.",
        file: "packages/python-sdk/agentguard/client.py",
        nodes: ["sdk", "api"], edges: [["sdk", "api"]],
      },
      {
        title: "Refuse bad evidence",
        body: "Before anything is written, the API checks the payload: at most 500 spans, unique span IDs, every parent present in the same payload, no cycles, and sane start and end times. The project and version must belong to the caller's workspace.",
        file: "apps/api/agentguard_api/services/trace_ingestion.py",
        nodes: ["api"], edges: [],
      },
      {
        title: "Redact, then commit atomically",
        body: "The workspace's redaction patterns replace matches with [REDACTED], or drop the field entirely in drop mode. The trace and all of its spans are then inserted in one transaction, parents before children. A repeated external ID is rejected rather than duplicated.",
        file: "apps/api/agentguard_api/services/redaction.py",
        nodes: ["api", "redact", "db"], edges: [["api", "redact"], ["api", "db"]],
      },
      {
        title: "Expectations live apart from runs",
        body: "Test suites hold what should happen: required content, exact answers, sources, expected and forbidden tools, latency budgets, and a critical flag. A run points back to its case through the dataset_case_id in its input.",
        file: "apps/api/agentguard_api/services/datasets.py",
        nodes: ["suite", "db"], edges: [["suite", "db"]],
      },
      {
        title: "Queue the work",
        body: "An evaluation job is one suite, one version and one evaluator, with a row for every case it applies to. It goes onto a Redis queue, so the API answers immediately and the slow part happens elsewhere.",
        file: "apps/api/agentguard_api/services/evaluation_jobs.py",
        nodes: ["api", "queue"], edges: [["api", "queue"]],
      },
      {
        title: "Claim, evaluate, retry",
        body: "A worker claims the oldest queued job with SELECT … FOR UPDATE SKIP LOCKED, so two workers never take the same one. For each case it finds the latest run of that version, evaluates it, and retries up to the job's limit. Jobs stuck running for five minutes go back on the queue.",
        file: "apps/api/agentguard_api/worker.py",
        nodes: ["queue", "worker", "db"], edges: [["queue", "worker"], ["worker", "db"]],
      },
      {
        title: "Thirteen ways to check a run",
        body: "Nine checks are deterministic: required content, exact answer, JSON schema, keyword coverage, required source, expected tool, forbidden tool, runtime success and latency. Four use a rubric judge at temperature 0 that must answer in JSON and passes at a score of 0.8. Each trace is scored once per evaluator.",
        file: "apps/api/agentguard_api/services/evaluator_runner.py",
        nodes: ["worker", "evals", "judge"], edges: [["worker", "evals"], ["evals", "judge"]],
      },
      {
        title: "Pair cases, don't average them",
        body: "Every case is matched with itself across the two versions. Pass to fail is a regression, fail to pass an improvement, and a score drop of 0.05 or more also counts. Evidence on one side only is marked not comparable. Each regression gets a likely failure stage, labelled as correlation, not cause.",
        file: "apps/api/agentguard_api/services/evaluations.py",
        nodes: ["db", "compare"], edges: [["db", "compare"]],
      },
      {
        title: "The verdict is arithmetic",
        body: "Too many paired regressions, a critical case regressing, a pass rate under the minimum, a score drop past the allowance or a runtime failure means BLOCK. Missing evidence without a blocker means REVIEW. Otherwise PASS, and the CI endpoint exits 0 or 1. No model decides whether to ship.",
        file: "apps/api/agentguard_api/api/ci.py",
        nodes: ["compare", "gate"], edges: [["compare", "gate"]],
      },
    ],
  },

  "x-mutest": {
    nodes: [
      { id: "data", label: "Posts + rationales", file: "README.md · HASOC 2020/21, HOLD-Telugu", x: 0, y: 3, h: 1.2 },
      { id: "base", label: "Baselines", file: "codes/xlmr.ipynb · codes/MuriL.ipynb", x: 3, y: 0, w: 1.8, d: 1.8, h: 0.8 },
      { id: "s1", label: "Stage 1", file: "codes/eng_mu_r.ipynb", x: 3, y: 3, h: 1.3 },
      { id: "ngram", label: "n-gram probe", file: "codes/proposed_explainability_method.ipynb", x: 6, y: 3, h: 1.1 },
      { id: "pick", label: "Scores → words", file: "codes/scores_to_rationales.ipynb", x: 9, y: 3, w: 1.8, d: 1.8, h: 0.8 },
      { id: "llm", label: "LLM consults", file: "codes/GPT-4o.ipynb · Llama.ipynb · mistral.ipynb", x: 9, y: 6, h: 1 },
      { id: "s2", label: "Stage 2", file: "codes/training_with_rationales.ipynb", x: 12, y: 3, h: 1.5 },
      { id: "mask", label: "Masking", file: "codes/masking.ipynb", x: 15, y: 1.5, w: 1.7, d: 1.7, h: 0.7 },
      { id: "metrics", label: "Metrics", file: "codes/Token-F1.ipynb · codes/IOU_F1.ipynb", x: 15, y: 4.5, h: 1.2 },
      { id: "lime", label: "LIME", file: "codes/mlr.ipynb", x: 6, y: 0, w: 1.6, d: 1.6, h: 0.6 },
    ],
    edges: [["data", "base"], ["data", "s1"], ["s1", "ngram"], ["ngram", "pick"], ["llm", "pick"], ["pick", "s2"], ["s2", "mask"], ["s2", "metrics"], ["mask", "metrics"], ["base", "lime"]],
    steps: [
      {
        title: "Posts, and the words that justify them",
        body: "English, Hindi and Telugu posts come from HASOC 2020, HASOC 2021 and HOLD-Telugu. Three native annotators mark, word by word, what makes a post hateful or offensive. Agreement is measured with Cohen's kappa for each pair and Fleiss' kappa overall.",
        file: "README.md",
        nodes: ["data"], edges: [],
      },
      {
        title: "Baselines first",
        body: "XLM-RoBERTa and MuRIL are fine-tuned as plain classifiers for 20 epochs. LIME, with 500 samples per post, gives the reference explanation every new method has to beat.",
        file: "codes/xlmr.ipynb · codes/mlr.ipynb",
        nodes: ["data", "base", "lime"], edges: [["data", "base"], ["base", "lime"]],
      },
      {
        title: "Stage 1: teach the model where to look",
        body: "MuRIL's last-layer attention from the [CLS] token, averaged across heads, is pushed toward the human rationale with a binary cross-entropy loss, weighted equally with classification. When a word splits into subwords, every piece inherits the word's label.",
        file: "codes/eng_mu_r.ipynb",
        nodes: ["data", "s1"], edges: [["data", "s1"]],
      },
      {
        title: "Ask each phrase what it does alone",
        body: "Every unigram, bigram and trigram is fed to the trained model on its own. Its score is how far its predicted probabilities sit from the full post's, weighted 0.5, 0.3 and 0.2 by length, averaged for each word and normalized to sum to one.",
        file: "codes/proposed_explainability_method.ipynb",
        nodes: ["s1", "ngram"], edges: [["s1", "ngram"]],
      },
      {
        title: "The closest words carry the label",
        body: "A word whose n-grams alone land closest to the full prediction is doing the work. The lowest-scoring five words become the rationale in posts longer than ten words; in shorter posts, the lower half.",
        file: "codes/scores_to_rationales.ipynb",
        nodes: ["ngram", "pick"], edges: [["ngram", "pick"]],
      },
      {
        title: "Consult the large models",
        body: "GPT-4o, Llama 3.1 405B and Mistral Large, all at temperature 0, are asked two things for each post: label it 1 or 0, and list the hateful or offensive words and phrases. Those lists are the LLM side of the framework.",
        file: "codes/Llama.ipynb · codes/GPT-4o.ipynb · codes/mistral.ipynb",
        nodes: ["llm", "pick"], edges: [["llm", "pick"]],
      },
      {
        title: "Stage 2: retrain on the derived rationales",
        body: "The same attention supervision runs again, now on the derived rationales, with attention weighted 0.7 and classification 0.3, at a learning rate of 2e-5 and 128 tokens.",
        file: "codes/training_with_rationales.ipynb",
        nodes: ["pick", "s2"], edges: [["pick", "s2"]],
      },
      {
        title: "Judge the explanation, not just the label",
        body: "Plausibility asks whether it matches people: Token-F1 over every word, and IOU-F1 over spans that overlap by more than half. Faithfulness asks whether the model relied on it: comprehensiveness hides the rationale behind <mask>, sufficiency keeps only the rationale.",
        file: "codes/masking.ipynb · codes/IOU_F1.ipynb",
        nodes: ["s2", "mask", "metrics"], edges: [["s2", "mask"], ["s2", "metrics"], ["mask", "metrics"]],
      },
    ],
  },

  "tensor-fusion": {
    nodes: [
      { id: "mosi", label: "CMU-MOSI", file: "MultiBench · mosi_raw.pkl", x: 0, y: 3, h: 1.2 },
      { id: "bal", label: "Balanced split", file: "Combination_binary.ipynb", x: 3, y: 3, w: 1.8, d: 1.8, h: 0.7 },
      { id: "v35", label: "35-d stream", file: "SubnetModel", x: 6, y: 0, w: 1.8, d: 1.8, h: 0.9 },
      { id: "a74", label: "74-d stream", file: "SubnetModel", x: 6, y: 3, w: 1.8, d: 1.8, h: 0.9 },
      { id: "txt", label: "Text LSTM", file: "TextModel", x: 6, y: 6, w: 1.8, d: 1.8, h: 1.1 },
      { id: "one", label: "+1", file: "torch.cat(ones, out)", x: 9, y: 3, w: 1.4, d: 1.4, h: 0.5 },
      { id: "fuse", label: "Outer product", file: "TFN.forward · torch.bmm", x: 12, y: 3, w: 2.4, d: 2.4, h: 2.2 },
      { id: "sin", label: "Inference net", file: "TFN.fc1 · fc2", x: 15, y: 3, h: 1 },
      { id: "heads", label: "Three heads", file: "binary · regression · 5-class notebooks", x: 18, y: 3, h: 1.3 },
    ],
    edges: [["mosi", "bal"], ["bal", "v35"], ["bal", "a74"], ["bal", "txt"], ["v35", "one"], ["a74", "one"], ["txt", "one"], ["one", "fuse"], ["fuse", "sin"], ["sin", "heads"]],
    steps: [
      {
        title: "Three streams per clip",
        body: "CMU-MOSI clips are loaded through MultiBench and padded or cut to 50 time steps. Each clip carries a 35-dimension and a 74-dimension stream of frame features, plus 300-dimension word vectors for the transcript.",
        file: "Combination_binary.ipynb",
        nodes: ["mosi"], edges: [],
      },
      {
        title: "Balance before training",
        body: "A clip is positive when its sentiment is zero or above, and clips scored exactly zero are left out. The classes are then balanced: 550 of each for training, 75 for validation and 250 for test.",
        file: "Combination_binary.ipynb",
        nodes: ["mosi", "bal"], edges: [["mosi", "bal"]],
      },
      {
        title: "One small network per modality",
        body: "The two frame streams are averaged over time and pass through three ReLU layers down to 32 numbers each. The transcript runs through a one-layer LSTM of 128 units and two dense layers, ending at 128.",
        file: "SubnetModel · TextModel",
        nodes: ["bal", "v35", "a74", "txt"], edges: [["bal", "v35"], ["bal", "a74"], ["bal", "txt"]],
      },
      {
        title: "The quiet trick: append a 1",
        body: "Each vector gets a constant 1 attached, making them 33, 33 and 129 long. That single 1 is what lets the product below keep every one-modality and two-modality signal, not just the three-way mix.",
        file: "TFN.forward",
        nodes: ["v35", "a74", "txt", "one"], edges: [["v35", "one"], ["a74", "one"], ["txt", "one"]],
      },
      {
        title: "Fuse with an outer product",
        body: "A batched matrix multiply crosses the first two into a 33 × 33 grid, flattens it to 1,089, then crosses that with the text's 129. Every clip becomes 140,481 numbers holding every combination of the three.",
        file: "TFN.forward · torch.bmm",
        nodes: ["one", "fuse"], edges: [["one", "fuse"]],
      },
      {
        title: "Read the sentiment out",
        body: "Two ReLU layers of 128 compress those 140,481 features into something a single head can read.",
        file: "TFN.fc1 · TFN.fc2",
        nodes: ["fuse", "sin"], edges: [["fuse", "sin"]],
      },
      {
        title: "Three heads, three questions",
        body: "Binary: a sigmoid with BCE, Adam at 5e-4, reaching 70.4% accuracy and 0.709 F1 on the balanced test set. Regression: a sigmoid stretched to −3…+3 with MSE, MAE 1.10. Five-class: cross-entropy over five bins, 31.9% accuracy.",
        file: "Combination_binary · Combination_regression · LA_combination_5class",
        nodes: ["sin", "heads"], edges: [["sin", "heads"]],
      },
      {
        title: "What I'd fix first",
        body: "The training loops check progress on the test loader rather than the validation loader, so the model was picked while looking at the test set. The reported numbers are what the notebooks print; a clean rerun would select on validation only.",
        file: "Combination_binary.ipynb",
        nodes: ["bal", "heads"], edges: [],
      },
    ],
  },

  "course-catalog": {
    nodes: [
      { id: "seed", label: "Seeder", file: "seedCourses.js", x: 6, y: 6, w: 1.6, d: 1.6, h: 0.6 },
      { id: "browser", label: "Browser · EJS", file: "views/", x: 0, y: 3, h: 1.1 },
      { id: "google", label: "Google OAuth", file: "config/passport.js", x: 3, y: 0, w: 1.8, d: 1.8, h: 0.9 },
      { id: "role", label: "Role from email", file: "config/passport.js", x: 6, y: 0, w: 1.8, d: 1.8, h: 0.8 },
      { id: "server", label: "Express", file: "server.js", x: 3, y: 3, h: 1.5 },
      { id: "session", label: "Session", file: "express-session · req.session.cart", x: 6, y: 3, w: 1.8, d: 1.8, h: 0.7 },
      { id: "mongo", label: "MongoDB", file: "models/Student.js · Course.js · Professor.js", x: 9, y: 3, h: 1.8 },
    ],
    edges: [["browser", "server"], ["server", "google"], ["google", "role"], ["role", "mongo"], ["server", "session"], ["session", "mongo"], ["server", "mongo"], ["seed", "mongo"]],
    steps: [
      {
        title: "Start clean",
        body: "Every time the server boots, the seeder empties the courses collection and inserts five sample courses.",
        file: "seedCourses.js",
        nodes: ["seed", "mongo"], edges: [["seed", "mongo"]],
      },
      {
        title: "Sign in with Google",
        body: "The browser goes to /auth/google, and Passport's Google strategy comes back with the profile and email.",
        file: "server.js · config/passport.js",
        nodes: ["browser", "server", "google"], edges: [["browser", "server"], ["server", "google"]],
      },
      {
        title: "The email decides the role",
        body: "An address shaped like a roll number at iiitdwd.ac.in is a student; anything else is a professor. The roll number also gives the joining year, which sets the semester, and the branch code: BCS, BDS or BEC. First-time users are created on the spot.",
        file: "config/passport.js",
        nodes: ["google", "role", "mongo"], edges: [["google", "role"], ["role", "mongo"]],
      },
      {
        title: "Remember who, and which kind",
        body: "The session stores only an ID and a role. On each request the right model, Student or Professor, is loaded back from it.",
        file: "config/passport.js",
        nodes: ["server", "session"], edges: [["server", "session"]],
      },
      {
        title: "Browse the catalog",
        body: "The student home page loads enrolled courses and the full catalog. View details fetches one course as JSON, with its professor filled in.",
        file: "server.js · views/student/home.ejs",
        nodes: ["browser", "server", "mongo"], edges: [["browser", "server"], ["server", "mongo"]],
      },
      {
        title: "A cart that lives in the session",
        body: "Add to cart stores the course ID in the session, once. Checkout looks each one up again before showing the list.",
        file: "server.js · views/student/checkout.ejs",
        nodes: ["server", "session"], edges: [["server", "session"]],
      },
      {
        title: "Confirm writes both sides",
        body: "For each course in the cart, the course gains the student and the student gains the course. Each course is saved, then the student, then the cart is cleared.",
        file: "server.js",
        nodes: ["session", "server", "mongo"], edges: [["session", "mongo"], ["server", "mongo"]],
      },
      {
        title: "Where it can break",
        body: "Those saves are separate writes with no transaction around them, so a crash halfway leaves the two sides disagreeing. The student model has a 25-credit limit, and nothing checks it yet. The explorable above lets you cause it, and the duplicates a retry adds.",
        file: "server.js · models/Student.js",
        nodes: ["server", "mongo"], edges: [],
      },
    ],
  },
}
