import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

function formatUZS(n: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(n)
}

export default async function CoursesPlansPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email || null
  const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null

  const course = await prisma.course.findFirst({
    where: { published: true },
    include: { lessons: { orderBy: { order: 'asc' } }, Enrollment: user ? { where: { userId: user.id, status: 'ACTIVE' } } : false }
  })

  const enrolled = Boolean(course && user && (course as any).Enrollment && (course as any).Enrollment.length > 0)
  const slug = course?.slug || 'english'
  const firstLesson = course?.lessons?.[0]?.slug

  const plans = [
    {
      id: 'free',
      name: 'Free lesson',
      desc: 'Try one lesson to feel the format',
      seats: null as number | null,
      price: 0,
      cta: 'Watch',
      href: firstLesson ? `/${locale}/courses/${slug}/lessons/${firstLesson}` : `/${locale}/courses/${slug}`
    },
    {
      id: 'basic',
      name: 'Basic',
      desc: 'Access to video lessons and assignments',
      seats: 500,
      price: 200_000,
      cta: enrolled ? 'Continue' : 'Join',
      href: enrolled ? `/${locale}/courses/${slug}` : `/${locale}/courses/${slug}?plan=basic`
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: 'Video lessons, assignments, and mentor feedback',
      seats: 200,
      price: 400_000,
      cta: enrolled ? 'Continue' : 'Join',
      href: enrolled ? `/${locale}/courses/${slug}` : `/${locale}/courses/${slug}?plan=pro`
    },
    {
      id: 'deluxe',
      name: 'Deluxe',
      desc: 'One on one mentoring and full guidance',
      seats: 50,
      price: 800_000,
      cta: enrolled ? 'Continue' : 'Join',
      href: enrolled ? `/${locale}/courses/${slug}` : `/${locale}/courses/${slug}?plan=deluxe`
    }
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 space-y-2">
        <h1 className="hero-title text-3xl sm:text-4xl">Choose your plan</h1>
        <p className="opacity-80 !pt-8">Start free, then upgrade for feedback or mentoring</p>
      </div>

      {!course && (
        <div className="card border rounded-xl p-6 opacity-80">No course is published yet</div>
      )}

      {course && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map(p => (
            <li key={p.id} className="card rounded-2xl border p-6 transition-all"
              style={{ borderColor: 'var(--gold)', boxShadow: 'var(--shadow-gold)', background: 'var(--bg)', color: 'var(--fg)' }}>
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                {p.seats ? (
                  <span className="badge rounded-full px-3 py-1 text-sm" style={{ background: 'rgba(199,164,90,0.12)', color: 'var(--fg)' }}>
                    {p.seats} seats
                  </span>
                ) : (
                  <span className="badge rounded-full px-3 py-1 text-sm" style={{ background: 'rgba(199,164,90,0.12)', color: 'var(--fg)' }}>
                    Free
                  </span>
                )}
              </div>

              <p className="min-h-[56px] opacity-80">{p.desc}</p>

              <div className="my-5 h-px w-full" style={{ background: 'var(--border)' }} />

              <div className="mt-auto flex items-end justify-between">
                <div className="text-lg font-medium">
                  {p.price > 0 ? `${formatUZS(p.price, locale)} / month` : '0 UZS'}
                </div>
                <Link href={p.href} className="btn rounded-full px-4 py-2"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(240,240,240,0.6))', color: 'var(--fg)', boxShadow: '0 4px 24px rgba(199,164,90,0.25)' }}>
                  {p.cta}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
