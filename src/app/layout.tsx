import "@/features/ui/styles/tokens.css"
import "@/features/ui/styles/globals.css"
import "@/features/ui/styles/admin-structure.css"
import "@/features/ui/styles/documents.css"
import "@/design/tokens.css"
import "@/design/base.css"
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeScript } from '@/features/ui/components/ThemeScript'
import { fontVariables } from '@/design/fonts'

const SUPPORTED_LOCALES = ['ru', 'uz', 'en']

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers()
  const requestedLocale = requestHeaders.get('x-locale')
  const locale = SUPPORTED_LOCALES.includes(requestedLocale ?? '') ? requestedLocale! : 'ru'

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
