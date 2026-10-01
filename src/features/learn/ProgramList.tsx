import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/design/components/Reveal'
import { examHref, lessonHref, type CourseTree, type TreeLesson, type TreeModule } from './progress'
import s from './program.module.css'

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)
const Play = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)
const Lock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
)

export async function ProgramList({ tree, locale }: { tree: CourseTree; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'programPage' })

  const sub = (lesson: TreeLesson) => {
    if (lesson.status === 'locked') {
      if (lesson.blockedByExam) return t('lockedExam', { title: lesson.blockedByExam })
      if (lesson.blockedByTitle) return t('lockedAfter', { title: lesson.blockedByTitle })
      return t('lockedModule')
    }
    const parts = [t('lessonN', { n: lesson.index })]
    if (lesson.status === 'current' && lesson.lastStep) parts.push(t(`where.${lesson.lastStep}`))
    if (lesson.durationMin) parts.push(t('min', { min: lesson.durationMin }))
    return parts.join(' · ')
  }

  const examRow = (mod: TreeModule) => {
    const exam = mod.exam!
    const ready = mod.total > 0 && mod.done === mod.total
    let status = ready ? t('examReady') : t('examLater')
    if (exam.reviewStatus === 'PENDING') status = t('examPending')
    else if (exam.reviewStatus === 'APPROVED') status = t('examApproved', { grade: exam.grade ?? 0 })
    else if (exam.reviewStatus === 'REJECTED') status = t('examRejected')
    const open = ready && exam.reviewStatus !== 'APPROVED' && exam.reviewStatus !== 'PENDING'
    const body = (
      <>
        <span className={s.dot} data-kind={exam.reviewStatus === 'APPROVED' ? 'done' : 'exam'}>
          {exam.reviewStatus === 'APPROVED' ? <Check /> : '★'}
        </span>
        <span className={s.rowText}>
          <span className={s.rowTitle}>{exam.title || t('exam')}</span>
          <span className={s.rowSub}>{status}</span>
        </span>
        {open && <span className={s.rowCta}>{t('examOpen')}</span>}
      </>
    )
    return open || exam.attempted ? (
      <Link href={examHref(locale, tree.slug, mod.id)} className={s.row} data-kind={open ? 'current' : 'exam'}>
        {body}
      </Link>
    ) : (
      <div className={s.row} data-kind="exam">
        {body}
      </div>
    )
  }

  return (
    <div className={s.modules}>
      {tree.modules.map((mod, i) => {
        const status = mod.total > 0 && mod.done === mod.total ? t('moduleDone') : mod.locked ? t('moduleLocked') : t('moduleStatus', { done: mod.done, total: mod.total })
        return (
          <Reveal key={mod.id} delay={Math.min(i, 4) * 60} as="section" className={s.module}>
            <div className={s.moduleHead}>
              <h2 className={s.moduleTitle}>{mod.title}</h2>
              <span className={s.moduleStatus} data-state={mod.total > 0 && mod.done === mod.total ? 'done' : mod.locked ? 'locked' : 'open'}>
                {status}
              </span>
            </div>
            {mod.description && <p className={s.moduleDesc}>{mod.description}</p>}
            <div className={s.rows}>
              {mod.lessons.map(lesson => {
                const kind = lesson.status
                const body = (
                  <>
                    <span className={s.dot} data-kind={kind}>
                      {kind === 'done' ? <Check /> : kind === 'current' ? <Play /> : <Lock />}
                    </span>
                    <span className={s.rowText}>
                      <span className={s.rowTitle}>{lesson.title}</span>
                      <span className={s.rowSub}>{sub(lesson)}</span>
                    </span>
                    {kind !== 'locked' && <span className={s.rowCta}>{kind === 'done' ? t('lessonDone') : lesson.lastStep ? t('lessonCurrent') : t('lessonStart')}</span>}
                  </>
                )
                return kind === 'locked' ? (
                  <div key={lesson.id} className={s.row} data-kind="locked">
                    {body}
                  </div>
                ) : (
                  <Link key={lesson.id} href={lessonHref(locale, tree.slug, lesson.slug, kind === 'current' ? lesson.lastStep : null)} className={s.row} data-kind={kind}>
                    {body}
                  </Link>
                )
              })}
              {mod.exam && examRow(mod)}
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}
