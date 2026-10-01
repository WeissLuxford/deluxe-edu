'use client'

import { useActionState, useEffect, useState } from 'react'
import { Field, FormError, Input, Textarea, formStyles as fs } from '@/features/staff/form/Form'
import { useRouter } from 'next/navigation'
import { Check, Copy, Eye } from 'lucide-react'
import { ActionButton } from './ActionButton'
import type { ActionResult } from '../types'

export type ReportCardData = {
  id: string
  studentName: string
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
  revokedAt: string | null
  viewCount: number
  comment: string | null
  url: string
  summary: {
    homeworkAverage: number | null
    attendanceRate: number | null
    lessonsPassed: number
    position: number | null
    of: number
    exams: number
  }
}

function StatusBadge({ status, revokedAt }: { status: string; revokedAt: string | null }) {
  if (revokedAt) return <span className="doc-badge doc-badge--stop">Ссылка отозвана</span>
  if (status === 'PUBLISHED') return <span className="doc-badge doc-badge--ok">Опубликован</span>
  return <span className="doc-badge doc-badge--wait">Черновик</span>
}

export function ReportCard({
  report,
  saveComment,
  publish,
  revoke,
  regenerate
}: {
  report: ReportCardData
  saveComment: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  publish: () => Promise<ActionResult>
  revoke: () => Promise<ActionResult>
  regenerate: () => Promise<ActionResult>
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(saveComment, null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (state?.ok) router.refresh()
  }, [state, router])

  const { summary } = report
  const published = report.status === 'PUBLISHED' && !report.revokedAt

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(report.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер обмена может быть недоступен (нет https, отказ в разрешении) —
      // ссылка всё равно видна в поле рядом, скопировать можно руками.
      setCopied(false)
    }
  }

  return (
    <article className="admin-card" style={{ display: 'grid', gap: '0.875rem' }}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <strong>{report.studentName}</strong>
        <StatusBadge status={report.status} revokedAt={report.revokedAt} />
      </header>

      <div className="doc-stats">
        <div className="doc-stat">
          <div className="doc-stat__value">{summary.homeworkAverage ?? '—'}</div>
          <div className="doc-stat__label">Домашние</div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat__value">
            {summary.attendanceRate != null ? `${summary.attendanceRate}%` : '—'}
          </div>
          <div className="doc-stat__label">Посещаемость</div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat__value">{summary.lessonsPassed}</div>
          <div className="doc-stat__label">Уроков</div>
        </div>
        <div className="doc-stat">
          <div className="doc-stat__value">
            {summary.position != null ? `${summary.position}/${summary.of}` : '—'}
          </div>
          <div className="doc-stat__label">Место</div>
        </div>
      </div>

      <form action={formAction} className={fs.stack}>
        <Field label="Комментарий родителю" htmlFor={`comment-${report.id}`}>
          <Textarea
            id={`comment-${report.id}`}
            name="comment"
            rows={3}
            maxLength={4000}
            defaultValue={report.comment ?? ''}
            placeholder="Одна-две живые фразы про этот месяц. Именно они отличают отчёт от выписки из базы."
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn btn-secondary" disabled={pending}>
            {pending ? 'Сохраняю…' : 'Сохранить комментарий'}
          </button>

          {!published && (
            <ActionButton action={publish} className="btn btn-primary">
              {report.revokedAt ? 'Опубликовать снова' : 'Опубликовать'}
            </ActionButton>
          )}

          {published && (
            <ActionButton action={revoke} className="btn btn-ghost" title="Ссылка перестанет открываться">
              Отозвать ссылку
            </ActionButton>
          )}

          {report.status === 'DRAFT' && (
            <ActionButton action={regenerate} className="btn btn-ghost" title="Пересчитать числа за период">
              Пересобрать
            </ActionButton>
          )}
        </div>
        {state && !state.ok && <FormError>{state.error}</FormError>}
      </form>

      {published && (
        <div className="flex flex-wrap items-center gap-2" style={{ fontSize: '0.8125rem' }}>
          <Input readOnly value={report.url} style={{ flex: '1 1 18rem', width: 'auto' }} onFocus={e => e.target.select()} />
          <button type="button" className="btn btn-ghost" onClick={copyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
          <a className="btn btn-ghost" href={report.url} target="_blank" rel="noreferrer">
            <Eye size={16} /> Открыть
          </a>
          <span style={{ color: 'var(--muted)' }}>
            {report.viewCount > 0 ? `открывали ${report.viewCount} раз` : 'ещё не открывали'}
          </span>
        </div>
      )}
    </article>
  )
}
