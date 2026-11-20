// Everything the "Ask about me" assistant is allowed to know, assembled from the same data the site
// renders. Nothing is written here that the site doesn't already say; if it isn't in this text, the
// assistant says it doesn't know.

import { earlierExperience, experiences, projects } from "@/lib/portfolio-data"
import { plain } from "@/lib/plain"
import { flows } from "@/lib/flows"
import { repoDetail } from "@/lib/project-repo"

const EDUCATION = `## Education
- M.S. in Computer Science, Arizona State University, Tempe, Arizona. Fall 2025 to May 2027 (expected graduation May 2027). GPA 4.22 on a 4.0 scale (ASU counts an A+ as 4.33). Coursework: Data Mining, Data Visualization, Distributed Database Systems. Building AgentGuard during the master's. A current course project (CSE 598) is a chess agent that plays without seeing most of the board.
- B.Tech in Computer Science, Indian Institute of Information Technology (IIIT) Dharwad, India. 2021 to May 2025. GPA 8.94 out of 10. Coursework: Data Analytics, Artificial Intelligence, Operating Systems. Research at IIT Indore during the degree became the X-MuTeST paper.`

const ABOUT = `## About him (his own words, from the site)
- He got into computer science through machine learning; what kept him there was everything around the model.
- At IIT Indore a model could get the label right and still be wrong about why; checking which words it leaned on, in three languages, taught him not to trust a good number until he can explain it.
- Blackcoffer was messy business data with no clean benchmark and someone waiting on a forecast; he learned to ask what the data can support before reaching for a model.
- AgentGuard exists because an average score can go up while the cases you care about quietly break.
- Away from code he likes mysteries, slow-burn suspense and attentive horror; same itch as debugging.
- Toolkit: Python (home), TypeScript and JavaScript for front ends; FastAPI, PostgreSQL, Redis/ARQ, Next.js (AgentGuard); PyTorch, Hugging Face, MuRIL, XLM-R, LLaMA 3.1 (X-MuTeST); PyTorch, scikit-learn (Tensor Fusion); time-series forecasting (Blackcoffer); Node.js, Express, MongoDB, Google OAuth (Course Catalog); also Flask and Neo4j in practice repos.`

const CONTACT = `## Contact and links
- Email: sairithwikreddy.chirra@gmail.com
- GitHub: https://github.com/imrithwik1908
- LinkedIn: https://www.linkedin.com/in/sairithwikreddy
- Résumé: the "Open my résumé" button on the home page.
- He is based in Tempe, Arizona, and is looking for ML engineering and data science roles.
- Do not give out a phone number; there isn't one on the site.`

function projectBlock(slug: string) {
  const p = projects.find((x) => x.slug === slug)!
  const s = plain[slug]
  const r = repoDetail[slug]
  const f = flows[slug]
  return [
    `## Project: ${p.title} (${p.eyebrow}, ${p.year}) — page: /projects/${p.slug}`,
    `Status: ${p.status}. Stack: ${p.stack.join(", ")}. Source: ${p.github}${p.live ? `. Live app: ${p.live}` : ""}${p.paper ? `. Paper: ${p.paper}` : ""}.`,
    `Summary: ${p.summary}`,
    `What it is: ${s.what}`,
    `How it's built: ${s.how}`,
    `Why it matters: ${s.why}`,
    `Problem: ${p.problem.join(" ")}`,
    `System: ${p.system.join(" ")}`,
    `Decisions: ${p.decisions.map((d) => `${d.title}: ${d.body}`).join(" ")}`,
    `Debugging: ${p.debugging}`,
    `Results: ${p.results.join(" ")}`,
    `Limits: ${p.limitations.join(" ")}`,
    `Next: ${p.next}`,
    `Facts: ${r.facts.map((x) => `${x.value} ${x.label}`).join("; ")}.`,
    `How it runs, step by step: ${f.steps.map((st, i) => `(${i + 1}) ${st.title}: ${st.body}`).join(" ")}`,
  ].join("\n")
}

export function knowledge() {
  const work = [
    "## Experience",
    ...experiences.map((e) => `- ${e.role}, ${e.company}, ${e.period}. ${e.summary} ${e.aside}`),
    `- ${earlierExperience.role}, ${earlierExperience.company}, ${earlierExperience.period}. ${earlierExperience.summary}`,
    "## Publication",
    "- X-MuTeST: A Multilingual Benchmark for Explainable Hate Speech Detection and a Novel LLM-Consulted Explanation Framework. Proceedings of the AAAI Conference on Artificial Intelligence, vol. 40 no. 46, 2026, pp. 39134-39142. Authors: Rehman, Kasu, Koppula, Chirra (Sai Rithwik Reddy), Singh, Kumar. DOI 10.1609/aaai.v40i46.41261.",
  ].join("\n")
  return [
    "# Sai Rithwik Reddy Chirra (goes by Rithwik)",
    "Builds machine learning systems and the software around them; cares more about why a model fails than about its best score.",
    EDUCATION, work, ABOUT, CONTACT,
    ...projects.map((p) => projectBlock(p.slug)),
  ].join("\n\n")
}
