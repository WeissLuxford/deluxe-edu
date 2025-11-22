// src/app/[locale]/courses/[slug]/lessons/[lesson]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { LessonPlayer } from '@/features/courses/components/LessonPlayer'

type Props = {
  params: Promise<{ locale: string; slug: string; lesson: string }>
}

export default async function LessonPage({ params }: Props) {
  const { locale, slug, lesson: lessonSlug } = await params
  const session = await getServerSession(authOptions)
  const userPhone = session?.user?.phone || null
  const user = userPhone ? await prisma.user.findUnique({ where: { phone: userPhone } }) : null

  if (!user) {
    redirect(`/${locale}/signin?callbackUrl=/${locale}/courses/${slug}/lessons/${lessonSlug}`)
  }

  const course = await prisma.course.findUnique({
    where: { slug, published: true, visible: true },
    include: {
      lessons: { orderBy: { order: 'asc' } }
    }
  })

  if (!course) notFound()

  const lesson = course.lessons.find(l => l.slug === lessonSlug)
  if (!lesson) notFound()

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: user.id, courseId: course.id, status: 'ACTIVE' }
  })

  if (!enrollment) {
    redirect(`/${locale}/courses/${slug}`)
  }

  // Проверка доступа к уроку
  const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id)
  if (lessonIndex > 0) {
    const prevLesson = course.lessons[lessonIndex - 1]
    const prevProgress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId: prevLesson.id } }
    })
    if (!prevProgress?.passed) {
      redirect(`/${locale}/courses/${slug}`)
    }
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } }
  })

  const assignment = lesson.hasTest
    ? await prisma.assignment.findFirst({ where: { lessonId: lesson.id } })
    : null

  const nextLesson = course.lessons[lessonIndex + 1]

  return (
    <LessonPlayer
      lesson={lesson}
      course={course}
      assignment={assignment}
      progress={progress}
      nextLesson={nextLesson}
      enrollmentPlan={enrollment.plan || 'BASIC'}
      locale={locale}
      userId={user.id}
    />
  )
}