import "@/features/ui/styles/tokens.css"
import "@/features/ui/styles/globals.css"
import "@/features/ui/styles/sections.css"
import "@/features/ui/styles/atmosphere.css"
import "@/features/ui/styles/admin-structure.css"
import type { ReactNode } from 'react'
import { ThemeScript } from '@/features/ui/components/ThemeScript'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
