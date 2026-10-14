import { BuildMark } from "@/components/portfolio-interactions"

const links = [
  ["Email", "mailto:sairithwikreddy.chirra@gmail.com"],
  ["GitHub", "https://github.com/imrithwik1908"],
  ["LinkedIn", "https://www.linkedin.com/in/sairithwikreddy"],
  ["Resume", "https://drive.google.com/file/d/1LF8cf2CkC7JzFfhFVyHCXXfUYF6L9pZd/view?usp=sharing"],
] as const

export function ContactSection() {
  return (
    <footer id="contact" className="contact-section">
      <div className="page-shell">
        <p className="section-kicker">Contact</p>
        <div className="contact-main">
          <h2>Building something difficult?</h2>
          <p>I&apos;d probably like to hear about it. Roles, research, project questions, and interesting engineering problems are all fair reasons to write.</p>
          <a className="contact-address" href="mailto:sairithwikreddy.chirra@gmail.com">sairithwikreddy.chirra@gmail.com <span aria-hidden="true">↗</span></a>
        </div>
        <div className="contact-bottom">
          <nav aria-label="Contact links">{links.map(([label, href]) => <a key={label} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noreferrer"}>{label} <span aria-hidden="true">↗</span></a>)}</nav>
          <BuildMark />
        </div>
      </div>
    </footer>
  )
}
