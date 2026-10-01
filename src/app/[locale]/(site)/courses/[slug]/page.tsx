import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { Chip } from '@/design/components/Bits'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading } from '@/design/components/Type'
import { levelCode, levelVars } from '@/design/levels'
import { topicOf } from '@/features/courses/catalog'
import { CourseModules, type ModuleView } from '@/features/courses/CourseModules'
import { courseExtras } from '@/features/courses/extras'
import { PlanPicker } from '@/features/courses/PlanPicker'
import { formatSum, FUNNEL_SLUGS } from '@/features/pricing/planPrices'
import { courseJsonLd } from '@/features/seo/jsonLd'
import { pickText } from '@/features/teachers/registry'
import s from '@/features/courses/course.module.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const course = await prisma.course.findUnique({ where: { slug, published: true, visible: true }, select: { title: true, description: true } })
  if (!course) return {}
  return { title: `${localized(course.title, locale)} — Highgate`, description: localized(course.description, locale) }
}

export default async function CoursePage({ params }: Props) {
  const { locale, slug } = await params
  if (FUNNEL_SLUGS.includes(slug)) notFound()

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  const course = await prisma.course.findUnique({
    where: { slug, published: true, visible: true },
    include: {
      lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, durationMin: true, moduleId: true } },
      modules: { orderBy: { order: 'asc' }, select: { id: true, title: true, exam: { select: { id: true } } } }
    }
  })
  if (!course) notFound()

  // Someone who already studies this course belongs in /learn, not on the sales page.
  if (userId) {
    const enrolled = await prisma.enrollment.findFirst({ where: { userId, courseId: course.id, status: 'ACTIVE' }, select: { id: true } })
    if (enrolled) redirect(`/${locale}/learn/${slug}`)
  }

  const [t, tu] = await Promise.all([getTranslations({ locale, namespace: 'coursePage' }), getTranslations({ locale, namespace: 'ui' })])

  const title = localized(course.title, locale) || course.slug
  const description = localized(course.description, locale)
  const level = levelCode(course.level)
  const lv = levelVars(level)
  const topic = topicOf(course.slug)
  const timed = course.lessons.filter(l => l.durationMin)
  const avgMinutes = timed.length ? Math.round(timed.reduce((sum, l) => sum + (l.durationMin ?? 0), 0) / timed.length) : null
  const { outcomes, teacher } = courseExtras(course.slug, locale)

  const minutes = (m: number | null) => (m ? `${m} ${t('min')}` : '')
  const lessonsOf = (moduleId: string | null) =>
    course.lessons.filter(l => l.moduleId === moduleId).map(l => ({ id: l.id, title: localized(l.title, locale), minutes: minutes(l.durationMin) }))

  const modules: ModuleView[] = course.modules.map(m => {
    const lessons = lessonsOf(m.id)
    return { id: m.id, title: localized(m.title, locale), meta: t('moduleMeta', { count: lessons.length }) + (m.exam ? t('withExam') : ''), lessons }
  })
  const loose = lessonsOf(null)
  if (loose.length) modules.push({ id: 'loose', title: tu('lessonsCount', { count: loose.length }), meta: '', lessons: loose })

  // Plans are a monthly subscription.
  const sum = (amount: number) => tu('perMonth', { price: tu('sum', { amount: formatSum(amount) }) })
  const prices = { BASIC: sum(course.priceBasic), PRO: sum(course.pricePro), DELUXE: sum(course.priceDeluxe) }

  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  return (
    <Container className={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd({ title, description, slug, locale })) }} />

      <div className={s.top}>
        <div className={s.main}>
          <Link href={`/${locale}/courses`} className={s.back}>
            ← {t('back')}
          </Link>
          <Reveal className={s.banner} style={{ background: lv.bg, color: lv.fg }}>
            <span className={s.bannerChips}>
              <Chip tone="white">
                {level} · {tu(`levels.${level}.short`)}
              </Chip>
              {topic !== 'general' && <Chip tone="white">{tu(`topics.${topic}`)}</Chip>}
            </span>
            <span className={s.bannerLevel} aria-hidden="true">{level}</span>
            <Heading size="h2" as="h1" className={s.bannerTitle}>
              {title}
            </Heading>
          </Reveal>
          {description && (
            <Reveal delay={80}>
              <p className={s.desc}>{description}</p>
            </Reveal>
          )}
          <Reveal delay={140} className={s.stats}>
            <div className={s.stat}>
              <span className={s.statNum}>{course.lessons.length}</span>
              <span className={s.statLabel}>{t('statLessons', { count: course.lessons.length })}</span>
            </div>
            {course.modules.length > 0 && (
              <div className={s.stat}>
                <span className={s.statNum}>{course.modules.length}</span>
                <span className={s.statLabel}>{t('statModules', { count: course.modules.length })}</span>
              </div>
            )}
            {avgMinutes && (
              <div className={s.stat}>
                <span className={s.statNum}>
                  ~{avgMinutes}
                  <small> {t('min')}</small>
                </span>
                <span className={s.statLabel}>{t('statMinutes')}</span>
              </div>
            )}
          </Reveal>
        </div>

        <aside className={s.aside}>
          <PlanPicker courseId={course.id} prices={prices} />
        </aside>
      </div>

      <div className={s.lower}>
        <div className={s.inside}>
          <Reveal>
            <Heading size="h3" as="h2">{t.rich('inside', rich)}</Heading>
          </Reveal>
          <Reveal delay={80}>
            <CourseModules modules={modules} />
          </Reveal>
        </div>
        {(outcomes.length > 0 || teacher) && (
          <div className={s.sideNotes}>
            {outcomes.length > 0 && (
              <Reveal className={s.outcomes}>
                <span className={s.outcomesTitle}>{t.rich('outcomes', rich)}</span>
                {outcomes.map(o => (
                  <span key={o} className={s.outcome}>
                    <span aria-hidden="true">→</span>
                    {o}
                  </span>
                ))}
              </Reveal>
            )}
            {teacher && (
              <Reveal delay={80} className={s.teacher}>
                <span className={s.teacherPhoto} style={teacher.photo ? { backgroundImage: `url(${teacher.photo})` } : undefined} />
                <span className={s.teacherText}>
                  <span className={s.teacherLabel}>{t('teacher')}</span>
                  <span className={s.teacherName}>{teacher.name}</span>
                  <span className={s.teacherRole}>{pickText(teacher.role, locale)}</span>
                </span>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}
