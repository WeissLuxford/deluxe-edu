'use client'

const PALETTE = [
  { bg: '#34d399', fg: '#04241a' },
  { bg: '#22d3ee', fg: '#052a33' },
  { bg: '#60a5fa', fg: '#08203f' },
  { bg: '#a78bfa', fg: '#1e1040' },
  { bg: '#fbbf24', fg: '#3a2a02' },
  { bg: '#fb7185', fg: '#3f0714' },
  { bg: '#f472b6', fg: '#3d0a26' },
  { bg: '#c7a45a', fg: '#2a1f07' }
]

function pickColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initials(name: string | null | undefined, fallback: string) {
  const clean = (name || '').trim()
  if (!clean) return fallback.slice(-2)

  const words = clean.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
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

  const color = pickColor(seed)

  return (
    <span
      className={`avatar-initials ${className}`}
      style={{
        width: size,
        height: size,
        background: color.bg,
        color: color.fg,
        fontSize: Math.round(size * 0.38)
      }}
      aria-hidden="true"
    >
      {initials(name, seed)}
    </span>
  )
}
