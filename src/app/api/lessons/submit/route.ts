import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function normalize(v: unknown) {
  if (v == null) return ''
  const s = String(v).trim()
  const n = Number(s)
  if (!Number.isNaN(n) && s !== '') return String(n)
  return s.toLowerCase()
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const { courseSlug, lessonSlug, answer } = await req.json()
  if (!courseSlug || !lessonSlug) return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ ok: false, error: 'no_user' }, { status: 401 })

  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug, course: { slug: courseSlug } },
    include: { course: true }
  })
  if (!lesson) return NextResponse.json({ ok: false, error: 'no_lesson' }, { status: 404 })

  const enroll = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: lesson.courseId, status: 'ACTIVE' } })
  if (!enroll) return NextResponse.json({ ok: false, error: 'no_enrollment' }, { status: 403 })

  let assignment = await prisma.assignment.findFirst({ where: { lessonId: lesson.id } })
  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: {
        lessonId: lesson.id,
        title: { ru: 'Проверка', en: 'Check', uz: 'Tekshiruv' },
        prompt: { ru: 'Ответьте 42', en: 'Answer 42', uz: 'Javob 42' },
        answerKey: { type: 'text', value: '42' }
      }
    })
  }

  const key = (assignment.answerKey as any) || {}
  const correct = normalize(answer) === normalize(key.value)

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    update: { watched: true, passed: correct },
    create: { userId: user.id, lessonId: lesson.id, watched: true, passed: correct }
  })

  return NextResponse.json({ ok: true, correct })
}
