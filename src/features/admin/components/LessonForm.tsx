'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizedField } from './LocalizedField'
import { SlugField } from './SlugField'
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
  videoUrl: string | null
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
  videoUrl: null,
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
  const [titleRu, setTitleRu] = useState(lesson.title.ru ?? '')

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} className="admin-form">
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

      <section className="admin-panel">
        <h2 className="admin-panel__title">Содержание</h2>

        <LocalizedField
          name="title"
          label="Название урока"
          value={lesson.title}
          required
          onRuChange={setTitleRu}
        />

        <LocalizedField
          name="content"
          label="Конспект"
          value={lesson.content}
          textarea
          rows={8}
          required
          hint="Текст, который студент видит на шаге «Конспект»"
        />

        <div className="admin-grid">
          <SlugField value={lesson.slug} source={titleRu} />
          <div>
            <label className="label">Порядок</label>
            <input type="number" name="order" defaultValue={lesson.order} className="input" min={0} required />
            <div className="hint">Меняется стрелками в списке уроков</div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Материалы</h2>

        <div>
          <label className="label">Ссылка на видео</label>
          <input
            name="videoUrl"
            defaultValue={lesson.videoUrl ?? ''}
            className="input"
            placeholder="https://youtu.be/... или прямая ссылка"
          />
          <div className="hint">Пока принимаем YouTube и прямые ссылки. Bunny добавим позже</div>
        </div>

        <div>
          <label className="label">Номер конференции Zoom</label>
          <input
            name="zoomMeetingId"
            defaultValue={lesson.zoomMeetingId ?? ''}
            className="input"
            placeholder="необязательно"
          />
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Шаги урока</h2>

        <label className="admin-switch">
          <input type="checkbox" name="hasVideo" defaultChecked={lesson.hasVideo} />
          <span>
            <strong>Видео</strong>
            <em>Показывается, если задана ссылка выше</em>
          </span>
        </label>

        <label className="admin-switch">
          <input type="checkbox" name="hasConspect" defaultChecked={lesson.hasConspect} />
          <span>
            <strong>Конспект</strong>
            <em>Текст из поля «Конспект»</em>
          </span>
        </label>

        <label className="admin-switch">
          <input type="checkbox" name="hasTest" defaultChecked={lesson.hasTest} />
          <span>
            <strong>Тест</strong>
            <em>Появится у студента после того, как добавите вопросы ниже</em>
          </span>
        </label>
      </section>

      <div className="admin-savebar">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Сохраняю…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
