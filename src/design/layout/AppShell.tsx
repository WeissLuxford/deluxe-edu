import type { ReactNode } from 'react'
import { AppSidebar, AppTabBar, type AppSection } from './AppNav'
import { ThemeSync } from './ThemeSync'
import s from './app.module.css'

type Props = {
  children: ReactNode
  /** Where "My courses" leads: the course being studied, or the catalog. */
  coursesHref: string
  badges?: Partial<Record<AppSection, number>>
}

// The learning area: a soft gradient frame, a glassy tray with the sidebar,
// and one white floating panel for the page. On phones the frame falls away
// and a tab bar takes over from the sidebar.
export function AppShell({ children, coursesHref, badges }: Props) {
  return (
    <div className={s.frame}>
      <ThemeSync area="app" />
      <div className={s.tray}>
        <AppSidebar coursesHref={coursesHref} badges={badges} />
        <div className={s.panel}>{children}</div>
      </div>
      <AppTabBar coursesHref={coursesHref} badges={badges} />
    </div>
  )
}

/** Main column + optional right rail inside the panel, as on the canvas. */
export function PanelGrid({ children, rail }: { children: ReactNode; rail?: ReactNode }) {
  return (
    <div className={rail ? s.grid : s.single}>
      <div className={s.main}>{children}</div>
      {rail && <aside className={s.rail}>{rail}</aside>}
    </div>
  )
}
