'use client'

import { useEffect, useRef } from 'react'
import { StickerSlap, emojiToImage } from '@/features/ui/lib/stickerSlap'

const DEFAULT_EMOJIS = ['🎉', '🔥', '⭐', '💪', '🏆', '✨', '🚀', '💯']

type StickerRewardProps = {
  trigger: number
  emojis?: string[]
}

export function StickerReward({ trigger, emojis = DEFAULT_EMOJIS }: StickerRewardProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const slapperRef = useRef<StickerSlap | null>(null)

  useEffect(() => {
    if (stageRef.current && !slapperRef.current) {
      slapperRef.current = new StickerSlap(stageRef.current)
    }
  }, [])

  useEffect(() => {
    if (trigger <= 0 || !slapperRef.current) return
    const glyph = emojis[Math.floor(Math.random() * emojis.length)]
    // Corner placement reads as a badge stamped on the card rather than
    // fighting the centered title/score text for the same space.
    slapperRef.current.slap(emojiToImage(glyph), { x: 0.85, y: 0.18, size: [70, 100] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return <div ref={stageRef} className="hg-sticker-stage" aria-hidden />
}
