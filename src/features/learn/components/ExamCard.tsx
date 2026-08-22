import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ClipboardCheck, Lock, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { examHref, type TreeModule } from '@/features/learn/progress'

export async function ExamCard({
  locale,
  courseSlug,
  module
}: {
  locale: string
  courseSlug: string
  module: TreeModule
}) {
  const t = await getTranslations({ locale, namespace: 'exam' })
  const exam = module.exam
  if (!exam) return null

  const moduleDone = module.total > 0 && module.done === module.total
  const locked = !moduleDone

  let statusIcon = <ClipboardCheck size={15} />
  let statusLabel = t('start')

  if (exam.reviewStatus === 'PENDING') {
    statusIcon = <Clock3 size={15} />
    statusLabel = t('pendingReview')
  } else if (exam.reviewStatus === 'APPROVED') {
    statusIcon = <CheckCircle2 size={15} />
    statusLabel = t('approved')
  } else if (exam.reviewStatus === 'REJECTED') {
    statusIcon = <XCircle size={15} />
    statusLabel = t('rejected')
  } else if (exam.attempted) {
    statusIcon = <ClipboardCheck size={15} />
    statusLabel = exam.passed ? t('passedTitle') : t('failedTitle')
  }

  const inner = (
    <>
      <div className="lesson-card__cover exam-card__cover">
        <span className="lesson-card__badge">{locked ? <Lock size={14} /> : statusIcon}</span>
      </div>
      <div className="lesson-card__body">
        <span className="lesson-card__number">{t('title')}</span>
        <h3 className="lesson-card__title">{exam.title}</h3>
        <p className="lesson-card__hint">{locked ? t('notYetAvailable') : statusLabel}</p>
      </div>
    </>
  )

  if (locked) {
    return <div className="lesson-card is-locked exam-card">{inner}</div>
  }

  return (
    <Link href={examHref(locale, courseSlug, module.id)} className="lesson-card exam-card status-current">
      {inner}
    </Link>
  )
}
