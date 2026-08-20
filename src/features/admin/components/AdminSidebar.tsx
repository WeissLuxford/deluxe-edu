'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Radio,
  Newspaper,
  Inbox,
  GraduationCap,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X
} from 'lucide-react'
import { Avatar } from '@/features/ui/components/Avatar'
import ThemeToggle from '@/features/ui/components/ThemeToggle'

type Props = {
  locale: string
  adminName: string
  adminPhone: string
  counters: {
    courses: number
    students: number
    streams: number
    news: number
    newContacts: number
    teachers: number
  }
}

export function AdminSidebar({ locale, adminName, adminPhone, counters }: Props) {
  const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const base = `/${locale}/admin`

  const items = [
    { href: base, icon: LayoutDashboard, label: 'Обзор', exact: true },
    { href: `${base}/courses`, icon: BookOpen, label: 'Курсы', count: counters.courses },
    { href: `${base}/students`, icon: Users, label: 'Студенты', count: counters.students },
    { href: `${base}/teachers`, icon: GraduationCap, label: 'Учителя', count: counters.teachers },
    { href: `${base}/streams`, icon: Radio, label: 'Эфиры', count: counters.streams },
    { href: `${base}/news`, icon: Newspaper, label: 'Новости', count: counters.news },
    { href: `${base}/contacts`, icon: Inbox, label: 'Заявки', count: counters.newContacts, accent: true }
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
                  <span className={`admin-nav__count${item.accent ? ' accent' : ''}`}>{item.count}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__user">
            <Avatar name={adminName} seed={adminPhone} size={32} />
            {!collapsed && (
              <div className="admin-sidebar__userinfo">
                <span className="admin-sidebar__username">{adminName}</span>
                <span className="admin-sidebar__userphone">+{adminPhone}</span>
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
