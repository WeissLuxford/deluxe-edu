'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { BoilingIcon } from '@/features/ui/components/BoilingIcon'

export type LevelNode = {
  code: string
  name: string
  text: string
  href: string
}

// Hub-and-spoke layout: each level sits in one of 6 fixed slots around a
// center hub (see `.levels-node--N` position rules in sections.css), and
// each curve here connects that slot to the hub at the middle of this
// 800x500 viewBox.
const LINK_PATHS = [
  'M 140 75 Q 250 170, 395 247',
  'M 660 75 Q 545 170, 405 247',
  'M 80 270 Q 230 258, 388 250',
  'M 720 270 Q 570 258, 412 250',
  'M 140 425 Q 250 335, 395 253',
  'M 660 425 Q 545 335, 405 253'
]

const RING_RADII = [60, 105, 150]

// A1→C2 is a progression, not six unrelated categories, so the nodes share one
// hue and gain intensity as the level rises. Six different colors here read as
// decoration and fight the diagram's meaning.
function ladderAccent(index: number, total: number) {
  const strength = 35 + Math.round((index / Math.max(total - 1, 1)) * 65)
  return `color-mix(in oklab, var(--section-accent, var(--ui-accent)) ${strength}%, var(--muted))`
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const EASE_POP = [0.34, 1.56, 0.64, 1] as const

// A single `whileInView` on the outer diagram drives every child through
// these variants (staggerChildren), instead of each ring/link/node running
// its own IntersectionObserver — with ~15 separate observers on absolutely
// positioned elements, a couple would occasionally never fire.
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
}

const ringVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: EASE_OUT } }
}

const hubVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: EASE_POP } }
}

const linkVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1, transition: { duration: 0.8, ease: EASE_OUT } }
}

const nodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_POP } }
}

export function LevelsDiagram({ levels }: { levels: LevelNode[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  // Touch fires a synthetic mouseenter right before click, which would
  // already flip `activeIndex` to this tile by the time the click guard
  // below runs — so the tap/navigate decision needs its own ref instead of
  // reading that state.
  const tapArmedIndex = useRef<number | null>(null)

  useEffect(() => {
    const closeIfOutside = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('.levels-node')) {
        setActiveIndex(null)
        tapArmedIndex.current = null
      }
    }
    document.addEventListener('pointerdown', closeIfOutside)
    return () => document.removeEventListener('pointerdown', closeIfOutside)
  }, [])

  // Touch devices get no hover: the first tap previews the popover instead
  // of following the link immediately, and a second tap on the same tile
  // navigates.
  const handleTileClick = (e: React.MouseEvent, index: number) => {
    const hoverCapable = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
    if (hoverCapable) return
    if (tapArmedIndex.current === index) {
      tapArmedIndex.current = null
      return
    }
    e.preventDefault()
    tapArmedIndex.current = index
    setActiveIndex(index)
  }

  return (
    <motion.div
      className="levels-diagram"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={containerVariants}
    >
      <svg className="levels-diagram__rings" viewBox="0 0 800 500" aria-hidden="true">
        {RING_RADII.map(r => (
          <motion.circle
            key={r}
            cx={400}
            cy={250}
            r={r}
            style={{ transformOrigin: '400px 250px' }}
            variants={ringVariants}
          />
        ))}
      </svg>

      <div className="levels-diagram__hub">
        <motion.div className="levels-diagram__hub-enter" variants={hubVariants}>
          <div className="levels-diagram__hub-bob">
            <BoilingIcon icon={GraduationCap} color="var(--section-accent, var(--ui-accent))" size={56} />
          </div>
        </motion.div>
      </div>

      <svg
        className="levels-diagram__links"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {levels.map((level, index) => (
          <motion.path key={level.code} d={LINK_PATHS[index]} variants={linkVariants} />
        ))}
      </svg>

      <ol className="levels-diagram__nodes">
        {levels.map((level, index) => (
          <motion.li
            key={level.code}
            className={`levels-node levels-node--${index + 1}`}
            style={{ '--ladder-accent': ladderAccent(index, levels.length) } as CSSProperties}
            variants={nodeVariants}
          >
            <Link
              href={level.href}
              className="levels-node__link"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(current => (current === index ? null : current))}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(current => (current === index ? null : current))}
              onClick={e => handleTileClick(e, index)}
            >
              <span className="levels-node__tile">{level.code}</span>
              <span className={`levels-node__popover${activeIndex === index ? ' is-open' : ''}`}>
                <span className="levels-node__name">{level.name}</span>
                <span className="levels-node__text">{level.text}</span>
                <span className="levels-node__go">
                  <ArrowRight size={14} />
                </span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  )
}
