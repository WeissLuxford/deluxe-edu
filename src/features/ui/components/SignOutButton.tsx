'use client'

import { signOut } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'

export default function SignOutButton() {
  const locale = useLocale()
  const t = useTranslations('common')
  
  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}` })
  }

  return (
    <button
      onClick={handleSignOut}
      className="iridescent vx"
      aria-label={t('nav.signout')}
    >
      {t('nav.signout')}
      <span className="drop-shadow" />
    </button>
  )
}