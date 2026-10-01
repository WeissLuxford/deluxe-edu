'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizedField } from './LocalizedField'
import type { ActionResult } from '../actions'
import { Chips, Field, FormLayout, Input, Row, SaveBox, Section, Toggle } from '@/features/staff/form/Form'

type Localized = { ru?: string; uz?: string; en?: string }

export type StreamFormData = {
  title: Localized
  description: Localized
  kind: 'YOUTUBE' | 'ZOOM'
  youtubeId: string
  zoomJoinUrl: string
  startsAt: string
  durationMin: number
  recordingUrl: string
  requiredPlan: string
  published: boolean
}

const empty: StreamFormData = {
  title: {},
  description: {},
  kind: 'YOUTUBE',
  youtubeId: '',
  zoomJoinUrl: '',
  startsAt: '',
  durationMin: 60,
  recordingUrl: '',
  requiredPlan: '',
  published: false
}

export function StreamForm({
  action,
  stream = empty,
  submitLabel,
  redirectTo
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>
  stream?: StreamFormData
  submitLabel: string
  redirectTo: string
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null)
  const [kind, setKind] = useState(stream.kind)

  useEffect(() => {
    if (state?.ok) router.push(redirectTo)
  }, [state, router, redirectTo])

  return (
    <form action={formAction}>
      <FormLayout
        aside={
          <>
            <Section title="Доступ" hint="Открытый эфир видят и гости — это реклама платформы.">
              <Chips
                name="requiredPlan"
                defaultValue={stream.requiredPlan}
                options={[
                  { value: '', label: 'Всем' },
                  { value: 'BASIC', label: 'Basic+' },
                  { value: 'PRO', label: 'Pro+' },
                  { value: 'DELUXE', label: 'Deluxe' }
                ]}
              />
              <div>
                <Toggle name="published" defaultChecked={stream.published} title="Опубликован" hint="Без этого эфира нет в расписании" />
              </div>
            </Section>
            <SaveBox pending={pending} label={submitLabel} error={state && !state.ok ? state.error : null} />
          </>
        }
      >
        <Section title="О чём эфир">
          <LocalizedField name="title" label="Название" value={stream.title} required />
          <LocalizedField name="description" label="Описание" value={stream.description} textarea rows={3} required />
        </Section>

        <Section title="Где и когда">
          <Field label="Площадка">
            <Chips
              name="kind"
              value={kind}
              onChange={v => setKind(v as 'YOUTUBE' | 'ZOOM')}
              options={[
                { value: 'YOUTUBE', label: 'YouTube — смотрят на сайте' },
                { value: 'ZOOM', label: 'Zoom — по ссылке' }
              ]}
            />
          </Field>

          <Row min={220}>
            <Field label="Начало" required htmlFor="startsAt">
              <Input id="startsAt" type="datetime-local" name="startsAt" defaultValue={stream.startsAt} required />
            </Field>
            <Field label="Длительность, мин" htmlFor="durationMin">
              <Input id="durationMin" type="number" name="durationMin" defaultValue={stream.durationMin} min={5} max={600} required />
            </Field>
          </Row>

          {kind === 'YOUTUBE' ? (
            <Field label="Ссылка или id ролика" required htmlFor="youtubeId" hint="Можно вставить полную ссылку — id извлечётся сам.">
              <Input id="youtubeId" name="youtubeId" defaultValue={stream.youtubeId} placeholder="https://youtu.be/XXXXXXXXXXX" />
            </Field>
          ) : (
            <Field
              label="Ссылка входа в Zoom"
              required
              htmlFor="zoomJoinUrl"
              hint="В разметку страницы не попадает — сервер отдаёт её только тем, у кого есть доступ."
            >
              <Input id="zoomJoinUrl" name="zoomJoinUrl" defaultValue={stream.zoomJoinUrl} placeholder="https://zoom.us/j/..." />
            </Field>
          )}

          <Field label="Запись" htmlFor="recordingUrl" hint="Когда эфир прошёл — ссылка на запись для тех, кто пропустил.">
            <Input id="recordingUrl" name="recordingUrl" defaultValue={stream.recordingUrl} placeholder="необязательно" />
          </Field>
        </Section>
      </FormLayout>
    </form>
  )
}
