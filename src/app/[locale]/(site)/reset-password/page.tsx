import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: false }
}

export default async function ResetPasswordPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { locale } = await params
  const { token } = await searchParams
  const t = await getTranslations('reset')

  const record = token
    ? await prisma.verificationToken.findUnique({
        where: { token },
        select: { purpose: true, usedAt: true, expiresAt: true }
      })
    : null

  let problem: string | null = null

  if (!record || record.purpose !== 'PASSWORD_RESET') problem = 'invalidLink'
  else if (record.usedAt) problem = 'usedLink'
  else if (record.expiresAt < new Date()) problem = 'expiredLink'

  if (problem) {
    return (
      <main className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-title">{t('title')}</h1>
          <p
            className="auth-error"
            style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)' }}
          >
            {t(problem)}
          </p>
          <Link href={`/${locale}/forgot-password`} className="iridescent vx w-full" style={{ textAlign: 'center' }}>
            {t('requestAgain')}
            <span className="drop-shadow" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">{t('title')}</h1>
        <ResetPasswordForm token={token as string} locale={locale} />
      </div>
    </main>
  )
}
