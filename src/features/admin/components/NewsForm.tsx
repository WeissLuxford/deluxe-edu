'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizedField } from './LocalizedField'
import { LocalizedRichField } from './LocalizedRichField'
import { SlugField } from './SlugField'
import type { ActionResult } from '../actions'

type Localized = { ru?: string; uz?: string; en?: string }

export type NewsFormData = {
  slug: string
  title: Localized
  lead: Localized
  body: Localized
  metaTitle: Localized
  metaDescription: Localized
  coverUrl: string
  published: boolean
  publishedAt: string
}

const empty: NewsFormData = {
  slug: '',
  title: {},
  lead: {},
  body: {},
  metaTitle: {},
  metaDescription: {},
  coverUrl: '',
  published: false,
  publishedAt: ''
}

export function NewsForm({
  action,
  news = empty,
  submitLabel,
  redirectTo
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  news?: NewsFormData
  submitLabel: string
  redirectTo: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)
  const [titleRu, setTitleRu] = useState(news.title.ru ?? '')

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction} className="admin-form">
      {state && !state.ok && <div className="alert alert-error">{state.error}</div>}

      <section className="admin-panel">
        <h2 className="admin-panel__title">Содержание</h2>

        <LocalizedField name="title" label="Заголовок" value={news.title} required onRuChange={setTitleRu} />

        <SlugField value={news.slug} source={titleRu} hint="Общий адрес для всех языков: /ru/news/адрес, /uz/news/адрес, /en/news/адрес" />

        <LocalizedField name="lead" label="Анонс" value={news.lead} textarea rows={3} required hint="Короткое описание для списка и соцсетей" maxLength={300} />

        <LocalizedRichField name="body" label="Текст" value={news.body} required hint="Заголовки, списки, выноски, цвет текста, ссылки и кнопки — через панель редактора" />

        <div>
          <label className="label">Ссылка на обложку</label>
          <input name="coverUrl" defaultValue={news.coverUrl} className="input" placeholder="необязательно" />
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
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Поисковая выдача</h2>

        <LocalizedField
          name="metaTitle"
          label="Title страницы"
          value={news.metaTitle}
          hint="Что видно в поиске как ссылка. Пусто — возьмётся заголовок"
          maxLength={70}
        />

        <LocalizedField
          name="metaDescription"
          label="Description страницы"
          value={news.metaDescription}
          textarea
          rows={3}
          hint="Что видно в поиске под ссылкой. Пусто — возьмётся анонс"
          maxLength={170}
        />
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
