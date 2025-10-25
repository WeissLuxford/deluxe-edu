'use client'

type Props = {
  src?: string | null
  name?: string | null
  email?: string | null
  size?: number
  className?: string
}

export default function UserAvatar({ src, name, email, size = 64, className = '' }: Props) {
  const base = 'avatar inline-grid place-items-center rounded-full border'
  const style = { width: size, height: size }
  const textSize =
    size >= 64 ? 'text-xl' : size >= 48 ? 'text-base' : size >= 40 ? 'text-sm' : 'text-xs'
  const letter =
    (name?.trim()?.[0] || email?.trim()?.[0] || 'U').toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt="avatar"
        className={`${base} avatar-img object-cover ${className}`}
        style={style}
      />
    )
  }

  return (
    <div className={`${base} avatar-fallback ${textSize} ${className}`} style={style}>
      {letter}
    </div>
  )
}
