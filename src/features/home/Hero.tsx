'use client'

import { useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { BookOpen, MessageCircle, Rocket, Sparkles } from 'lucide-react'
import { ChunkyButton } from '@/features/ui/components/ChunkyButton'
import { BoilingIcon } from '@/features/ui/components/BoilingIcon'
import { PLAYFUL_PALETTE } from '@/features/ui/lib/palette'
import { StickerSlap, emojiToImage } from '@/features/ui/lib/stickerSlap'

const FLOATERS = [
  { icon: BookOpen, color: PLAYFUL_PALETTE[0], top: '14%', left: '8%', duration: 4.5 },
  { icon: MessageCircle, color: PLAYFUL_PALETTE[1], top: '66%', left: '10%', duration: 5.5 },
  { icon: Rocket, color: PLAYFUL_PALETTE[3], top: '18%', left: '90%', duration: 5 },
  { icon: Sparkles, color: PLAYFUL_PALETTE[2], top: '70%', left: '88%', duration: 4 }
]

const STICKER_EMOJIS = ['🎉', '🔥', '💖', '⭐', '🌈', '✨', '🚀', '🎈', '💫', '🍕', '🌎', '🌍', '🌏']

export default function Hero() {
  const t = useTranslations('home')
  const locale = useLocale()
  const base = `/${locale}`
  const heroRef = useRef<HTMLElement>(null)
  const slapperRef = useRef<StickerSlap | null>(null)

  useEffect(() => {
    if (heroRef.current && !slapperRef.current) {
      slapperRef.current = new StickerSlap(heroRef.current)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    const rect = heroRef.current!.getBoundingClientRect()
    const glyph = STICKER_EMOJIS[Math.floor(Math.random() * STICKER_EMOJIS.length)]
    slapperRef.current?.slap(emojiToImage(glyph), {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      size: [60, 110]
    })
  }

  return (
    <section className="hero" ref={heroRef} onPointerDown={handlePointerDown}>
      <div className="hg-sticker-stage" aria-hidden />

      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="hero-floater"
          style={{ top: f.top, left: f.left }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -14, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: i * 0.15 },
            y: { duration: f.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
          }}
        >
          <BoilingIcon icon={f.icon} color={f.color} size={40} />
        </motion.div>
      ))}

      <div className="hero-inner">
        <motion.p
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('introducing')}
        </motion.p>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {'HIGHGATE'.split('').map((letter, i) => (
            <span key={i} style={{ color: PLAYFUL_PALETTE[i % PLAYFUL_PALETTE.length] }}>
              {letter}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="herotxt"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t('tagline')}
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ChunkyButton href={`${base}/trial-lesson`} color="brand" size="lg">
            {t('heroPrimary')}
          </ChunkyButton>
          <ChunkyButton href={`${base}/courses`} color="neutral" size="lg">
            {t('heroSecondary')}
          </ChunkyButton>
        </motion.div>
      </div>
    </section>
  )
}
