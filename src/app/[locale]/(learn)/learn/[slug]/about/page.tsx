import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { BookOpen, GraduationCap, Layers } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCourseTree } from '@/features/learn/progress'
import { CoursePlans } from '@/features/courses/components/CoursePlans'

export default async function LearnCourseAbout({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/learn/${slug}/about`)

  const [t, tCourses] = await Promise.all([
    getTranslations({ locale, namespace: 'learn' }),
    getTranslations({ locale, namespace: 'courses' })
  ])

  const tree = await getCourseTree(session.user.id, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const course = await prisma.course.findUnique({
    where: { id: tree.courseId },
    select: { priceBasic: true, pricePro: true, priceDeluxe: true }
  })

  return (
    <div className="learn-container">
      <header className="learn-head">
        <h1 className="learn-head__title">{t('aboutCourse')}</h1>
        <p className="learn-head__sub">{tree.description}</p>
      </header>

      <div className="learn-facts">
        <div className="learn-fact">
          <Layers size={16} />
          <strong>{tree.modules.length}</strong>
          <span>{t('modulesCount')}</span>
        </div>
        <div className="learn-fact">
          <BookOpen size={16} />
          <strong>{tree.total}</strong>
          <span>{tCourses('lessonsCount', { count: tree.total })}</span>
        </div>
        <div className="learn-fact">
          <GraduationCap size={16} />
          <strong>{tree.level}</strong>
          <span>{tCourses('level')}</span>
        </div>
      </div>

      <section className="learn-section">
        <h2 className="learn-section__title">{t('overview')}</h2>
        <ol className="learn-outline">
          {tree.modules.map(module => (
            <li key={module.id} className="learn-outline__item">
              <div className="learn-outline__head">
                <span className="learn-outline__index">{module.index}</span>
                <span className="learn-outline__title">{module.title}</span>
                <span className="learn-outline__count">
                  {t('lessonsOf', { done: module.done, total: module.total })}
                </span>
              </div>
              <ul className="learn-outline__lessons">
                {module.lessons.map(lesson => (
                  <li key={lesson.id}>{lesson.title}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {course && (
        <CoursePlans
          courseId={tree.courseId}
          courseSlug={tree.slug}
          courseTitle={tree.title}
          priceBasic={course.priceBasic}
          pricePro={course.pricePro}
          priceDeluxe={course.priceDeluxe}
          locale={locale}
          currentPlan={tree.plan}
        />
      )}
    </div>
  )
}
