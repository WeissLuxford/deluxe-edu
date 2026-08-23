'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import rough from 'roughjs'

type BoilingIconProps = {
  icon: ComponentType
  color?: string
  size?: number
  intervalMs?: number
}

export function BoilingIcon({ icon: Icon, color = 'currentColor', size = 48, intervalMs = 150 }: BoilingIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const svgMarkup = renderToStaticMarkup(<Icon />)
    const doc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    // Lucide icons mix primitive element types per-icon (Target is circles,
    // Medal is a path plus a circle, etc.) — extracting only <path> silently
    // drops whichever icons don't happen to use one.
    const shapes = [...doc.querySelectorAll('path, circle, line, rect, polyline, ellipse')]

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    const rc = rough.canvas(canvas)
    const scale = size / 24

    // rough.js hands `color` straight to the canvas 2D context, which (unlike
    // SVG) can't resolve custom properties passed as a raw string — only the
    // `currentColor` keyword itself is spec-resolved there. Routing the value
    // through the canvas element's own computed style resolves both cases.
    canvas.style.color = color
    const resolvedColor = getComputedStyle(canvas).color || color

    let rafId = 0
    let lastDraw = 0

    const loop = (t: number) => {
      rafId = requestAnimationFrame(loop)
      if (t - lastDraw < intervalMs) return
      lastDraw = t

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(scale, scale)
      const opts = { stroke: resolvedColor, roughness: 0.7, strokeWidth: 1.5 / scale }
      for (const shape of shapes) {
        const num = (attr: string) => Number(shape.getAttribute(attr) ?? 0)
        switch (shape.tagName) {
          case 'path': {
            const d = shape.getAttribute('d')
            if (d) rc.path(d, opts)
            break
          }
          case 'circle':
            rc.circle(num('cx'), num('cy'), num('r') * 2, opts)
            break
          case 'ellipse':
            rc.ellipse(num('cx'), num('cy'), num('rx') * 2, num('ry') * 2, opts)
            break
          case 'line':
            rc.line(num('x1'), num('y1'), num('x2'), num('y2'), opts)
            break
          case 'rect':
            rc.rectangle(num('x'), num('y'), num('width'), num('height'), opts)
            break
          case 'polyline': {
            const points = shape
              .getAttribute('points')
              ?.trim()
              .split(/\s+/)
              .map((pair) => pair.split(',').map(Number) as [number, number])
            if (points) rc.linearPath(points, opts)
            break
          }
        }
      }
      ctx.restore()
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [Icon, color, size, intervalMs])

  return <canvas ref={canvasRef} className="boiling-icon" style={{ width: size, height: size }} aria-hidden />
}
