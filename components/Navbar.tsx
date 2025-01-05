'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()
  const { theme, setTheme } = useTheme()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <motion.header
      className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-border"
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-foreground">
              YourName
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300"
              >
                {item.name}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </nav>
    </motion.header>
  )
}

