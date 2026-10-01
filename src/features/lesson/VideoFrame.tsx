'use client'

import { useTranslations } from 'next-intl'
import s from './lesson.module.css'

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

/** 16:9 ink frame. YouTube links embed without related videos; anything else plays natively. */
export function VideoFrame({ url }: { url: string | null }) {
  const t = useTranslations('lessonFlow')
  if (!url) {
    return (
      <div className={s.videoEmpty}>
        <span className={s.play} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
        <span>{t('videoEmpty')}</span>
      </div>
    )
  }
  const yt = youtubeId(url)
  return (
    <div className={s.video}>
      {yt ? (
        <iframe
          src={`https://www.youtube.com/embed/${yt}?rel=0`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video src={url} controls controlsList="nodownload" playsInline />
      )}
    </div>
  )
}
