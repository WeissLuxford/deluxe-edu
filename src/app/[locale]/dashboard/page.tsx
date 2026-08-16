import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DashboardShell from '@/features/dashboard/DashboardShell'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin`)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          course: {
            include: { lessons: { orderBy: { order: 'asc' }, select: { id: true, slug: true } } }
          }
        }
      },
      Payment: { include: { course: true }, orderBy: { createdAt: 'desc' } },
      LessonProgress: {
        include: { lesson: { include: { course: { select: { slug: true, title: true } } } } },
        orderBy: { updatedAt: 'desc' }
      },
      submissions: true
    }
  })

  if (!user) redirect(`/${locale}/signin`)

  // Прогресс считаем здесь, чтобы кабинет показывал не «статус ACTIVE»,
  // а сколько уроков пройдено и куда возвращаться
  const passedLessonIds = new Set(
    user.LessonProgress.filter(p => p.passed).map(p => p.lessonId)
  )

  const courses = user.enrollments.map(e => {
    const total = e.course.lessons.length
    const done = e.course.lessons.filter(l => passedLessonIds.has(l.id)).length
    const resume = e.course.lessons.find(l => !passedLessonIds.has(l.id)) ?? e.course.lessons[0]

    return {
      enrollmentId: e.id,
      plan: e.plan || 'BASIC',
      id: e.course.id,
      slug: e.course.slug,
      title: e.course.title,
      description: e.course.description,
      level: e.course.level,
      priceBasic: e.course.priceBasic,
      pricePro: e.course.pricePro,
      priceDeluxe: e.course.priceDeluxe,
      total,
      done,
      completed: total > 0 && done === total,
      resumeSlug: resume?.slug ?? null
    }
  })

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        locale: user.locale,
        createdAt: user.createdAt,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        emailVerified: user.emailVerified,
        passwordTail: user.passwordTail
      }}
      courses={courses}
      payments={user.Payment ?? []}
      progress={user.LessonProgress ?? []}
      submissions={user.submissions ?? []}
      locale={locale}
    />
  )
}
