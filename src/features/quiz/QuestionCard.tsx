'use client'

import { useTranslations } from 'next-intl'
import type { Answer, QuizQuestion } from './questions'
import s from './quiz.module.css'

export type Review = { correct: boolean; rightValues?: string[] } | null

type Props = {
  question: QuizQuestion
  value: Answer | undefined
  onChange: (value: Answer) => void
  /** After checking: marks the right option green and a wrong pick red. */
  review?: Review
  size?: 'md' | 'lg'
}

// One question, styled after the canvas: a big sentence, then options as
// rounded cards with A–D keys. The card re-keys per question so it slides in.
export function QuestionCard({ question, value, onChange, review = null, size = 'lg' }: Props) {
  const t = useTranslations('quiz')
  const locked = Boolean(review)
  const picked = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []

  const stateOf = (optionValue: string) => {
    const isPicked = picked.includes(optionValue)
    if (!review) return isPicked ? 'picked' : 'idle'
    if (review.rightValues?.includes(optionValue)) return 'right'
    if (isPicked) return review.correct ? 'right' : 'wrong'
    return 'idle'
  }

  const toggle = (optionValue: string) => {
    if (locked) return
    if (question.type === 'multiple') {
      onChange(picked.includes(optionValue) ? picked.filter(v => v !== optionValue) : [...picked, optionValue])
    } else {
      onChange(optionValue)
    }
  }

  return (
    <div key={question.id} className={[s.card, size === 'md' && s.cardMd].filter(Boolean).join(' ')}>
      <div className={s.qHead}>
        <span className={s.qHint}>{question.type === 'multiple' ? t('pickMany') : question.type === 'text' ? t('type') : t('pick')}</span>
        <h2 className={s.qText}>{question.text}</h2>
      </div>

      {question.type === 'text' ? (
        <input
          className={[s.textAnswer, review && (review.correct ? s.textRight : s.textWrong)].filter(Boolean).join(' ')}
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          placeholder={t('typePlaceholder')}
          aria-label={question.text}
          readOnly={locked}
          autoFocus
        />
      ) : (
        <div className={s.options} role={question.type === 'multiple' ? 'group' : 'radiogroup'} aria-label={question.text}>
          {question.options.map((option, i) => {
            const state = stateOf(option.value)
            return (
              <button
                key={option.value}
                type="button"
                role={question.type === 'multiple' ? 'checkbox' : 'radio'}
                aria-checked={picked.includes(option.value)}
                className={s.option}
                data-state={state}
                disabled={locked}
                onClick={() => toggle(option.value)}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className={s.key}>{String.fromCharCode(65 + i)}</span>
                <span className={s.optionLabel}>{option.label}</span>
                {state === 'right' && review && <span className={s.note}>{t('right')}</span>}
                {state === 'wrong' && <span className={`${s.note} ${s.noteWrong}`}>{t('yours')}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Top bar for focused flows: close, a progress line that fills smoothly, a counter. */
export function FocusBar({ percent, counter, closeHref }: { percent: number; counter: string; closeHref: string }) {
  const t = useTranslations('quiz')
  return (
    <div className={s.bar}>
      <a href={closeHref} className={s.close} aria-label={t('close')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </a>
      <span className={s.track} role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <span className={s.fill} style={{ width: `${Math.max(3, Math.min(100, percent))}%` }} />
      </span>
      <span className={s.counter}>{counter}</span>
    </div>
  )
}
