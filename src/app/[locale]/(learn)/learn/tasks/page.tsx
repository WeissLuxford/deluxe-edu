import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { Reveal } from '@/design/components/Reveal'
import { PanelGrid } from '@/design/layout/AppShell'
import { examHref, getEnrolledCourses } from '@/features/learn/progress'
import s from '@/features/account/account.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tasksPage' })
  return { title: t('meta') }
}

const PASSING = 70

export default async function TasksPage({ params }: Props) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const t = await getTranslations({ locale, namespace: 'tasksPage' })
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  const [trees, submissions, attempts] = await Promise.all([
    getEnrolledCourses(userId, locale),
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, grade: true, createdAt: true, assignment: { select: { lesson: { select: { title: true, slug: true, course: { select: { slug: true } } } } } } }
    }),
    prisma.examAttempt.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 20,
      select: { id: true, grade: true, reviewStatus: true, submittedAt: true, exam: { select: { title: true } } }
    })
  ])

  // What still needs the student: checkpoints whose lessons are all done and
  // which are not approved yet, plus anything sitting with the teacher.
  const waiting = trees.flatMap(tree =>
    tree.modules
      .filter(m => m.exam && m.total > 0 && m.done === m.total && m.exam.reviewStatus !== 'APPROVED')
      .map(m => ({ key: m.id, title: m.exam!.title || m.title, course: tree.title, href: examHref(locale, tree.slug, m.id), pending: m.exam!.reviewStatus === 'PENDING' }))
  )

  const fmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' })
  const history = [
    ...submissions
      .filter(sub => sub.grade !== null)
      .map(sub => ({
        key: sub.id,
        at: sub.createdAt,
        title: localized(sub.assignment.lesson.title, locale),
        kind: t('test'),
        grade: sub.grade as number,
        status: (sub.grade as number) >= PASSING ? t('passed') : t('failed'),
        good: (sub.grade as number) >= PASSING,
        href: `/${locale}/learn/${sub.assignment.lesson.course.slug}/${sub.assignment.lesson.slug}?step=test`
      })),
    ...attempts.map(a => ({
      key: a.id,
      at: a.submittedAt,
      title: localized(a.exam.title, locale),
      kind: t('exam'),
      grade: a.grade,
      status: a.reviewStatus === 'APPROVED' ? t('approved') : a.reviewStatus === 'REJECTED' ? t('rejected') : t('pending'),
      good: a.reviewStatus === 'APPROVED',
      href: null as string | null
    }))
  ].sort((a, b) => +b.at - +a.at)

  return (
    <PanelGrid>
      <Reveal>
        <h1 className={s.title}>{t.rich('title', rich)}</h1>
      </Reveal>

      <section className={s.col}>
        <h2 className={s.h2}>{t('waiting')}</h2>
        {waiting.length === 0 ? (
          <p className={s.muted}>{t('waitingEmpty')}</p>
        ) : (
          <div className={s.taskList}>
            {waiting.map((w, i) => (
              <Reveal key={w.key} delay={i * 50}>
                <Link href={w.href} className={s.task}>
                  <span className={s.taskMark} style={{ background: w.pending ? 'var(--c-butter)' : 'var(--c-lime)', color: 'var(--c-ink)' }}>
                    {w.pending ? '…' : '★'}
                  </span>
                  <span className={s.itemText} style={{ flexGrow: 1 }}>
                    <span className={s.itemTitle}>{w.title}</span>
                    <span className={s.itemMeta}>
                      {w.course} · {w.pending ? t('reviewing') : t('examReady')}
                    </span>
                  </span>
                  <span className={s.linkBtn}>{t('open')} →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className={s.col}>
        <h2 className={s.h2}>{t('history')}</h2>
        {history.length === 0 ? (
          <p className={s.muted}>{t('historyEmpty')}</p>
        ) : (
          <div className={s.taskList}>
            {history.map((h, i) => {
              const body = (
                <>
                  <span className={s.taskMark} style={{ background: h.good ? 'var(--c-ok)' : 'var(--c-line)', color: h.good ? 'var(--c-white)' : 'var(--c-faint)' }}>
                    {h.good ? '✓' : '·'}
                  </span>
                  <span className={s.itemText} style={{ flexGrow: 1 }}>
                    <span className={s.itemTitle}>{h.title}</span>
                    <span className={s.itemMeta}>
                      {h.kind} · {fmt.format(h.at)} · {h.status}
                    </span>
                  </span>
                  <span className={s.taskGrade}>{h.grade}%</span>
                </>
              )
              return (
                <Reveal key={h.key} delay={Math.min(i, 8) * 40}>
                  {h.href ? (
                    <Link href={h.href} className={s.task}>
                      {body}
                    </Link>
                  ) : (
                    <div className={s.task}>{body}</div>
                  )}
                </Reveal>
              )
            })}
          </div>
        )}
      </section>
    </PanelGrid>
  )
}
