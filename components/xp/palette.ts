// Four palettes for the same deep-space black. The visitor's pick is remembered on this device.
export const PALETTES = [
  { id: "amber", name: "Amber", lamp: "#f4b76a", lampRgb: "244, 183, 106", pop: "#9cc4ff", popRgb: "156, 196, 255" },
  { id: "nebula", name: "Nebula", lamp: "#c3a3ff", lampRgb: "195, 163, 255", pop: "#ff9ecf", popRgb: "255, 158, 207" },
  { id: "aurora", name: "Aurora", lamp: "#6ff0c8", lampRgb: "111, 240, 200", pop: "#b79cff", popRgb: "183, 156, 255" },
  { id: "mars", name: "Mars", lamp: "#ff8a5c", lampRgb: "255, 138, 92", pop: "#ffd27a", popRgb: "255, 210, 122" },
] as const

export type PaletteId = (typeof PALETTES)[number]["id"]

export function currentPalette() {
  const id = typeof document === "undefined" ? "amber" : document.documentElement.dataset.palette
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}
