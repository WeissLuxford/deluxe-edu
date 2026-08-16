import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { Calendar, Clock } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { StreamPlayer } from '@/features/streams/components/StreamPlayer'
import {
  canWatch,
  getStreamById,
  getUserPlanRank,
  statusOf
} from '@/features/streams/utils/streamHelpers'
import { localized } from '@/lib/localized'

export const dynamic = 'force-dynamic'

export default async function StreamPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'streams' })

  const stream = await getStreamById(id)
  if (!stream) notFound()

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null
  const planRank = await getUserPlanRank(userId)

  if (!canWatch(stream.requiredPlan, planRank)) {
    redirect(`/${locale}/streams`)
  }

  const status = statusOf(stream.startsAt, stream.durationMin)
  const title = localized(stream.title, locale)
  const description = localized(stream.description, locale)

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href={`/${locale}/streams`}>{t('title')}</Link>
          </nav>

          <h1 className="page-hero__title">{title}</h1>
          {description && <p className="page-hero__sub">{description}</p>}

          <div className="course-hero__meta">
            <span>
              <Calendar size={15} />
              {stream.startsAt.toLocaleString(locale, {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span>
              <Clock size={15} />
              {t('duration', { minutes: stream.durationMin })}
            </span>
          </div>
        </div>
      </div>

      <div className="container page-body">
        <StreamPlayer
          kind={stream.kind}
          youtubeId={stream.youtubeId}
          recordingUrl={stream.recordingUrl}
          status={status}
        />
      </div>
    </main>
  )
}
