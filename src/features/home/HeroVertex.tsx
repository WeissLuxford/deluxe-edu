'use client'

import { useEffect, useRef } from 'react'

export default function HeroVertex() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    setSize()

    let particles: Array<{
      x: number
      y: number
      speed: number
      opacity: number
      fadeDelay: number
      fadeStart: number
      fadingOut: boolean
      size: number
    }> = []

    const count = () => Math.min(Math.floor((window.innerWidth * window.innerHeight) / 6000), 200)

    const reset = (p: typeof particles[0]) => {
      p.x = Math.random() * window.innerWidth
      p.y = Math.random() * window.innerHeight
      p.speed = Math.random() * 0.4 + 0.2
      p.opacity = Math.random() * 0.6 + 0.4
      // p.fadeDelay = Math.random() * 1000 + 500
      // p.fadeStart = Date.now() + p.fadeDelay
      // p.fadingOut = false
      p.size = Math.random() * 2 + 0.8
    }

    const init = () => {
      particles = []
      const particleCount = count()
      for (let i = 0; i < particleCount; i++) {
        const p = {} as typeof particles[0]
        reset(p)
        p.y = Math.random() * window.innerHeight
        particles.push(p)
      }
    }

    let frameId: number
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const p of particles) {
        p.y -= p.speed
        if (p.y < -10) {
          reset(p)
          p.y = window.innerHeight + 10
        }
        if (!p.fadingOut && Date.now() > p.fadeStart) {
          p.fadingOut = true
        }
        if (p.fadingOut) {
          p.opacity -= 0.008
          if (p.opacity <= 0) {
            reset(p)
            p.y = window.innerHeight + 10
          }
        }
        ctx.fillStyle = `rgba(250, 204, 21, ${p.opacity})`
        const h = Math.random() * 3 + 2
        ctx.fillRect(p.x, p.y, p.size, h)
      }
      frameId = requestAnimationFrame(draw)
    }

    let resizeTimeout: number
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        setSize()
        init()
      }, 150)
    }

    window.addEventListener('resize', onResize)
    init()
    draw()

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
          background-image: linear-gradient(0deg, rgb(0 152 244 / 0%), rgb(41 124 222));
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
          animation: vx-load 0.4s ease-in-out forwards;
          z-index: 2;
          width: 100%;
          height: 100%;
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
        .vx-hero-p {
          font-size: 1.2rem;
          position: absolute;
          left: 25%;
          right: 25%;
          top: 30rem;
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
         text-shadow: 1px 1px 1px white, 1px 1px 1px white;
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
            -1rem -0.2rem 0.4rem -1.1rem rgba(199, 164, 90, 0.32),
            inset 0 0 0 2px var(--gold),
            inset 0.2rem 0.3rem 0.2rem -0.2rem rgba(184, 149, 77, 0.34),
            inset 10.2rem 10.3rem 2rem -10rem rgba(212, 176, 106, 0.16);
          background: var(--bg-secondary);
          filter: brightness(1.02);
        }
        .vx-hero-spacer {
          height: 50rem;
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
          .vx-hero-p { font-size: 1rem; padding: 0 1rem; top: 24rem; }
          .vx-hero-sub { top: 10rem; }
          .vx-hero { top: 13rem; }
          .vx-mountains { top: 32rem; }
          .vx-hero-spacer { height: 40rem; }
        }
        @media (max-width: 480px) {
          .vx-hero-text > h2 { font-size: 3rem; }
          .vx-hero-sub p::before,
          .vx-hero-sub p::after { width: 3rem; }
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

      <canvas id="vxParticleCanvas" className="only-dark" ref={canvasRef} />

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
        <p>Introducing</p>
      </div>
      

      <div className="vx-hero">
        <div className="vx-hero-text">
          <h2>VERTEX</h2>
          <h2>VERTEX</h2>
        </div>
      </div>

      <p className="vx-hero-p">To the highest heights</p>

      <div className="vx-mountains">
        <div />
        <div />
        <div />
      </div>

      <div className="vx-hero-spacer " />
    </section>
  )
}
