"use client"

import { useEffect, useRef, useState } from "react"
import { geoCircle, geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import land110 from "world-atlas/land-110m.json"

// The two campuses, the real great-circle route between them, and tonight's actual night side.
// Drag to turn it; left alone it drifts. Double-click flies to the other campus.
const DHARWAD: [number, number] = [75.0, 15.39]
const TEMPE: [number, number] = [-111.93, 33.42]
const land = feature(land110 as unknown as Topology, (land110 as unknown as Topology).objects.land as GeometryCollection)
const route = geoInterpolate(DHARWAD, TEMPE)

function subsolar(date: Date): [number, number] {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const day = (date.getTime() - start) / 86_400_000
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10))
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60
  return [-(hours - 12) * 15, decl]
}

export function Globe() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const rot = useRef<[number, number]>([-20, -18])
  const vel = useRef(0.08)
  const target = useRef<[number, number] | null>(null)
  const [label, setLabel] = useState("Drag me")

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext("2d")!
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let size = 0, frame = 0, visible = true, t = 0
    const resize = () => {
      size = el.clientWidth
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      el.width = size * dpr; el.height = size * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(el)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(el)

    const draw = () => {
      frame = requestAnimationFrame(draw)
      if (!visible || !size) return
      t += 1
      if (target.current) {
        const [tl, tp] = target.current
        const r = rot.current
        const dl = ((tl - r[0] + 540) % 360) - 180
        r[0] += dl * 0.08; r[1] += (tp - r[1]) * 0.08
        if (Math.abs(dl) < 0.2 && Math.abs(tp - r[1]) < 0.2) target.current = null
      } else if (!reduce) {
        rot.current[0] += vel.current
        vel.current += (0.08 - vel.current) * 0.02
      }
      const R = size / 2 - 6
      const proj = geoOrthographic().scale(R).translate([size / 2, size / 2]).rotate([rot.current[0], rot.current[1], 0]).clipAngle(90)
      const path = geoPath(proj, ctx)
      ctx.clearRect(0, 0, size, size)

      // Atmosphere
      const halo = ctx.createRadialGradient(size / 2, size / 2, R * 0.9, size / 2, size / 2, R * 1.08)
      halo.addColorStop(0, "rgba(233,194,123,0.18)"); halo.addColorStop(1, "rgba(233,194,123,0)")
      ctx.fillStyle = halo; ctx.fillRect(0, 0, size, size)

      // Ocean, lit from the upper left
      const ocean = ctx.createRadialGradient(size * 0.36, size * 0.32, R * 0.1, size / 2, size / 2, R)
      ocean.addColorStop(0, "#2a2620"); ocean.addColorStop(1, "#0f0e0c")
      ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = ocean; ctx.fill()

      ctx.beginPath(); path(geoGraticule10()); ctx.strokeStyle = "rgba(235,230,220,0.05)"; ctx.lineWidth = 0.6; ctx.stroke()
      ctx.beginPath(); path(land); ctx.fillStyle = "#5b5040"; ctx.fill()
      ctx.strokeStyle = "rgba(233,194,123,0.25)"; ctx.lineWidth = 0.5; ctx.stroke()

      // The real night side right now
      const [sl, sp] = subsolar(new Date())
      ctx.beginPath(); path(geoCircle().center([sl + 180, -sp]).radius(90)()); ctx.fillStyle = "rgba(5,5,4,0.55)"; ctx.fill()

      // Route with a light travelling along it
      const arc = { type: "LineString" as const, coordinates: Array.from({ length: 65 }, (_, i) => route(i / 64)) }
      ctx.beginPath(); path(arc); ctx.strokeStyle = "rgba(233,194,123,0.55)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([])
      const p = route(((t / 360) % 1))
      const center: [number, number] = [-rot.current[0], -rot.current[1]]
      const dot = (c: [number, number], r: number, color: string) => {
        if (geoDistance(c, center) > Math.PI / 2) return
        const [x, y] = proj(c)!
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
        g.addColorStop(0, color); g.addColorStop(1, "rgba(233,194,123,0)")
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = "#fff4dc"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
      }
      dot(p, 1.6, "rgba(233,194,123,0.9)")
      dot(DHARWAD, 2.4, "rgba(233,194,123,0.8)")
      dot(TEMPE, 2.4, "rgba(233,194,123,0.8)")

      // Rim shading for depth
      const rim = ctx.createRadialGradient(size / 2, size / 2, R * 0.6, size / 2, size / 2, R)
      rim.addColorStop(0, "rgba(0,0,0,0)"); rim.addColorStop(1, "rgba(0,0,0,0.45)")
      ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = rim; ctx.fill()
    }
    draw()

    let drag: { x: number; y: number; r: [number, number]; lx: number; lt: number } | null = null
    const down = (e: PointerEvent) => { el.setPointerCapture(e.pointerId); target.current = null; drag = { x: e.clientX, y: e.clientY, r: [...rot.current], lx: e.clientX, lt: performance.now() } }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const k = 180 / size
      rot.current = [drag.r[0] + (e.clientX - drag.x) * k, Math.max(-60, Math.min(60, drag.r[1] - (e.clientY - drag.y) * k))]
      const now = performance.now()
      vel.current = ((e.clientX - drag.lx) * k) / Math.max(1, (now - drag.lt) / 16)
      drag.lx = e.clientX; drag.lt = now
      setLabel("Let go and it keeps spinning")
    }
    const up = () => { drag = null }
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up)
    return () => {
      cancelAnimationFrame(frame); ro.disconnect(); io.disconnect()
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up)
    }
  }, [])

  // Double-click: fly to whichever campus is facing away.
  const fly = () => {
    const center: [number, number] = [-rot.current[0], -rot.current[1]]
    const to = geoDistance(DHARWAD, center) < geoDistance(TEMPE, center) ? TEMPE : DHARWAD
    target.current = [-to[0], -to[1]]
    setLabel(to === TEMPE ? "Tempe, now" : "Dharwad, where it started")
  }

  return (
    <div className="xp-globe">
      <canvas ref={canvas} onDoubleClick={fly} aria-label="A globe showing the route from Dharwad, India to Tempe, Arizona, with the current night side shaded" role="img" />
      <p className="xp-globe-label">{label}</p>
      <p className="xp-degree-km" title="The shaded half is where it is night right now.">14,530 km apart</p>
    </div>
  )
}
