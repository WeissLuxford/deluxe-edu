import { ReactNode } from 'react'
import { ThemeSync } from '@/design/layout/ThemeSync'

// Focused flows (level test, trial lesson): no site header or footer, just the
// task and a way out — as drawn on the design canvas.
export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <main className="page-in">
      <ThemeSync area="site" />
      {children}
    </main>
  )
}
