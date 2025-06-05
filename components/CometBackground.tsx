'use client'

import { useEffect, useRef } from 'react'

export const CometBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    const comets: { x: number; y: number; dx: number; dy: number; trail: { x: number; y: number }[] }[] = []

    for (let i = 0; i < 10; i++) {
      comets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: -1.5 - Math.random(),
        dy: 1 + Math.random(),
        trail: [],
      })
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)' // slowly fade trails
      ctx.fillRect(0, 0, width, height)

      comets.forEach((comet) => {
        comet.trail.push({ x: comet.x, y: comet.y })
        if (comet.trail.length > 20) comet.trail.shift()

        // comet head
        ctx.beginPath()
        ctx.fillStyle = 'white'
        ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2)
        ctx.fill()

        // comet trail
        for (let i = 0; i < comet.trail.length - 1; i++) {
          const opacity = i / comet.trail.length
          ctx.strokeStyle = `rgba(255,255,255,${opacity})`
          ctx.beginPath()
          ctx.moveTo(comet.trail[i].x, comet.trail[i].y)
          ctx.lineTo(comet.trail[i + 1].x, comet.trail[i + 1].y)
          ctx.stroke()
        }

        // update position
        comet.x += comet.dx
        comet.y += comet.dy

        // reset comet if out of bounds
        if (comet.x < 0 || comet.y > height) {
          comet.x = Math.random() * width + width
          comet.y = Math.random() * -height
          comet.trail = []
        }
      })

      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  )
}
