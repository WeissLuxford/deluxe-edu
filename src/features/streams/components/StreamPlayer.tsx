'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { MessageCircle } from 'lucide-react'
import type { StreamStatus } from '../utils/streamHelpers'

export function StreamPlayer({
  kind,
  youtubeId,
  recordingUrl,
  status
}: {
  kind: 'YOUTUBE' | 'ZOOM'
  youtubeId: string | null
  recordingUrl: string | null
  status: StreamStatus
}) {
  const t = useTranslations('streams')

  const [host, setHost] = useState<string | null>(null)
  useEffect(() => setHost(window.location.hostname), [])

  if (kind === 'ZOOM') {
    return (
      <div className="empty-state">
        <p>{status === 'past' ? t('ended') : t('notStarted')}</p>
      </div>
    )
  }

  const source = recordingUrl || (youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null)

  if (!source) {
    return (
      <div className="empty-state">
        <p>{t('noRecording')}</p>
      </div>
    )
  }

  const showChat = status === 'live' && youtubeId && host

  return (
    <div className={`stream-stage${showChat ? ' with-chat' : ''}`}>
      <div className="stream-stage__video">
        <iframe
          src={source}
          title="stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>

      {showChat && (
        <aside className="stream-stage__chat">
          <div className="stream-stage__chat-head">
            <MessageCircle size={15} />
            <span>{t('chatHint')}</span>
          </div>
          <iframe
            src={`https://www.youtube.com/live_chat?v=${youtubeId}&embed_domain=${host}`}
            title="chat"
          />
        </aside>
      )}
    </div>
  )
}
