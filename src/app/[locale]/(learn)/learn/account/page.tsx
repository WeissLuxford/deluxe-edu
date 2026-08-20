import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { getLearnAccountData } from '@/features/dashboard/getLearnAccountData'
import { LearnAccountShell } from '@/features/dashboard/LearnAccountShell'
import { LearnTopbar } from '@/features/learn/components/LearnTopbar'

export default async function LearnAccountPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { locale } = await params
  const { tab } = await searchParams
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/learn/account`)

  const data = await getLearnAccountData(session.user.id, locale)
  if (!data) redirect(`/${locale}/signin`)

  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return (
    <>
      <LearnTopbar locale={locale} crumbs={[{ label: t('title') }]} />
      <LearnAccountShell
        data={data}
        tab={tab || 'profile'}
        locale={locale}
        currentDeviceId={session.user.deviceId ?? null}
      />
    </>
  )
}
