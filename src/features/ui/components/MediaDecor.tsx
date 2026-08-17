'use client'

import { useLocale } from 'next-intl'
import { Media } from './Media'

export function MediaDecor({
  slot,
  side = 'right',
  size = 'md'
}: {
  slot: string
  side?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}) {
  const locale = useLocale()

  return (
    <div className={`media-decor side-${side} size-${size}`} aria-hidden="true">
      <Media slot={slot} locale={locale} sizes="(max-width: 1100px) 0px, 30vw" />
    </div>
  )
}
