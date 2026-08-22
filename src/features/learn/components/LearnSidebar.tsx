'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Info,
  User,
  ClipboardCheck,
  Clock3
} from 'lucide-react'
import type { CourseTree } from '@/features/learn/progress'

export function LearnSidebar({ locale, tree }: { locale: string; tree: CourseTree }) {
  const t = useTranslations('learn')
  const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const base = `/${locale}/learn/${tree.slug}`
  const openModule = tree.modules.find(m => m.lessons.some(l => pathname.endsWith(`/${l.slug}`)))
  const currentModule = tree.modules.find(m => m.lessons.some(l => l.status === 'current'))
  const [expanded, setExpanded] = useState<string | null>(
    (openModule ?? currentModule ?? tree.modules[0])?.id ?? null
  )

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
            <span className="learn-sidebar__level">{tree.level}</span>
            {!collapsed && <span className="learn-sidebar__title">{tree.title}</span>}
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
          <div className="learn-sidebar__progress">
            <div className="progress">
              <div className="progress-bar" style={{ width: `${tree.percent}%` }} />
            </div>
            <span>{t('lessonsOf', { done: tree.done, total: tree.total })}</span>
          </div>
        )}

        <nav className="learn-modules">
          {tree.modules.map(module => {
            const isOpen = expanded === module.id && !collapsed
            const moduleDone = module.total > 0 && module.done === module.total

            return (
              <div key={module.id} className={`learn-module${module.locked ? ' is-locked' : ''}`}>
                <button
                  type="button"
                  className={`learn-module__head${isOpen ? ' open' : ''}`}
                  onClick={() => setExpanded(isOpen ? null : module.id)}
                  title={collapsed ? module.title : undefined}
                >
                  <span className="learn-module__index">{module.index}</span>
                  {!collapsed && (
                    <>
                      <span className="learn-module__title">{module.title}</span>
                      <span className={`learn-module__count${moduleDone ? ' done' : ''}`}>
                        {module.done}/{module.total}
                      </span>
                    </>
                  )}
                </button>

                {isOpen && (
                  <ul className="learn-lessons">
                    {module.lessons.length === 0 && (
                      <li className="learn-lessons__empty">{t('emptyModule')}</li>
                    )}

                    {module.lessons.map(lesson => {
                      const href = `${base}/${lesson.slug}`
                      const active = pathname === href
                      const Icon =
                        lesson.status === 'done'
                          ? CheckCircle2
                          : lesson.status === 'current'
                            ? PlayCircle
                            : Lock

                      if (lesson.status === 'locked') {
                        return (
                          <li key={lesson.id}>
                            <span
                              className="learn-lesson is-locked"
                              title={
                                lesson.blockedByTitle
                                  ? t('lockedAfter', { title: lesson.blockedByTitle })
                                  : t('statusLocked')
                              }
                            >
                              <Lock size={15} />
                              <span className="learn-lesson__title">{lesson.title}</span>
                            </span>
                          </li>
                        )
                      }

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={href}
                            className={`learn-lesson status-${lesson.status}${active ? ' active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon size={15} />
                            <span className="learn-lesson__title">{lesson.title}</span>
                            {lesson.durationMin && (
                              <span className="learn-lesson__time">{lesson.durationMin}</span>
                            )}
                          </Link>
                        </li>
                      )
                    })}

                    {module.exam && (
                      <li>
                        {(() => {
                          const exam = module.exam
                          const moduleDone = module.total > 0 && module.done === module.total
                          if (!moduleDone) {
                            return (
                              <span className="learn-lesson is-locked" title={t('lockedModule')}>
                                <Lock size={15} />
                                <span className="learn-lesson__title">{exam.title}</span>
                              </span>
                            )
                          }

                          const Icon = exam.reviewStatus === 'PENDING' ? Clock3 : ClipboardCheck
                          const href = `${base}/exam/${module.id}`
                          const active = pathname === href

                          return (
                            <Link
                              href={href}
                              className={`learn-lesson status-current${active ? ' active' : ''}`}
                              onClick={() => setMobileOpen(false)}
                            >
                              <Icon size={15} />
                              <span className="learn-lesson__title">{exam.title}</span>
                            </Link>
                          )
                        })()}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>

        <div className="learn-sidebar__foot">
          <Link href={`${base}/about`} className="learn-sidebar__about">
            <Info size={16} />
            {!collapsed && <span>{t('aboutCourse')}</span>}
          </Link>

          <Link href={`/${locale}/learn/account`} className="learn-sidebar__about">
            <User size={16} />
            {!collapsed && <span>{t('personalAccount')}</span>}
          </Link>

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
