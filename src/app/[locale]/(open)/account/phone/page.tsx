import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/features/auth/guards'
import { BindPhone } from '@/features/auth/ui/BindPhone'
import { AuthShell } from '@/features/auth/ui/kit'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string }> }

export default async function BindPhonePage({ params, searchParams }: Props) {
  const { locale } = await params
  const { next } = await searchParams
  await requireSession(locale, `/${locale}/account/phone`)
  const t = await getTranslations({ locale, namespace: 'authFlow.bind' })
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  return (
    <AuthShell title={t.rich('title', rich)} lead={t('lead')}>
      <BindPhone next={next ?? `/${locale}/learn`} />
    </AuthShell>
  )
}
