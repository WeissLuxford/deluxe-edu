import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/${locale}/signin?next=/${locale}/learn`)
  }

  return <div className="learn-shell">{children}</div>
}
