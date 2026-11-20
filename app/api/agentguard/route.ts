// A thin, read-only proxy to the deployed AgentGuard API, so the case study can ask the real release
// gate for a verdict. The API key stays on the server. Two steps:
//   GET ?step=config        -> is the live connection set up on this deployment?
//   GET ?step=wake          -> is the (free, sleeping) API up yet?
//   GET ?step=gate&max=N    -> the release gate's answer for the configured baseline and candidate
// Configure on Vercel: AGENTGUARD_API_KEY, AGENTGUARD_BASELINE_ID, AGENTGUARD_CANDIDATE_ID
// (and optionally AGENTGUARD_API_URL).

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const BASE = process.env.AGENTGUARD_API_URL ?? "https://agentguard-api-7evp.onrender.com"

type Summary = { pass_count: number; fail_count: number; evaluation_count: number; pass_rate: string | null; average_score: string | null }
type Gate = {
  passed: boolean
  exit_code: number
  decision: {
    decision: string
    summary: string
    reasons: string[]
    maximum_regressions: number
    critical_regression_count: number
    comparison: { baseline: Summary; candidate: Summary; regression_count_delta: number }
  }
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

async function timed(url: string, init: RequestInit, ms: number) {
  const started = Date.now()
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms), cache: "no-store" })
  return { res, ms: Date.now() - started }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const step = searchParams.get("step")

  if (step === "config") {
    return json({ configured: Boolean(process.env.AGENTGUARD_API_KEY && process.env.AGENTGUARD_BASELINE_ID && process.env.AGENTGUARD_CANDIDATE_ID), preview: process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview" || process.env.AGENTGUARD_PREVIEW === "1" })
  }

  if (step === "wake") {
    try {
      const { res, ms } = await timed(`${BASE}/healthz`, {}, 25_000)
      return json({ awake: res.ok, ms })
    } catch {
      return json({ awake: false })
    }
  }

  if (step === "gate") {
    const key = process.env.AGENTGUARD_API_KEY
    const baseline = process.env.AGENTGUARD_BASELINE_ID
    const candidate = process.env.AGENTGUARD_CANDIDATE_ID
    if (!key || !baseline || !candidate) return json({ configured: false })
    const max = Math.max(0, Math.min(5, Number(searchParams.get("max") ?? 0) || 0))
    const q = new URLSearchParams({ baseline_version_id: baseline, candidate_version_id: candidate, maximum_regressions: String(max) })
    try {
      const { res, ms } = await timed(`${BASE}/api/v1/ci/release-gate?${q}`, { headers: { "x-agentguard-api-key": key } }, 30_000)
      if (!res.ok) return json({ configured: true, error: `The API answered ${res.status}.` }, 502)
      const g = (await res.json()) as Gate
      const c = g.decision.comparison
      return json({
        configured: true,
        ms,
        host: new URL(BASE).host,
        decision: g.decision.decision,
        exitCode: g.exit_code,
        summary: g.decision.summary,
        reasons: g.decision.reasons,
        allowed: g.decision.maximum_regressions,
        baseline: { pass: c.baseline.pass_count, total: c.baseline.evaluation_count, rate: c.baseline.pass_rate },
        candidate: { pass: c.candidate.pass_count, total: c.candidate.evaluation_count, rate: c.candidate.pass_rate },
      })
    } catch {
      return json({ configured: true, error: "The API didn't answer in time." }, 504)
    }
  }

  return json({ error: "Unknown step." }, 400)
}
