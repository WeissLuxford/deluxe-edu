import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react'
import type { CourseTree } from '@/features/learn/progress'

export async function CourseTile({ locale, tree }: { locale: string; tree: CourseTree }) {
  const t = await getTranslations({ locale, namespace: 'learn' })
  const href = `/${locale}/learn/${tree.slug}`

  return (
    <article className={`learn-tile${tree.completed ? ' is-done' : ''}`} data-level={tree.level}>
      <div
        className={`learn-tile__cover${tree.coverUrl ? ' has-image' : ''}`}
        style={tree.coverUrl ? { backgroundImage: `url(${tree.coverUrl})` } : undefined}
      >
        {!tree.coverUrl && <BookOpen size={26} />}
        {tree.completed && (
          <span className="learn-tile__done">
            <CheckCircle2 size={13} />
            {t('courseDone')}
          </span>
        )}
      </div>

      <div className="learn-tile__body">
        <span className="learn-tile__level">{tree.level}</span>
        <h3 className="learn-tile__title">
          <Link href={href}>{tree.title}</Link>
        </h3>

        <div className="learn-tile__progress">
          <div className="progress">
            <div className="progress-bar" style={{ width: `${tree.percent}%` }} />
          </div>
          <span className="learn-tile__counter">
            {t('lessonsOf', { done: tree.done, total: tree.total })}
          </span>
        </div>

        <Link href={href} className="learn-tile__cta">
          {tree.completed ? t('reviewAction') : t('openCourse')}
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  )
}
