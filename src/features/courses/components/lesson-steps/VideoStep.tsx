// src/features/courses/components/lesson-steps/VideoStep.tsx
'use client'

import { useEffect, useState } from 'react'

type Props = {
  lessonId: string
  userId: string
  locale: string
}

export function VideoStep({ lessonId, userId, locale }: Props) {
  const [videoWatched, setVideoWatched] = useState(false)

  useEffect(() => {
    // Отметить видео как просмотренное после 5 секунд
    const timer = setTimeout(async () => {
      if (!videoWatched) {
        setVideoWatched(true)
        await fetch('/api/lessons/watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, userId })
        })
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [lessonId, userId, videoWatched])

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="aspect-video rounded-xl overflow-hidden" style={{ background: '#000' }}>
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🎥</div>
            <div className="text-lg">Video player placeholder</div>
            <div className="text-sm opacity-70 mt-2">
              Integrate with YouTube, Vimeo, or self-hosted video
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg)' }}>
          Video Lesson
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          Watch the video carefully. You can pause and replay as needed.
        </p>
        
        {videoWatched && (
          <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: '#22c55e' }}>
            <span>✓</span>
            <span>Video marked as watched</span>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-lg p-4" style={{ background: 'rgba(199, 164, 90, 0.1)', border: '1px solid var(--border)' }}>
        <div className="text-sm" style={{ color: 'var(--muted)' }}>
          💡 <strong style={{ color: 'var(--gold)' }}>Tip:</strong> Take notes while watching. You can review them in the next step.
        </div>
      </div>
    </div>
  )
}