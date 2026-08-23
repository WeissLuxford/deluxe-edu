'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import ThemeToggle from '@/features/ui/components/ThemeToggle'
import LangSwitcher from '@/features/ui/components/LangDropdown'
import UserMenu from '@/features/ui/components/UserMenu'
import { HighgateLogo } from '@/features/ui/components/HighgateLogo'

export function OpenAccessTopbar() {
  const locale = useLocale()

  return (
    <header className="learn-topbar">
      <div className="learn-topbar__inner">
        <Link href={`/${locale}`} className="learn-topbar__brand">
          <HighgateLogo className="learn-topbar__logo" />
        </Link>

        <div className="learn-topbar__actions">
          <ThemeToggle />
          <LangSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
