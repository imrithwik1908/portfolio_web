// The plain-language layer of each case study: what it is, how it's built and why it matters,
// written for a reader who has never heard of evals, Redis, LIME or tensor fusion, plus the handful
// of terms the rest of the page uses.

export type Plain = { what: string; how: string; why: string; terms: [string, string][] }

export const plain: Record<string, Plain> = {
  agentguard: {
    what: "A safety check for AI features before they ship. When a team changes the prompt, the model or the documents behind an AI assistant, AgentGuard runs the same test questions on the old and new versions, compares them one question at a time, and says whether the change is safe to release, with reasons.",
    how: "A small Python library records every step the assistant takes. A FastAPI service checks those records and stores them in PostgreSQL. Background workers, fed by a Redis queue, grade each answer with rule-based checks and, optionally, an AI grader. A Next.js dashboard shows the comparison, and one endpoint returns PASS, BLOCK or REVIEW for a deployment pipeline to act on.",
    why: "An average score can go up while individual answers get worse, and users notice the broken answer, not the average. AgentGuard makes those breaks visible before release, and keeps the final decision in plain rules rather than another model's opinion.",
    terms: [
      ["Trace", "a step-by-step record of how the AI produced one answer"],
      ["Eval", "an automated check of whether an answer is good"],
      ["Regression", "something that used to work and now doesn't"],
      ["LLM judge", "an AI model used to grade another AI's answer against a rubric"],
      ["Queue", "a waiting line for slow work, so nobody has to wait on it"],
      ["CI", "the automated pipeline that tests a change before it ships"],
    ],
  },
  "x-mutest": {
    what: "A research paper, published at AAAI 2026, on hate-speech detection that has to show its work. The models label posts in English, Hindi and Telugu, point to the words that make a post hateful, and the paper measures whether those pointers can be trusted.",
    how: "Native speakers marked the offending words in about 16,800 posts. Multilingual models were trained in two rounds to focus on those words; a new probe found which words a model actually relies on; and large language models gave a second opinion. Everything ran in PyTorch with Hugging Face models.",
    why: "Moderation decisions affect people. A model that is right for the wrong reason fails in ways nobody can predict, and lower-resource languages such as Telugu had no word-level benchmark to check this against.",
    terms: [
      ["Rationale", "the words in a post that justify its label"],
      ["Attention", "a model's built-in measure of which words it is focusing on"],
      ["LIME", "a common tool that explains a prediction by deleting words and watching what changes"],
      ["Plausible", "the explanation matches what a person would point to"],
      ["Faithful", "the model really relied on those words to decide"],
      ["MuRIL, XLM-R", "language models trained on many languages, including Indian ones"],
    ],
  },
  "tensor-fusion": {
    what: "A study of whether an AI reads someone's sentiment better when it watches their face and hears their voice, not only reads their words.",
    how: "Each video clip in CMU-MOSI becomes three streams of numbers: face, voice and words. A small network summarizes each one, a Tensor Fusion Network multiplies the summaries together so every combination is represented, and a final layer predicts the sentiment. Written as PyTorch notebooks, run as three tasks.",
    why: "\"Great, just great\" means opposite things depending on the tone. Combining senses well is the core problem of multimodal AI, and this is one of its classic answers, implemented and measured myself.",
    terms: [
      ["Modality", "one kind of input: face, voice or text"],
      ["Fusion", "combining several modalities into one representation"],
      ["Outer product", "multiplying every number in one list by every number in another"],
      ["LSTM", "a network that reads a sequence, such as a sentence, in order"],
      ["F1", "a score that punishes both missed positives and false alarms"],
      ["Validation set", "data held back to choose a model, separate from the final test"],
    ],
  },
  "course-catalog": {
    what: "A course-registration web app for a university. Students browse courses, add them to a cart and enroll; professors see the courses they teach.",
    how: "Sign-in goes through Google, and the email address decides whether you're a student or a professor. An Express server builds each page, keeps the cart in the session, and stores students, professors and courses in MongoDB.",
    why: "One set of data, two very different users. Keeping both views consistent, especially when a single enrollment has to be written in two places, is the real problem underneath a simple-looking app.",
    terms: [
      ["OAuth", "signing in with an account you already have, such as Google"],
      ["Session", "what the server remembers about you between pages"],
      ["Server-rendered", "pages built on the server and sent ready to display"],
      ["Transaction", "a group of database writes that succeed or fail together"],
      ["MongoDB", "a database that stores each record as a document"],
    ],
  },
}
