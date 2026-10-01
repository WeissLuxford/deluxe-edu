'use client'

import { useEffect } from 'react'

// The inline ThemeScript runs once per full page load. Client-side navigation
// between the always-light site and the app (which follows the user's choice)
// needs the theme re-applied, or a dark app theme would leak onto the site.
export function ThemeSync({ area }: { area: 'site' | 'app' }) {
  useEffect(() => {
    const root = document.documentElement
    let dark = false
    if (area === 'app') {
      try {
        const saved = localStorage.getItem('theme')
        dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
      } catch {
        dark = false
      }
    }
    if (dark) root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')
    root.classList.toggle('light', !dark)
  }, [area])
  return null
}
