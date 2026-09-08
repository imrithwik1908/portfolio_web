'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ModeToggle } from './mode-toggle'

const navigation = [
  { name: 'About', href: '/#about' },
  { name: 'Work', href: '/#experience' },
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '/#contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-background/58 shadow-sm shadow-foreground/5 backdrop-blur-2xl" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-black tracking-[-0.02em] text-foreground">
          Sai Rithwik
        </Link>

        <nav className="hidden min-w-0 items-center gap-7 sm:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'shrink-0 text-sm transition-colors hover:text-foreground',
                item.href === '/projects' && pathname === '/projects'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <ModeToggle />
      </div>
    </header>
  )
}
