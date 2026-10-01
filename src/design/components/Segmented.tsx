'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import s from './Segmented.module.css'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  tone?: 'ink' | 'white'
}

// The selected thumb slides between options instead of jumping.
export function Segmented<T extends string>({ options, value, onChange, label, tone = 'ink' }: Props<T>) {
  const root = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null)

  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(value)}"]`)
    if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth })
  }, [value, options.length])

  return (
    <div ref={root} className={[s.root, tone === 'white' && s.onWhite].filter(Boolean).join(' ')} role="radiogroup" aria-label={label}>
      <span
        className={s.thumb}
        aria-hidden="true"
        style={thumb ? { transform: `translateX(${thumb.x}px)`, width: thumb.w, opacity: 1 } : { opacity: 0 }}
      />
      {options.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-value={option.value}
            className={[s.option, active && s.active].filter(Boolean).join(' ')}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
