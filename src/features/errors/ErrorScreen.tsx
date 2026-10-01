import type { ReactNode } from 'react'
import { Logo } from '@/design/components/Bits'
import s from './errors.module.css'

type Props = {
  code: string
  title: ReactNode
  text: string
  actions: ReactNode
  homeHref: string
}

// Shared look of the 404 and error pages: logo, a tilted sticker with the code,
// a heading and the ways out. Plain markup, so the client error page can use it.
export function ErrorScreen({ code, title, text, actions, homeHref }: Props) {
  return (
    <main className={`${s.page} page-in`}>
      <Logo href={homeHref} />
      <div className={s.body}>
        <span className={s.code} aria-hidden="true">
          {code}
        </span>
        <h1 className={s.title}>{title}</h1>
        <p className={s.text}>{text}</p>
        <div className={s.actions}>{actions}</div>
      </div>
    </main>
  )
}
