'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ExternalLink, PanelLeftClose, PanelLeftOpen, Menu, X } from 'lucide-react'
import { Avatar } from '@/features/ui/components/Avatar'
import ThemeToggle from '@/features/ui/components/ThemeToggle'

type Props = {
  locale: string
  teacherName: string
  teacherPhone: string
  counters: { groups: number }
}

export function TeacherSidebar({ locale, teacherName, teacherPhone, counters }: Props) {
  const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const base = `/${locale}/teacher`

  const items = [
    { href: base, icon: LayoutDashboard, label: 'Обзор', exact: true },
    { href: `${base}/groups`, icon: Users, label: 'Группы', count: counters.groups }
  ]

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      <button
        type="button"
        className="admin-burger"
        onClick={() => setMobileOpen(true)}
        aria-label="Меню"
      >
        <Menu size={20} />
      </button>

      <div
        className={`admin-backdrop${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`}>
        <div className="admin-sidebar__top">
          <span className="admin-sidebar__brand">{collapsed ? 'V' : 'VERTEX'}</span>
          <button
            type="button"
            className="admin-sidebar__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <Link href={`/${locale}`} className="admin-sidebar__site">
          <ExternalLink size={16} />
          {!collapsed && <span>Перейти на сайт</span>}
        </Link>

        <nav className="admin-nav">
          {items.map(item => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav__item${active ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                {!collapsed && <span className="admin-nav__label">{item.label}</span>}
                {!collapsed && typeof item.count === 'number' && item.count > 0 && (
                  <span className="admin-nav__count">{item.count}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__user">
            <Avatar name={teacherName} seed={teacherPhone} size={32} />
            {!collapsed && (
              <div className="admin-sidebar__userinfo">
                <span className="admin-sidebar__username">{teacherName}</span>
                <span className="admin-sidebar__userphone">+{teacherPhone}</span>
              </div>
            )}
          </div>

          <div className="admin-sidebar__tools">
            <ThemeToggle />
            <button
              type="button"
              className="admin-sidebar__collapse"
              onClick={() => setCollapsed(v => !v)}
              title={collapsed ? 'Развернуть' : 'Свернуть'}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              {!collapsed && <span>Свернуть</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
