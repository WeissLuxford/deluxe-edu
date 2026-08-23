import "@/features/ui/styles/tokens.css"
import "@/features/ui/styles/globals.css"
import "@/features/ui/styles/sections.css"
import "@/features/ui/styles/playful.css"
import "@/features/ui/styles/admin-structure.css"
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeScript } from '@/features/ui/components/ThemeScript'
import { RoughFilters } from '@/features/ui/components/RoughFilters'

const SUPPORTED_LOCALES = ['ru', 'uz', 'en']

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers()
  const requestedLocale = requestHeaders.get('x-locale')
  const locale = SUPPORTED_LOCALES.includes(requestedLocale ?? '') ? requestedLocale! : 'ru'

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <RoughFilters />
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
