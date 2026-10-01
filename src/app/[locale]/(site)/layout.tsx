import { ReactNode } from 'react'
import { SiteHeader } from '@/design/layout/SiteHeader'
import { SiteFooter } from '@/design/layout/SiteFooter'
import { ThemeSync } from '@/design/layout/ThemeSync'

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <>
      <ThemeSync area="site" />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter locale={locale} />
    </>
  )
}
