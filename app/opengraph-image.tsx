import { ImageResponse } from "next/og"

export const alt = "Sai Rithwik Reddy Chirra — ML systems and the software around them"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", color: "#ebe6dc", backgroundColor: "#0d0d0c", backgroundImage: "radial-gradient(circle at 50% 0%, rgba(233,194,123,0.18), transparent 60%)", fontFamily: "serif" }}>
      <div style={{ display: "flex", fontSize: 24, color: "#7d786f", fontFamily: "sans-serif" }}>Tempe, Arizona · AAAI 2026 · M.S. CS, Arizona State</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 110, lineHeight: 1 }}>Hi, I&apos;m&nbsp;<span style={{ color: "#e9c27b", fontStyle: "italic" }}>Rithwik</span>.</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 38, color: "#b4ada1", maxWidth: 900 }}>I build machine learning systems and the software around them.</div>
      </div>
      <div style={{ display: "flex", fontSize: 22, color: "#7d786f", fontFamily: "sans-serif" }}>sairithwikreddy.vercel.app</div>
    </div>,
    size,
  )
}
