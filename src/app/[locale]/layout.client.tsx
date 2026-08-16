'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import SiteHeader from '@/features/ui/components/SiteHeader'
import SiteFooter from '@/features/ui/components/SiteFooter'

export default function LocaleLayoutClient({ children, locale }: { children: ReactNode; locale: string }) {
  const pathname = usePathname() || ''
  const isAdmin = pathname.startsWith(`/${locale}/admin`)

  if (isAdmin) {
    return <SessionProvider>{children}</SessionProvider>
  }

  return (
    <SessionProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </SessionProvider>
  )
}
