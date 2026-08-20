'use client'

import { Rocket, Sword, Dog, Cat, Bird, Car, Compass, Sailboat, Guitar, Gem } from 'lucide-react'
import avatarSkins from '@/content/avatars.json'

type AvatarSkinId =
  | 'rocket' | 'sword' | 'dog' | 'cat' | 'bird' | 'car' | 'compass' | 'sailboat' | 'guitar' | 'gem'

const AVATARS: Record<AvatarSkinId, { Icon: typeof Rocket; bg: string; fg: string }> = {
  rocket: { Icon: Rocket, bg: '#1d4ed8', fg: '#dbeafe' },
  sword: { Icon: Sword, bg: '#7c3aed', fg: '#ede9fe' },
  dog: { Icon: Dog, bg: '#b45309', fg: '#fef3c7' },
  cat: { Icon: Cat, bg: '#be123c', fg: '#ffe4e6' },
  bird: { Icon: Bird, bg: '#0e7490', fg: '#cffafe' },
  car: { Icon: Car, bg: '#c2410c', fg: '#ffedd5' },
  compass: { Icon: Compass, bg: '#15803d', fg: '#dcfce7' },
  sailboat: { Icon: Sailboat, bg: '#0f766e', fg: '#ccfbf1' },
  guitar: { Icon: Guitar, bg: '#a16207', fg: '#fef9c3' },
  gem: { Icon: Gem, bg: '#6d28d9', fg: '#f3e8ff' }
}

const AVATAR_IDS = Object.keys(AVATARS) as AvatarSkinId[]

const SKIN_SRC = new Map((avatarSkins as { id: string; src: string }[]).map(s => [s.id, s.src?.trim() || '']))

function pickAvatar(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const id = AVATAR_IDS[Math.abs(hash) % AVATAR_IDS.length]
  return AVATARS[id]
}

export function Avatar({
  name,
  seed,
  image,
  avatarSkinId,
  size = 40,
  className = ''
}: {
  name?: string | null
  seed: string
  image?: string | null
  avatarSkinId?: string | null
  size?: number
  className?: string
}) {
  const skin = avatarSkinId && AVATARS[avatarSkinId as AvatarSkinId] ? (avatarSkinId as AvatarSkinId) : null

  if (skin) {
    const skinSrc = SKIN_SRC.get(skin)
    if (skinSrc) {
      return (
        <img
          src={skinSrc}
          alt={name || ''}
          className={`avatar-img ${className}`}
          style={{ width: size, height: size }}
        />
      )
    }

    const { Icon, bg, fg } = AVATARS[skin]
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
