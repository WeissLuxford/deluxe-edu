'use client'

import { useEffect } from 'react'
import { paintTheme, savedTheme } from './theme'

// The inline ThemeScript runs once per full page load. Client-side navigation
// between the always-light site and the app (which follows the user's choice)
// needs the theme re-applied, or a dark app theme would leak onto the site.
export function ThemeSync({ area }: { area: 'site' | 'app' }) {
  useEffect(() => {
    paintTheme(area === 'app' ? savedTheme() : 'light')
  }, [area])
  return null
}
