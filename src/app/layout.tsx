import "@/features/ui/styles/tokens.css"
import "@/features/ui/styles/globals.css"
import "@/features/ui/styles/sections.css"
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
