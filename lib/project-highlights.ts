// Card-level highlights. Each figure is checked against its source:
// AgentGuard from the recorded demo (lib/agentguard-demo.json) and evaluations.py,
// X-MuTeST from the repository README, Tensor Fusion from Combination_binary.ipynb output,
// Course Catalog from the repository's models and routes.
export type Highlight = { value: string; count?: { to: number; decimals?: number; suffix?: string }; label: string }

export const projectMeta: Record<string, { tint: string; accent: string; tagline: string; highlights: Highlight[] }> = {
  agentguard: {
    tint: "#e9e8f5",
    accent: "#3d3fd6",
    tagline: "Regression tests and a release gate for LLM applications.",
    highlights: [
      { value: "2", count: { to: 2 }, label: "regressions caught in the recorded demo, despite most checks passing" },
      { value: "3", count: { to: 3 }, label: "release outcomes (PASS, BLOCK, REVIEW), each with stored reasons; an LLM never makes the call" },
    ],
  },
  "x-mutest": {
    tint: "#f5ecdb",
    accent: "#c8741b",
    tagline: "Explainable hate-speech detection with human rationales.",
    highlights: [
      { value: "AAAI 2026", label: "published in the conference proceedings" },
      { value: "3", count: { to: 3 }, label: "languages with token-level rationales: English, Hindi, Telugu" },
    ],
  },
  "tensor-fusion": {
    tint: "#e2eeeb",
    accent: "#13806f",
    tagline: "Sentiment from language, voice and facial expression.",
    highlights: [
      { value: "70.4%", count: { to: 70.4, decimals: 1, suffix: "%" }, label: "binary test accuracy in the checked-in notebook" },
      { value: "0.709", count: { to: 0.7087, decimals: 3 }, label: "F1 score on the same run" },
    ],
  },
  "course-catalog": {
    tint: "#f3e4dd",
    accent: "#bf4f2c",
    tagline: "One course system for two very different users.",
    highlights: [
      { value: "2", count: { to: 2 }, label: "role-specific flows, chosen at Google sign-in" },
      { value: "Refs, not copies", label: "students, professors and courses share one MongoDB model" },
    ],
  },
}
