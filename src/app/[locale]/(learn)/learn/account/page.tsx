import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { summarizeUserAgent } from '@/lib/userAgent'
import achievementsCatalog from '@/content/achievements.json'
import { Reveal } from '@/design/components/Reveal'
import { PanelGrid } from '@/design/layout/AppShell'
import { ProfileHead } from '@/features/account/ProfileHead'
import { DevicesList, LanguageChoice, SettingsList, ThemeChoice } from '@/features/account/Settings'
import { ACHIEVEMENT_IDS } from '@/features/dashboard/achievements'
import { getLearnAccountData } from '@/features/dashboard/getLearnAccountData'
import { ACHIEVEMENT_LOOK, FALLBACK_LOOK } from '@/features/learn/achievementLook'
import { formatSum } from '@/features/pricing/planPrices'
import s from '@/features/account/account.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'accountPage' })
  return { title: t('meta') }
}

const LANG_NAME: Record<string, string> = { ru: 'Русский', uz: 'O‘zbekcha', en: 'English' }

export default async function AccountPage({ params }: Props) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const [data, certificates, t, tu] = await Promise.all([
    getLearnAccountData(userId, locale),
    prisma.certificate.count({ where: { userId, revokedAt: null } }),
    getTranslations({ locale, namespace: 'accountPage' }),
    getTranslations({ locale, namespace: 'ui' })
  ])
  if (!data) redirect(`/${locale}/signin`)

  const { user } = data
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU', o).format(d)
  const phone = user.phone ? `+${user.phone.slice(0, 5)} ••• •• ${user.phone.slice(-2)}` : t('noPhone')
  const meta = [phone, t('since', { date: fmt(user.createdAt, { month: 'long', year: 'numeric' }) })].join(' · ')
  const earned = new Set(data.earned.map(e => e.achievementId))
  const catalog = achievementsCatalog as Record<string, { title?: Record<string, string> }>
  const main = data.courseTrees.find(tr => !tr.completed) ?? data.courseTrees[0] ?? null
  const plan = main ? tu(`plans.${main.plan === 'FREE' ? 'BASIC' : main.plan}.name`) : null

  const rows = [
    {
      id: 'payments',
      label: t('settings.payments'),
      value: String(data.payments.length || ''),
      content: data.payments.length ? (
        <ul className={s.list}>
          {data.payments.map(p => (
            <li key={p.id} className={s.item}>
              <span className={s.itemText}>
                <span className={s.itemTitle}>{localized(p.course.title, locale)}</span>
                <span className={s.itemMeta}>
                  {fmt(p.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })} · {t(`paymentStatus.${['pending', 'paid', 'failed', 'cancelled'].includes(p.status) ? p.status : 'pending'}`)}
                </span>
              </span>
              <b>{tu('sum', { amount: formatSum(p.amountCents) })}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.muted}>{t('noPayments')}</p>
      )
    },
    { id: 'language', label: t('settings.language'), value: LANG_NAME[user.locale] ?? user.locale, content: <LanguageChoice current={locale} /> },
    { id: 'theme', label: t('settings.theme'), value: '', content: <ThemeChoice /> },
    {
      id: 'phone',
      label: t('settings.phone'),
      value: phone,
      content: (
        <Link href={`/${locale}/account/phone`} className={s.linkBtn}>
          {user.phone ? t('changePhone') : t('addPhone')} →
        </Link>
      )
    },
    { id: 'email', label: t('settings.email'), value: user.email ?? t('noEmail'), content: <p className={s.muted}>{user.email ?? t('noEmail')}</p> },
    {
      id: 'devices',
      label: t('settings.devices'),
      value: String(data.devices.length || ''),
      content: (
        <DevicesList
          locale={locale}
          devices={data.devices.map(d => ({
            id: d.id,
            name: summarizeUserAgent(d.userAgent),
            meta: [d.ip, fmt(d.lastSeenAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })].filter(Boolean).join(' · '),
            current: d.id === session!.user.deviceId
          }))}
        />
      )
    }
  ]

  return (
    <PanelGrid>
      <Reveal>
        <ProfileHead firstName={user.firstName ?? ''} lastName={user.lastName ?? ''} email={user.email ?? ''} meta={meta} />
      </Reveal>

      <div className={s.columns}>
        <div className={s.col}>
          <Reveal delay={60} className={s.stats}>
            <div className={`${s.stat} ${s.statLilac}`}>
              <b>{data.lessonsPassedCount}</b>
              <span>{t('lessons', { count: data.lessonsPassedCount })}</span>
            </div>
            <div className={`${s.stat} ${s.statLime}`}>
              <b>{data.streakDays}</b>
              <span>{t('streak', { count: data.streakDays })}</span>
            </div>
            <div className={`${s.stat} ${s.statMint}`}>
              <b>{certificates}</b>
              <span>{t('certificates', { count: certificates })}</span>
            </div>
          </Reveal>

          <Reveal delay={120} className={s.box}>
            <span className={s.boxTitle}>{t('achievements')}</span>
            <div className={s.badges}>
              {ACHIEVEMENT_IDS.map(id => {
                const got = earned.has(id)
                const look = ACHIEVEMENT_LOOK[id] ?? FALLBACK_LOOK
                const title = catalog[id]?.title?.[locale] ?? catalog[id]?.title?.ru ?? id
                return (
                  <span key={id} className={s.badgeCell}>
                    <span
                      className={[s.badge, !got && s.badgeTodo].filter(Boolean).join(' ')}
                      style={got ? { background: look.bg, color: look.fg, ['--tilt' as string]: look.tilt } : undefined}
                    >
                      {look.glyph}
                    </span>
                    <span className={[s.badgeLabel, !got && s.badgeLabelTodo].filter(Boolean).join(' ')}>{title}</span>
                  </span>
                )
              })}
            </div>
          </Reveal>
        </div>

        <div className={s.col}>
          <Reveal delay={80} className={s.planCard}>
            <span className={s.planLabel}>{t('plan')}</span>
            {main && plan ? (
              <>
                <span className={s.planName}>{t('planLine', { plan, course: main.title })}</span>
                <span className={s.planNote}>{t('planNote')}</span>
              </>
            ) : (
              <span className={s.planNote}>{t('noPlan')}</span>
            )}
          </Reveal>
          <Reveal delay={140}>
            <SettingsList rows={rows} />
          </Reveal>
        </div>
      </div>
    </PanelGrid>
  )
}
