'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizedField } from './LocalizedField'
import { LocalizedRichField } from './LocalizedRichField'
import { SlugField } from './SlugField'
import type { ActionResult } from '../actions'
import { Field, FormLayout, Input, SaveBox, Section, Toggle } from '@/features/staff/form/Form'

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
    <form action={formAction}>
      <FormLayout
        aside={
          <>
            <Section title="Публикация">
              <Field label="Дата" required htmlFor="publishedAt" hint="Новости в ленте идут по этой дате">
                <Input id="publishedAt" type="datetime-local" name="publishedAt" defaultValue={news.publishedAt} required />
              </Field>
              <div>
                <Toggle name="published" defaultChecked={news.published} title="Опубликована" hint="Без этого новости нет на сайте и в RSS" />
              </div>
            </Section>
            <SaveBox pending={pending} label={submitLabel} error={state && !state.ok ? state.error : null} />
          </>
        }
      >
        <Section title="Содержание">
          <LocalizedField name="title" label="Заголовок" value={news.title} required onRuChange={setTitleRu} />
          <SlugField value={news.slug} source={titleRu} hint="Общий для всех языков: /ru/news/адрес, /uz/news/адрес, /en/news/адрес" />
          <LocalizedField name="lead" label="Анонс" value={news.lead} textarea rows={3} hint="Коротко — для ленты и соцсетей" maxLength={300} />
          <LocalizedRichField name="body" label="Текст" value={news.body} hint="Заголовки, списки, выноски, цвет, ссылки и кнопки — через панель редактора" />
          <Field label="Обложка" htmlFor="coverUrl">
            <Input id="coverUrl" name="coverUrl" defaultValue={news.coverUrl} placeholder="ссылка на картинку, необязательно" />
          </Field>
        </Section>

        <Section title="В поиске" hint="Пусто — возьмутся заголовок и анонс.">
          <LocalizedField name="metaTitle" label="Заголовок в поиске" value={news.metaTitle} maxLength={70} />
          <LocalizedField name="metaDescription" label="Описание в поиске" value={news.metaDescription} textarea rows={3} maxLength={170} />
        </Section>
      </FormLayout>
    </form>
  )
}
