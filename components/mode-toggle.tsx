"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  const nextName = dark ? "Arizona Noon" : "2:17 AM"

  return (
    <button type="button" onClick={() => setTheme(dark ? "light" : "dark")} className="theme-toggle" aria-label={`Switch to ${nextName}`} title={`Switch to ${nextName}`}>
      <Sun className="theme-toggle-sun" aria-hidden="true" />
      <Moon className="theme-toggle-moon" aria-hidden="true" />
    </button>
  )
}
