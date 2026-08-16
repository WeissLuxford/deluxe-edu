'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Radio, Calendar, Clock, Lock, Video, PlayCircle } from 'lucide-react'
import type { StreamStatus } from '../utils/streamHelpers'

export type StreamCardData = {
  id: string
  title: string
  description: string
  kind: 'YOUTUBE' | 'ZOOM'
  youtubeId: string | null
  startsAt: string
  durationMin: number
  hasRecording: boolean
  requiredPlan: string | null
  status: StreamStatus
  allowed: boolean
}

export function StreamCard({
  stream,
  locale,
  isAuthenticated
}: {
  stream: StreamCardData
  locale: string
  isAuthenticated: boolean
}) {
  const t = useTranslations('streams')
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const starts = new Date(stream.startsAt)
  const isZoom = stream.kind === 'ZOOM'

  const openZoom = async () => {
    setOpening(true)
    setError(null)
    try {
      const res = await fetch(`/api/streams/${stream.id}/join`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || t('ended'))
        return
      }
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError(t('ended'))
    } finally {
      setOpening(false)
    }
  }

  const action = () => {
    if (!stream.allowed) {
      return (
        <span className="stream-card__locked">
          <Lock size={14} />
          {isAuthenticated
            ? t('needPlan', { plan: stream.requiredPlan || 'BASIC' })
            : t('needSignIn')}
        </span>
      )
    }

    if (stream.status === 'past') {
      return stream.hasRecording ? (
        <Link href={`/${locale}/streams/${stream.id}`} className="btn btn-secondary">
          <PlayCircle size={15} />
          {t('watchRecording')}
        </Link>
      ) : (
        <span className="stream-card__locked">{t('noRecording')}</span>
      )
    }

    if (stream.status === 'upcoming') {
      return <span className="stream-card__locked">{t('notStarted')}</span>
    }

    if (isZoom) {
      return (
        <button type="button" onClick={openZoom} disabled={opening} className="btn btn-primary">
          <Video size={15} />
          {opening ? t('opening') : t('join')}
        </button>
      )
    }

    return (
      <Link href={`/${locale}/streams/${stream.id}`} className="btn btn-primary">
        <Radio size={15} />
        {t('watch')}
      </Link>
    )
  }

  return (
    <article className={`stream-card status-${stream.status} kind-${stream.kind.toLowerCase()}`}>
      {stream.kind === 'YOUTUBE' && stream.youtubeId && (
        <div className="stream-card__thumb">
          <img
            src={`https://i.ytimg.com/vi/${stream.youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
          />
          {stream.status === 'live' && (
            <span className="stream-card__live">
              <Radio size={12} />
              {t('liveNow')}
            </span>
          )}
        </div>
      )}

      <div className="stream-card__body">
        <span className="stream-card__kind">
          {isZoom ? t('zoomLesson') : t('youtubeStream')}
        </span>

        <h3 className="stream-card__title">{stream.title}</h3>
        {stream.description && <p className="stream-card__desc">{stream.description}</p>}

        <div className="stream-card__meta">
          <span>
            <Calendar size={14} />
            {starts.toLocaleString(locale, {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <span>
            <Clock size={14} />
            {t('duration', { minutes: stream.durationMin })}
          </span>
        </div>

        <div className="stream-card__plan">
          {stream.requiredPlan
            ? t('planRequired', { plan: stream.requiredPlan })
            : t('openToAll')}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stream-card__action">{action()}</div>
      </div>
    </article>
  )
}
