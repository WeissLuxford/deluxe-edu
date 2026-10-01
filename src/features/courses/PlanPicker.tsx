'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { Segmented } from '@/design/components/Segmented'
import { CallbackForm } from '@/features/leads/CallbackForm'
import s from './course.module.css'

type Plan = 'BASIC' | 'PRO' | 'DELUXE'

type Props = {
  courseId: string
  prices: Record<Plan, string>
}

// Online payment isn't wired yet (docs/AUDIT.md, stage 5), so "start" opens a
// call-back request for the chosen plan right inside the card.
export function PlanPicker({ courseId, prices }: Props) {
  const t = useTranslations('coursePage')
  const tu = useTranslations('ui')
  const locale = useLocale()
  const [plan, setPlan] = useState<Plan>('PRO')
  const [asking, setAsking] = useState(false)
  const points = tu.raw(`plans.${plan}.points`) as string[]

  const rich = {
    it: (c: ReactNode) => <span className="it">{c}</span>,
    a: (c: ReactNode) => <Link href={`/${locale}/trial-lesson`}>{c}</Link>
  }

  return (
    <div className={s.picker}>
      <div className={[s.pickerFace, asking && s.pickerAway].filter(Boolean).join(' ')} aria-hidden={asking}>
        <span className={s.pickerLabel}>{t('howToLearn')}</span>
        <Segmented<Plan>
          label={t('howToLearn')}
          value={plan}
          onChange={setPlan}
          options={(['BASIC', 'PRO', 'DELUXE'] as Plan[]).map(p => ({ value: p, label: tu(`plans.${p}.name`) }))}
        />
        <div className={s.pickerPrice} key={plan}>
          <span className={s.pickerTag}>{tu(`plans.${plan}.tagline`)}</span>
          <span className={s.pickerAmount}>{prices[plan]}</span>
        </div>
        <ul className={s.points} key={`${plan}-points`}>
          {points.map((point, i) => (
            <li key={point} style={{ animationDelay: `${i * 50}ms` }}>
              <span className={s.tick} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              {point}
            </li>
          ))}
        </ul>
        <Button size="lg" block dot onClick={() => setAsking(true)}>
          {t('startWith', { plan: tu(`plans.${plan}.name`) })}
        </Button>
        <span className={s.pickerNote}>{t.rich('note', rich)}</span>
      </div>

      <div className={[s.pickerAsk, asking && s.pickerAskIn].filter(Boolean).join(' ')} aria-hidden={!asking}>
        {asking && (
          <>
            <span className={s.askTitle}>{t.rich('leadTitle', rich)}</span>
            <span className={s.askText}>{t('leadText')}</span>
            <CallbackForm source="COURSE_PAGE" courseId={courseId} plan={plan} tone="onWhite" />
            <button type="button" className={s.askBack} onClick={() => setAsking(false)}>
              ← {t('leadBack')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
