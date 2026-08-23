import { requireSession } from '@/features/auth/guards'
import BindPhoneForm from '@/features/auth/components/BindPhoneForm'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: false }
}

export default async function BindPhonePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string }>
}) {
  const { locale } = await params
  const { next } = await searchParams
  const t = await getTranslations('phoneBind')

  await requireSession(locale, `/${locale}/account/phone`)

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">{t('title')}</h1>
        <p className="auth-hint">{t('why')}</p>
        <BindPhoneForm locale={locale} next={next ?? `/${locale}/learn`} />
      </div>
    </main>
  )
}
