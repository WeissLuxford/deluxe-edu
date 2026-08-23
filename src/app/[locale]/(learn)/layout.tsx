import { ReactNode } from 'react'
import { requireVerifiedPhone } from '@/features/auth/guards'

export const metadata = {
  robots: { index: false, follow: false }
}

export default async function LearnLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireVerifiedPhone(locale, `/${locale}/learn`)

  return <div className="learn-shell learn-shell--notebook">{children}</div>
}
