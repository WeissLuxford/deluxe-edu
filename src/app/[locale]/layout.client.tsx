'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import SiteHeader from '@/features/ui/components/SiteHeader'
import SiteFooter from '@/features/ui/components/SiteFooter'

export default function LocaleLayoutClient({ children, locale }: { children: ReactNode; locale: string }) {
  return (
    <SessionProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </SessionProvider>
  )
}
