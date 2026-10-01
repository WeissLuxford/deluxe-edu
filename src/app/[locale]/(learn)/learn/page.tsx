import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { localized } from '@/lib/localized'
import { Button } from '@/design/components/Button'
import { Bar, Ring } from '@/design/components/Bits'
import { Reveal } from '@/design/components/Reveal'
import { PanelGrid } from '@/design/layout/AppShell'
import { levelVars, levelCode } from '@/design/levels'
import { ACHIEVEMENT_LOOK, FALLBACK_LOOK } from '@/features/learn/achievementLook'
import { examHref, lessonHref } from '@/features/learn/progress'
import { todayData } from '@/features/learn/today'
import s from '@/features/learn/today.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'todayPage' })
  return { title: t('meta') }
}

const EVENT_LOOKS = ['b1', 'a2', 'b2'] as const

export default async function TodayPage({ params }: Props) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const [t, data] = await Promise.all([getTranslations({ locale, namespace: 'todayPage' }), todayData(userId, locale)])
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }
  const days = t.raw('days') as string[]
  const { resume } = data
  const maxCount = Math.max(1, ...data.week.map(d => d.count))
  const dateFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'numeric' })
  const timeFmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const isToday = (d: Date) => new Date(d).toDateString() === new Date().toDateString()

  const rail = (
    <>
      <Reveal className={s.streak}>
        <span className={s.streakTop}>
          <span className={s.streakNum}>{data.streak}</span>
          <span className={s.streakLabel}>{t('streak', { count: data.streak })}</span>
        </span>
        <span className={s.streakDays}>
          {data.week.map((d, i) => (
            <span key={i} className={[s.streakDay, d.count > 0 && s.streakDayOn, d.isToday && s.streakDayToday].filter(Boolean).join(' ')}>
              {days[i]}
            </span>
          ))}
        </span>
        <span className={s.streakNote}>{data.streak === 0 ? t('streakZero') : data.streak >= 7 ? t('streakGood') : t('streakKeep')}</span>
      </Reveal>

      {data.review && (
        <Reveal delay={80} className={s.note}>
          <span className={s.noteFrom}>{t('reviewed', { teacher: data.review.teacher })}</span>
          <span className={s.noteTitle}>
            {localized(data.review.examTitle, locale)} — {data.review.grade}%
          </span>
          <span className={s.noteText}>{data.review.note}</span>
        </Reveal>
      )}

      {data.achievements.length > 0 && (
        <Reveal delay={140} className={s.achievements}>
          <span className={s.railTitle}>{t('achievements')}</span>
          <span className={s.badges}>
            {data.achievements.slice(-8).map(a => {
              const look = ACHIEVEMENT_LOOK[a.id] ?? FALLBACK_LOOK
              return (
                <span key={a.id} className={s.badge} title={a.title} style={{ background: look.bg, color: look.fg, ['--tilt' as string]: look.tilt }}>
                  {look.glyph}
                </span>
              )
            })}
          </span>
        </Reveal>
      )}
    </>
  )

  return (
    <PanelGrid rail={rail}>
      <Reveal>
        <h1 className={s.hello}>{t.rich(data.trees.some(tr => tr.done > 0) ? 'hello' : 'helloNew', { ...rich, name: data.firstName })}</h1>
      </Reveal>

      {data.trees.length === 0 ? (
        <Reveal className={s.empty}>
          <span className={s.emptyTitle}>{t.rich('emptyTitle', rich)}</span>
          <span className={s.emptyText}>{t('emptyText')}</span>
          <span className={s.emptyActions}>
            <Button href={`/${locale}/courses`} variant="lime" size="lg" arrow>
              {t('toCatalog')}
            </Button>
            <Button href={`/${locale}/trial-lesson`} variant="ghostOnInk" size="lg">
              {t('toTrial')}
            </Button>
          </span>
        </Reveal>
      ) : (
        resume && (
          <Reveal delay={60} className={s.hero}>
            {data.resumeLevel && (
              <span className={s.heroLevel} style={{ background: levelVars(data.resumeLevel).bg, color: levelVars(data.resumeLevel).fg }} aria-hidden="true">
                {data.resumeLevel}
              </span>
            )}
            <div className={s.heroText}>
              {resume.kind === 'lesson' ? (
                <>
                  <span className={s.heroMeta}>
                    {t(`where.${resume.step ?? 'start'}`)}
                    {data.resumeLessonIndex ? ` · ${t('lessonOf', { n: data.resumeLessonIndex, total: resume.total })}` : ''}
                  </span>
                  <span className={s.heroTitle}>{resume.lessonTitle}</span>
                  <span className={s.heroSub}>
                    {resume.courseTitle}
                    {data.resumeMinutes ? ` · ${t('minutes', { min: data.resumeMinutes })}` : ''}
                  </span>
                  <Button href={lessonHref(locale, resume.courseSlug, resume.lessonSlug, resume.step)} variant="lime" size="lg" arrow className={s.heroBtn}>
                    {resume.step ? t('continue') : t('start')}
                  </Button>
                </>
              ) : (
                <>
                  <span className={s.heroMeta}>{resume.moduleTitle}</span>
                  <span className={s.heroTitle}>{t('examReady')}</span>
                  <span className={s.heroSub}>{t('examText')}</span>
                  <Button href={examHref(locale, resume.courseSlug, resume.moduleId)} variant="lime" size="lg" arrow className={s.heroBtn}>
                    {t('openExam')}
                  </Button>
                </>
              )}
            </div>
            <Ring percent={resume.percent} size={180} stroke={18} color="var(--c-lime)" track="#2e2939" hole="var(--c-ink)">
              <span className={s.ringNum}>{resume.percent}%</span>
              <span className={s.ringLabel}>{t('ofCourse')}</span>
            </Ring>
          </Reveal>
        )
      )}

      {data.events.length > 0 && (
        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.h2}>{t('week')}</h2>
            <Link href={`/${locale}/streams`} className={s.more}>
              {t('allLive')} →
            </Link>
          </div>
          <div className={s.events}>
            {data.events.map((e, i) => {
              const look = EVENT_LOOKS[i % EVENT_LOOKS.length]
              return (
                <Reveal key={e.id} delay={i * 70} className={s.event} style={{ background: `var(--lv-${look}-bg)`, color: `var(--lv-${look}-fg)` }}>
                  <span className={s.eventTop}>
                    <span className={s.eventDate}>{dateFmt.format(new Date(e.startsAt))}</span>
                    <span className={s.eventTag}>{isToday(e.startsAt) ? t('today') : t(`event.${e.type}`)}</span>
                  </span>
                  <span className={s.eventTime}>
                    {timeFmt.format(new Date(e.startsAt))} · {e.groupName}
                  </span>
                  <span className={s.eventTitle}>{e.title || t(`event.${e.type}`)}</span>
                </Reveal>
              )
            })}
          </div>
        </section>
      )}

      {data.trees.length > 0 && (
        <div className={s.pair}>
          <Reveal className={s.box}>
            <span className={s.boxHead}>
              {t('activity')}
              <span className={s.boxHint}>{t('activityHint', { count: data.week.reduce((n, d) => n + d.count, 0) })}</span>
            </span>
            <div className={s.bars}>
              {data.week.map((d, i) => (
                <span key={i} className={s.barCol}>
                  <span
                    className={[s.bar, d.isToday && s.barToday, d.count === 0 && s.barEmpty].filter(Boolean).join(' ')}
                    style={{ height: `${Math.max(8, (d.count / maxCount) * 110)}px`, animationDelay: `${i * 50}ms` }}
                  />
                  <span className={s.barDay}>{days[i]}</span>
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80} className={s.box}>
            <span className={s.boxHead}>{t('courses')}</span>
            {data.trees.map(tree => {
              const code = levelCode(tree.level)
              const color = tree.completed ? 'var(--c-ok)' : `var(--lv-${code.toLowerCase()}-fg)`
              return (
                <Link key={tree.courseId} href={`/${locale}/learn/${tree.slug}`} className={s.course}>
                  <span className={s.courseHead}>
                    {tree.title}
                    <span>{tree.percent}%</span>
                  </span>
                  <Bar percent={tree.percent} color={color} track="var(--c-white)" />
                </Link>
              )
            })}
          </Reveal>
        </div>
      )}
    </PanelGrid>
  )
}
