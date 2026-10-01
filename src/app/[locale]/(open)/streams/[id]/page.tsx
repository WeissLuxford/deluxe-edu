import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { localized } from '@/lib/localized'
import { Container } from '@/design/components/Type'
import { PanelGrid } from '@/design/layout/AppShell'
import { StreamStage } from '@/features/streams/StreamStage'
import { canWatch, getStreamById, getUserPlanRank, statusOf } from '@/features/streams/utils/streamHelpers'
import s from '@/features/streams/live.module.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params
  const stream = await getStreamById(id)
  return stream ? { title: `${localized(stream.title, locale)} — Highgate` } : {}
}

export default async function StreamPage({ params }: Props) {
  const { locale, id } = await params
  const stream = await getStreamById(id)
  if (!stream) notFound()

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null
  if (!canWatch(stream.requiredPlan, await getUserPlanRank(userId))) redirect(`/${locale}/streams`)

  const t = await getTranslations({ locale, namespace: 'livePage' })
  const status = statusOf(stream.startsAt, stream.durationMin)
  const description = localized(stream.description, locale)
  const when = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(stream.startsAt)

  const content = (
    <>
      <Link href={`/${locale}/streams`} className={s.back}>
        ← {t('back')}
      </Link>
      <h1 className={s.title}>{localized(stream.title, locale)}</h1>
      <span className={s.meta}>
        {status === 'live' ? t('liveNow') : when} · {t('duration', { min: stream.durationMin })}
      </span>
      {description && <p className={s.meta}>{description}</p>}
      <StreamStage kind={stream.kind} youtubeId={stream.youtubeId} recordingUrl={stream.recordingUrl} status={status} />
    </>
  )

  return userId ? <PanelGrid>{content}</PanelGrid> : <Container className={s.guest}>{content}</Container>
}
