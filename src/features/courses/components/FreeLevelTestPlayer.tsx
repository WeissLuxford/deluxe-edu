'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react'
import LeadForm from '@/features/leads/LeadForm'
import { RichText } from '@/features/ui/components/RichText'
import { FreeTest, type FreeTestResult } from './FreeTest'

type Section = { slug: string; title: string }

type Props = {
  lessonSlug: string
  assignment: { prompt: unknown } | null
  // Текст раздела: в чтении здесь лежит сам отрывок, без него вопросы бессмысленны.
  content: string
  sections: Section[]
  currentIndex: number
  locale: string
}

const STORAGE_KEY = 'vertex:level-test'

// Разделы теста лежат на отдельных страницах, поэтому промежуточный результат
// живёт в sessionStorage: закрыл вкладку — начал заново, и это честно.
type Saved = Record<string, { correct: number; total: number }>

function readSaved(): Saved {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? (parsed as Saved) : {}
  } catch {
    return {}
  }
}

function writeSaved(saved: Saved) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {
    return
  }
}

// Границы подобраны под банк вопросов: он идёт по нарастающей сложности,
// поэтому 60% верных — это уверенный Intermediate, а не половина знаний.
const BANDS = [
  { min: 90, level: 'Advanced', cefr: 'C1' },
  { min: 75, level: 'Upper-Intermediate', cefr: 'B2' },
  { min: 60, level: 'Intermediate', cefr: 'B1' },
  { min: 40, level: 'Pre-Intermediate', cefr: 'A2+' },
  { min: 20, level: 'Elementary', cefr: 'A2' },
  { min: 0, level: 'Beginner', cefr: 'A1' }
] as const

function bandFor(percent: number) {
  return BANDS.find(band => percent >= band.min) ?? BANDS[BANDS.length - 1]
}

export function FreeLevelTestPlayer({
  lessonSlug,
  assignment,
  content,
  sections,
  currentIndex,
  locale
}: Props) {
  const t = useTranslations('levelTest')
  const tLead = useTranslations('lead')
  const [result, setResult] = useState<FreeTestResult | null>(null)

  const nextSection = sections[currentIndex + 1]
  const isLastSection = !nextSection

  const onScored = (scored: FreeTestResult) => {
    const saved = readSaved()
    saved[lessonSlug] = { correct: scored.correct, total: scored.total }
    writeSaved(saved)
    setResult(scored)
  }

  const restart = () => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // приватный режим браузера — начнём заново и без очистки
    }
    window.location.href = `/${locale}/level-test`
  }

  if (!result) {
    return (
      <div className="page-start py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="level-test__hint">{t('hint')}</p>

          {content.trim() && (
            <div className="conspect">
              <RichText text={content} />
            </div>
          )}

          {assignment ? (
            <FreeTest
              courseSlug="level-test"
              lessonSlug={lessonSlug}
              prompt={assignment.prompt}
              locale={locale}
              submitLabel={isLastSection ? t('finish') : t('completeSection')}
              onScored={onScored}
            />
          ) : (
            <div className="test-empty">
              <h3>{t('emptyTitle')}</h3>
              <p>{t('emptyText')}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isLastSection) {
    return (
      <div className="page-start py-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="test-result passed">
            <span className="test-result__icon">
              <CheckCircle2 size={40} />
            </span>
            <h2 className="test-result__title">{t('sectionDone')}</h2>
            <div className="test-result__score">
              {result.correct}/{result.total}
            </div>
            <p className="test-result__text">
              {t('sectionDoneText', { section: sections[currentIndex + 1].title })}
            </p>
          </div>

          <Link
            href={`/${locale}/level-test/${nextSection.slug}`}
            className="btn btn-primary w-full justify-center"
          >
            {t('nextSection')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  const saved = readSaved()
  const breakdown = sections.map(section => ({
    title: section.title,
    ...(saved[section.slug] ?? { correct: 0, total: 0 })
  }))

  const answered = breakdown.filter(row => row.total > 0)
  const correct = answered.reduce((sum, row) => sum + row.correct, 0)
  const total = answered.reduce((sum, row) => sum + row.total, 0)
  const percent = total ? Math.round((correct / total) * 100) : 0
  const band = bandFor(percent)
  const partial = answered.length < sections.length

  return (
    <div className="page-start py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="level-result">
          <span className="level-result__label">{t('resultTitle')}</span>
          <div className="level-result__level">{band.level}</div>
          <div className="level-result__cefr">{t('cefr', { code: band.cefr })}</div>
          <p className="level-result__score">
            {t('totalScore', { correct, total, percent })}
          </p>
        </div>

        <div className="test-summary">
          <div className="test-summary__row">
            <strong>{t('breakdown')}</strong>
          </div>
          {breakdown.map(row => (
            <div key={row.title} className="test-summary__row">
              <span>{row.title}</span>
              <strong>{row.total ? `${row.correct}/${row.total}` : '—'}</strong>
            </div>
          ))}
        </div>

        {partial && <div className="alert alert-warning">{t('partial')}</div>}

        <div className="level-advice">
          <h3 className="level-advice__title">{t('adviceTitle')}</h3>
          <p className="level-advice__text">{t('adviceText', { level: band.level })}</p>
          <div className="level-advice__actions">
            <Link
              href={`/${locale}/courses?level=${encodeURIComponent(band.level)}`}
              className="btn btn-primary"
            >
              {t('toCourses')}
            </Link>
            <button type="button" onClick={restart} className="btn btn-secondary">
              <RotateCcw size={16} />
              {t('restart')}
            </button>
          </div>
        </div>

        <div className="level-lead">
          <h3 className="level-advice__title">{tLead('title')}</h3>
          <p className="level-advice__text">{t('leadLead')}</p>
          <LeadForm source="LEVEL_TEST" />
        </div>
      </div>
    </div>
  )
}
