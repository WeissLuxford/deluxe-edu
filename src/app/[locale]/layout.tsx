import { ReactNode } from 'react'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import AuthProvider from '@/features/ui/components/AuthProvider'

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>{children}</AuthProvider>
    </NextIntlClientProvider>
  )
}

// Matches --bg in tokens.css for each theme; a flat #000 left a black bar
// above the header that belongs to neither theme.
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f6fd' },
    { media: '(prefers-color-scheme: dark)', color: '#070a14' }
  ]
}
