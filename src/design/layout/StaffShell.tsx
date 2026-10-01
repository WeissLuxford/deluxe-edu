'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { ReactNode } from 'react'
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Radio,
  SquareArrowOutUpRight,
  UserRound,
  Users
} from 'lucide-react'
import { ThemeSync } from './ThemeSync'
import { ThemeToggle } from './ThemeToggle'
import s from './staff.module.css'
import '@/features/staff/kit.css'

const ICONS = {
  overview: LayoutDashboard,
  leads: Inbox,
  students: Users,
  courses: BookOpen,
  teachers: GraduationCap,
  live: Radio,
  news: Newspaper,
  groups: Users,
  review: ClipboardCheck,
  schedule: CalendarDays,
  profile: UserRound
} as const

export type StaffItem = {
  href: string
  label: string
  icon: keyof typeof ICONS
  badge?: number
  /** Active only on this exact path, not on its children. */
  exact?: boolean
}

type Props = {
  /** Admin gets a white active tab, the teacher a lime one — as on the canvas. */
  tone: 'admin' | 'teacher'
  items: StaffItem[]
  siteHref: string
  children: ReactNode
}

// Staff area (admin and teacher): a dark rail of icons on the left and the
// page on paper. On phones the rail becomes a floating bar at the bottom.
// Light by default; the sun/moon in the rail switches to dark (design/layout/theme.ts).
export function StaffShell({ tone, items, siteHref, children }: Props) {
  const pathname = usePathname() || ''
  const isActive = (item: StaffItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`))

  return (
    <div className={`staff ${s.shell}`} data-tone={tone}>
      <ThemeSync area="app" />
      <nav className={s.rail} aria-label="Разделы">
        <Link href={items[0]?.href ?? siteHref} className={s.logo} aria-label="Highgate">
          h
        </Link>
        <div className={s.items}>
          {items.map(item => {
            const Icon = ICONS[item.icon]
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={s.item}
                data-active={active || undefined}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                data-tip={item.label}
              >
                <Icon size={21} strokeWidth={2.1} aria-hidden="true" />
                {item.badge ? <span className={s.badge}>{item.badge > 99 ? '99+' : item.badge}</span> : null}
              </Link>
            )
          })}
        </div>
        <div className={s.foot}>
          <ThemeToggle variant="round" className={s.item} tip />
          <Link href={siteHref} className={s.item} aria-label="На сайт" data-tip="На сайт">
            <SquareArrowOutUpRight size={19} strokeWidth={2.1} aria-hidden="true" />
          </Link>
          <button type="button" className={s.item} aria-label="Выйти" data-tip="Выйти" onClick={() => signOut({ callbackUrl: siteHref })}>
            <LogOut size={19} strokeWidth={2.1} aria-hidden="true" />
          </button>
        </div>
      </nav>
      <main className={s.main}>
        <div className="page-in">{children}</div>
      </main>
    </div>
  )
}
