import { ReactNode } from 'react'
import SiteHeader from '@/features/ui/components/SiteHeader'
import SiteFooter from '@/features/ui/components/SiteFooter'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
