'use client'

import { useEffect, useState } from 'react'

const EVENT = 'vertex:theme-changed'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const sync = () => setIsLight(document.documentElement.classList.contains('light'))
    sync()
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const toggle = () => {
    const next = !document.documentElement.classList.contains('light')
    document.documentElement.classList.toggle('light', next)
    try {
      localStorage.setItem('theme', next ? 'light' : 'dark')
    } catch {}
    window.dispatchEvent(new Event(EVENT))
  }

  return (
    <button aria-label="Theme" className="theme-toggle" onClick={toggle}>
      {isLight ? (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="var(--fg)" strokeWidth="1.6" />
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l-1.4-1.4M20.4 20.4L19 19M19 5l1.4-1.4M4.6 20.4L6 19" stroke="var(--fg)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="var(--fg)" strokeWidth="1.6" fill="none" />
        </svg>
      )}
    </button>
  )
}
