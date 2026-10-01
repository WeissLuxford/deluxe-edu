'use client'

import { useActionState, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Video, FileText, ClipboardCheck } from 'lucide-react'
import { LocalizedField } from './LocalizedField'
import { LocalizedRichField } from './LocalizedRichField'
import { SlugField } from './SlugField'
import { FileOrUrlField } from './FileOrUrlField'
import type { ActionResult } from '../actions'
import { Field, FormLayout, Input, Row, SaveBox, Section, Select, Tabs, Toggle, formStyles as fs } from '@/features/staff/form/Form'

const FORM_ID = 'lesson-form'

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
  { key: 'tests', label: 'Тест', icon: ClipboardCheck },
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
    <FormLayout
      aside={
        <>
          <Section title="Что увидит ученик" hint="Шаг появится, когда для него есть содержимое.">
            <div>
              <Toggle form={FORM_ID} name="hasVideo" defaultChecked={lesson.hasVideo} title="Видео" hint="Нужна ссылка на ролик" />
              <Toggle form={FORM_ID} name="hasConspect" defaultChecked={lesson.hasConspect} title="Конспект" hint="Текст на вкладке «Конспект»" />
              <Toggle form={FORM_ID} name="hasTest" defaultChecked={lesson.hasTest} title="Тест" hint="Нужны вопросы на вкладке «Тест»" />
            </div>
          </Section>
          <SaveBox form={FORM_ID} pending={pending} label={submitLabel} error={state && !state.ok ? state.error : null} />
        </>
      }
    >
      <form id={FORM_ID} action={formAction} className={fs.stack}>
        <Section title="Основное">
          <LocalizedField name="title" label="Название урока" value={lesson.title} required onRuChange={setTitleRu} />

          <Row min={220}>
            <SlugField value={lesson.slug} source={titleRu} />
            <Field label="Порядок" htmlFor="order" hint="Удобнее менять стрелками в списке уроков">
              <Input id="order" type="number" name="order" defaultValue={lesson.order} min={0} required />
            </Field>
          </Row>

          <Row min={220}>
            <Field
              label="Модуль"
              htmlFor="moduleId"
              hint={modules.length === 0 ? 'В курсе ещё нет модулей — создай их на странице курса' : 'Раздел программы, где ученик увидит урок'}
            >
              <Select id="moduleId" name="moduleId" defaultValue={lesson.moduleId ?? ''}>
                <option value="">Вне модулей</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Длительность, мин" htmlFor="durationMin" hint="Видна в программе курса">
              <Input id="durationMin" type="number" name="durationMin" defaultValue={lesson.durationMin ?? ''} min={0} max={600} placeholder="необязательно" />
            </Field>
          </Row>
        </Section>

        <Tabs
          value={tab}
          onChange={v => setTab(v as TabKey)}
          tabs={TABS.map(t => {
            const Icon = t.icon
            return {
              value: t.key,
              label: (
                <>
                  <Icon size={16} /> {t.label}
                </>
              )
            }
          })}
        />

        <div style={{ display: tab === 'video' ? 'contents' : 'none' }}>
          <Section title="Видео">
            <Field label="Ссылка на видео" hint="YouTube, прямая ссылка или загрузка файла в хранилище">
              <FileOrUrlField
                name="videoUrl"
                defaultValue={lesson.videoUrl}
                placeholder="https://youtu.be/... или прямая ссылка"
                folder="lesson-video"
                accept="video/mp4,video/webm"
              />
            </Field>
            <Field label="Обложка урока" htmlFor="coverUrl" hint="Путь к файлу из папки public. Без обложки — однотонная плашка">
              <Input id="coverUrl" name="coverUrl" defaultValue={lesson.coverUrl ?? ''} placeholder="/media/lessons/present-simple.webp" />
            </Field>
            <Field label="Номер конференции Zoom" htmlFor="zoomMeetingId">
              <Input id="zoomMeetingId" name="zoomMeetingId" defaultValue={lesson.zoomMeetingId ?? ''} placeholder="необязательно" />
            </Field>
          </Section>
        </div>

        <div style={{ display: tab === 'conspect' ? 'contents' : 'none' }}>
          <Section title="Конспект">
            <LocalizedRichField name="content" label="Текст конспекта" value={lesson.content} required hint="То, что ученик видит на шаге «Конспект»" />
          </Section>
        </div>

        {tab === 'tests' && !testsSlot && (
          <Section title="Тест">
            <p className={fs.hint}>Вопросы можно добавить, когда урок будет создан.</p>
          </Section>
        )}
      </form>

      {testsSlot && <div style={{ display: tab === 'tests' ? 'contents' : 'none' }}>{testsSlot}</div>}
    </FormLayout>
  )
}
