import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/design/layout/AppShell'
import { SiteHeader } from '@/design/layout/SiteHeader'
import { SiteFooter } from '@/design/layout/SiteFooter'
import { ThemeSync } from '@/design/layout/ThemeSync'
import { shellProps } from '@/features/learn/shell'

// Pages a guest may also open (live streams). Signed in, they sit in the
// learning app; as a guest, in the site's own header and footer.
export default async function OpenLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    const shell = await shellProps(session.user.id, locale)
    return (
      <AppShell {...shell}>
        <div className="page-in">{children}</div>
      </AppShell>
    )
  }

  return (
    <>
      <ThemeSync area="site" />
      <SiteHeader />
      <main className="page-in">{children}</main>
      <SiteFooter locale={locale} />
    </>
  )
}
