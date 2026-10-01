'use client'

import { useState } from 'react'
import registry from '@/content/media.json'

type Entry = { src?: string; srcLight?: string }
const slots = registry as unknown as Record<string, Entry>

export function HighgateLogo({ className = "h-7 w-auto" }: { className?: string }) {
  const entry = slots['brand.header.logo']
  const [loaded, setLoaded] = useState(false)

  return (
    <span className="logo-swap" data-loaded={loaded}>
      <span className={`logo-swap__text ${className}`}>Highgate</span>
      <img
        src={entry?.srcLight}
        alt="Highgate"
        className={`logo-light ${className}`}
        onLoad={() => setLoaded(true)}
      />
      <img
        src={entry?.src}
        alt="Highgate"
        className={`logo-dark ${className}`}
        onLoad={() => setLoaded(true)}
      />
    </span>
  )
}
