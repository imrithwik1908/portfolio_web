import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Now",
  description: "What Rithwik is studying, building, and tightening up right now.",
  alternates: { canonical: "/now" },
}

export default function NowPage() {
  return (
    <main id="main-content" className="now-page page-shell">
      <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Home</Link>
      <p className="section-kicker">Now · October 2026</p>
      <h1>The current tab set.</h1>
      <p className="now-intro">A small record of what has my attention. Kept short on purpose; stale “now” pages are a special kind of archaeological site.</p>
      <div className="now-list">
        <article><span>Building</span><h2>AgentGuard v1</h2><p>Tightening the evaluation and release workflow, especially the boundaries between stored evidence and a decision that can be explained later.</p></article>
        <article><span>Studying</span><h2>Distributed systems and verification</h2><p>Graduate coursework at ASU, with the useful side effect of making failure assumptions harder to hand-wave.</p></article>
        <article><span>Revisiting</span><h2>Old ML experiments</h2><p>Turning notebook results into clearer experimental records: configuration, baselines, and the less flattering outputs included.</p></article>
      </div>
    </main>
  )
}

