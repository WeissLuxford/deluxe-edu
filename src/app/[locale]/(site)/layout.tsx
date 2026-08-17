import { ReactNode } from 'react'
import SiteHeader from '@/features/ui/components/SiteHeader'
import SiteFooter from '@/features/ui/components/SiteFooter'
import { Atmosphere } from '@/features/ui/components/Atmosphere'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Atmosphere />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
