// File: components/ContactSection.tsx
'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Twitter, Instagram } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="py-16 px-4">
      <div className="container mx-auto text-center">
        <motion.h2
          className="text-2xl font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Get In Touch
        </motion.h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Want to collaborate or just say hi? Let&apos;s connect.
        </p>

        <div className="flex justify-center space-x-8 text-muted-foreground opacity-80">
          <a
            href="https://github.com/imrithwik1908"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hover:text-primary transition-colors"
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href="https://www.linkedin.com/in/sairithwikreddy"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:text-primary transition-colors"
          >
            <Linkedin className="h-6 w-6" />
          </a>
          <a
            href="mailto:csairithwik.reddy@gmail.com"
            aria-label="Email"
            className="hover:text-primary transition-colors"
          >
            <Mail className="h-6 w-6" />
          </a>
          <a
            href="https://twitter.com/rithwik_cs"
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className="hover:text-primary transition-colors"
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="https://instagram.com/rithwik.cs"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hover:text-primary transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
      </div>
    </section>
  )
}
