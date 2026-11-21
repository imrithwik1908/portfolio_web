"use client"

import { useState } from "react"
import { Note } from "@/components/xp/note"

// "How I work": a few working rules, not a skill list and not a second pass over the projects.
// Each rule has the line where I wrote it down (quoted from my own fog-of-war chess project plan,
// CSE 598, Oct 2026) or the place it came from, and one moment where it actually decided something.
// Facts: PLAN.md, results/ENTRY1_EXPERIMENTS.md and JOURNAL.md at the entry-1 release, and the résumé.
type Rule = { id: string; rule: React.ReactNode; note?: { from: string; quote: string }; moment: React.ReactNode }

const RULES: Rule[] = [
  {
    id: "measured",
    rule: <>Say what I <em>haven&apos;t</em> measured yet.</>,
    note: { from: "my chess project plan · Oct 2026", quote: "I have not run these matches yet, so I am not reporting the example scores in the starter README as my own results." },
    moment: <>The starter code came with example scores. They stayed out of my plan until I had played the games myself.</>,
  },
  {
    id: "one-thing",
    rule: <>Change <em>one</em> thing at a time.</>,
    note: { from: "the same plan", quote: "Change one component at a time." },
    moment: <>My first experiment changed only the network&apos;s width: same data, same seed, same schedule. The wider model reached a lower training loss and scored higher against the reference bots, but the two split their direct games <b>25–25</b> and the uncertainty overlapped. So I didn&apos;t call it a win.</>,
  },
  {
    id: "failures",
    rule: <>Write the failure down <em>next to</em> the wins.</>,
    moment: <>When I retrained my chess model from scratch, it passed every check and then lost <b>all 200 games</b> to the original. That&apos;s in my journal, in the same place as the good results. Then I shipped the version an independent rerun could rebuild <b>byte for byte</b>.</>,
  },
  {
    id: "leftovers",
    rule: <>When the score stops moving, look at <em>what&apos;s left</em>.</>,
    note: { from: "my chess project plan", quote: "I will inspect losing games rather than assume a higher training accuracy means stronger play." },
    moment: <>At Blackcoffer, when the ad-revenue error stopped shrinking, I went back to the data behind the misses and found <b>three hidden patterns in user behaviour</b>. Fixing for those brought the mean daily error down to $142.</>,
  },
]

export function Skills() {
  const [open, setOpen] = useState(0)

  return (
    <div className="xp-can">
      <ol className="xp-can-list">
        {RULES.map((r, i) => {
          const on = open === i
          return (
            <li key={r.id} className={on ? "is-open" : undefined}>
              <button type="button" className="xp-can-promise" aria-expanded={on} aria-controls={`rule-${r.id}`} onClick={() => setOpen(i)}>
                <span className="xp-can-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="xp-can-text">{r.rule}</span>
              </button>
              <div className="xp-can-body" id={`rule-${r.id}`} role="region" aria-hidden={!on}>
                <div className="xp-can-inner">
                  <p className="xp-can-proof">{r.moment}</p>
                  {r.note && (
                    <figure className="xp-can-note">
                      <blockquote>&ldquo;{r.note.quote}&rdquo;</blockquote>
                      <figcaption>from {r.note.from}</figcaption>
                    </figure>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      <Note className="is-kit">The quoted lines are from my own project notes, written before the results came in.</Note>
    </div>
  )
}
