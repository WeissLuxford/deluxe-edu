import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { StreamCard, type StreamCardData } from '@/features/streams/components/StreamCard'
import {
  canWatch,
  getPublishedStreams,
  getUserPlanRank,
  statusOf
} from '@/features/streams/utils/streamHelpers'
import { localized } from '@/lib/localized'

export const dynamic = 'force-dynamic'

export default async function StreamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'streams' })

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  const [streams, planRank] = await Promise.all([
    getPublishedStreams(),
    getUserPlanRank(userId)
  ])

  const now = new Date()

  const cards: StreamCardData[] = streams.map(s => ({
    id: s.id,
    title: localized(s.title, locale),
    description: localized(s.description, locale),
    kind: s.kind,
    youtubeId: s.youtubeId,
    startsAt: s.startsAt.toISOString(),
    durationMin: s.durationMin,
    hasRecording: Boolean(s.recordingUrl || (s.kind === 'YOUTUBE' && s.youtubeId)),
    requiredPlan: s.requiredPlan,
    status: statusOf(s.startsAt, s.durationMin, now),
    allowed: canWatch(s.requiredPlan, planRank)
  }))

  const live = cards.filter(c => c.status === 'live')
  const upcoming = cards
    .filter(c => c.status === 'upcoming')
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
  const past = cards.filter(c => c.status === 'past')

  const section = (title: string, items: StreamCardData[]) =>
    items.length > 0 && (
      <section className="catalog-section">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="stream-grid">
          {items.map(s => (
            <StreamCard key={s.id} stream={s} locale={locale} isAuthenticated={Boolean(userId)} />
          ))}
        </div>
      </section>
    )

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">{t('title')}</h1>
          <p className="page-hero__sub">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container page-body">
        {cards.length === 0 ? (
          <div className="empty-state">
            <h3>{t('emptyAll')}</h3>
            <p>{t('emptyHint')}</p>
          </div>
        ) : (
          <>
            {section(t('liveNow'), live)}
            {section(t('upcoming'), upcoming)}
            {section(t('past'), past)}
          </>
        )}
      </div>
    </main>
  )
}
