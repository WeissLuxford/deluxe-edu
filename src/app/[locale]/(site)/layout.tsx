import { ReactNode } from 'react'
import { SiteHeader } from '@/design/layout/SiteHeader'
import { SiteFooter } from '@/design/layout/SiteFooter'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
