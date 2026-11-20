import { ImageResponse } from "next/og"
import { projects } from "@/lib/portfolio-data"

// The card a link to this case study unfolds into on LinkedIn, Slack or iMessage.
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "A case study by Sai Rithwik Reddy Chirra"

export function generateStaticParams() { return projects.map((p) => ({ slug: p.slug })) }

export default function Image({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug) ?? projects[0]
  const index = projects.indexOf(project) + 1
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", color: "#e8ecf4", backgroundColor: "#050507", backgroundImage: "radial-gradient(circle at 85% 0%, rgba(244,183,106,0.16), transparent 55%)", fontFamily: "serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#a7adbd", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", padding: "4px 14px", border: "1px solid rgba(232,236,244,0.25)", borderRadius: 999 }}>{String(index).padStart(2, "0")}</div>
        <div style={{ display: "flex" }}>{project.eyebrow} · {project.year}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 104, lineHeight: 1, color: "#f4b76a", fontStyle: "italic" }}>{project.title}</div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 38, lineHeight: 1.25, color: "#e8ecf4", maxWidth: 1000 }}>{project.question}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6c7286", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex" }}>A case study by Sai Rithwik Reddy Chirra</div>
        <div style={{ display: "flex" }}>sairithwikreddy.vercel.app</div>
      </div>
    </div>,
    size,
  )
}
