'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { LEVEL_CODES, levelVars, type LevelCode } from '@/design/levels'
import type { CatalogCourse, Topic } from './catalog'
import s from './catalog.module.css'

type Props = {
  courses: CatalogCourse[]
  initialLevel: LevelCode | null
  initialTopic: Topic | null
  fromLabels: Record<string, string>
}

// Filtering happens in place: the grid re-keys and the cards fade up in a
// stagger instead of the whole page reloading. The URL follows along so a
// filtered catalog can still be shared.
export function CatalogGrid({ courses, initialLevel, initialTopic, fromLabels }: Props) {
  const t = useTranslations('coursesPage')
  const tu = useTranslations('ui')
  const locale = useLocale()
  const [level, setLevel] = useState<LevelCode | null>(initialLevel)
  const [topic, setTopic] = useState<Topic | null>(initialTopic)

  const topics = useMemo(() => {
    const present = new Set(courses.map(c => c.topic))
    return (['grammar', 'speaking', 'exams', 'work', 'writing'] as Topic[]).filter(tp => present.has(tp))
  }, [courses])

  const shown = courses.filter(c => (!level || c.level === level) && (!topic || c.topic === topic))

  const sync = (nextLevel: LevelCode | null, nextTopic: Topic | null) => {
    const params = new URLSearchParams()
    if (nextLevel) params.set('level', nextLevel)
    if (nextTopic) params.set('topic', nextTopic)
    const qs = params.toString()
    window.history.replaceState(null, '', `/${locale}/courses${qs ? `?${qs}` : ''}`)
  }

  const pickLevel = (next: LevelCode | null) => {
    setLevel(next)
    sync(next, topic)
  }

  const pickTopic = (next: Topic | null) => {
    const value = next === topic ? null : next
    setTopic(value)
    sync(level, value)
  }

  return (
    <>
      <div className={s.filters}>
        <div className={s.filterGroup} role="group" aria-label={t('levelFilter')}>
          <button type="button" className={s.pill} aria-pressed={!level} data-on={!level || undefined} onClick={() => pickLevel(null)}>
            {tu('all')}
          </button>
          {LEVEL_CODES.map(code => {
            const lv = levelVars(code)
            return (
              <button
                key={code}
                type="button"
                className={s.pill}
                aria-pressed={level === code}
                data-on={level === code || undefined}
                style={{ ['--pill-bg' as string]: lv.bg, ['--pill-fg' as string]: lv.fg }}
                onClick={() => pickLevel(code)}
              >
                {code}
              </button>
            )
          })}
        </div>
        {topics.length > 1 && (
          <>
            <span className={s.divider} aria-hidden="true" />
            <div className={s.filterGroup} role="group" aria-label={t('topicFilter')}>
              {topics.map(tp => (
                <button key={tp} type="button" className={s.topic} aria-pressed={topic === tp} data-on={topic === tp || undefined} onClick={() => pickTopic(tp)}>
                  {tu(`topics.${tp}`)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={s.grid} key={`${level ?? 'all'}-${topic ?? 'all'}`}>
        {shown.map((course, i) => {
          const lv = levelVars(course.level)
          return (
            <Link key={course.id} href={`/${locale}/courses/${course.slug}`} className={s.card} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
              <span className={s.cover} style={{ background: lv.bg, color: lv.fg }}>
                <span className={s.coverTopic}>{tu(`topics.${course.topic}`)}</span>
                <span className={s.coverLevel} aria-hidden="true">{course.level}</span>
              </span>
              <span className={s.body}>
                <span className={s.title}>{course.title}</span>
                {course.description && <span className={s.desc}>{course.description}</span>}
                <span className={s.foot}>
                  <span className={s.meta}>{tu('lessonsCount', { count: course.lessons })}</span>
                  <span className={s.price}>{fromLabels[course.id]}</span>
                </span>
              </span>
            </Link>
          )
        })}
        {shown.length === 0 && <p className={s.empty}>{t('empty')}</p>}
      </div>
    </>
  )
}
