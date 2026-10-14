import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Bug, CircleDot, FlaskConical } from "lucide-react"

export const metadata: Metadata = { title: "Lab", robots: { index: false, follow: false } }

export default function LabPage() {
  return (
    <main id="main-content" className="lab-page page-shell">
      <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Back to the sensible site</Link>
      <header><p className="section-kicker">/lab</p><h1>Small experiments. No launch copy.</h1><p>Things that were useful enough to keep, but not important enough to interrupt the portfolio.</p></header>
      <div className="lab-grid">
        <article><FlaskConical aria-hidden="true" /><span>01</span><h2>Evaluation matrix</h2><p>A tiny reminder that “better” depends on the case, evaluator, threshold, and version being compared.</p><div className="matrix" aria-label="Decorative evaluation matrix">{Array.from({ length: 24 }, (_, index) => <i key={index} data-pass={index % 5 !== 0} />)}</div></article>
        <article><Bug aria-hidden="true" /><span>02</span><h2>Failure path</h2><p>The happy path is intentionally the shortest line here.</p><pre aria-label="Example failure flow">request → queue → worker{`\n`}             ↘ retry{`\n`}               ↘ review</pre></article>
        <article><CircleDot aria-hidden="true" /><span>03</span><h2>Scorecard</h2><p>One wicket, three evaluators, and no agreement on whether it was a good delivery. Model evaluation feels familiar.</p><div className="scorecard"><b>86.4</b><small>coverage</small><b>02</b><small>regressions</small></div></article>
      </div>
    </main>
  )
}

