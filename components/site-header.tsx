"use client"

import { useState } from "react"
import Link from "next/link"
import { Command, Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

const navigation = [
  ["Work", "/#work"],
  ["About", "/#about"],
  ["Experience", "/#experience"],
  ["Projects", "/projects"],
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="page-shell header-inner">
        <Link href="/" className="site-wordmark" aria-label="Sai Rithwik Reddy Chirra, home">
          <span>SR</span><strong>Rithwik</strong>
        </Link>
        <nav id="main-navigation" className={open ? "site-nav is-open" : "site-nav"} aria-label="Main navigation">
          {navigation.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <a href="/#contact" onClick={() => setOpen(false)}>Contact</a>
        </nav>
        <div className="header-tools">
          <button className="command-trigger" type="button" onClick={() => window.dispatchEvent(new Event("portfolio:command"))} aria-label="Open command menu">
            <Command aria-hidden="true" /><span>⌘K</span>
          </button>
          <ModeToggle />
          <button className="mobile-menu" type="button" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
