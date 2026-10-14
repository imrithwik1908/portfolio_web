import Link from "next/link"
import { ArrowLeft, Terminal } from "lucide-react"

export default function NotFound() {
  return (
    <main id="main-content" className="not-found page-shell">
      <Terminal aria-hidden="true" />
      <p className="section-kicker">HTTP 404 · resource_not_found</p>
      <h1>This route did not survive the timeline.</h1>
      <pre>{`GET /wherever-this-was-going\n→ 404\n→ no fallback data invented`}</pre>
      <Link className="primary-action" href="/"><ArrowLeft aria-hidden="true" /> Return home</Link>
    </main>
  )
}

