import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { getTranslations } from 'next-intl/server'

function norm(v: unknown) {
  if (v == null) return ''
  const s = String(v).trim()
  const n = Number(s)
  if (!Number.isNaN(n) && s !== '') return String(n)
  return s.toLowerCase()
}

export default async function AssignmentPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; slug: string; lesson: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale, slug, lesson } = await params
  const resolvedSearchParams = await searchParams
  
  const t = await getTranslations({ locale, namespace: 'common' })
  const session = await getServerSession(authOptions)
  
  // Используем phone вместо email
  const userPhone = session?.user?.phone
  if (!userPhone) redirect(`/${locale}/signin`)
  
  const user = await prisma.user.findUnique({ where: { phone: userPhone } })
  if (!user) redirect(`/${locale}/signin`)

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: 'asc' } } }
  })
  if (!course) notFound()

  const current = course.lessons.find(l => l.slug === lesson)
  if (!current) notFound()

  const enroll = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: course.id, status: 'ACTIVE' } })
  if (!enroll) redirect(`/${locale}/courses/${slug}`)

  const idx = course.lessons.findIndex(l => l.id === current.id)
  if (idx > 0) {
    const prev = course.lessons[idx - 1]
    const prevProgress = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: prev.id } } })
    if (!prevProgress?.passed) redirect(`/${locale}/courses/${slug}/lessons/${prev.slug}`)
  }

  let assignment = await prisma.assignment.findFirst({ where: { lessonId: current.id } })
  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: {
        lessonId: current.id,
        title: { ru: 'Проверка', en: 'Check', uz: 'Tekshiruv' },
        prompt: { ru: 'Ответьте 42', en: 'Answer 42', uz: 'Javob 42' },
        answerKey: { type: 'text', value: '42' }
      }
    })
  }

  async function submit(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions)
    const userPhone = session?.user?.phone
    if (!userPhone) redirect(`/${locale}/signin`)
    
    const user = await prisma.user.findUnique({ where: { phone: userPhone } })
    if (!user) redirect(`/${locale}/signin`)

    const raw = formData.get('answer')
    const ans = typeof raw === 'string' ? raw : ''
    const key = (assignment!.answerKey as any) || {}
    const correct = norm(ans) === norm(key.value)

    await prisma.submission.create({
      data: {
        assignmentId: assignment!.id,
        userId: user.id,
        answer: { value: ans } as Prisma.InputJsonValue,
        grade: correct ? 1 : 0
      }
    })

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: current.id } },
      update: { watched: true, passed: correct },
      create: { userId: user.id, lessonId: current.id, watched: true, passed: correct }
    })

    if (correct) {
      const next = course.lessons[idx + 1]
      if (next) redirect(`/${locale}/courses/${slug}/lessons/${next.slug}`)
      redirect(`/${locale}/courses/${slug}`)
    } else {
      redirect(`/${locale}/courses/${slug}/lessons/${lesson}/assignment?error=1`)
    }
  }

  const ct = current.title as any
  const title = ct?.[locale] ?? ct?.ru ?? ct?.en ?? ct?.uz ?? current.slug
  const backHref = `/${locale}/courses/${slug}/lessons/${lesson}`
  const error = resolvedSearchParams?.error === '1'

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">{t('assignment.title')}: {title}</h1>
      <div className="opacity-80">{t('assignment.prompt')}</div>
      {error && <div className="text-red-600">{t('assignment.wrong')}</div>}
      <form action={submit} className="flex gap-3 items-center">
        <input name="answer" placeholder={t('assignment.answerPlaceholder')} className="border px-3 py-2 rounded flex-1" />
        <button type="submit" className="px-4 py-2 rounded bg-black text-white">{t('buttons.send')}</button>
      </form>
      <div className="flex gap-3">
        <Link href={backHref} className="px-4 py-2 rounded border">{t('lesson.backToVideo')}</Link>
      </div>
    </main>
  )
}