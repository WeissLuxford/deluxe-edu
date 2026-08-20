import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { getEnrolledCourses, resumeFromTree } from '@/features/learn/progress'
import { getStudentGroups, getUpcomingEvents, getRecentAttendance } from '@/features/learn/schedule'
import { LearnTopbar } from '@/features/learn/components/LearnTopbar'
import { LearnHomeSidebar } from '@/features/learn/components/LearnHomeSidebar'
import { ResumeCard } from '@/features/learn/components/ResumeCard'
import { CourseTile } from '@/features/learn/components/CourseTile'
import { GroupScheduleCard } from '@/features/learn/components/GroupScheduleCard'

export default async function LearnHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/learn`)

  const t = await getTranslations({ locale, namespace: 'learn' })
  const trees = await getEnrolledCourses(session.user.id, locale)
  const groups = await getStudentGroups(session.user.id)
  const [upcomingEvents, attendance] = groups.length
    ? await Promise.all([
        getUpcomingEvents(groups.map(g => g.groupId)),
        getRecentAttendance(session.user.id)
      ])
    : [[], []]

  const active = trees.filter(tree => !tree.completed)
  const completed = trees.filter(tree => tree.completed)
  const resumeTree = active.find(tree => tree.total > 0) ?? null
  const resume = resumeTree ? resumeFromTree(resumeTree) : null

  return (
    <>
      <LearnTopbar locale={locale} />

      <div className="learn-course">
        <LearnHomeSidebar locale={locale} courses={trees} />

        <main className="learn-content">
          <div className="learn-container">
            <header className="learn-head">
              <h1 className="learn-head__title">{t('title')}</h1>
              <p className="learn-head__sub">{t('subtitle')}</p>
            </header>

            {resume && <ResumeCard locale={locale} resume={resume} />}

            {groups.length > 0 && (
              <GroupScheduleCard locale={locale} groups={groups} upcoming={upcomingEvents} attendance={attendance} />
            )}

            {trees.length === 0 && (
              <div className="empty-state">
                <h3>{t('noCourses')}</h3>
                <p>{t('noCoursesHint')}</p>
                <Link href={`/${locale}/courses`} className="btn btn-primary">
                  {t('browseCourses')}
                </Link>
              </div>
            )}

            {active.length > 0 && (
              <section className="learn-section">
                <h2 className="learn-section__title">{t('activeSection')}</h2>
                <div className="learn-grid">
                  {active.map(tree => (
                    <CourseTile key={tree.courseId} locale={locale} tree={tree} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section className="learn-section">
                <h2 className="learn-section__title">{t('completedSection')}</h2>
                <div className="learn-grid">
                  {completed.map(tree => (
                    <CourseTile key={tree.courseId} locale={locale} tree={tree} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
