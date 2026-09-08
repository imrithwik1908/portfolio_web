"use client"

import { useEffect, useRef } from "react"

const equationSets = [
  ["θ ← θ − η∇L(θ)", "p(y|x)=softmax(Wx+b)", "E[x]=∫x p(x)dx"],
  ["f(t)=Σ aₙsin(nωt+φₙ)", "z(t)=[sin(3t+φ), cos(2t)]", "K(x,x′)=exp(-||x-x′||²/2σ²)"],
  ["hₜ=tanh(Wxₜ+Uhₜ₋₁)", "A=softmax(QKᵀ/√d)", "ŷ=argmax p(y|x)"],
]

const equationAnchors = [
  { x: 0.1, y: 0.24, speed: 0.32 },
  { x: 0.72, y: 0.2, speed: 0.24 },
  { x: 0.46, y: 0.72, speed: 0.2 },
]

const smoothstep = (value: number) => value * value * (3 - 2 * value)

export function MathCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d", { alpha: true })
    if (!context) return

    let width = 0
    let height = 0
    let frame = 0
    let running = true
    let monoFont = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    const dprCap = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dprCap)
      canvas.height = Math.floor(height * dprCap)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dprCap, 0, 0, dprCap, 0, 0)
      monoFont =
        getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono") ||
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    }

    const drawWave = (
      time: number,
      yOffset: number,
      amplitude: number,
      frequency: number,
      phase: number,
      opacity: number,
      hue: string,
    ) => {
      const gradient = context.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, `${hue.replace("OPACITY", "0")}`)
      gradient.addColorStop(0.32, `${hue.replace("OPACITY", String(opacity))}`)
      gradient.addColorStop(0.68, `rgba(84, 65, 49, ${opacity * 0.72})`)
      gradient.addColorStop(1, `${hue.replace("OPACITY", "0")}`)

      context.beginPath()
      context.strokeStyle = gradient
      context.lineWidth = 1

      for (let x = 0; x <= width; x += 10) {
        const normalized = x / width
        const harmonic =
          Math.sin(normalized * Math.PI * frequency + time + phase) +
          Math.cos(normalized * Math.PI * (frequency * 0.62) - time * 0.72 + phase) * 0.45 +
          Math.sin(normalized * Math.PI * (frequency * 1.34) + time * 0.48) * 0.16
        const y = yOffset + harmonic * amplitude

        if (x === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }

      context.stroke()
    }

    const drawLissajous = (time: number, cx: number, cy: number, scale: number, opacity: number, hue: string) => {
      const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, scale)
      gradient.addColorStop(0, hue.replace("OPACITY", String(opacity)))
      gradient.addColorStop(1, hue.replace("OPACITY", "0"))

      context.beginPath()
      context.strokeStyle = gradient
      context.lineWidth = 1.15

      for (let i = 0; i <= 240; i += 1) {
        const t = (i / 240) * Math.PI * 2
        const x = cx + Math.sin(3 * t + time * 0.42) * scale
        const y = cy + Math.sin(2 * t + time * 0.31) * scale * 0.48

        if (i === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }

      context.stroke()
    }

    const drawEquationSet = (setIndex: number, opacity: number, time: number, isDark: boolean) => {
      if (opacity <= 0.002) return

      const equations = equationSets[setIndex]
      context.save()
      context.font = `${Math.max(15, Math.min(width, height) * 0.026)}px ${monoFont}`
      context.textBaseline = "middle"

      for (let index = 0; index < equations.length; index += 1) {
        const anchor = equationAnchors[index]
        const driftX = Math.sin(time * anchor.speed + index) * 18
        const driftY = Math.cos(time * anchor.speed * 0.82 + index * 1.7) * 11
        const x = width * anchor.x + driftX
        const y = height * anchor.y + driftY
        const baseOpacity = isDark ? 0.08 : 0.075

        context.fillStyle = isDark
          ? `rgba(204, 240, 224, ${baseOpacity * opacity})`
          : `rgba(35, 83, 65, ${baseOpacity * opacity})`
        context.fillText(equations[index], x, y)
      }

      context.restore()
    }

    const render = (now: number) => {
      if (!running) return

      const time = now * 0.00018
      const isDark = document.documentElement.classList.contains("dark")
      const hue = isDark ? "rgba(98, 180, 255, OPACITY)" : "rgba(36, 120, 86, OPACITY)"
      const cycle = (now * 0.00008) % equationSets.length
      const activeSet = Math.floor(cycle)
      const nextSet = (activeSet + 1) % equationSets.length
      const fade = smoothstep(cycle - activeSet)

      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = "source-over"

      drawWave(time, height * 0.22, height * 0.025, 3.2 + fade * 0.8, 0.2, isDark ? 0.075 : 0.06, hue)
      drawWave(time * 0.85, height * 0.58, height * 0.032, 4.2 + fade * 1.1, 1.7, isDark ? 0.06 : 0.052, hue)
      drawWave(time * 1.08, height * 0.84, height * 0.022, 5.2 + fade * 0.7, 2.3, isDark ? 0.05 : 0.045, hue)
      drawLissajous(time, width * 0.14, height * 0.72, Math.min(width, height) * 0.16, isDark ? 0.048 : 0.038, hue)
      drawLissajous(time + 1.6, width * 0.84, height * 0.34, Math.min(width, height) * 0.12, isDark ? 0.04 : 0.034, hue)
      drawEquationSet(activeSet, 1 - fade, time, isDark)
      drawEquationSet(nextSet, fade, time, isDark)

      frame = window.requestAnimationFrame(render)
    }

    resize()
    window.addEventListener("resize", resize)
    frame = window.requestAnimationFrame(render)

    return () => {
      running = false
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="math-canvas-bg" aria-hidden="true" />
}
