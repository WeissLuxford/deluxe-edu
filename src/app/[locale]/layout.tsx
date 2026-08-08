import { ReactNode } from 'react'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import LocaleLayoutClient from './layout.client'

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleLayoutClient locale={locale}>{children}</LocaleLayoutClient>
    </NextIntlClientProvider>
  )
}

export const viewport = { themeColor: '#000000' }
