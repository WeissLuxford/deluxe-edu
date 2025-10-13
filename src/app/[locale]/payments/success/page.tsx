import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function PaymentSuccess({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const sessionId = typeof searchParams?.session_id === 'string' ? searchParams?.session_id : undefined
  if (!sessionId) redirect(`/${locale}`)

  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] })
  const meta = (session.metadata || {}) as Record<string, string>
  const courseId = meta.courseId
  const courseSlug = meta.courseSlug
  const userId = meta.userId
  if (!courseId || !courseSlug || !userId) redirect(`/${locale}`)

  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { lessons: { orderBy: { order: 'asc' } } } })
  if (!course) notFound()

  const amount = session.amount_total ?? course.priceCents
  const currency = (session.currency || 'usd').toUpperCase()

  const paid = session.payment_status === 'paid' || session.status === 'complete'

  if (paid) {
    await prisma.payment.create({
      data: {
        userId,
        courseId,
        provider: 'stripe',
        providerRef: session.id,
        amountCents: amount,
        currency,
        status: 'paid'
      }
    })
    const existing = await prisma.enrollment.findFirst({ where: { userId, courseId } })
    if (!existing) {
      await prisma.enrollment.create({ data: { userId, courseId, status: 'ACTIVE' } })
    } else if (existing.status !== 'ACTIVE') {
      await prisma.enrollment.update({ where: { id: existing.id }, data: { status: 'ACTIVE' } })
    }
  }

  const first = course.lessons[0]
  const goCourse = first ? `/${locale}/courses/${courseSlug}/lessons/${first.slug}` : `/${locale}/courses/${courseSlug}`

  return (
    <main className="max-w-xl mx-auto px-4 py-14 space-y-6 text-center">
      <h1 className="text-3xl font-bold">{t('payments.successTitle')}</h1>
      <p className="opacity-80">{t('payments.successText')}</p>
      <div className="flex gap-3 justify-center">
        <Link href={goCourse} className="px-4 py-2 rounded bg-black text-white">{t('payments.goToCourse')}</Link>
        <Link href={`/${locale}/dashboard`} className="px-4 py-2 rounded border">{t('nav.dashboard')}</Link>
      </div>
    </main>
  )
}
