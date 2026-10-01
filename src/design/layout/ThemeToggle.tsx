'use client'

import { useTranslations } from 'next-intl'
import { chooseTheme, useTheme } from './theme'
import s from './ThemeToggle.module.css'

const SUN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
)

const MOON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
  </svg>
)

// Sun / moon switch. Where the knob sits comes from html[data-theme] in CSS,
// so it is right from the first paint and every toggle on the page agrees.
export function ThemeToggle({ variant = 'pill' }: { variant?: 'pill' | 'round' }) {
  const t = useTranslations('appNav')
  const dark = useTheme() === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={t('themeDark')}
      title={dark ? t('themeLight') : t('themeDark')}
      className={variant === 'pill' ? s.pill : s.round}
      onClick={() => chooseTheme(dark ? 'light' : 'dark')}
    >
      {variant === 'pill' && <span className={s.knob} />}
      <span className={[s.icon, s.sun].join(' ')}>{SUN}</span>
      <span className={[s.icon, s.moon].join(' ')}>{MOON}</span>
    </button>
  )
}
