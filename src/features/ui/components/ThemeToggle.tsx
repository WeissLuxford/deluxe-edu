'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersLight = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: light)').matches : false
    const useLight = saved ? saved === 'light' : prefersLight ? false : false
    document.documentElement.classList.toggle('light', useLight)
    setIsLight(useLight)
  }, [])

  return (
    <button
      aria-label="Theme"
      className="theme-toggle"
      onClick={() => {
        const next = !isLight
        setIsLight(next)
        document.documentElement.classList.toggle('light', next)
        localStorage.setItem('theme', next ? 'light' : 'dark')
      }}
    >
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
