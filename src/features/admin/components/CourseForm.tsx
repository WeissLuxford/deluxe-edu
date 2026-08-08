'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
}

// Должно совпадать со списком в каталоге (app/[locale]/courses/page.tsx):
// уровень, которого там нет, не попадёт ни в один раздел
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
  visible: true
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

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
          Название
        </h2>
        <div className="space-y-3">
          <div>
            <label className="label">Русский *</label>
            <input name="title_ru" defaultValue={course.title.ru} className="input" required />
          </div>
          <div>
            <label className="label">O‘zbekcha</label>
            <input name="title_uz" defaultValue={course.title.uz} className="input" />
          </div>
          <div>
            <label className="label">English</label>
            <input name="title_en" defaultValue={course.title.en} className="input" />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
          Описание
        </h2>
        <div className="space-y-3">
          <div>
            <label className="label">Русский *</label>
            <textarea name="description_ru" defaultValue={course.description.ru} className="textarea" rows={3} required />
          </div>
          <div>
            <label className="label">O‘zbekcha</label>
            <textarea name="description_uz" defaultValue={course.description.uz} className="textarea" rows={3} />
          </div>
          <div>
            <label className="label">English</label>
            <textarea name="description_en" defaultValue={course.description.en} className="textarea" rows={3} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
          Настройки
        </h2>

        <div className="form-grid-2" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <label className="label">Адрес курса *</label>
            <input
              name="slug"
              defaultValue={course.slug}
              className="input"
              placeholder="english-a1"
              pattern="[a-z0-9\-]+"
              required
            />
            <div className="hint">Виден в ссылке: /ru/courses/<b>english-a1</b>. Только латиница и дефис.</div>
          </div>

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

        <div className="space-y-2" style={{ marginTop: '1.25rem' }}>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
            <input type="checkbox" name="published" defaultChecked={course.published} />
            <span style={{ color: 'var(--fg)' }}>Опубликован</span>
          </label>
          <div className="hint">Неопубликованный курс не открывается по прямой ссылке.</div>

          <label className="flex items-center gap-2" style={{ cursor: 'pointer', marginTop: '0.75rem' }}>
            <input type="checkbox" name="visible" defaultChecked={course.visible} />
            <span style={{ color: 'var(--fg)' }}>Показывать в каталоге</span>
          </label>
          <div className="hint">Снимите, чтобы курс был доступен только по ссылке.</div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Сохраняю…' : submitLabel}
      </button>
    </form>
  )
}
