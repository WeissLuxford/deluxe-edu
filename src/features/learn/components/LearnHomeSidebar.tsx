'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import {
  Menu,
  X,
  Search,
  User,
  TrendingUp,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import type { CourseTree } from '@/features/learn/progress'

export function LearnHomeSidebar({ locale, courses }: { locale: string; courses: CourseTree[] }) {
  const t = useTranslations('learn')
  const tDash = useTranslations('dashboard')
  const tNav = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter(c => c.title.toLowerCase().includes(q))
  }, [courses, query])

  const accountBase = `/${locale}/learn/account`

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

      <aside className={`learn-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`}>
        <div className="learn-sidebar__head">
          <div className="learn-sidebar__course">
            {!collapsed && <span className="learn-sidebar__title">{t('title')}</span>}
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

        {!collapsed && (
          <div className="learn-sidebar__search">
            <Search size={15} />
            <input
              type="text"
              className="learn-sidebar__search-input"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        )}

        <nav className="learn-modules">
          {filtered.length === 0 ? (
            <p className="learn-lessons__empty">{query ? t('searchNoResults') : t('noCourses')}</p>
          ) : (
            filtered.map((course, i) => (
              <Link
                key={course.courseId}
                href={`/${locale}/learn/${course.slug}`}
                className="learn-module__head"
                title={collapsed ? course.title : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <span className="learn-module__index">{i + 1}</span>
                {!collapsed && (
                  <>
                    <span className="learn-module__title">{course.title}</span>
                    <span className={`learn-module__count${course.completed ? ' done' : ''}`}>
                      {course.done}/{course.total}
                    </span>
                  </>
                )}
              </Link>
            ))
          )}
        </nav>

        <div className="learn-sidebar__foot">
          <Link href={accountBase} className="learn-sidebar__about" title={collapsed ? t('personalAccount') : undefined}>
            <User size={16} />
            {!collapsed && <span>{t('personalAccount')}</span>}
          </Link>

          <Link
            href={`${accountBase}?tab=progress`}
            className="learn-sidebar__about"
            title={collapsed ? tDash('tabProgress') : undefined}
          >
            <TrendingUp size={16} />
            {!collapsed && <span>{tDash('tabProgress')}</span>}
          </Link>

          <Link
            href={`${accountBase}?tab=settings`}
            className="learn-sidebar__about"
            title={collapsed ? tDash('tabSettings') : undefined}
          >
            <Settings size={16} />
            {!collapsed && <span>{tDash('tabSettings')}</span>}
          </Link>

          <button
            type="button"
            className="learn-sidebar__about"
            title={collapsed ? tNav('signout') : undefined}
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
          >
            <LogOut size={16} />
            {!collapsed && <span>{tNav('signout')}</span>}
          </button>

          <button
            type="button"
            className="learn-sidebar__collapse"
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? t('expand') : t('collapse')}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>{t('collapse')}</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
