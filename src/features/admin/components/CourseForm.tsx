'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizedField } from './LocalizedField'
import { SlugField } from './SlugField'
import type { ActionResult } from '../actions'
import { Chips, Field, FormLayout, Input, LevelPicker, Row, SaveBox, Section, Toggle } from '@/features/staff/form/Form'

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
    <form action={formAction}>
      <FormLayout
        aside={
          <>
            <Section title="Публикация">
              <div>
                <Toggle name="published" defaultChecked={course.published} title="Опубликован" hint="Без этого курс не открывается даже по прямой ссылке" />
                <Toggle name="visible" defaultChecked={course.visible} title="В каталоге" hint="Выключи, чтобы курс был доступен только по ссылке" />
              </div>
            </Section>
            <SaveBox pending={pending} label={submitLabel} error={state && !state.ok ? state.error : null} />
          </>
        }
      >
        <Section title="Содержание">
          <LocalizedField name="title" label="Название" value={course.title} required onRuChange={setTitleRu} />
          <LocalizedField name="description" label="Описание" value={course.description} textarea rows={4} required />
          <SlugField value={course.slug} source={titleRu} hint="Виден в ссылке: /ru/courses/адрес. Только латиница, цифры и дефис." />
        </Section>

        <Section title="Уровень">
          <LevelPicker name="level" defaultValue={course.level} levels={LEVELS} />
        </Section>

        <Section title="Цены" hint="В сумах, за месяц подписки. Тарифы отличаются тем, сколько преподавателя в них.">
          <Row min={160}>
            <Field label="Basic" htmlFor="priceBasic">
              <Input id="priceBasic" type="number" name="priceBasic" defaultValue={course.priceBasic} min={0} step={1000} required />
            </Field>
            <Field label="Pro" htmlFor="pricePro">
              <Input id="pricePro" type="number" name="pricePro" defaultValue={course.pricePro} min={0} step={1000} required />
            </Field>
            <Field label="Deluxe" htmlFor="priceDeluxe">
              <Input id="priceDeluxe" type="number" name="priceDeluxe" defaultValue={course.priceDeluxe} min={0} step={1000} required />
            </Field>
          </Row>
        </Section>

        <Section title="Вид в каталоге">
          <Field
            label="Обложка"
            htmlFor="coverUrl"
            hint="Путь к файлу из папки public. Нет файла — карточка покажет плашку цвета уровня, сломанной картинки не будет."
          >
            <Input id="coverUrl" name="coverUrl" defaultValue={course.coverUrl ?? ''} placeholder="/media/courses/beginner-grammar.webp" />
          </Field>
          <Field label="Бейдж" hint="Плашка в углу карточки в каталоге">
            <Chips name="badge" defaultValue={course.badge ?? ''} options={BADGES.map(b => ({ value: b, label: b || 'Без бейджа' }))} />
          </Field>
        </Section>
      </FormLayout>
    </form>
  )
}
