import Link from 'next/link'
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'
import { LEVEL_TILT, levelVars, type LevelCode } from '../levels'
import s from './Bits.module.css'

type ChipTone = 'soft' | 'lime' | 'violet' | 'ink' | 'white'

export function Chip({ tone = 'soft', level, children, style }: { tone?: ChipTone; level?: LevelCode; children: ReactNode; style?: CSSProperties }) {
  const toneClass = { soft: '', lime: s.chipLime, violet: s.chipViolet, ink: s.chipInk, white: s.chipWhite }[tone]
  const lv = level ? levelVars(level) : null
  return (
    <span
      className={[s.chip, toneClass, level && s.chipLevel].filter(Boolean).join(' ')}
      style={lv ? { background: lv.bg, color: lv.fg, ...style } : style}
    >
      {children}
    </span>
  )
}

type StickerProps = {
  level: LevelCode
  title?: ReactNode
  desc?: ReactNode
  href?: string
  height?: number
  tilt?: boolean
  code?: ReactNode
}

/** Pastel level card — the main way levels are shown everywhere. */
export function LevelSticker({ level, title, desc, href, height, tilt = true, code }: StickerProps) {
  const lv = levelVars(level)
  const style = {
    background: lv.bg,
    color: lv.fg,
    ...(height ? { ['--sticker-h' as string]: `${height}px` } : {}),
    ['--tilt' as string]: tilt ? LEVEL_TILT[level] : '0deg'
  } as CSSProperties
  const body = (
    <>
      <span className={s.stickerCode}>{code ?? level}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {title && <span className={s.stickerTitle}>{title}</span>}
        {desc && <span className={s.stickerDesc}>{desc}</span>}
      </span>
    </>
  )
  return href ? (
    <Link href={href} className={s.sticker} style={style}>
      {body}
    </Link>
  ) : (
    <div className={s.sticker} style={style}>
      {body}
    </div>
  )
}

type RingProps = {
  percent: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  hole?: string
  children?: ReactNode
}

export function Ring({ percent, size = 84, stroke = 10, color = 'var(--c-violet)', track = 'var(--t-track)', hole = 'var(--t-surface)', children }: RingProps) {
  const p = Math.max(0, Math.min(100, percent))
  return (
    <div
      className={s.ring}
      role="img"
      aria-label={`${Math.round(p)}%`}
      style={{ ['--size' as string]: `${size}px`, ['--stroke' as string]: `${stroke}px`, ['--p' as string]: p, ['--ring-color' as string]: color, ['--ring-track' as string]: track, ['--ring-hole' as string]: hole }}
    >
      <div className={s.ringInner}>{children}</div>
    </div>
  )
}

export function Bar({ percent, color = 'var(--c-violet)', height = 8, track }: { percent: number; color?: string; height?: number; track?: string }) {
  const p = Math.max(0, Math.min(100, percent))
  return (
    <span className={s.bar} style={{ height, background: track }} role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100}>
      <span className={s.barFill} style={{ width: `${p}%`, background: color }} />
    </span>
  )
}

export function Logo({ href, ring, word = true, inverse }: { href?: string; ring?: string; word?: boolean; inverse?: boolean }) {
  const body = (
    <>
      <span className={[s.logoMark, inverse && s.logoMarkInverse].filter(Boolean).join(' ')} style={ring ? ({ ['--logo-ring' as string]: ring } as CSSProperties) : undefined}>h</span>
      {word && <span className={s.logoWord}>highgate</span>}
    </>
  )
  return href ? (
    <Link href={href} className={s.logo} aria-label="Highgate">
      {body}
    </Link>
  ) : (
    <span className={s.logo}>{body}</span>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode
  error?: string | null
  flat?: boolean
}

export function Field({ label, error, flat, className, ...input }: FieldProps) {
  return (
    <label className={s.field}>
      {label}
      <input {...input} className={[s.input, flat && s.inputFlat, className].filter(Boolean).join(' ')} aria-invalid={error ? true : undefined} />
      {error && <span className={s.fieldError}>{error}</span>}
    </label>
  )
}
