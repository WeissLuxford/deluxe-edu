import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { Button } from '@/design/components/Button'
import { Reveal } from '@/design/components/Reveal'
import { PanelGrid } from '@/design/layout/AppShell'
import { FREE_DAILY_LESSON_LIMIT, getFreeDailyLessonCount } from '@/features/courses/dailyLimit'
import { CourseHead } from '@/features/learn/CourseHead'
import { ProgramList } from '@/features/learn/ProgramList'
import { getCourseTree } from '@/features/learn/progress'
import s from '@/features/learn/program.module.css'

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<{ limitReached?: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return {}
  const tree = await getCourseTree(session.user.id, slug, locale)
  return tree ? { title: `${tree.title} — Highgate` } : {}
}

export default async function ProgramPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  const { limitReached } = await searchParams
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const tree = await getCourseTree(userId, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const [t, tt] = await Promise.all([getTranslations({ locale, namespace: 'programPage' }), getTranslations({ locale, namespace: 'todayPage' })])
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }
  const dailyCount = tree.plan === 'FREE' ? await getFreeDailyLessonCount(userId) : 0
  const limitHit = tree.plan === 'FREE' && (dailyCount >= FREE_DAILY_LESSON_LIMIT || limitReached === '1')
  const nextExam = tree.modules.find(m => m.exam && m.exam.reviewStatus !== 'APPROVED')

  const rail = (
    <>
      {nextExam?.exam && (
        <Reveal className={s.examCard}>
          <span className={s.examLabel}>{t('nextExam')}</span>
          <span className={s.examTitle}>{nextExam.title}</span>
          <span className={s.examText}>{t('nextExamText')}</span>
        </Reveal>
      )}
      {tree.plan !== 'DELUXE' && (
        <Reveal delay={80} className={s.upsell}>
          <span className={s.upsellTitle}>{t('upsellTitle')}</span>
          <span className={s.upsellText}>{t('upsellText')}</span>
          <a href={`/${locale}/learn/${slug}/about#upgrade`} className={s.upsellLink}>
            {t('upsellLink')} →
          </a>
        </Reveal>
      )}
    </>
  )

  return (
    <PanelGrid rail={rail}>
      <CourseHead tree={tree} locale={locale} tab="program" />

      {limitHit && (
        <Reveal className={s.notice}>
          <span className={s.noticeTitle}>{t.rich('limitTitle', rich)}</span>
          <span>{t('limitText', { limit: FREE_DAILY_LESSON_LIMIT })}</span>
        </Reveal>
      )}

      {tree.completed && (
        <Reveal className={s.done}>
          <span className={s.doneTitle}>{t.rich('courseDone', rich)}</span>
          <span>{t('courseDoneText')}</span>
          <Button href={`/${locale}/courses`} variant="lime" size="md" arrow>
            {tt('toCatalog')}
          </Button>
        </Reveal>
      )}

      {tree.total === 0 ? <p className={s.empty}>{t('emptyCourse')}</p> : <ProgramList tree={tree} locale={locale} />}
    </PanelGrid>
  )
}
