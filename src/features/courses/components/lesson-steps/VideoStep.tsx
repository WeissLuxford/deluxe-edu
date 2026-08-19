'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Video } from 'lucide-react'

type Props = {
  lessonId: string
  locale: string
  videoUrl?: string | null
  // В открытой зоне прогресс писать некуда: пользователь не вошёл.
  track?: boolean
}

function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([A-Za-z0-9_-]{11})/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function VideoStep({ lessonId, locale, videoUrl, track = true }: Props) {
  const t = useTranslations('lesson')
  const [watched, setWatched] = useState(false)

  useEffect(() => {
    if (!track) return

    const timer = setTimeout(async () => {
      if (!watched) {
        setWatched(true)
        await fetch('/api/lessons/watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId })
        })
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [lessonId, watched, track])

  if (!videoUrl) {
    return (
      <div className="video-empty">
        <Video size={40} />
        <p>{t('videoPlaceholder')}</p>
      </div>
    )
  }

  const yt = youtubeId(videoUrl)

  return (
    <div className="video-stage">
      {yt ? (
        <iframe
          src={`https://www.youtube.com/embed/${yt}?rel=0`}
          title="lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video src={videoUrl} controls controlsList="nodownload" playsInline />
      )}
    </div>
  )
}
