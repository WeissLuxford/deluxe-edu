'use client'

import { Rocket, Sword, Dog, Cat, Bird, Car, Compass, Sailboat, Guitar, Gem } from 'lucide-react'

const AVATARS = [
  { Icon: Rocket, bg: '#1d4ed8', fg: '#dbeafe' },
  { Icon: Sword, bg: '#7c3aed', fg: '#ede9fe' },
  { Icon: Dog, bg: '#b45309', fg: '#fef3c7' },
  { Icon: Cat, bg: '#be123c', fg: '#ffe4e6' },
  { Icon: Bird, bg: '#0e7490', fg: '#cffafe' },
  { Icon: Car, bg: '#c2410c', fg: '#ffedd5' },
  { Icon: Compass, bg: '#15803d', fg: '#dcfce7' },
  { Icon: Sailboat, bg: '#0f766e', fg: '#ccfbf1' },
  { Icon: Guitar, bg: '#a16207', fg: '#fef9c3' },
  { Icon: Gem, bg: '#6d28d9', fg: '#f3e8ff' }
]

function pickAvatar(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return AVATARS[Math.abs(hash) % AVATARS.length]
}

export function Avatar({
  name,
  seed,
  image,
  size = 40,
  className = ''
}: {
  name?: string | null
  seed: string
  image?: string | null
  size?: number
  className?: string
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name || ''}
        className={`avatar-img ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const { Icon, bg, fg } = pickAvatar(seed)

  return (
    <span
      className={`avatar-glyph ${className}`}
      style={{ width: size, height: size, background: bg, color: fg }}
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.52)} strokeWidth={1.8} />
    </span>
  )
}
