'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PLAYFUL_PALETTE } from '@/features/ui/lib/palette'

export type LevelNode = {
  code: string
  name: string
  text: string
  href: string
}

// Wide, short viewBox so the path can be stretched full-width behind the
// node row with `preserveAspectRatio="none"` — the curve just needs to read
// as a gentle connecting line, not line up pixel-for-pixel with each node.
const PATH_D = 'M 0 60 C 120 20, 220 100, 340 55 S 560 15, 660 60 S 880 105, 1000 55'

export function LevelsDiagram({ levels }: { levels: LevelNode[] }) {
  return (
    <div className="levels-diagram">
      <svg
        className="levels-diagram__line"
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d={PATH_D}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      <ol className="levels-diagram__nodes">
        {levels.map((level, index) => (
          <motion.li
            key={level.code}
            style={{ '--ladder-accent': PLAYFUL_PALETTE[index % PLAYFUL_PALETTE.length] } as CSSProperties}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.15 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={level.href} className="levels-node">
              <span className="levels-node__code">{level.code}</span>
              <span className="levels-node__name">{level.name}</span>
              <p className="levels-node__text">{level.text}</p>
              <span className="levels-node__go">
                <ArrowRight size={14} />
              </span>
            </Link>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
