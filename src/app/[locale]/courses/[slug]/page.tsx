import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export default async function CoursePage(props: {
  params: Promise<{ locale: string; slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale, slug } = await props.params
  const searchParams = (await props.searchParams) || {}
  const i18n = await getTranslations({ locale, namespace: 'common' })

  const planParam = typeof searchParams?.plan === 'string' ? searchParams?.plan : undefined
  const plan =
    planParam && ['free', 'basic', 'pro', 'deluxe'].includes(planParam)
      ? (planParam.toUpperCase() as 'FREE' | 'BASIC' | 'PRO' | 'DELUXE')
      : undefined

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: 'asc' } } },
  })
  if (!course) notFound()

  const session = await getServerSession(authOptions)
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null
  const enrollment = user
    ? await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: course.id, status: 'ACTIVE' },
      })
    : null

  const tt = course.title as any
  const dd = course.description as any
  const title = tt?.[locale] ?? tt?.ru ?? tt?.en ?? tt?.uz ?? course.slug
  const desc = dd?.[locale] ?? dd?.ru ?? dd?.en ?? dd?.uz ?? ''
  const price = (course.priceCents / 100).toFixed(2)
  const first = course.lessons[0]

  const isFree = course.priceCents === 0
  const isStaff = user?.role === 'ADMIN' || user?.role === 'MENTOR'
  const canStart = Boolean(enrollment || isFree || isStaff)

  async function start() {
    'use server'
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect(`/${locale}/signin?next=/${locale}/courses/${slug}`)
    const user = await prisma.user.findUnique({ where: { email: session.user!.email! } })
    if (!user) redirect(`/${locale}/signin`)
    const existing = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId: course.id },
    })
    const isFree = course.priceCents === 0
    const isStaff = user.role === 'ADMIN' || user.role === 'MENTOR'
    if (!existing && !isFree && !isStaff && !plan) redirect(`/${locale}/courses/${slug}`)
    if (!existing) {
      await prisma.enrollment.create({
        data: { userId: user.id, courseId: course.id, status: 'ACTIVE', plan: plan || 'BASIC' },
      })
    } else if (existing.status !== 'ACTIVE' || (plan && existing.plan !== plan)) {
      await prisma.enrollment.update({
        where: { id: existing.id },
        data: { status: 'ACTIVE', plan: plan || existing.plan || 'BASIC' },
      })
    }
    if (first) redirect(`/${locale}/courses/${slug}/lessons/${first.slug}`)
    redirect(`/${locale}/courses/${slug}`)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="opacity-80">{desc}</p>
        <div className="text-xl">{price}</div>
        <div className="flex gap-3">
          {canStart ? (
            <form action={start}>
              <button className="px-4 py-2 rounded bg-black text-white">{i18n('course.startCourse')}</button>
            </form>
          ) : (
            <form action={start}>
              <button className="px-4 py-2 rounded bg-black text-white">Start</button>
            </form>
          )}
          <Link href={`/${locale}/dashboard`} className="px-4 py-2 rounded border">
            {i18n('nav.dashboard')}
          </Link>
          {!session && (
            <Link href={`/${locale}/signin`} className="px-4 py-2 rounded border">
              {i18n('buttons.signIn')}
            </Link>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{i18n('course.lessons')}</h2>
        <ul className="grid gap-2">
          {course.lessons.map((lesson) => {
            const lt = lesson.title as any
            const ltitle = lt?.[locale] ?? lt?.ru ?? lt?.en ?? lt?.uz ?? lesson.slug
            return (
              <li key={lesson.id} className="border rounded p-3">
                <Link href={`/${locale}/courses/${slug}/lessons/${lesson.slug}`} className="hover:underline">
                  {lesson.order}. {ltitle}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
