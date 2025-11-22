import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const userPhone = session?.user?.phone
  if (!userPhone) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const slug = url.searchParams.get('course') || ''
  if (!slug) return NextResponse.json({ ok: false, error: 'missing course' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { slug } })
  if (!course) return NextResponse.json({ ok: false, error: 'course not found' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { phone: userPhone } })
  if (!user) return NextResponse.json({ ok: false, error: 'user not found' }, { status: 404 })

  const existing = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: course.id } })
  if (!existing) {
    await prisma.enrollment.create({ data: { userId: user.id, courseId: course.id, status: 'ACTIVE' } })
  } else if (existing.status !== 'ACTIVE') {
    await prisma.enrollment.update({ where: { id: existing.id }, data: { status: 'ACTIVE' } })
  }

  return NextResponse.json({ ok: true, course: slug })
}