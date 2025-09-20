import './features/ui/styles/globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function RootLayout({ children, params }: { children: ReactNode, params: { locale: string } }) {
  let messages
  try { messages = (await import(`../locales/${params.locale}/common.json`)) as any }
  catch { notFound() }
  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
