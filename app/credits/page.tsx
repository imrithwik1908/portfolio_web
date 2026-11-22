import type { Metadata } from "next"
import { SectionHead } from "@/components/xp/section-head"
import { FLIP_IMAGES } from "@/lib/flipbook-images"

export const metadata: Metadata = {
  title: "Picture credits",
  description: "Credits for the openly licensed photographs in the flipbook intro.",
  alternates: { canonical: "/credits" },
}

const LICENSES: Record<string, string> = { cc0: "CC0", pdm: "Public domain", by: "CC BY", "by-sa": "CC BY-SA" }

export default function CreditsPage() {
  return (
    <main id="main-content" className="xp">
      <section className="xp-section xp-page-top" aria-label="Picture credits">
        <h1 className="sr-only">Picture credits</h1>
        <SectionHead index="—" label="Credits" title="The pictures in the flipbook." />
        <p className="xp-credits-intro">The flipbook intro (⌘K, then “Play the flipbook intro”) uses these openly licensed photographs, found through Openverse. Each is used as published, resized for the web. Thank you to everyone who shared them.</p>
        <ol className="xp-credits-list">
          {FLIP_IMAGES.map((f) => (
            <li key={f.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt="" loading="lazy" width={160} height={90} />
              <div>
                <a href={f.landing} target="_blank" rel="noreferrer">{f.title || "Untitled"}</a>
                <span>{f.creator ? <>by {f.creatorUrl ? <a href={f.creatorUrl} target="_blank" rel="noreferrer">{f.creator}</a> : f.creator}</> : "Creator unknown"}</span>
                <span>{f.licenseUrl ? <a href={f.licenseUrl} target="_blank" rel="noreferrer">{LICENSES[f.license] ?? f.license} {f.licenseVersion}</a> : `${LICENSES[f.license] ?? f.license} ${f.licenseVersion ?? ""}`}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
