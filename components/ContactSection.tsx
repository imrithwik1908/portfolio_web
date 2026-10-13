// File: components/ContactSection.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Github, Instagram, Linkedin, Mail, Twitter } from 'lucide-react'

const contactLinks = [
  { label: 'GitHub', href: 'https://github.com/imrithwik1908', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sairithwikreddy', icon: Linkedin },
  { label: 'X', href: 'https://twitter.com/rithwik_cs', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com/rithwik.cs', icon: Instagram },
]

export function ContactSection() {
  return (
    <section id="contact" className="contact-section px-4 py-16">
      <motion.div
        className="contact-shell container mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-12%' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h2>Say hello.</h2>
          <p>You can reach me about roles, research, or anything here you&apos;d like to discuss.</p>
        </div>

        <a className="contact-email" href="mailto:sairithwikreddy.chirra@gmail.com">
          <span className="contact-email-icon"><Mail aria-hidden="true" /></span>
          <span>
            <small>Email</small>
            <strong>sairithwikreddy.chirra@gmail.com</strong>
          </span>
          <ArrowUpRight aria-hidden="true" />
        </a>

        <div className="contact-footer-row">
          <p>Sai Rithwik Reddy Chirra <span>Tempe, Arizona</span></p>
          <nav aria-label="Social links">
            {contactLinks.map((link) => {
              const Icon = link.icon

              return (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  <Icon aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              )
            })}
          </nav>
        </div>
      </motion.div>
    </section>
  )
}
