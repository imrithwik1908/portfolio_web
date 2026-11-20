// System walkthroughs, one per project, written from each repository's own code and told in plain
// language. Each box has a plain name and, underneath, the technology that does the job; `file` is
// where it happens in the repo (shown only as a hover title and a small source line).

export type FlowNode = { id: string; label: string; role: string; file: string; x: number; y: number }
export type FlowStep = { title: string; body: string; file: string; nodes: string[]; edges: [string, string][] }
export type Flow = { nodes: FlowNode[]; edges: [string, string][]; steps: FlowStep[] }

// What is being carried at each step: a short name for the moving dot, one sentence on what it is,
// and a few labelled facts about it. No code; the repository is one click away for that.
export type Packet = { token: string; carries: string; parts: [string, string][]; like?: string }

export const flows: Record<string, Flow> = {
  agentguard: {
    nodes: [
      { id: "app", label: "Your AI app", role: "the thing being tested", file: "apps/demo-agent/demo_agent/agent.py", x: 0, y: 3 },
      { id: "sdk", label: "Recorder", role: "Python SDK", file: "packages/python-sdk/agentguard/client.py", x: 3, y: 3 },
      { id: "api", label: "Front door", role: "FastAPI", file: "apps/api/agentguard_api/services/trace_ingestion.py", x: 6, y: 3 },
      { id: "redact", label: "Privacy filter", role: "redaction", file: "apps/api/agentguard_api/services/redaction.py", x: 6, y: 6 },
      { id: "db", label: "Database", role: "PostgreSQL", file: "apps/api/agentguard_api/models/", x: 9, y: 3 },
      { id: "suite", label: "Test cases", role: "what should happen", file: "apps/api/agentguard_api/services/datasets.py", x: 9, y: 6 },
      { id: "queue", label: "Waiting line", role: "Redis queue", file: "apps/api/agentguard_api/services/evaluation_jobs.py", x: 6, y: 0 },
      { id: "worker", label: "Worker", role: "runs in the background", file: "apps/api/agentguard_api/worker.py", x: 9, y: 0 },
      { id: "evals", label: "13 checks", role: "evaluators", file: "apps/api/agentguard_api/services/evaluator_runner.py", x: 12, y: 0 },
      { id: "judge", label: "AI grader", role: "LLM judge", file: "apps/api/agentguard_api/services/llm_judge.py", x: 15, y: 0 },
      { id: "compare", label: "Side by side", role: "case pairing", file: "apps/api/agentguard_api/services/evaluations.py", x: 12, y: 3 },
      { id: "gate", label: "Release gate", role: "pass · block · review", file: "apps/api/agentguard_api/api/ci.py", x: 15, y: 3 },
    ],
    edges: [["app", "sdk"], ["sdk", "api"], ["api", "redact"], ["api", "db"], ["suite", "db"], ["api", "queue"], ["queue", "worker"], ["worker", "db"], ["worker", "evals"], ["evals", "judge"], ["db", "compare"], ["compare", "gate"]],
    steps: [
      {
        title: "Record what the app does",
        body: "An AI assistant answers a question in steps: it plans, looks up documents, maybe calls a tool, then writes the answer. The recorder wraps each step and notes what went in, what came out and how long it took, nested like folders inside folders. The whole thing is one trace.",
        file: "packages/python-sdk/agentguard/client.py",
        nodes: ["app", "sdk"], edges: [["app", "sdk"]],
      },
      {
        title: "Send it in one piece",
        body: "When the answer is done, the recorder sends the whole trace at once. If AgentGuard can't be reached, the app keeps working: the recorder logs a warning instead of crashing the thing it is watching.",
        file: "packages/python-sdk/agentguard/client.py",
        nodes: ["sdk", "api"], edges: [["sdk", "api"]],
      },
      {
        title: "Turn away bad evidence",
        body: "Before saving anything, the front door checks that the trace makes sense: no more than 500 steps, no duplicate step IDs, every step's parent present, nothing looping back on itself, nothing ending before it starts. It also checks the sender is allowed to write to this project.",
        file: "apps/api/agentguard_api/services/trace_ingestion.py",
        nodes: ["api"], edges: [],
      },
      {
        title: "Hide private data, then save it all at once",
        body: "Text that matches the workspace's privacy patterns is replaced with [REDACTED], or dropped. Then the run and every step are saved in one transaction: either all of it lands or none of it does, so there is never half a trace.",
        file: "apps/api/agentguard_api/services/redaction.py",
        nodes: ["api", "redact", "db"], edges: [["api", "redact"], ["api", "db"]],
      },
      {
        title: "Write down what good looks like",
        body: "Separately, a test suite lists questions and what a good answer needs: phrases it must contain, the right source document, tools it should or shouldn't use, a time limit. Some cases are marked critical. Each recorded run points back to the case it was answering.",
        file: "apps/api/agentguard_api/services/datasets.py",
        nodes: ["suite", "db"], edges: [["suite", "db"]],
      },
      {
        title: "Put the grading in line",
        body: "Grading can be slow, so nobody waits for it. The API creates a job (one test suite, one app version, one kind of check) and puts it in a waiting line. The API answers straight away; the work happens elsewhere.",
        file: "apps/api/agentguard_api/services/evaluation_jobs.py",
        nodes: ["api", "queue"], edges: [["api", "queue"]],
      },
      {
        title: "A worker picks it up",
        body: "A background worker takes the oldest waiting job, and the database locks it as it's taken, so two workers never grade the same job. If a worker dies halfway, the job goes back in line after five minutes.",
        file: "apps/api/agentguard_api/worker.py",
        nodes: ["queue", "worker", "db"], edges: [["queue", "worker"], ["worker", "db"]],
      },
      {
        title: "Thirteen ways to check an answer",
        body: "Nine checks are plain rules: does the answer contain the required words, match exactly, follow the format, cite the right source, use the right tools, finish without errors and in time? Four use another AI as a grader with a fixed rubric. It must reply with a score, and 0.8 or above passes.",
        file: "apps/api/agentguard_api/services/evaluator_runner.py",
        nodes: ["worker", "evals", "judge"], edges: [["worker", "evals"], ["evals", "judge"]],
      },
      {
        title: "Compare case by case, not on average",
        body: "Each test case is matched with itself in the old and the new version. Passed then failed is a regression; failed then passed is an improvement; a score drop of 0.05 or more also counts. When only one side has evidence, the case is marked not comparable instead of guessed.",
        file: "apps/api/agentguard_api/services/evaluations.py",
        nodes: ["db", "compare"], edges: [["db", "compare"]],
      },
      {
        title: "The verdict is arithmetic",
        body: "The release gate applies the team's rules. Too many regressions, a critical case breaking, a low pass rate, a large score drop or a crash means BLOCK. Missing evidence means REVIEW. Otherwise PASS. A deployment pipeline can act on it directly, and no AI makes the final call.",
        file: "apps/api/agentguard_api/api/ci.py",
        nodes: ["compare", "gate"], edges: [["compare", "gate"]],
      },
    ],
  },

  "x-mutest": {
    nodes: [
      { id: "data", label: "Labelled posts", role: "+ words people marked", file: "README.md · HASOC 2020/21, HOLD-Telugu", x: 0, y: 3 },
      { id: "base", label: "Standard models", role: "XLM-R and MuRIL", file: "codes/xlmr.ipynb · codes/MuriL.ipynb", x: 3, y: 0 },
      { id: "lime", label: "LIME", role: "the explainer to beat", file: "codes/mlr.ipynb", x: 6, y: 0 },
      { id: "s1", label: "Training, round 1", role: "follow human marks", file: "codes/eng_mu_r.ipynb", x: 3, y: 3 },
      { id: "ngram", label: "Phrase probe", role: "1, 2 and 3 words", file: "codes/proposed_explainability_method.ipynb", x: 6, y: 3 },
      { id: "pick", label: "Pick the words", role: "closest to the whole", file: "codes/scores_to_rationales.ipynb", x: 9, y: 3 },
      { id: "llm", label: "Ask large LLMs", role: "GPT-4o, Llama, Mistral", file: "codes/GPT-4o.ipynb · Llama.ipynb · mistral.ipynb", x: 9, y: 6 },
      { id: "s2", label: "Training, round 2", role: "derived rationales", file: "codes/training_with_rationales.ipynb", x: 12, y: 3 },
      { id: "mask", label: "Masking test", role: "is it faithful?", file: "codes/masking.ipynb", x: 15, y: 1.5 },
      { id: "metrics", label: "Scores", role: "is it plausible?", file: "codes/Token-F1.ipynb · codes/IOU_F1.ipynb", x: 15, y: 4.5 },
    ],
    edges: [["data", "base"], ["data", "s1"], ["s1", "ngram"], ["ngram", "pick"], ["llm", "pick"], ["pick", "s2"], ["s2", "mask"], ["s2", "metrics"], ["mask", "metrics"], ["base", "lime"]],
    steps: [
      {
        title: "Posts, and the words that make them hateful",
        body: "English, Hindi and Telugu posts come from public research datasets. Three native speakers marked each post word by word: which words make it hateful or offensive. Those marks are the rationale. Where the annotators disagreed, they talked it through and annotated again.",
        file: "README.md",
        nodes: ["data"], edges: [],
      },
      {
        title: "Start from the usual approach",
        body: "Two standard multilingual models, XLM-RoBERTa and MuRIL, are trained as plain classifiers. LIME, a widely used explainer, guesses which words mattered by deleting words at random and watching the prediction move. That is the explanation the new method has to beat.",
        file: "codes/xlmr.ipynb · codes/mlr.ipynb",
        nodes: ["data", "base", "lime"], edges: [["data", "base"], ["base", "lime"]],
      },
      {
        title: "Round 1: teach the model where to look",
        body: "Language models have attention, a built-in measure of which words they focus on. During training, the model is graded on two things equally: getting the label right, and putting its attention on the words the people marked.",
        file: "codes/eng_mu_r.ipynb",
        nodes: ["data", "s1"], edges: [["data", "s1"]],
      },
      {
        title: "Ask each phrase what it means alone",
        body: "The trained model is shown every single word, every pair and every triple from the post, one at a time. A fragment that gets nearly the same verdict as the whole post on its own is carrying the meaning. Single words count most, then pairs, then triples.",
        file: "codes/proposed_explainability_method.ipynb",
        nodes: ["s1", "ngram"], edges: [["s1", "ngram"]],
      },
      {
        title: "The closest words become the explanation",
        body: "The words whose fragments land closest to the whole post's verdict are doing the work. In a post longer than ten words, the five closest become the model's rationale; in a shorter post, the closest half.",
        file: "codes/scores_to_rationales.ipynb",
        nodes: ["ngram", "pick"], edges: [["ngram", "pick"]],
      },
      {
        title: "Ask the large models too",
        body: "GPT-4o, Llama 3.1 and Mistral Large are each asked to label the post and list its hateful words, with randomness turned off. In the paper's final setup, Llama 3.1's list is merged with the model's own picks, so each covers what the other misses.",
        file: "codes/Llama.ipynb · codes/GPT-4o.ipynb · codes/mistral.ipynb",
        nodes: ["llm", "pick"], edges: [["llm", "pick"]],
      },
      {
        title: "Round 2: train on the merged explanation",
        body: "The same attention training runs again, now aiming at the merged rationale, and leaning harder on attention than on the label.",
        file: "codes/training_with_rationales.ipynb",
        nodes: ["pick", "s2"], edges: [["pick", "s2"]],
      },
      {
        title: "Grade the explanation, not only the label",
        body: "Two questions. Is it plausible: does it match what people marked? Is it faithful: does the model really rely on it? Hide those words and the verdict should weaken; keep only those words and it should hold.",
        file: "codes/masking.ipynb · codes/IOU_F1.ipynb",
        nodes: ["s2", "mask", "metrics"], edges: [["s2", "mask"], ["s2", "metrics"], ["mask", "metrics"]],
      },
    ],
  },

  "tensor-fusion": {
    nodes: [
      { id: "mosi", label: "Video clips", role: "CMU-MOSI", file: "MultiBench · mosi_raw.pkl", x: 0, y: 3 },
      { id: "bal", label: "Fair split", role: "equal pos and neg", file: "Combination_binary.ipynb", x: 3, y: 3 },
      { id: "v35", label: "Face", role: "35 numbers a moment", file: "SubnetModel", x: 6, y: 0 },
      { id: "a74", label: "Voice", role: "74 numbers a moment", file: "SubnetModel", x: 6, y: 3 },
      { id: "txt", label: "Words", role: "read in order (LSTM)", file: "TextModel", x: 6, y: 6 },
      { id: "one", label: "Add a 1", role: "the quiet trick", file: "TFN.forward", x: 9, y: 3 },
      { id: "fuse", label: "Multiply all", role: "outer product", file: "TFN.forward", x: 12, y: 3 },
      { id: "sin", label: "Compress", role: "140,481 → 128", file: "TFN.fc1 · fc2", x: 15, y: 3 },
      { id: "heads", label: "Answer", role: "three ways to ask", file: "binary · regression · 5-class notebooks", x: 18, y: 3 },
    ],
    edges: [["mosi", "bal"], ["bal", "v35"], ["bal", "a74"], ["bal", "txt"], ["v35", "one"], ["a74", "one"], ["txt", "one"], ["one", "fuse"], ["fuse", "sin"], ["sin", "heads"]],
    steps: [
      {
        title: "Three streams per clip",
        body: "CMU-MOSI is a set of short videos of people giving opinions, each scored for sentiment from −3 (very negative) to +3 (very positive). Every clip arrives as three streams: facial-expression features, voice features, and the words spoken.",
        file: "Combination_binary.ipynb",
        nodes: ["mosi"], edges: [],
      },
      {
        title: "Make it fair before training",
        body: "For the positive-or-negative version, clips scored exactly zero are dropped. Positives and negatives are then made equal, so the model can't score well by always guessing one side.",
        file: "Combination_binary.ipynb",
        nodes: ["mosi", "bal"], edges: [["mosi", "bal"]],
      },
      {
        title: "One small network per sense",
        body: "Face and voice are averaged over time and squeezed by three small layers down to 32 numbers each. The words go through an LSTM, a network that reads a sentence in order, and come out as 128 numbers.",
        file: "SubnetModel · TextModel",
        nodes: ["bal", "v35", "a74", "txt"], edges: [["bal", "v35"], ["bal", "a74"], ["bal", "txt"]],
      },
      {
        title: "The quiet trick: add a 1",
        body: "Each summary gets one extra number at the front, a constant 1. It looks like nothing. The next step shows why it matters, and the playground below lets you switch it off.",
        file: "TFN.forward",
        nodes: ["v35", "a74", "txt", "one"], edges: [["v35", "one"], ["a74", "one"], ["txt", "one"]],
      },
      {
        title: "Multiply every number by every other",
        body: "Every face number is multiplied by every voice number and every word number. Because each list carries that 1, the result also keeps face alone, voice alone, words alone and every pair, not only the three-way mix.",
        file: "TFN.forward",
        nodes: ["one", "fuse"], edges: [["one", "fuse"]],
      },
      {
        title: "Squeeze it back down",
        body: "Two layers compress those 140,481 numbers into 128, a summary small enough for one final layer to read.",
        file: "TFN.fc1 · TFN.fc2",
        nodes: ["fuse", "sin"], edges: [["fuse", "sin"]],
      },
      {
        title: "Three ways to ask the question",
        body: "The same pipeline answers three versions of the question: positive or negative, a score from −3 to +3, and one of five sentiment bins. The yes-or-no version is right 70.4% of the time on a balanced test set, where guessing gets 50%.",
        file: "Combination_binary · Combination_regression · LA_combination_5class",
        nodes: ["sin", "heads"], edges: [["sin", "heads"]],
      },
      {
        title: "What I'd fix first",
        body: "The training loop checks its progress on the test set instead of the validation set, so the test set influenced which model was kept. The numbers are what the notebooks print; a clean rerun would choose using validation only and touch the test set once.",
        file: "Combination_binary.ipynb",
        nodes: ["bal", "heads"], edges: [],
      },
    ],
  },

  "course-catalog": {
    nodes: [
      { id: "seed", label: "Sample courses", role: "seeder", file: "seedCourses.js", x: 6, y: 6 },
      { id: "browser", label: "Browser", role: "pages (EJS)", file: "views/", x: 0, y: 3 },
      { id: "google", label: "Google sign-in", role: "OAuth", file: "config/passport.js", x: 3, y: 0 },
      { id: "role", label: "Student or prof?", role: "read from the email", file: "config/passport.js", x: 6, y: 0 },
      { id: "server", label: "Server", role: "Express", file: "server.js", x: 3, y: 3 },
      { id: "session", label: "Session", role: "short-term memory", file: "express-session · req.session.cart", x: 6, y: 3 },
      { id: "mongo", label: "Database", role: "MongoDB", file: "models/Student.js · Course.js · Professor.js", x: 9, y: 3 },
    ],
    edges: [["browser", "server"], ["server", "google"], ["google", "role"], ["role", "mongo"], ["server", "session"], ["session", "mongo"], ["server", "mongo"], ["seed", "mongo"]],
    steps: [
      {
        title: "Start clean",
        body: "Every time the server starts, it empties the course list and adds five sample courses.",
        file: "seedCourses.js",
        nodes: ["seed", "mongo"], edges: [["seed", "mongo"]],
      },
      {
        title: "Sign in with Google",
        body: "There are no passwords to store. The student clicks sign in, Google confirms who they are and sends back their name and email.",
        file: "server.js · config/passport.js",
        nodes: ["browser", "server", "google"], edges: [["browser", "server"], ["server", "google"]],
      },
      {
        title: "The email decides the role",
        body: "An IIIT Dharwad address shaped like a roll number means student; anything else means professor. The roll number also gives away the joining year, and so the semester, plus the branch. First-time users get an account on the spot.",
        file: "config/passport.js",
        nodes: ["google", "role", "mongo"], edges: [["google", "role"], ["role", "mongo"]],
      },
      {
        title: "Remember who, and which kind",
        body: "The session remembers only two things: your ID, and whether you're a student or a professor. Every page load fetches the rest fresh from the database.",
        file: "config/passport.js",
        nodes: ["server", "session"], edges: [["server", "session"]],
      },
      {
        title: "Browse the catalog",
        body: "The student's home page shows what they're enrolled in and every course on offer. View details fetches one course along with its professor.",
        file: "server.js · views/student/home.ejs",
        nodes: ["browser", "server", "mongo"], edges: [["browser", "server"], ["server", "mongo"]],
      },
      {
        title: "A cart, like a shop",
        body: "Adding a course puts it in a cart kept in the session, once only. Checkout looks each course up again before showing the list.",
        file: "server.js · views/student/checkout.ejs",
        nodes: ["server", "session"], edges: [["server", "session"]],
      },
      {
        title: "Confirm writes both sides",
        body: "Enrollment is recorded twice: the course lists the student, and the student lists the course. Each course is saved, then the student, then the cart is emptied.",
        file: "server.js",
        nodes: ["session", "server", "mongo"], edges: [["session", "mongo"], ["server", "mongo"]],
      },
      {
        title: "Where it can break",
        body: "Those saves are separate, with nothing tying them together. A crash between them leaves the course and the student disagreeing, and confirming again adds duplicates. A 25-credit limit is defined but nothing checks it yet. The playground below lets you cause it.",
        file: "server.js · models/Student.js",
        nodes: ["server", "mongo"], edges: [],
      },
    ],
  },
}

export const packets: Record<string, Packet[]> = {
  agentguard: [
    { token: "trace", carries: "One answer, recorded step by step.", parts: [["Question", "What is the refund window?"], ["Steps", "plan → look up → summarize → answer"], ["Each step keeps", "input, output, timing, kind"]], like: "A flight recorder for a single answer." },
    { token: "trace", carries: "The whole run, sent in one request.", parts: [["Sent", "once, when the answer is finished"], ["Waits at most", "5 seconds"], ["If it fails", "the app carries on"]] },
    { token: "check", carries: "A trace being inspected at the door.", parts: [["Steps", "4, limit 500 ✓"], ["Step IDs", "all unique ✓"], ["Parents", "all present ✓"], ["Timing", "nothing ends before it starts ✓"]], like: "A bouncer with a checklist." },
    { token: "save", carries: "The trace, cleaned and saved as one unit.", parts: [["Before", "Email jane@… about the refund"], ["After", "Email [REDACTED] about the refund"], ["Saved", "1 run and 4 steps, together"], ["If anything fails", "nothing is saved"]] },
    { token: "case", carries: "One test case: a question and its answer key.", parts: [["Case", "refund window"], ["Must mention", "30 days"], ["Critical", "yes"]], like: "The answer key a teacher grades against." },
    { token: "job", carries: "A grading job waiting its turn.", parts: [["Check", "is the answer grounded in the documents?"], ["Version", "the candidate"], ["Cases", "every case it applies to"], ["Tries", "up to 2"]] },
    { token: "claim", carries: "A worker taking the next job.", parts: [["Takes", "the oldest waiting job"], ["Other workers", "skip it while it's locked"], ["Stuck over 5 min", "goes back in line"]], like: "Pulling the next ticket off a kitchen rail." },
    { token: "score", carries: "One answer, graded.", parts: [["Rule-based checks", "9"], ["AI-graded checks", "4, with a fixed rubric"], ["Example", "0.72, fails (needs 0.8)"], ["Grader's reason", "cites a document it never looked up"]] },
    { token: "pairs", carries: "Each case, old version next to new.", parts: [["Case 5", "pass → fail · regressed"], ["Case 6", "fail → pass · improved"], ["Case 8", "pass → fail · regressed"], ["Everything else", "unchanged"]] },
    { token: "verdict", carries: "The release decision, with its reason.", parts: [["Decision", "BLOCK"], ["Because", "2 regressions, 0 allowed"], ["Pipeline", "stops the release"]] },
  ],
  "x-mutest": [
    { token: "post", carries: "A post, its label, and the words that justify it.", parts: [["Label", "hateful or offensive, or not"], ["Rationale", "a mark on each word people flagged"], ["Marked by", "3 native speakers"], ["Languages", "English, Hindi, Telugu"]], like: "A highlighter over the words that earn the label." },
    { token: "model", carries: "Two standard classifiers and a reference explainer.", parts: [["Models", "XLM-RoBERTa, MuRIL"], ["Task", "hateful or not"], ["LIME", "500 altered copies of each post"]] },
    { token: "focus", carries: "A model learning where to look.", parts: [["Goal 1", "the right label · half the grade"], ["Goal 2", "attention on marked words · half"], ["Split words", "every piece inherits the word's mark"]] },
    { token: "phrases", carries: "Every fragment of the post, tried on its own.", parts: [["Single words", "count most (0.5)"], ["Pairs", "0.3"], ["Triples", "0.2"], ["Score", "how far each sits from the whole post"]] },
    { token: "words", carries: "The words that carry the verdict.", parts: [["Long post", "the 5 closest words"], ["10 words or fewer", "the closest half"], ["Output", "one mark per word, like the human marks"]] },
    { token: "LLM", carries: "Second opinions from large language models.", parts: [["Asked", "label it, list the hateful words"], ["Models", "GPT-4o, Llama 3.1, Mistral Large"], ["Randomness", "off"], ["Kept", "Llama 3.1's list, merged in"]] },
    { token: "focus", carries: "The same lesson, with a better answer key.", parts: [["Target", "the merged rationale"], ["Attention", "70% of the grade"], ["Label", "30%"]] },
    { token: "grades", carries: "Two grades for one explanation.", parts: [["Plausible", "overlaps with what people marked"], ["Hide the words", "the verdict should weaken"], ["Keep only them", "the verdict should hold"]] },
  ],
  "tensor-fusion": [
    { token: "clip", carries: "One video clip, as three streams of numbers.", parts: [["Face", "35 numbers per moment"], ["Voice", "74 numbers per moment"], ["Words", "300 numbers per word"], ["Score", "−3 to +3"]] },
    { token: "split", carries: "A training set where both answers are equally common.", parts: [["Train", "550 positive, 550 negative"], ["Tune", "75 and 75"], ["Test", "250 and 250"], ["Guessing scores", "50%"]] },
    { token: "summaries", carries: "Three short summaries, one per sense.", parts: [["Face", "→ 32 numbers"], ["Voice", "→ 32 numbers"], ["Words", "→ 128 numbers"]] },
    { token: "+1", carries: "The same summaries, each one number longer.", parts: [["Face", "32 → 33"], ["Voice", "32 → 33"], ["Words", "128 → 129"]] },
    { token: "fused", carries: "Every combination of the three, in one long list.", parts: [["Face × voice", "33 × 33 = 1,089"], ["× words", "1,089 × 129 = 140,481"], ["Thanks to the 1", "solo and paired signals survive"]], like: "A multiplication table, in three dimensions." },
    { token: "128", carries: "The combinations, compressed.", parts: [["In", "140,481 numbers"], ["Out", "128 numbers"]] },
    { token: "answer", carries: "Three versions of the same question.", parts: [["Positive or negative", "70.4% right · F1 0.709"], ["Score from −3 to +3", "off by 1.10 on average"], ["One of five bins", "31.9% right"]] },
    { token: "note", carries: "A flaw I found re-reading my own code.", parts: [["Now", "picks the model while watching the test set"], ["Should", "pick on validation, test once at the end"], ["So", "read the scores as slightly optimistic"]] },
  ],
  "course-catalog": [
    { token: "seed", carries: "Five sample courses, fresh on every start.", parts: [["Clears", "every course"], ["Adds", "CS101 to CS105"]] },
    { token: "login", carries: "A sign-in handed off to Google.", parts: [["Asks Google for", "name and email"], ["Passwords stored", "none"]] },
    { token: "role", carries: "An email, read for clues.", parts: [["Roll-number address", "student"], ["Any other address", "professor"], ["From the roll number", "year, semester, branch"], ["First visit", "account created"]] },
    { token: "session", carries: "A small note the server keeps between pages.", parts: [["Remembers", "ID and role"], ["Every page", "loads the rest from the database"]] },
    { token: "course", carries: "Course details for one page.", parts: [["Home page", "your courses and all courses"], ["Details", "one course and its professor"]] },
    { token: "cart", carries: "A shopping cart for courses.", parts: [["Adds", "a course, once"], ["Kept in", "the session"], ["Checkout", "looks every course up again"]] },
    { token: "writes", carries: "One enrollment, written in two places.", parts: [["First", "each course adds the student"], ["Then", "the student adds the courses"], ["Last", "the cart is emptied"]] },
    { token: "gap", carries: "The weak spots, stated plainly.", parts: [["Separate saves", "a crash can leave half an enrollment"], ["No re-check", "confirming twice adds duplicates"], ["25-credit limit", "defined, never enforced"]] },
  ],
}
