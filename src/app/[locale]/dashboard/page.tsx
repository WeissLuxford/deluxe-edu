import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SignOutButton from '@/features/ui/components/SignOutButton'
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/${locale}/signin`)

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">{t('nav.dashboard')}</h1>
        <p>{t('dashboard.hello')}, {session.user?.name}</p>
        <SignOutButton />
      </div>
    </main>
  )
}
