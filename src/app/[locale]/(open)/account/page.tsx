import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getSiteAccountUser } from '@/features/dashboard/getSiteAccountUser'
import { SiteAccountCard } from '@/features/dashboard/SiteAccountCard'

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/account`)

  const user = await getSiteAccountUser(session.user.id)
  if (!user) redirect(`/${locale}/signin`)

  return <SiteAccountCard user={user} locale={locale} />
}
