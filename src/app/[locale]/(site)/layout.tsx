import { ReactNode } from 'react'
import { SiteHeader } from '@/design/layout/SiteHeader'
import { SiteFooter } from '@/design/layout/SiteFooter'
import { ThemeSync } from '@/design/layout/ThemeSync'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeSync area="site" />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
