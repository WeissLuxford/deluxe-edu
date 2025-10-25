'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

export default function TilesCarousel() {
  const items = useMemo(() => [
    { emoji: '📡', title: 'Live streams', sub: 'Interactive sessions' },
    { emoji: '📝', title: 'Assignments', sub: 'Practice and review' },
    { emoji: '🎧', title: 'Recordings and notes', sub: 'Watch and read' },
    { emoji: '🎬', title: 'Lesson preview', sub: 'See the format' },
    { emoji: '💬', title: 'Q&A sessions', sub: 'Ask questions' }
  ], [])

  const duplicatedItems = useMemo(() => [...items, ...items, ...items], [items])
  const block = items.length
  const total = duplicatedItems.length

  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(block)
  const [paused, setPaused] = useState(false)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const clampToMiddle = useCallback((index: number) => {
    let idx = ((index % total) + total) % total
    if (idx < block) idx += block
    if (idx >= block * 2) idx -= block
    return idx
  }, [block, total])

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const el = trackRef.current
    if (!el) return
    const idx = clampToMiddle(index)
    const child = el.children[idx] as HTMLElement
    if (!child) return
    isScrollingRef.current = true
    el.scrollTo({
      left: child.offsetLeft - (el.clientWidth - child.clientWidth) / 2,
      behavior: smooth ? 'smooth' : 'auto'
    })
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = false }, smooth ? 600 : 50)
  }, [clampToMiddle])

  useEffect(() => {
    const id = setTimeout(() => { scrollToIndex(block, false) }, 60)
    return () => clearTimeout(id)
  }, [block, scrollToIndex])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let raf: number | null = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const mid = el.scrollLeft + el.clientWidth / 2
        let ci = 0
        let md = Infinity
        Array.from(el.children).forEach((child, i) => {
          const ch = child as HTMLElement
          const cc = ch.offsetLeft + ch.clientWidth / 2
          const d = Math.abs(cc - mid)
          if (d < md) { md = d; ci = i }
        })
        setActive(ci)
        const firstChild = el.children[0] as HTMLElement | undefined
        const lastChild = el.children[total - 1] as HTMLElement | undefined
        const cw = firstChild?.clientWidth || 0
        const threshold = cw * 2
        const maxScroll = el.scrollWidth - el.clientWidth
        if (!isScrollingRef.current) {
          if (el.scrollLeft < threshold) {
            const target = clampToMiddle(ci)
            const tEl = el.children[target] as HTMLElement
            if (tEl) el.scrollLeft = tEl.offsetLeft - (el.clientWidth - tEl.clientWidth) / 2
            setActive(target)
          } else if (el.scrollLeft > maxScroll - threshold) {
            const target = clampToMiddle(ci)
            const tEl = el.children[target] as HTMLElement
            if (tEl) el.scrollLeft = tEl.offsetLeft - (el.clientWidth - tEl.clientWidth) / 2
            setActive(target)
          }
        }
        raf = null
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { el.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [clampToMiddle, total])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      if (isScrollingRef.current) return
      scrollToIndex(active + 1)
    }, 3500)
    const onVis = () => { setPaused(document.hidden) }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [paused, active, scrollToIndex])

  const prev = () => { if (!isScrollingRef.current) scrollToIndex(active - 1) }
  const next = () => { if (!isScrollingRef.current) scrollToIndex(active + 1) }
  const goToDot = (dotIndex: number) => { if (!isScrollingRef.current) scrollToIndex(block + dotIndex) }

  const activeDot = ((active % block) + block) % block

  return (
    <section
      className="tiles-carousel"
      aria-labelledby="tiles-head"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <style>{`
        .tiles-carousel { padding: 3rem 0 2rem; position: relative; max-width: 1200px; margin: 0 auto }
        .tiles-track { display: grid; grid-auto-flow: column; grid-auto-columns: 85%; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; padding: 0 1rem 1rem; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none }
        .tiles-track::-webkit-scrollbar { display: none }
        @media (min-width: 640px){ .tiles-track { grid-auto-columns: calc(50% - .5rem) } }
        @media (min-width: 1024px){ .tiles-track { grid-auto-columns: calc(33.333% - .75rem) } }
        .tile-slide { scroll-snap-align: center; min-width: 0 }
        .tile-card { display: grid; grid-template-columns: 56px 1fr; gap: 1rem; align-items: center; padding: 1.5rem; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-secondary); transition: var(--transition-slow); cursor: pointer; height: 100% }
        .tile-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-gold); transform: translateY(-2px) }
        .tile-ico { width: 56px; height: 56px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-tertiary); font-size: 24px; transition: var(--transition-slow) }
        .tile-card:hover .tile-ico { border-color: var(--gold); transform: scale(1.05) }
        .tile-title { font-weight: 600; font-size: 1rem; color: var(--fg); margin-bottom: .25rem }
        .tile-sub { font-size: .875rem; color: var(--muted) }
        .tiles-dots { display: flex; justify-content: center; gap: .5rem; margin-top: 1.5rem }
        .tiles-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); border: 1px solid grey; cursor: pointer; transition: var(--transition-slow); padding: 0 }
        .tiles-dot:hover { background: var(--muted); transform: scale(1.3) }
        .tiles-dot.active { background: var(--gold); width: 24px; border-radius: var(--radius-sm) }
        .tiles-arrows { position: absolute; top: 36%; left: 0; right: 0; transform: translateY(-50%); pointer-events: none; z-index: 10 }
        .tiles-arrow { position: absolute; width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-secondary); color: var(--fg); font-size: 24px; cursor: pointer; transition: var(--transition-slow); pointer-events: auto; box-shadow: var(--shadow) }
        .tiles-arrow:hover { border-color: var(--gold); background: var(--gold); color: var(--bg); transform: scale(1.1); box-shadow: var(--shadow-gold) }
        .tiles-arrow:active { transform: scale(.95) }
        .tiles-arrow.left { left: -50px }
        .tiles-arrow.right { right: -50px }
        @media (max-width: 768px){ .tiles-arrow { width: 36px; height: 36px; font-size: 20px } .tiles-arrow.left { left: 0 } .tiles-arrow.right { right: 0 } }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0 }
      `}</style>

      <h2 id="tiles-head" className="sr-only">Vertex format</h2>

      <div className="tiles-arrows">
        <button aria-label="Previous" className="tiles-arrow left" onClick={prev} type="button">‹</button>
        <button aria-label="Next" className="tiles-arrow right" onClick={next} type="button">›</button>
      </div>

      <div ref={trackRef} className="tiles-track" role="list">
        {duplicatedItems.map((it, i) => (
          <article key={i} className="tile-slide" role="listitem">
            <div className="tile-card">
              <div className="tile-ico">{it.emoji}</div>
              <div>
                <div className="tile-title">{it.title}</div>
                <div className="tile-sub">{it.sub}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="tiles-dots" aria-label="Carousel dots">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={`tiles-dot${activeDot === i ? ' active' : ''}`}
            onClick={() => goToDot(i)}
            type="button"
          />
        ))}
      </div>
    </section>
  )
}
