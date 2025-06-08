// components/TechBackground.tsx
'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const gridSize = 40
    const speed = 0.5

    const pulses = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dir: Math.random() > 0.5 ? 'horizontal' : 'vertical',
      progress: 0
    }))

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      if (theme === 'light') {
        ctx.strokeStyle = 'rgba(206, 204, 204, 0.95)'; // grey for light mode
      } else {
        ctx.strokeStyle = 'rgba(34, 34, 34, 0.95)'; // dark mode original
      }      
      ctx.lineWidth = 1

      // Draw grid
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw pulses
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)' // blue glow
      pulses.forEach(p => {
        if (p.dir === 'horizontal') {
          p.x += speed
          if (p.x > width) p.x = 0
          ctx.beginPath()
          ctx.arc(p.x, Math.round(p.y / gridSize) * gridSize, 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          p.y += speed
          if (p.y > height) p.y = 0
          ctx.beginPath()
          ctx.arc(Math.round(p.x / gridSize) * gridSize, p.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  )
}
