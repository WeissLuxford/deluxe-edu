import type { CSSProperties } from 'react'

type StickerTextProps = {
  children: string
  color?: string
  size?: string
  rotate?: number
  className?: string
}

export function StickerText({ children, color, size, rotate = 0, className }: StickerTextProps) {
  const style: CSSProperties & Record<string, string | number | undefined> = {
    '--sticker-color': color,
    '--sticker-size': size,
    '--sticker-rotate': `${rotate}deg`
  }

  return (
    <span className={`hg-sticker-text${className ? ` ${className}` : ''}`} data-text={children} style={style}>
      {children}
    </span>
  )
}
