'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ActionResult } from '../actions'

type Localized = { ru?: string; uz?: string; en?: string }

type Lesson = {
  slug: string
  title: Localized
  content: Localized
  order: number
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
  zoomMeetingId: string | null
}

const empty: Lesson = {
  slug: '',
  title: {},
  content: {},
  order: 0,
  hasVideo: true,
  hasConspect: false,
  hasTest: false,
  zoomMeetingId: null
}

export function LessonForm({
  action,
  lesson = empty,
  submitLabel,
  redirectTo
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  lesson?: Lesson
  submitLabel: string
  redirectTo: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
          Название урока
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label">Русский *</label>
            <input name="title_ru" defaultValue={lesson.title.ru} className="input" required />
          </div>
          <div>
            <label className="label">O‘zbekcha</label>
            <input name="title_uz" defaultValue={lesson.title.uz} className="input" />
          </div>
          <div>
            <label className="label">English</label>
            <input name="title_en" defaultValue={lesson.title.en} className="input" />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '0.5rem' }}>
          Конспект
        </h3>
        <div className="hint" style={{ marginBottom: '1rem' }}>
          Текст, который студент видит на шаге «Конспект».
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Русский *</label>
            <textarea name="content_ru" defaultValue={lesson.content.ru} className="textarea" rows={6} required />
          </div>
          <div>
            <label className="label">O‘zbekcha</label>
            <textarea name="content_uz" defaultValue={lesson.content.uz} className="textarea" rows={4} />
          </div>
          <div>
            <label className="label">English</label>
            <textarea name="content_en" defaultValue={lesson.content.en} className="textarea" rows={4} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
          Настройки
        </h3>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <label className="label">Адрес урока *</label>
            <input
              name="slug"
              defaultValue={lesson.slug}
              className="input"
              placeholder="lesson-1"
              pattern="[a-z0-9\-]+"
              required
            />
          </div>
          <div>
            <label className="label">Порядок</label>
            <input type="number" name="order" defaultValue={lesson.order} className="input" min={0} required />
            <div className="hint">Чем меньше число, тем раньше урок в списке.</div>
          </div>
          <div>
            <label className="label">Номер конференции Zoom</label>
            <input name="zoomMeetingId" defaultValue={lesson.zoomMeetingId ?? ''} className="input" placeholder="необязательно" />
          </div>
        </div>

        <div className="space-y-2" style={{ marginTop: '1.25rem' }}>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
            <input type="checkbox" name="hasVideo" defaultChecked={lesson.hasVideo} />
            <span style={{ color: 'var(--fg)' }}>Шаг «Видео»</span>
          </label>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
            <input type="checkbox" name="hasConspect" defaultChecked={lesson.hasConspect} />
            <span style={{ color: 'var(--fg)' }}>Шаг «Конспект»</span>
          </label>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
            <input type="checkbox" name="hasTest" defaultChecked={lesson.hasTest} />
            <span style={{ color: 'var(--fg)' }}>Шаг «Тест»</span>
          </label>
          <div className="hint">
            Тест появится у студента только после того, как вы добавите к уроку вопросы.
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Сохраняю…' : submitLabel}
      </button>
    </form>
  )
}
