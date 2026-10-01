import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { Button } from '@/design/components/Button'
import { ResetForm } from '@/features/auth/ui/ResetForm'
import s from '@/features/auth/ui/auth.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { token } = await searchParams
  const t = await getTranslations({ locale, namespace: 'authFlow' })
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  const record = token
    ? await prisma.verificationToken.findUnique({ where: { token }, select: { purpose: true, usedAt: true, expiresAt: true } })
    : null

  let problem: 'invalid' | 'used' | 'expired' | null = null
  if (!record || record.purpose !== 'PASSWORD_RESET') problem = 'invalid'
  else if (record.usedAt) problem = 'used'
  else if (record.expiresAt < new Date()) problem = 'expired'

  return (
    <div className={s.shell}>
      <div className={s.head}>
        <h1 className={s.title}>{t.rich('reset.title', rich)}</h1>
      </div>
      {problem ? (
        <div className={s.step}>
          <p className={`${s.notice} ${s.noticeWarn}`}>{t(`reset.${problem}`)}</p>
          <Button href={`/${locale}/forgot-password`} size="lg" block dot>
            {t('reset.again')}
          </Button>
        </div>
      ) : (
        <ResetForm token={token as string} />
      )}
    </div>
  )
}
