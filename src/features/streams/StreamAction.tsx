'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'

export type StreamActionData = {
  id: string
  kind: 'YOUTUBE' | 'ZOOM'
  status: 'live' | 'upcoming' | 'past'
  allowed: boolean
  hasRecording: boolean
  requiredPlan: string | null
}

/** The one button a stream card needs: join Zoom, watch, watch the recording — or why not. */
export function StreamAction({ stream, signedIn, size = 'lg', variant = 'ink' }: { stream: StreamActionData; signedIn: boolean; size?: 'md' | 'lg'; variant?: 'ink' | 'lime' | 'white' }) {
  const t = useTranslations('livePage')
  const locale = useLocale()
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')

  if (!stream.allowed) {
    return <span style={{ fontSize: 14, fontWeight: 600 }}>{signedIn ? t('needPlan', { plan: stream.requiredPlan ?? 'Basic' }) : t('needSignIn')}</span>
  }
  if (stream.status === 'past') {
    return stream.hasRecording ? (
      <Button href={`/${locale}/streams/${stream.id}`} size={size} variant={variant === 'ink' ? 'white' : variant}>
        {t('recording')}
      </Button>
    ) : null
  }
  if (stream.status === 'upcoming') return null

  if (stream.kind === 'ZOOM') {
    const open = async () => {
      setOpening(true)
      setError('')
      const res = await fetch(`/api/streams/${stream.id}/join`, { method: 'POST' }).catch(() => null)
      const data = res ? await res.json().catch(() => null) : null
      setOpening(false)
      if (!res?.ok || !data?.url) return setError(t('joinError'))
      window.open(data.url, '_blank', 'noopener,noreferrer')
    }
    return (
      <span style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
        <Button size={size} variant={variant} dot onClick={open} disabled={opening}>
          {opening ? t('opening') : t('join')}
        </Button>
        {error && <span style={{ fontSize: 13, fontWeight: 600 }}>{error}</span>}
      </span>
    )
  }

  return (
    <Button href={`/${locale}/streams/${stream.id}`} size={size} variant={variant} dot>
      {t('watch')}
    </Button>
  )
}
