import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import registry from '@/content/media.json'
import { localized } from '@/lib/localized'

type Entry = {
  src?: string
  alt?: Record<string, string>
  width?: number
  height?: number
  decorative?: boolean
}

const slots = registry as unknown as Record<string, Entry>

export function Media({
  slot,
  locale,
  className = '',
  sizes,
  priority = false
}: {
  slot: string
  locale: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const entry = slots[slot]
  const src = entry?.src?.trim()
  const width = entry?.width ?? 640
  const height = entry?.height ?? 480

  if (!entry || !src) {
    return (
      <div
        className={`media-slot ${className}`.trim()}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <ImageOff size={20} />
        <code>{slot}</code>
      </div>
    )
  }

  const alt = entry.decorative ? '' : localized(entry.alt, locale)

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={`media-image ${className}`.trim()}
    />
  )
}

export function mediaSrc(slot: string): string | null {
  const src = slots[slot]?.src?.trim()
  return src || null
}
