'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlugField } from './SlugField'
import type { ActionResult } from '../actions'

export type NewsFormData = {
  groupId: string
  locale: string
  slug: string
  title: string
  lead: string
  body: string
  metaTitle: string
  metaDescription: string
  coverUrl: string
  published: boolean
  publishedAt: string
}

const empty: NewsFormData = {
  groupId: '',
  locale: 'ru',
  slug: '',
  title: '',
  lead: '',
  body: '',
  metaTitle: '',
  metaDescription: '',
  coverUrl: '',
  published: false,
  publishedAt: ''
}

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max
  const near = value.length > max * 0.9
  return (
    <span className={`lf__count${over ? ' warn' : near ? ' warn' : ''}`}>
      {value.length} / {max}
    </span>
  )
}

export function NewsForm({
  action,
  news = empty,
  submitLabel,
  redirectTo,
  lockLocale = false
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  news?: NewsFormData
  submitLabel: string
  redirectTo: string
  lockLocale?: boolean
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)

  const [title, setTitle] = useState(news.title)
  const [lead, setLead] = useState(news.lead)
  const [metaTitle, setMetaTitle] = useState(news.metaTitle)
  const [metaDescription, setMetaDescription] = useState(news.metaDescription)

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} className="admin-form">
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

      <input type="hidden" name="groupId" value={news.groupId} />

      <section className="admin-panel">
        <h2 className="admin-panel__title">Содержание</h2>

        <div className="admin-grid">
          <div>
            <label className="label">Язык новости *</label>
            <select name="locale" defaultValue={news.locale} className="select" disabled={lockLocale}>
              <option value="ru">Русский</option>
              <option value="uz">O‘zbekcha</option>
              <option value="en">English</option>
            </select>
            {lockLocale && <input type="hidden" name="locale" value={news.locale} />}
            <div className="hint">Каждый язык — отдельная запись со своим адресом</div>
          </div>

          <div>
            <label className="label">Дата публикации *</label>
            <input
              type="datetime-local"
              name="publishedAt"
              defaultValue={news.publishedAt}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Заголовок *</label>
          <input
            name="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            required
          />
        </div>

        <SlugField value={news.slug} source={title} hint="Виден в ссылке: /ru/news/адрес" />

        <div>
          <label className="label">Анонс *</label>
          <textarea
            name="lead"
            value={lead}
            onChange={e => setLead(e.target.value)}
            className="textarea"
            rows={3}
            required
          />
          <div className="lf__foot">
            <span className="hint">Короткое описание для списка и соцсетей</span>
            <Counter value={lead} max={300} />
          </div>
        </div>

        <div>
          <label className="label">Текст *</label>
          <textarea
            name="body"
            defaultValue={news.body}
            className="textarea"
            rows={16}
            required
          />
          <div className="hint">Пустая строка разделяет абзацы</div>
        </div>

        <div>
          <label className="label">Ссылка на обложку</label>
          <input name="coverUrl" defaultValue={news.coverUrl} className="input" placeholder="необязательно" />
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Поисковая выдача</h2>

        <div>
          <label className="label">Title страницы</label>
          <input
            name="metaTitle"
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            className="input"
            placeholder="Пусто — возьмётся заголовок"
          />
          <div className="lf__foot">
            <span className="hint">Что видно в поиске как ссылка</span>
            <Counter value={metaTitle} max={70} />
          </div>
        </div>

        <div>
          <label className="label">Description страницы</label>
          <textarea
            name="metaDescription"
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
            className="textarea"
            rows={3}
            placeholder="Пусто — возьмётся анонс"
          />
          <div className="lf__foot">
            <span className="hint">Что видно в поиске под ссылкой</span>
            <Counter value={metaDescription} max={170} />
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Публикация</h2>

        <label className="admin-switch">
          <input type="checkbox" name="published" defaultChecked={news.published} />
          <span>
            <strong>Опубликована</strong>
            <em>Неопубликованная новость не видна на сайте и не попадает в RSS</em>
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
