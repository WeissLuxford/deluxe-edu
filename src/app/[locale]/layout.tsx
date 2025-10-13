import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import SiteHeader from '@/features/ui/components/SiteHeader'

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = await getMessages({ locale })
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SiteHeader locale={locale} />
      <div className="pt-14">{children}</div>
    </NextIntlClientProvider>
  )
}
