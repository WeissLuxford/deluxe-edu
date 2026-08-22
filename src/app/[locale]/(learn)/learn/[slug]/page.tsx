import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2, Lock } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { getCourseTree, resumeFromTree } from '@/features/learn/progress'
import { ResumeCard } from '@/features/learn/components/ResumeCard'
import { LessonCard } from '@/features/learn/components/LessonCard'
import { ExamCard } from '@/features/learn/components/ExamCard'
import { DailyLimitBanner } from '@/features/learn/components/DailyLimitBanner'
import { getFreeDailyLessonCount, FREE_DAILY_LESSON_LIMIT } from '@/features/courses/dailyLimit'

export default async function LearnCoursePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/learn/${slug}`)

  const t = await getTranslations({ locale, namespace: 'learn' })
  const tree = await getCourseTree(session.user.id, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const resume = tree.total > 0 ? resumeFromTree(tree) : null
  const dailyCount = tree.plan === 'FREE' ? await getFreeDailyLessonCount(session.user.id) : 0
  const showDailyLimit = tree.plan === 'FREE' && dailyCount >= FREE_DAILY_LESSON_LIMIT

  return (
    <div className="learn-container">
      {showDailyLimit && <DailyLimitBanner locale={locale} count={dailyCount} />}

      {resume && !tree.completed && <ResumeCard locale={locale} resume={resume} />}

      {tree.completed && (
        <div className="learn-done-banner">
          <CheckCircle2 size={18} />
          <span>{t('courseDone')}</span>
        </div>
      )}

      {tree.total === 0 && <p className="catalog-empty">{t('emptyCourse')}</p>}

      {tree.modules.map(module => (
        <section key={module.id} className="learn-module-block">
          <header className="learn-module-block__head">
            <div>
              <span className="learn-module-block__label">
                {t('moduleLabel', { n: module.index })}
              </span>
              <h2 className="learn-module-block__title">{module.title}</h2>
            </div>

            <span className={`learn-module-block__count${module.locked ? ' is-locked' : ''}`}>
              {module.locked && <Lock size={13} />}
              {t('lessonsOf', { done: module.done, total: module.total })}
            </span>
          </header>

          {module.description && (
            <p className="learn-module-block__desc">{module.description}</p>
          )}

          {module.lessons.length === 0 ? (
            <p className="catalog-empty">{t('emptyModule')}</p>
          ) : (
            <div className="lesson-grid">
              {module.lessons.map(lesson => (
                <LessonCard
                  key={lesson.id}
                  locale={locale}
                  courseSlug={tree.slug}
                  lesson={lesson}
                />
              ))}
              {module.exam && <ExamCard locale={locale} courseSlug={tree.slug} module={module} />}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
