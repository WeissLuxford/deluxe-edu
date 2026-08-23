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
  // Текст раздела: в чтении здесь лежит сам отрывок.
  content: string
  sections: Section[]
  currentIndex: number
  locale: string
}

const STORAGE_KEY = 'highgate:mock-test'

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

export function FreeMockTestPlayer({
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

  const onScored = (scored: FreeTestResult) => {
    try {
      const saved = readSaved()
      saved[lessonSlug] = { correct: scored.correct, total: scored.total }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // приватный режим браузера — покажем результат только этого раздела
    }
    setResult(scored)
  }

  const restart = () => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ничего не чистим, просто начнём сначала
    }
    window.location.href = `/${locale}/free-mock-test`
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
              courseSlug="free-mock-test-online"
              lessonSlug={lessonSlug}
              prompt={assignment.prompt}
              locale={locale}
              submitLabel={nextSection ? t('completeSection') : t('finish')}
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

  if (nextSection) {
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
            <p className="test-result__text">{t('sectionDoneText', { section: nextSection.title })}</p>
          </div>

          <Link
            href={`/${locale}/free-mock-test/${nextSection.slug}`}
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

  return (
    <div className="page-start py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="level-result">
          <span className="level-result__label">{t('mockResultTitle')}</span>
          <div className="level-result__level">{percent}%</div>
          <p className="level-result__score">{t('totalScore', { correct, total, percent })}</p>
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

        <div className="level-advice">
          <h3 className="level-advice__title">{t('mockAdviceTitle')}</h3>
          <p className="level-advice__text">{t('mockAdviceText')}</p>
          <div className="level-advice__actions">
            <Link href={`/${locale}/courses`} className="btn btn-primary">
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
