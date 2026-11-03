import { Arrow } from "@/components/xp/arrow"
import type { RepoDetail } from "@/lib/project-repo"

export function RepoSection({ detail, github }: { detail: RepoDetail; github: string }) {
  return (
    <section className="xp-repo" aria-labelledby="repo-title">
      <header className="xp-repo-head">
        <p className="xp-head-label"><span>{"{}"}</span>From the repository</p>
        <h2 id="repo-title">What&apos;s actually in the code.</h2>
        <a href={github} target="_blank" rel="noreferrer" className="xp-link">Open on GitHub <Arrow dir="out" /></a>
      </header>

      <dl className="xp-repo-facts">
        {detail.facts.map((f) => <div key={f.label}><dt>{f.value}</dt><dd>{f.label}</dd></div>)}
      </dl>

      <div className="xp-repo-langs">
        <div className="xp-lang-bar" aria-hidden="true">
          {detail.languages.map((l, i) => <i key={l.name} style={{ flexGrow: l.share, "--i": i } as React.CSSProperties} />)}
        </div>
        <p>{detail.languages.map((l) => `${l.name} ${l.share}%`).join(" · ")} <span>· {detail.files} files</span></p>
      </div>

      <div className="xp-repo-features">
        {detail.features.map((f) => <article key={f.title}><h3>{f.title}</h3><p>{f.body}</p></article>)}
      </div>

      <div className="xp-repo-split">
        <div>
          <h3 className="xp-repo-sub">Layout</h3>
          <ul className="xp-repo-tree">
            {detail.layout.map((l) => <li key={l.path}><code>{l.path}</code><span>{l.role}</span></li>)}
          </ul>
        </div>
        {detail.table && (
          <div>
            <h3 className="xp-repo-sub">{detail.table.caption}</h3>
            <div className="xp-table-wrap">
              <table className="xp-table">
                <thead><tr>{detail.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                <tbody>{detail.table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, i) => i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {detail.run && (
        <div className="xp-run">
          <h3 className="xp-repo-sub">{detail.run.label}</h3>
          <pre><code>{detail.run.code}</code></pre>
        </div>
      )}
      {detail.note && <p className="xp-repo-note">{detail.note}</p>}
    </section>
  )
}
