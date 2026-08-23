'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  size: number
  color: string
  life: number
  decay: number
}

const DEFAULT_COLORS = ['#ff5c7c', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b']

type ConfettiProps = {
  trigger: number
  colors?: string[]
}

export function Confetti({ trigger, colors = DEFAULT_COLORS }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = () => {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    size()
    window.addEventListener('resize', size)

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.life -= p.decay
        ctx.globalAlpha = Math.max(p.life, 0)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', size)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (trigger <= 0 || !canvas) return
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 5
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        gravity: 0.15,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.012 + Math.random() * 0.012
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return <canvas ref={canvasRef} className="hg-confetti" aria-hidden />
}
