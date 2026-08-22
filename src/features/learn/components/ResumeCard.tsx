import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Play, ArrowRight, ClipboardCheck } from 'lucide-react'
import { lessonHref, examHref, type ResumeTarget } from '@/features/learn/progress'

export async function ResumeCard({ locale, resume }: { locale: string; resume: ResumeTarget }) {
  const t = await getTranslations({ locale, namespace: 'learn' })
  const tExam = await getTranslations({ locale, namespace: 'exam' })

  if (resume.kind === 'exam') {
    return (
      <section className="resume-card">
        <div className="resume-card__body">
          <span className="resume-card__eyebrow">{tExam('title')}</span>

          <h2 className="resume-card__title">{resume.moduleTitle}</h2>

          <p className="resume-card__meta">{resume.courseTitle}</p>

          <div className="resume-card__progress">
            <div className="progress">
              <div className="progress-bar" style={{ width: `${resume.percent}%` }} />
            </div>
            <span className="resume-card__counter">
              {t('lessonsOf', { done: resume.done, total: resume.total })}
            </span>
          </div>
        </div>

        <div className="resume-card__actions">
          <Link
            href={examHref(locale, resume.courseSlug, resume.moduleId)}
            className="btn btn-primary resume-card__cta"
          >
            <ClipboardCheck size={16} />
            {tExam('start')}
          </Link>

          <Link href={`/${locale}/learn/${resume.courseSlug}`} className="resume-card__secondary">
            {t('overview')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="resume-card">
      <div className="resume-card__body">
        <span className="resume-card__eyebrow">
          {resume.started ? t('resumeHint') : t('startHint')}
        </span>

        <h2 className="resume-card__title">{resume.lessonTitle}</h2>

        <p className="resume-card__meta">
          {resume.courseTitle}
          <span className="resume-card__dot" />
          {resume.moduleTitle}
        </p>

        <div className="resume-card__progress">
          <div className="progress">
            <div className="progress-bar" style={{ width: `${resume.percent}%` }} />
          </div>
          <span className="resume-card__counter">
            {t('lessonsOf', { done: resume.done, total: resume.total })}
          </span>
        </div>
      </div>

      <div className="resume-card__actions">
        <Link
          href={lessonHref(locale, resume.courseSlug, resume.lessonSlug, resume.step)}
          className="btn btn-primary resume-card__cta"
        >
          <Play size={16} />
          {resume.started ? t('resumeAction') : t('startAction')}
        </Link>

        <Link href={`/${locale}/learn/${resume.courseSlug}`} className="resume-card__secondary">
          {t('overview')}
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
