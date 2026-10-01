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

// The page tone (--c-paper in tokens.css). One colour, not one per OS scheme:
// the site is always light and the app is light unless the person picks dark,
// so following the device would paint a dark bar over a light page.
export const viewport = {
  themeColor: '#f4f1fa'
}
