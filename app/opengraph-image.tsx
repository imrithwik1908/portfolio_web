import { ImageResponse } from "next/og"

export const alt = "Sai Rithwik Reddy Chirra — Systems, Data & AI Engineer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#efe5d6", color: "#1d1814", padding: "72px 80px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}><b>SRRC</b><span style={{ color: "#28785c" }}>Tempe, Arizona</span></div>
      <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 30, color: "#28785c", marginBottom: 20 }}>Systems, data &amp; AI</span><span style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.02, maxWidth: 970 }}>I build the systems around data and AI.</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}><span>Sai Rithwik Reddy Chirra</span><span>APIs · data · evaluation · ML</span></div>
    </div>,
    size,
  )
}

