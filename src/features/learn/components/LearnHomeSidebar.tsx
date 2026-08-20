'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, X, User } from 'lucide-react'
import type { CourseTree } from '@/features/learn/progress'

export function LearnHomeSidebar({ locale, courses }: { locale: string; courses: CourseTree[] }) {
  const t = useTranslations('learn')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="learn-burger"
        onClick={() => setMobileOpen(true)}
        aria-label={t('menu')}
      >
        <Menu size={18} />
      </button>

      <div
        className={`learn-backdrop${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`learn-sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="learn-sidebar__head">
          <div className="learn-sidebar__course">
            <span className="learn-sidebar__title">{t('title')}</span>
          </div>
          <button
            type="button"
            className="learn-sidebar__close"
            onClick={() => setMobileOpen(false)}
            aria-label={t('collapse')}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="learn-modules">
          {courses.length === 0 ? (
            <p className="learn-lessons__empty">{t('noCourses')}</p>
          ) : (
            courses.map((course, i) => (
              <Link
                key={course.courseId}
                href={`/${locale}/learn/${course.slug}`}
                className="learn-module__head"
                onClick={() => setMobileOpen(false)}
              >
                <span className="learn-module__index">{i + 1}</span>
                <span className="learn-module__title">{course.title}</span>
                <span className={`learn-module__count${course.completed ? ' done' : ''}`}>
                  {course.done}/{course.total}
                </span>
              </Link>
            ))
          )}
        </nav>

        <div className="learn-sidebar__foot">
          <Link href={`/${locale}/learn/account`} className="learn-sidebar__about">
            <User size={16} />
            <span>{t('personalAccount')}</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
