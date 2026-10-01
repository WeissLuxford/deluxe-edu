'use client'

import { useId, useState, type ReactNode } from 'react'
import s from './Accordion.module.css'

export type AccordionItem = { q: string; a: ReactNode }

// Answers stay in the DOM and open by animating grid rows 0fr → 1fr, so the
// height change is smooth and the text is still indexable.
export function Accordion({ items, initiallyOpen = 0 }: { items: AccordionItem[]; initiallyOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(initiallyOpen)
  const base = useId()

  return (
    <div className={s.list}>
      {items.map((item, i) => {
        const isOpen = open === i
        const panelId = `${base}-${i}`
        return (
          <div key={item.q} className={[s.item, isOpen && s.open].filter(Boolean).join(' ')}>
            <button type="button" className={s.trigger} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : i)}>
              <span>{item.q}</span>
              <span className={s.sign} aria-hidden="true" />
            </button>
            <div id={panelId} className={s.panel} role="region">
              <div className={s.panelInner}>
                <p className={s.answer}>{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
