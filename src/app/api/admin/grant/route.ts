import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { secret, email, name, courseSlug, amountCents, currency } = await req.json()

  if (!secret || secret !== process.env.ADMIN_GRANT_SECRET) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }
  if (!email || !courseSlug) {
    return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, include: { lessons: { orderBy: { order: 'asc' } } } })
  if (!course) return NextResponse.json({ ok: false, error: 'no_course' }, { status: 404 })

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name ?? undefined },
    create: { email, name: name ?? '', role: 'STUDENT', locale: 'ru' }
  })

  await prisma.payment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      provider: 'manual',
      providerRef: '',
      amountCents: typeof amountCents === 'number' ? amountCents : course.priceCents,
      currency: currency || 'UZS',
      status: 'paid'
    }
  })

  const exist = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: course.id } })
  if (!exist) {
    await prisma.enrollment.create({ data: { userId: user.id, courseId: course.id, status: 'ACTIVE' } })
  } else if (exist.status !== 'ACTIVE') {
    await prisma.enrollment.update({ where: { id: exist.id }, data: { status: 'ACTIVE' } })
  }

  const first = course.lessons[0]
  return NextResponse.json({
    ok: true,
    userId: user.id,
    courseId: course.id,
    goTo: first ? `/${user.locale}/courses/${course.slug}/lessons/${first.slug}` : `/${user.locale}/courses/${course.slug}`
  })
}
