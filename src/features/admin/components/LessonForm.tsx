'use client'

import { useActionState, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Video, FileText, ClipboardCheck } from 'lucide-react'
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
  moduleId: string | null
  coverUrl: string | null
  durationMin: number | null
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
  zoomMeetingId: null,
  moduleId: null,
  coverUrl: null,
  durationMin: null
}

type TabKey = 'video' | 'conspect' | 'tests'

const TABS: { key: TabKey; label: string; icon: typeof Video }[] = [
  { key: 'video', label: 'Видео', icon: Video },
  { key: 'conspect', label: 'Конспект', icon: FileText },
  { key: 'tests', label: 'Тесты', icon: ClipboardCheck }
]

export function LessonForm({
  action,
  lesson = empty,
  modules = [],
  submitLabel,
  redirectTo,
  testsSlot
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  lesson?: Lesson
  modules?: { id: string; label: string }[]
  submitLabel: string
  redirectTo: string
  testsSlot?: ReactNode
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)
  const [titleRu, setTitleRu] = useState(lesson.title.ru ?? '')
  const [tab, setTab] = useState<TabKey>('video')

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <>
      <form action={formAction} className="admin-form">
        {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

        <section className="admin-panel">
          <h2 className="admin-panel__title">Основное</h2>

          <LocalizedField
            name="title"
            label="Название урока"
            value={lesson.title}
            required
            onRuChange={setTitleRu}
          />

          <div className="admin-grid">
            <SlugField value={lesson.slug} source={titleRu} />
            <div>
              <label className="label">Порядок</label>
              <input type="number" name="order" defaultValue={lesson.order} className="input" min={0} required />
              <div className="hint">Меняется стрелками в списке уроков</div>
            </div>
          </div>

          <div className="admin-grid">
            <div>
              <label className="label">Модуль</label>
              <select name="moduleId" defaultValue={lesson.moduleId ?? ''} className="input">
                <option value="">Вне модулей</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="hint">
                {modules.length === 0
                  ? 'В курсе ещё нет модулей — создайте их на странице курса'
                  : 'Раздел программы, в котором студент увидит этот урок'}
              </div>
            </div>

            <div>
              <label className="label">Длительность, минут</label>
              <input
                type="number"
                name="durationMin"
                defaultValue={lesson.durationMin ?? ''}
                className="input"
                min={0}
                max={600}
                placeholder="необязательно"
              />
              <div className="hint">Показывается на карточке урока</div>
            </div>
          </div>
        </section>

        <div className="lesson-tabs" role="tablist">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`lesson-tabs__tab${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <Icon size={15} /> {t.label}
              </button>
            )
          })}
        </div>

        <section className="admin-panel" style={{ display: tab === 'video' ? 'flex' : 'none' }}>
          <label className="admin-switch">
            <input type="checkbox" name="hasVideo" defaultChecked={lesson.hasVideo} />
            <span>
              <strong>Показывать шаг «Видео»</strong>
              <em>Появится у студента, если ниже задана ссылка</em>
            </span>
          </label>

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
            <label className="label">Обложка урока</label>
            <input
              name="coverUrl"
              defaultValue={lesson.coverUrl ?? ''}
              className="input"
              placeholder="/media/lessons/present-simple.webp"
            />
            <div className="hint">
              Путь к файлу из папки public. Без обложки карточка урока покажет однотонную плашку
            </div>
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

        <section className="admin-panel" style={{ display: tab === 'conspect' ? 'flex' : 'none' }}>
          <label className="admin-switch">
            <input type="checkbox" name="hasConspect" defaultChecked={lesson.hasConspect} />
            <span>
              <strong>Показывать шаг «Конспект»</strong>
              <em>Текст из поля ниже</em>
            </span>
          </label>

          <LocalizedField
            name="content"
            label="Конспект"
            value={lesson.content}
            textarea
            rows={12}
            required
            hint="Текст, который студент видит на шаге «Конспект»"
          />
        </section>

        <section className="admin-panel" style={{ display: tab === 'tests' ? 'flex' : 'none' }}>
          <label className="admin-switch">
            <input type="checkbox" name="hasTest" defaultChecked={lesson.hasTest} />
            <span>
              <strong>Показывать шаг «Тест»</strong>
              <em>Появится у студента после того, как добавите вопросы</em>
            </span>
          </label>

          {!testsSlot && <p className="hint">Тест можно добавить после того, как урок будет создан.</p>}
        </section>

        <div className="admin-savebar">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Сохраняю…' : submitLabel}
          </button>
        </div>
      </form>

      {testsSlot && (
        <div style={{ display: tab === 'tests' ? 'block' : 'none', marginTop: '1rem' }}>
          {testsSlot}
        </div>
      )}
    </>
  )
}
