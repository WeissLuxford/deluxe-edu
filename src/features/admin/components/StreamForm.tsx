'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizedField } from './LocalizedField'
import type { ActionResult } from '../actions'

type Localized = { ru?: string; uz?: string; en?: string }

export type StreamFormData = {
  title: Localized
  description: Localized
  kind: 'YOUTUBE' | 'ZOOM'
  youtubeId: string
  zoomJoinUrl: string
  startsAt: string
  durationMin: number
  recordingUrl: string
  requiredPlan: string
  published: boolean
}

const empty: StreamFormData = {
  title: {},
  description: {},
  kind: 'YOUTUBE',
  youtubeId: '',
  zoomJoinUrl: '',
  startsAt: '',
  durationMin: 60,
  recordingUrl: '',
  requiredPlan: '',
  published: false
}

export function StreamForm({
  action,
  stream = empty,
  submitLabel,
  redirectTo
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  stream?: StreamFormData
  submitLabel: string
  redirectTo: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)
  const [kind, setKind] = useState(stream.kind)

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

      <div className="card" style={{ padding: '1.5rem' }}>
        <LocalizedField name="title" label="Название" value={stream.title} required />
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <LocalizedField name="description" label="Описание" value={stream.description} textarea rows={3} required />
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
          Эфир
        </h3>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <label className="label">Тип</label>
            <select
              name="kind"
              className="select"
              value={kind}
              onChange={e => setKind(e.target.value as 'YOUTUBE' | 'ZOOM')}
            >
              <option value="YOUTUBE">YouTube — смотрят на сайте</option>
              <option value="ZOOM">Zoom — занятие по ссылке</option>
            </select>
          </div>

          <div>
            <label className="label">Начало *</label>
            <input type="datetime-local" name="startsAt" defaultValue={stream.startsAt} className="input" required />
          </div>

          <div>
            <label className="label">Длительность, мин</label>
            <input type="number" name="durationMin" defaultValue={stream.durationMin} className="input" min={5} max={600} required />
          </div>

          <div>
            <label className="label">Минимальный тариф</label>
            <select name="requiredPlan" defaultValue={stream.requiredPlan} className="select">
              <option value="">Открыт всем</option>
              <option value="BASIC">BASIC</option>
              <option value="PRO">PRO</option>
              <option value="DELUXE">DELUXE</option>
            </select>
            <div className="hint">Открытый эфир видят и гости — это реклама платформы.</div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {kind === 'YOUTUBE' ? (
            <div>
              <label className="label">Ссылка или id ролика *</label>
              <input
                name="youtubeId"
                defaultValue={stream.youtubeId}
                className="input"
                placeholder="https://youtu.be/XXXXXXXXXXX"
              />
              <div className="hint">Можно вставить полную ссылку — id извлечётся сам.</div>
            </div>
          ) : (
            <div>
              <label className="label">Ссылка входа в Zoom *</label>
              <input
                name="zoomJoinUrl"
                defaultValue={stream.zoomJoinUrl}
                className="input"
                placeholder="https://zoom.us/j/..."
              />
              <div className="hint">В разметку страницы не попадает — сервер отдаёт её только тем, у кого есть доступ.</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label className="label">Ссылка на запись</label>
          <input name="recordingUrl" defaultValue={stream.recordingUrl} className="input" placeholder="необязательно" />
        </div>

        <label className="flex items-center gap-2" style={{ cursor: 'pointer', marginTop: '1.25rem' }}>
          <input type="checkbox" name="published" defaultChecked={stream.published} />
          <span style={{ color: 'var(--fg)' }}>Опубликован</span>
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Сохраняю…' : submitLabel}
      </button>
    </form>
  )
}
