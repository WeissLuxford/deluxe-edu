'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizedField } from './LocalizedField'
import { SlugField } from './SlugField'
import type { ActionResult } from '../actions'

type Localized = { ru?: string; uz?: string; en?: string }

type Course = {
  slug: string
  title: Localized
  description: Localized
  level: string
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  published: boolean
  visible: boolean
  coverUrl: string | null
  badge: string | null
}

const BADGES = ['', 'Хит продаж', 'Новинка', 'Со скидкой', 'С преподавателем']

const LEVELS = [
  'Beginner',
  'Elementary',
  'Pre-Intermediate',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced',
  'Other'
]

const empty: Course = {
  slug: '',
  title: {},
  description: {},
  level: 'Beginner',
  priceBasic: 200000,
  pricePro: 400000,
  priceDeluxe: 800000,
  published: false,
  visible: true,
  coverUrl: null,
  badge: null
}

export function CourseForm({
  action,
  course = empty,
  submitLabel,
  redirectTo
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  course?: Course
  submitLabel: string
  redirectTo: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)
  const [titleRu, setTitleRu] = useState(course.title.ru ?? '')

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
          label="Название"
          value={course.title}
          required
          onRuChange={setTitleRu}
        />

        <LocalizedField
          name="description"
          label="Описание"
          value={course.description}
          textarea
          rows={4}
          required
        />

        <SlugField
          value={course.slug}
          source={titleRu}
          hint="Виден в ссылке: /ru/courses/адрес. Только латиница, цифры и дефис."
        />
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Уровень и цены</h2>

        <div className="admin-grid">
          <div>
            <label className="label">Уровень</label>
            <select name="level" defaultValue={course.level} className="select">
              {LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Basic, сум</label>
            <input type="number" name="priceBasic" defaultValue={course.priceBasic} className="input" min={0} step={1000} required />
          </div>
          <div>
            <label className="label">Pro, сум</label>
            <input type="number" name="pricePro" defaultValue={course.pricePro} className="input" min={0} step={1000} required />
          </div>
          <div>
            <label className="label">Deluxe, сум</label>
            <input type="number" name="priceDeluxe" defaultValue={course.priceDeluxe} className="input" min={0} step={1000} required />
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Вид в каталоге</h2>

        <div className="admin-grid">
          <div>
            <label className="label">Обложка курса</label>
            <input
              name="coverUrl"
              defaultValue={course.coverUrl ?? ''}
              className="input"
              placeholder="/media/courses/beginner-grammar.webp"
            />
            <div className="hint">
              Путь к файлу из папки public. Если файла нет, карточка покажет плашку с цветом
              уровня — сломанной картинки не будет
            </div>
          </div>

          <div>
            <label className="label">Бейдж</label>
            <select name="badge" defaultValue={course.badge ?? ''} className="select">
              {BADGES.map(b => (
                <option key={b || 'none'} value={b}>
                  {b || 'без бейджа'}
                </option>
              ))}
            </select>
            <div className="hint">Плашка в углу карточки в каталоге</div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Публикация</h2>

        <label className="admin-switch">
          <input type="checkbox" name="published" defaultChecked={course.published} />
          <span>
            <strong>Опубликован</strong>
            <em>Неопубликованный курс не открывается по прямой ссылке</em>
          </span>
        </label>

        <label className="admin-switch">
          <input type="checkbox" name="visible" defaultChecked={course.visible} />
          <span>
            <strong>Показывать в каталоге</strong>
            <em>Снимите, чтобы курс был доступен только по ссылке</em>
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
