'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="theme-toggle"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Sun className="theme-toggle-sun h-4 w-4" />
      <Moon className="theme-toggle-moon h-4 w-4" />
    </button>
  )
}
