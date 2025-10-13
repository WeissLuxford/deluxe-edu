import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import LangSwitcher from '@/features/ui/components/LangSwitcher'
import type { ReactNode } from 'react'

export default async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
            Deluxe
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href={`/${locale}/courses`} className="opacity-90 hover:opacity-100">
            {t('nav.courses')}
          </Link>
          {session ? (
            <Link href={`/${locale}/dashboard`} className="opacity-90 hover:opacity-100">
              {t('nav.dashboard')}
            </Link>
          ) : (
            <Link href={`/${locale}/signin`} className="opacity-90 hover:opacity-100">
              {t('nav.signin')}
            </Link>
          )}
          <LangSwitcher />
        </nav>
      </div>
    </header>
  )
}
