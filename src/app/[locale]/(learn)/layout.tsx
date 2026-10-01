import { ReactNode } from 'react'
import { requireVerifiedPhone } from '@/features/auth/guards'
import { AppShell } from '@/design/layout/AppShell'
import { shellProps } from '@/features/learn/shell'

export const metadata = {
  robots: { index: false, follow: false }
}

export default async function LearnLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await requireVerifiedPhone(locale, `/${locale}/learn`)
  const shell = await shellProps(session.user.id, locale)

  return <AppShell {...shell}>{children}</AppShell>
}
