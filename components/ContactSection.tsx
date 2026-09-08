// File: components/ContactSection.tsx
'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Twitter, Instagram } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          className="text-sm text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Contact
        </motion.h2>

        <div className="mt-5 flex flex-col gap-5 border-y border-border/70 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Let&apos;s connect.</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Open to collaborations, internships, research-aligned work, and useful conversations.
            </p>
          </div>

          <div className="flex gap-5 text-muted-foreground">
            <a
              href="https://github.com/imrithwik1908"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-primary"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/sairithwikreddy"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="transition-colors hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:csairithwik.reddy@gmail.com"
              aria-label="Email"
              className="transition-colors hover:text-primary"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com/rithwik_cs"
              target="_blank"
              rel="noreferrer"
              aria-label="X (Twitter)"
              className="transition-colors hover:text-primary"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com/rithwik.cs"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="transition-colors hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
