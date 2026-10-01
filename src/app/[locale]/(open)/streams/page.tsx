import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { localized } from '@/lib/localized'
import { Reveal } from '@/design/components/Reveal'
import { Container } from '@/design/components/Type'
import { PanelGrid } from '@/design/layout/AppShell'
import { getStudentGroups, getUpcomingEvents } from '@/features/learn/schedule'
import { StreamAction } from '@/features/streams/StreamAction'
import { canWatch, getPublishedStreams, getUserPlanRank, statusOf } from '@/features/streams/utils/streamHelpers'
import s from '@/features/streams/live.module.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'livePage' })
  return { title: t('meta') }
}

const TILES = ['a2', 'b1', 'c1', 'b2', 'a1'] as const

export default async function LivePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'livePage' })
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  const [streams, planRank, groups] = await Promise.all([getPublishedStreams(), getUserPlanRank(userId), userId ? getStudentGroups(userId) : Promise.resolve([])])
  const groupEvents = groups.length ? await getUpcomingEvents(groups.map(g => g.groupId), 6) : []
  const now = new Date()

  const cards = streams.map(st => ({
    id: st.id,
    kind: st.kind,
    title: localized(st.title, locale),
    description: localized(st.description, locale),
    startsAt: st.startsAt,
    durationMin: st.durationMin,
    status: statusOf(st.startsAt, st.durationMin, now),
    allowed: canWatch(st.requiredPlan, planRank),
    hasRecording: Boolean(st.recordingUrl || (st.kind === 'YOUTUBE' && st.youtubeId)),
    requiredPlan: st.requiredPlan,
    youtubeId: st.youtubeId
  }))

  const live = cards.filter(c => c.status === 'live')
  const upcoming = cards.filter(c => c.status === 'upcoming').sort((a, b) => +a.startsAt - +b.startsAt)
  const past = cards.filter(c => c.status === 'past' && c.hasRecording)
  const featured = live[0] ?? upcoming[0] ?? null

  const day = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric' })
  const month = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'short' })
  const when = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  const startsIn = (d: Date) => {
    const mins = Math.max(1, Math.round((+d - +now) / 60000))
    return t('startsIn', { time: mins < 120 ? t('minutes', { count: mins }) : t('hours', { count: Math.round(mins / 60) }) })
  }

  // Streams and the student's own group classes share one schedule, soonest first.
  const schedule = [
    ...upcoming.filter(c => c.id !== featured?.id).map(c => ({ key: c.id, at: c.startsAt, title: c.title, meta: `${when.format(c.startsAt)} · ${t('duration', { min: c.durationMin })}` })),
    ...groupEvents.map(e => ({ key: e.id, at: new Date(e.startsAt), title: e.title || t('groupClass', { name: e.groupName }), meta: `${when.format(new Date(e.startsAt))} · ${t('groupClass', { name: e.groupName })}` }))
  ].sort((a, b) => +a.at - +b.at)

  const content = (
    <>
      <Reveal>
        <h1 className={s.title}>{t.rich('title', rich)}</h1>
      </Reveal>

      {featured ? (
        <Reveal delay={60} className={s.featured}>
          <div className={s.featuredText}>
            <span className={s.status}>
              <span className={featured.status === 'live' ? s.pulse : s.pulseIdle} />
              {featured.status === 'live' ? t('liveNow') : startsIn(featured.startsAt)}
            </span>
            <span className={s.featuredTitle}>{featured.title}</span>
            {featured.description && <span className={s.featuredDesc}>{featured.description}</span>}
          </div>
          <StreamAction stream={featured} signedIn={Boolean(userId)} />
        </Reveal>
      ) : (
        schedule.length === 0 &&
        past.length === 0 && (
          <Reveal className={s.empty}>
            <span className={s.emptyTitle}>{t.rich('emptyTitle', rich)}</span>
            <span>{t('emptyText')}</span>
          </Reveal>
        )
      )}

      {(schedule.length > 0 || past.length > 0) && (
        <div className={s.columns}>
          {schedule.length > 0 && (
            <section className={s.col}>
              <h2 className={s.h2}>{t('schedule')}</h2>
              {schedule.map((item, i) => {
                const tile = TILES[i % TILES.length]
                return (
                  <Reveal key={item.key} delay={i * 50} className={s.slot}>
                    <span className={s.date} style={{ background: `var(--lv-${tile}-bg)`, color: `var(--lv-${tile}-fg)` }}>
                      <b>{day.format(item.at)}</b>
                      <small>{month.format(item.at).replace('.', '')}</small>
                    </span>
                    <span className={s.slotText}>
                      <span className={s.slotTitle}>{item.title}</span>
                      <span className={s.slotMeta}>{item.meta}</span>
                    </span>
                  </Reveal>
                )
              })}
            </section>
          )}
          {past.length > 0 && (
            <section className={s.col}>
              <h2 className={s.h2}>{t('records')}</h2>
              <div className={s.records}>
                {past.map((rec, i) => (
                  <Reveal key={rec.id} delay={i * 50} className={s.record}>
                    <span className={s.recordChip}>{rec.requiredPlan ? t('needPlan', { plan: rec.requiredPlan }) : t('openToAll')}</span>
                    <span className={s.recordText}>
                      <span className={s.recordTitle}>{rec.title}</span>
                      <span className={s.recordMeta}>
                        {new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'short' }).format(rec.startsAt)} · {t('duration', { min: rec.durationMin })}
                      </span>
                    </span>
                    <StreamAction stream={rec} signedIn={Boolean(userId)} size="md" variant="lime" />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )

  // Signed in, the page sits in the app panel; a guest gets it inside the site layout.
  return userId ? <PanelGrid>{content}</PanelGrid> : <Container className={s.guest}>{content}</Container>
}
