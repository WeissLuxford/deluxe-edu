'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { mediaSrc } from '@/features/ui/components/Media'

const SUN_SRC = mediaSrc('home.hero.sun')
const CLOUDS_FAR = mediaSrc('home.hero.cloudsFar')
const CLOUDS_NEAR = mediaSrc('home.hero.cloudsNear')
const HAS_CLOUD_ART = Boolean(CLOUDS_FAR || CLOUDS_NEAR)

type Star = {
  x: number
  y: number
  r: number
  base: number
  phase: number
  speed: number
  flare: boolean
  hue: number
}

type Cloud = {
  x: number
  y: number
  scale: number
  speed: number
  alpha: number
  puffs: Array<{ dx: number; dy: number; r: number }>
}

type Shooting = {
  x: number
  y: number
  len: number
  angle: number
  speed: number
  life: number
  ttl: number
}

export default function HeroVertex() {
  const t = useTranslations('home')
  const locale = useLocale()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const base = `/${locale}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth || window.innerWidth
      h = canvas.clientHeight || window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    let stars: Star[] = []
    let clouds: Cloud[] = []
    let shooting: Shooting | null = null
    let nextShot = 0

    const buildStars = () => {
      const target = Math.min(Math.round((w * h) / 5200), 320)
      stars = []
      for (let i = 0; i < target; i++) {
        const depth = Math.random()
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.86,
          r: 0.4 + depth * depth * 1.5,
          base: 0.25 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0006 + Math.random() * 0.0018,
          flare: depth > 0.88,
          hue: Math.random() < 0.18 ? 42 : Math.random() < 0.3 ? 214 : 0
        })
      }
    }

    const buildClouds = () => {
      const target = Math.max(5, Math.min(Math.round(w / 210), 11))
      clouds = []
      for (let i = 0; i < target; i++) {
        const scale = 0.5 + Math.random() * 1.1
        const puffCount = 4 + Math.floor(Math.random() * 4)
        const puffs = []
        for (let p = 0; p < puffCount; p++) {
          puffs.push({
            dx: (p - puffCount / 2) * 34 + (Math.random() - 0.5) * 24,
            dy: (Math.random() - 0.5) * 20,
            r: 26 + Math.random() * 30
          })
        }
        clouds.push({
          x: Math.random() * (w + 400) - 200,
          y: h * (0.1 + Math.random() * 0.7),
          scale,
          speed: (0.06 + Math.random() * 0.16) * scale,
          alpha: 0.2 + Math.random() * 0.34,
          puffs
        })
      }
    }

    const build = () => {
      buildStars()
      buildClouds()
      nextShot = performance.now() + 2500 + Math.random() * 6000
    }

    const starColor = (hue: number, alpha: number) => {
      if (hue === 42) return `rgba(255, 232, 176, ${alpha})`
      if (hue === 214) return `rgba(198, 219, 255, ${alpha})`
      return `rgba(255, 255, 255, ${alpha})`
    }

    const drawStars = (time: number) => {
      for (const s of stars) {
        const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(s.phase + time * s.speed)
        const alpha = Math.max(0, Math.min(1, s.base * twinkle))
        if (alpha <= 0.02) continue

        if (s.r > 0.9) {
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5)
          halo.addColorStop(0, starColor(s.hue, alpha * 0.5))
          halo.addColorStop(1, starColor(s.hue, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = starColor(s.hue, alpha)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()

        if (s.flare) {
          const reach = s.r * (5 + twinkle * 4)
          ctx.strokeStyle = starColor(s.hue, alpha * 0.55)
          ctx.lineWidth = Math.max(0.5, s.r * 0.32)
          ctx.beginPath()
          ctx.moveTo(s.x - reach, s.y)
          ctx.lineTo(s.x + reach, s.y)
          ctx.moveTo(s.x, s.y - reach)
          ctx.lineTo(s.x, s.y + reach)
          ctx.stroke()
        }
      }
    }

    const drawShooting = (time: number, dt: number) => {
      if (reduced) return
      if (!shooting && time > nextShot) {
        const fromLeft = Math.random() > 0.4
        shooting = {
          x: fromLeft ? -60 : w * (0.5 + Math.random() * 0.5),
          y: h * (0.04 + Math.random() * 0.34),
          len: 90 + Math.random() * 130,
          angle: (fromLeft ? 0.32 : 0.72) + Math.random() * 0.1,
          speed: 0.55 + Math.random() * 0.4,
          life: 0,
          ttl: 900 + Math.random() * 500
        }
      }
      if (!shooting) return

      shooting.life += dt
      const progress = shooting.life / shooting.ttl
      if (progress >= 1) {
        shooting = null
        nextShot = time + 4000 + Math.random() * 9000
        return
      }

      const dx = Math.cos(shooting.angle)
      const dy = Math.sin(shooting.angle)
      shooting.x += dx * shooting.speed * dt
      shooting.y += dy * shooting.speed * dt

      const fade = Math.sin(progress * Math.PI)
      const tailX = shooting.x - dx * shooting.len
      const tailY = shooting.y - dy * shooting.len
      const grad = ctx.createLinearGradient(tailX, tailY, shooting.x, shooting.y)
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)')
      grad.addColorStop(1, `rgba(255, 246, 214, ${fade * 0.9})`)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.6
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(shooting.x, shooting.y)
      ctx.stroke()
    }

    const drawClouds = (dt: number) => {
      for (const c of clouds) {
        if (!reduced) c.x += c.speed * dt * 0.06
        if (c.x - 260 * c.scale > w) c.x = -260 * c.scale

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.scale(c.scale, c.scale)
        for (const p of c.puffs) {
          const grad = ctx.createRadialGradient(p.dx, p.dy, 0, p.dx, p.dy, p.r)
          grad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`)
          grad.addColorStop(0.62, `rgba(255, 255, 255, ${c.alpha * 0.5})`)
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }

    let frameId = 0
    let last = performance.now()

    const draw = (time: number) => {
      const dt = Math.min(time - last, 48)
      last = time
      ctx.clearRect(0, 0, w, h)

      if (document.documentElement.classList.contains('light')) {
        if (!HAS_CLOUD_ART) drawClouds(dt)
      } else {
        drawStars(time)
        drawShooting(time, dt)
      }

      frameId = requestAnimationFrame(draw)
    }

    let resizeTimeout: number
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        setSize()
        build()
      }, 150)
    }

    setSize()
    build()
    frameId = requestAnimationFrame(draw)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frameId)
      clearTimeout(resizeTimeout)
    }
  }, [])

  return (
    <section className="vx-root">
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/hubot-sans');
        .vx-root {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: var(--bg);
          background-image: linear-gradient(180deg, #0a1c46 0%, #0a1330 34%, rgb(7 10 20 / 0%) 78%);
        }
        html.light .vx-root {
          background-image: linear-gradient(180deg, #4c9ae8 0%, #8cc2ef 30%, #cfe4f7 62%, rgb(243 246 253 / 0%) 88%);
        }
        .vx-root * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        .vx-root h2, .vx-root p {
          margin: 0;
          padding: 0;
          font-family: 'Hubot-Sans', sans-serif;
        }
        canvas#vxParticleCanvas {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          animation: vx-load 1.2s ease-in-out forwards;
          z-index: 2;
          width: 100%;
          height: 100%;
        }
        .vx-sun {
          position: absolute;
          top: 4rem;
          right: 12%;
          width: 22rem;
          height: 22rem;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(255, 250, 226, 0.95), rgba(255, 226, 150, 0.42) 38%, rgba(255, 214, 130, 0) 72%);
          z-index: 1;
          pointer-events: none;
          animation: vx-sun-pulse 9s ease-in-out infinite;
        }
        @keyframes vx-sun-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9 }
          50% { transform: scale(1.06); opacity: 1 }
        }
        .vx-sun-art {
          position: absolute;
          top: 2rem;
          right: 8%;
          width: clamp(11rem, 24vw, 26rem);
          height: auto;
          z-index: 1;
          pointer-events: none;
          user-select: none;
          animation: vx-sun-pulse 11s ease-in-out infinite;
        }
        .vx-cloud-art {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          overflow: hidden;
        }
        .vx-cloud-art__layer {
          position: absolute;
          left: 0;
          width: 200%;
          display: flex;
          will-change: transform;
        }
        .vx-cloud-art__layer span {
          display: block;
          width: 50%;
          background-repeat: repeat-x;
          background-size: 100% 100%;
          background-position: center;
        }
        .vx-cloud-art__layer--far {
          top: 12%;
          height: clamp(7rem, 18vw, 15rem);
          opacity: 0.72;
          animation: vx-cloud-run 140s linear infinite;
        }
        .vx-cloud-art__layer--near {
          top: 34%;
          height: clamp(9rem, 24vw, 20rem);
          opacity: 0.92;
          animation: vx-cloud-run 78s linear infinite;
        }
        @keyframes vx-cloud-run {
          from { transform: translateX(0) }
          to { transform: translateX(-50%) }
        }
        @media (max-width: 768px) {
          .vx-cloud-art__layer--far { top: 10%; }
          .vx-cloud-art__layer--near { top: 30%; }
        }
        .vx-hero-sub {
          position: absolute;
          left: 0;
          right: 0;
          top: 13rem;
          margin: auto;
          opacity: 0;
          transform: translateY(-1rem);
          animation: vx-load 2s ease-in 0s forwards, vx-up 1.4s ease-out 0s forwards;
          z-index: 10;
        }
        .vx-hero-sub p {
          font-size: 1rem;
          position: relative;
          width: fit-content;
          margin: auto;
          color: #f7edd8;
          text-shadow: 0 2px 16px rgba(250, 204, 21, 0.24);
          background: linear-gradient(0deg, #f7edd8 0%, var(--gold-light) 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        html.light .vx-hero-sub p {
          background: none;
          -webkit-text-fill-color: initial;
          color: #163a67;
          text-shadow: 0 1px 10px rgba(255, 255, 255, 0.7);
        }
        .vx-hero-sub p::before,
        .vx-hero-sub p::after {
          position: absolute;
          top: 60%;
          content: '';
          width: 5rem;
          height: 1px;
          opacity: 0;
          animation: vx-load2 1.4s ease-in-out 0s forwards, vx-up 1.4s ease-out 0s forwards;
        }
        .vx-hero-sub p::before {
          background: linear-gradient(-90deg, var(--gold-light) 0%, transparent 100%);
          right: 120%;
          transform: translateX(-5rem);
        }
        .vx-hero-sub p::after {
          background: linear-gradient(90deg, var(--gold-light) 0%, transparent 100%);
          left: 120%;
          transform: translateX(5rem);
        }
        .vx-hero {
          width: 100%;
          position: absolute;
          top: 16rem;
          z-index: 10;
        }
        .vx-hero-text {
          position: relative;
          margin: auto;
          padding-top: 2rem;
          transform: translateY(-1.6rem);
          opacity: 0;
          animation: vx-load 2s ease-in-out 0.6s forwards;
        }
        .vx-hero-text > h2 {
          position: absolute;
          left: 0;
          right: 0;
          margin: auto;
          width: fit-content;
          font-size: 7rem;
          font-weight: 600;
          background: linear-gradient(0deg, #f1e0b8 30%, var(--gold-light) 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          --p: 0%;
          animation: vx-glow 8s ease-in-out 1.2s infinite;
        }
        html.light .vx-hero-text > h2 {
          background: linear-gradient(0deg, #a76d05 14%, #dda21a 58%, #f6d879 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: vx-glow-light 8s ease-in-out 1.2s infinite;
        }
        @keyframes vx-glow-light {
          0%, 100% {
            text-shadow: 0 2px 26px rgba(255, 255, 255, 0.75), 0 0 46px rgba(255, 236, 190, 0.5);
          }
          50% {
            text-shadow: 0 2px 34px rgba(255, 255, 255, 0.95), 0 0 64px rgba(255, 226, 150, 0.75);
          }
        }
        @keyframes vx-glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(250, 204, 21, 0.3),
                         0 0 40px rgba(250, 204, 21, 0.2),
                         0 0 60px rgba(250, 204, 21, 0.1);
          }
          50% {
            text-shadow: 0 0 30px rgba(250, 204, 21, 0.5),
                         0 0 60px rgba(250, 204, 21, 0.3),
                         0 0 90px rgba(250, 204, 21, 0.2);
          }
        }
        .vx-hero-text h2:nth-child(2) {
          filter: blur(12px) opacity(0.4);
        }
        html.light .vx-hero-text h2:nth-child(2) {
          filter: blur(16px) opacity(0.28);
        }
        .vx-hero-p {
          font-size: 1.2rem;
          position: absolute;
          left: 25%;
          right: 25%;
          top: 26.5rem;
          margin: auto;
          text-align: center;
          opacity: 0;
          animation: vx-load 2s ease-out 2s forwards, vx-up 1.4s ease-out 2s forwards;
          color: var(--text-hero);
          text-shadow: 0 2px 16px rgba(250, 204, 21, 0.24);
          background: linear-gradient(0deg, var(--text-hero) 0%, var(--gold-light-text) 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          z-index: 10;
          max-width: 90%;
        }
        html.light .vx-hero-p {
          background: none;
          -webkit-text-fill-color: initial;
          color: #14335c;
          text-shadow: 0 1px 12px rgba(255, 255, 255, 0.85);
        }
        .vx-hero-actions {
          position: absolute;
          left: 0;
          right: 0;
          top: 30.75rem;
          z-index: 12;
          display: flex;
          gap: 0.9rem;
          justify-content: center;
          flex-wrap: wrap;
          padding: 0 1rem;
          opacity: 0;
          transform: translateY(0.8rem);
          animation: vx-load 1.4s ease-out 2.5s forwards, vx-up 1.2s ease-out 2.5s forwards;
        }
        .vx-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.7rem;
          border-radius: 999px;
          font-size: 0.98rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        }
        .vx-cta--primary {
          background: linear-gradient(135deg, var(--brand-200), var(--brand-400) 55%, var(--brand-500));
          color: #1a1405;
          box-shadow: 0 10px 30px -10px rgba(221, 169, 47, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.45);
        }
        .vx-cta--primary:hover {
          transform: translateY(-2px);
          color: #1a1405;
          box-shadow: 0 16px 40px -12px rgba(221, 169, 47, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        .vx-cta--ghost {
          color: #f2f5ff;
          border: 1px solid rgba(226, 235, 255, 0.34);
          background: rgba(10, 18, 42, 0.42);
          backdrop-filter: blur(8px);
        }
        .vx-cta--ghost:hover {
          transform: translateY(-2px);
          color: #ffffff;
          border-color: rgba(226, 235, 255, 0.6);
          background: rgba(10, 18, 42, 0.6);
        }
        html.light .vx-cta--ghost {
          color: #12305a;
          border-color: rgba(18, 48, 90, 0.24);
          background: rgba(255, 255, 255, 0.72);
        }
        html.light .vx-cta--ghost:hover {
          color: #0d2444;
          background: rgba(255, 255, 255, 0.92);
        }
        .vx-mountains {
          position: absolute;
          left: 0;
          right: 0;
          top: 38rem;
          margin: auto;
          width: 100%;
          height: 10rem;
          pointer-events: none;
          z-index: 5;
        }
        .vx-mountains::before {
          content: '';
          width: 100%;
          height: 500%;
          position: absolute;
          top: 0;
          background: linear-gradient(0deg, var(--bg) 80%, transparent 90%);
          z-index: 2;
        }
        .vx-mountains > div {
          box-shadow:
            -1rem -0.2rem 0.4rem -1.1rem #f6e9c8,
            inset 0 0 0 2px #f6e9c8,
            inset 0.2rem 0.3rem 0.2rem -0.2rem #f6e9c8,
            inset 10.2rem 10.3rem 2rem -10rem rgba(246, 233, 200, 0.18);
          background: var(--bg);
          z-index: 1;
          filter: brightness(0.9);
          position: absolute;
          left: 0;
          right: 0;
          margin: auto;
          width: 20rem;
          height: 20rem;
          rotate: 45deg;
        }
        .vx-mountains > div:nth-child(1) {
          bottom: -240%;
          translate: -6rem 2rem;
          animation: vx-m1 2s ease-out 2.4s forwards;
        }
        .vx-mountains > div:nth-child(2) {
          bottom: -240%;
          translate: -2rem 0;
          width: 14rem;
          height: 20rem;
          animation: vx-m2 2s ease-out 2.2s forwards;
        }
        .vx-mountains > div:nth-child(3) {
          bottom: -240%;
          translate: 6rem 3rem;
          animation: vx-m1 2s ease-out 2s forwards;
        }
        html.light .vx-mountains::before {
          background: linear-gradient(0deg, var(--bg) 78%, transparent 90%);
        }
        html.light .vx-mountains > div {
          box-shadow:
            0 0 2rem -0.6rem rgba(32, 72, 132, 0.35),
            inset 0 0 0 2.5px #b8820f,
            inset 0.3rem 0.4rem 0.3rem -0.25rem rgba(255, 255, 255, 0.9),
            inset 9rem 9rem 3rem -8rem rgba(96, 140, 200, 0.3);
          background: linear-gradient(135deg, #ffffff, #dbe7f7);
          filter: none;
        }
        .vx-cloudbank {
          position: absolute;
          left: -8%;
          right: -8%;
          bottom: 4.5rem;
          height: 14rem;
          z-index: 6;
          pointer-events: none;
          opacity: 0;
          animation: vx-load 2.6s ease-out 2.8s forwards;
        }
        .vx-cloudbank span {
          position: absolute;
          inset: 0;
          background-repeat: no-repeat;
          will-change: transform;
        }
        .vx-cloudbank span:nth-child(1) {
          background-image:
            radial-gradient(26% 34% at 6% 60%, var(--cloud-edge), transparent 68%),
            radial-gradient(32% 40% at 30% 70%, var(--cloud), transparent 70%),
            radial-gradient(28% 36% at 54% 58%, var(--cloud-edge), transparent 68%),
            radial-gradient(34% 42% at 78% 70%, var(--cloud), transparent 70%),
            radial-gradient(26% 32% at 97% 62%, var(--cloud-edge), transparent 68%);
          animation: vx-drift-a 72s ease-in-out infinite;
        }
        .vx-cloudbank span:nth-child(2) {
          background-image:
            radial-gradient(38% 30% at 18% 80%, var(--cloud), transparent 66%),
            radial-gradient(30% 26% at 44% 76%, var(--cloud-edge), transparent 68%),
            radial-gradient(40% 32% at 70% 82%, var(--cloud), transparent 66%),
            radial-gradient(30% 24% at 92% 76%, var(--cloud-edge), transparent 68%);
          opacity: 0.8;
          animation: vx-drift-b 96s ease-in-out infinite;
        }
        .vx-cloudbank span:nth-child(3) {
          background-image:
            radial-gradient(18% 20% at 14% 42%, var(--cloud-edge), transparent 72%),
            radial-gradient(16% 18% at 62% 36%, var(--cloud-edge), transparent 72%),
            radial-gradient(20% 22% at 86% 46%, var(--cloud), transparent 72%);
          opacity: 0.6;
          animation: vx-drift-a 58s ease-in-out infinite reverse;
        }
        @keyframes vx-drift-a {
          0% { transform: translateX(-3.5rem) }
          50% { transform: translateX(3.5rem) }
          100% { transform: translateX(-3.5rem) }
        }
        @keyframes vx-drift-b {
          0% { transform: translateX(3rem) }
          50% { transform: translateX(-3rem) }
          100% { transform: translateX(3rem) }
        }
        .vx-hero-spacer {
          height: 52rem;
          pointer-events: none;
        }
        @keyframes vx-load {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes vx-load2 {
          0% { opacity: 0; }
          100% { opacity: 0.3; }
        }
        @keyframes vx-up {
          100% { transform: translateY(0); }
        }
        @keyframes vx-m1 {
          0% { bottom: -240%; }
          100% { bottom: -140%; }
        }
        @keyframes vx-m2 {
          0% { bottom: -240%; }
          100% { bottom: -108%; }
        }
        @property --p {
          syntax: '<percentage>';
          inherits: false;
          initial-value: 0%;
        }
        @media (max-width: 1024px) {
          .vx-hero-text > h2 { font-size: 5rem; }
        }
        @media (max-width: 768px) {
          .vx-hero-text > h2 { font-size: 4rem; }
          .vx-hero-p { font-size: 1rem; padding: 0 1rem; top: 21rem; left: 5%; right: 5%; }
          .vx-hero-sub { top: 10rem; }
          .vx-hero { top: 13rem; }
          .vx-hero-actions { top: 25rem; }
          .vx-mountains { top: 35rem; }
          .vx-cloudbank { height: 10rem; bottom: 3rem; }
          .vx-hero-spacer { height: 47rem; }
          .vx-sun { width: 14rem; height: 14rem; right: 6%; top: 3rem; }
        }
        @media (max-width: 480px) {
          .vx-hero-text > h2 { font-size: 3rem; }
          .vx-hero-sub p::before,
          .vx-hero-sub p::after { width: 3rem; }
          .vx-cta { padding: 0.75rem 1.3rem; font-size: 0.9rem; }
        }
body .bg {
  width: 100%;
  margin: auto;
  height: 100vh;
  max-height: 600px;
  overflow: hidden;
  position: absolute;
  top: 50%;
}
body .bg .aur_cont {
  margin: 120px auto 0;
  display: table;
  height: auto;
}
body .bg .aur_cont .aur {
  transform: skew(-0.06turn, 18deg);
  display: block;
  width: 0;
  min-height: 122px;
  float: left;
  margin-left: 100px;
  border-radius: 5% 52% 30px 20px;
  opacity: 1;
}
body .bg .aur_cont .aur.aur_1 {
  box-shadow: #4bff8b 0px 0px 100px 40px;
  margin-top: 2px;
  animation: topup 7031ms infinite linear;
}
body .bg .aur_cont .aur.aur_2 {
  box-shadow: #4b718c 0px 0px 100px 40px;
  margin-top: 27px;
  animation: topup 10359ms infinite linear;
}
body .bg .aur_cont .aur.aur_3 {
  box-shadow: #4bb044 0px 0px 100px 40px;
  margin-top: 27px;
  animation: topup 5515ms infinite linear;
}
body .bg .aur_cont .aur.aur_4 {
  box-shadow: #4bd4ff 0px 0px 100px 40px;
  margin-top: -30px;
  animation: topup 11580ms infinite linear;
}
body .bg .aur_cont .aur.aur_5 {
  box-shadow: #4bffa6 0px 0px 100px 40px;
  margin-top: 0px;
  animation: topup 6773ms infinite linear;
}
body .bg .aur_cont .aur.aur_6 {
  box-shadow: #4b724a 0px 0px 100px 40px;
  margin-top: 45px;
  animation: topup 8622ms infinite linear;
}
body .bg .aur_cont .aur.aur_7 {
  box-shadow: #4bb044 0px 0px 100px 40px;
  margin-top: 0px;
  animation: topup 11510ms infinite linear;
}
body .bg .aur_cont .aur.aur_8 {
  box-shadow: #4be56f 0px 0px 100px 40px;
  margin-top: 5px;
  animation: topup 10258ms infinite linear;
}
body .bg .aur_cont .aur.aur_9 {
  box-shadow: #4bb7ff 0px 0px 100px 40px;
  margin-top: 9px;
  animation: topup 12160ms infinite linear;
}
body .bg .aur_cont .aur.aur_10 {
  box-shadow: #4bffff 0px 0px 100px 40px;
  margin-top: -27px;
  animation: topup 12931ms infinite linear;
}
@keyframes drift {
  from {
    transform: rotate(0deg);
  }
  from {
    transform: rotate(360deg);
  }
}
@keyframes topup {
  0%, 100% {
    transform: translatey(0px);
    opacity: 0;
  }
  50% {
    transform: translatey(150px);
    opacity: 0.1;
  }
  25%, 75% {
    opacity: 1;
  }
}
@keyframes northern {
  0% {
    transform: translate(5%, -2%);
  }
  25% {
    transform: translate(10%, 7%);
  }
  40% {
    transform: rotate(-10deg);
  }
  60% {
    transform: translate(7%, -2%);
  }
  85% {
    transform: translate(6%, 3%) rotate(12deg);
  }
  100% {
    transform: none;
  }
}

      `}</style>

      <canvas id="vxParticleCanvas" ref={canvasRef} />

      {SUN_SRC ? (
        <img className="vx-sun-art only-light" src={SUN_SRC} alt="" aria-hidden="true" />
      ) : (
        <div className="vx-sun only-light" aria-hidden="true" />
      )}

      {HAS_CLOUD_ART && (
        <div className="vx-cloud-art only-light" aria-hidden="true">
          {CLOUDS_FAR && (
            <div className="vx-cloud-art__layer vx-cloud-art__layer--far">
              <span style={{ backgroundImage: `url(${CLOUDS_FAR})` }} />
              <span style={{ backgroundImage: `url(${CLOUDS_FAR})` }} />
            </div>
          )}
          {CLOUDS_NEAR && (
            <div className="vx-cloud-art__layer vx-cloud-art__layer--near">
              <span style={{ backgroundImage: `url(${CLOUDS_NEAR})` }} />
              <span style={{ backgroundImage: `url(${CLOUDS_NEAR})` }} />
            </div>
          )}
        </div>
      )}

    <div className="bg only-dark">
      <div className="aur_cont">
        <span className="aur aur_1"></span>
        <span className="aur aur_2"></span>
        <span className="aur aur_3"></span>
        <span className="aur aur_4"></span>
        <span className="aur aur_5"></span>
        <span className="aur aur_6"></span>
        <span className="aur aur_7"></span>
        <span className="aur aur_8"></span>
        <span className="aur aur_9"></span>
        <span className="aur aur_10"></span>
      </div>
    </div>

      <div className="vx-hero-sub">
        <p>{t('introducing')}</p>
      </div>


      <div className="vx-hero">
        <div className="vx-hero-text">
          <h2>VERTEX</h2>
          <h2>VERTEX</h2>
        </div>
      </div>

      <p className="vx-hero-p">{t('tagline')}</p>

      <div className="vx-hero-actions">
        <Link href={`${base}/trial-lesson`} className="vx-cta vx-cta--primary">
          {t('heroPrimary')}
        </Link>
        <Link href={`${base}/courses`} className="vx-cta vx-cta--ghost">
          {t('heroSecondary')}
        </Link>
      </div>

      <div className="vx-mountains">
        <div />
        <div />
        <div />
      </div>

      <div className="vx-cloudbank" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="vx-hero-spacer " />
    </section>
  )
}
