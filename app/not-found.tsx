import Link from "next/link"
import { Arrow } from "@/components/xp/arrow"
import { FogBoard } from "@/components/xp/fog-board"

export default function NotFound() {
  return (
    <main id="main-content" className="xp">
      <section className="xp-section xp-lost">
        <div>
          <p className="xp-head-label"><span>404</span>Off the map</p>
          <h1>You&apos;ve walked into the fog.</h1>
          <p className="xp-lost-text">This page doesn&apos;t exist, or I can&apos;t see it from here. It&apos;s the same problem my chess bot has. Move across the board to clear it, or head back.</p>
          <Link href="/" className="xp-button">Back to the light <Arrow /></Link>
        </div>
        <FogBoard />
      </section>
    </main>
  )
}
