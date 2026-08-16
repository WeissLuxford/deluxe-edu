'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Circle, Eye } from 'lucide-react'
import { localized } from '@/lib/localized'

type Row = {
  id: string
  watched: boolean
  passed: boolean
  updatedAt: string | Date
  lesson: { slug: string; title: any; course: { slug: string; title: any } }
}

export default function ProgressSection({ rows, locale }: { rows: Row[]; locale: string }) {
  const t = useTranslations('dashboard')

  if (!rows?.length) {
    return (
      <div className="empty-state">
        <p>{t('progressEmpty')}</p>
      </div>
    )
  }

  return (
    <ul className="progress-list">
      {rows.map(r => (
        <li key={r.id} className={`progress-row${r.passed ? ' passed' : ''}`}>
          <span className="progress-row__icon">
            {r.passed ? <CheckCircle2 size={18} /> : r.watched ? <Eye size={18} /> : <Circle size={18} />}
          </span>

          <div className="progress-row__body">
            <span className="progress-row__course">
              {localized(r.lesson.course.title, locale) || r.lesson.course.slug}
            </span>
            <span className="progress-row__lesson">
              {localized(r.lesson.title, locale) || r.lesson.slug}
            </span>
          </div>

          <time className="progress-row__date" dateTime={new Date(r.updatedAt).toISOString()}>
            {new Date(r.updatedAt).toLocaleDateString(locale, {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })}
          </time>
        </li>
      ))}
    </ul>
  )
}
