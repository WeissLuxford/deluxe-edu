import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

function formatUZS(n: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(n)
}

export default async function CoursesPlansPage(
  props: { params: Promise<{ locale: string }> }
) {
  const { locale } = await props.params
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email || null
  const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null

  const course = await prisma.course.findFirst({
    where: { published: true },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      Enrollment: user ? { where: { userId: user.id, status: 'ACTIVE' } } : false
    }
  })

  const enrolled = Boolean(course && user && (course as any).Enrollment && (course as any).Enrollment.length > 0)
  const enrollment = enrolled ? (course as any).Enrollment[0] : null
  const plan = enrollment?.plan || null
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
      cta: 'Join',
      href: `/${locale}/courses/${slug}?plan=basic`
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: 'Video lessons, assignments, and mentor feedback',
      seats: 200,
      price: 400_000,
      cta: 'Join',
      href: `/${locale}/courses/${slug}?plan=pro`
    },
    {
      id: 'deluxe',
      name: 'Deluxe',
      desc: 'One on one mentoring and full guidance',
      seats: 50,
      price: 800_000,
      cta: 'Join',
      href: `/${locale}/courses/${slug}?plan=deluxe`
    }
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {!course && (
        <div className="card border rounded-xl p-6 opacity-80 text-center">No course is published yet</div>
      )}

      {course && (
        <>
          {enrolled && (
            <section className="mb-10 rounded-2xl border p-6"
              style={{ borderColor: 'var(--gold)', background: 'var(--bg)', color: 'var(--fg)', boxShadow: 'var(--shadow-gold)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Your current plan</h2>
                  <div className="mt-1 text-lg opacity-90">{plan ? plan.toUpperCase() : 'BASIC'}</div>
                  <div className="opacity-70 text-sm mt-1">Progress: 6 of 20 lessons</div>
                </div>
                <Link
                  href={`/${locale}/courses/${slug}`}
                  className="px-5 py-2 rounded-full text-black font-medium"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(240,240,240,0.6))', boxShadow: '0 4px 24px rgba(199,164,90,0.25)' }}>
                  Continue learning
                </Link>
              </div>
              <div className="mt-6 border-t pt-4 text-sm opacity-80">Want another level? <a href="#plans" className="underline">Change plan</a></div>
            </section>
          )}

          <section id="plans">
            <div className={`mb-8 ${enrolled ? 'text-center' : 'text-left'}`}>
              <h1 className={`${enrolled ? 'text-2xl' : 'text-4xl'} font-bold hero-title`}>
                {enrolled ? 'Choose another plan' : 'Choose your plan'}
              </h1>
              {!enrolled && <p className="opacity-80 mt-1 pt-8">Start free, then upgrade for feedback or mentoring</p>}
            </div>

            <ul className={`grid gap-6 ${enrolled ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
              {plans.map(p => {
                const isActive = enrolled && plan && p.id.toUpperCase() === plan.toUpperCase()
                return (
                  <li key={p.id} className={`rounded-2xl border p-6 transition-all ${isActive ? 'ring-2 ring-[var(--gold)] opacity-90' : ''}`}
                    style={{ borderColor: 'var(--gold)', boxShadow: 'var(--shadow-gold)', background: 'var(--bg)', color: 'var(--fg)' }}>
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{p.name}</h3>
                      {p.seats ? (
                        <span className="badge rounded-full px-3 py-1 text-sm"
                          style={{ background: 'rgba(199,164,90,0.12)', color: 'var(--fg)' }}>
                          {p.seats} seats
                        </span>
                      ) : (
                        <span className="badge rounded-full px-3 py-1 text-sm"
                          style={{ background: 'rgba(199,164,90,0.12)', color: 'var(--fg)' }}>
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
                      {isActive ? (
                        <button disabled className="rounded-full px-4 py-2 opacity-60 cursor-default border"
                          style={{ borderColor: 'var(--gold)' }}>Current</button>
                      ) : (
                        <Link href={p.href} className="btn rounded-full px-4 py-2"
                          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(240,240,240,0.6))', color: 'var(--fg)', boxShadow: '0 4px 24px rgba(199,164,90,0.25)' }}>
                          {p.cta}
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}
