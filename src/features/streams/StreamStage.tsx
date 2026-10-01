'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { StreamStatus } from './utils/streamHelpers'
import s from './live.module.css'

/** YouTube player (with live chat while live) or the recording; Zoom streams are joined from the list. */
export function StreamStage({ kind, youtubeId, recordingUrl, status }: { kind: 'YOUTUBE' | 'ZOOM'; youtubeId: string | null; recordingUrl: string | null; status: StreamStatus }) {
  const t = useTranslations('livePage')
  const [host, setHost] = useState<string | null>(null)
  useEffect(() => setHost(window.location.hostname), [])

  if (kind === 'ZOOM') return <p className={s.note}>{status === 'past' ? t('ended') : t('notStarted')}</p>

  const source = recordingUrl || (youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null)
  if (!source) return <p className={s.note}>{t('noRecording')}</p>

  const chat = status === 'live' && youtubeId && host
  return (
    <div className={[s.stage, chat && s.stageChat].filter(Boolean).join(' ')}>
      <div className={s.player}>
        <iframe src={source} title="Stream" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
      {chat && (
        <aside className={s.chat}>
          <span>{t('chatHint')}</span>
          <iframe src={`https://www.youtube.com/live_chat?v=${youtubeId}&embed_domain=${host}`} title={t('chatHint')} />
        </aside>
      )}
    </div>
  )
}
