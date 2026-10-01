'use client'

import { useSyncExternalStore } from 'react'

// The learning area is light unless the person switched to dark themselves.
// The choice lives in localStorage on this device; ThemeScript reads the same
// key before the first paint, so keep the two in step.

export type Theme = 'light' | 'dark'

const KEY = 'theme'
const EVENT = 'hg-theme'

export function savedTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function paintTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
  root.classList.toggle('light', theme === 'light')
}

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown }

/** Saves the choice and repaints with a soft cross-fade where the browser can do one. */
export function chooseTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {}
  const doc = document as ViewTransitionDocument
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (doc.startViewTransition && !calm) doc.startViewTransition(() => paintTheme(theme))
  else paintTheme(theme)
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** The current choice; every toggle on the page stays in sync. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, savedTheme, () => 'light')
}
