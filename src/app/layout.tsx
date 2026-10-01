import "@/design/tokens.css"
import "@/design/base.css"
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeScript } from '@/features/ui/components/ThemeScript'
import { fontVariables } from '@/design/fonts'

const SUPPORTED_LOCALES = ['ru', 'uz', 'en']

// Icons come from file conventions next to this layout: favicon.ico (16/32/48),
// icon.svg, apple-icon.png (180) and manifest.ts (192/512, plus maskable).
export const metadata: Metadata = {
  applicationName: 'Highgate',
  appleWebApp: { capable: true, title: 'Highgate', statusBarStyle: 'default' }
}

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
