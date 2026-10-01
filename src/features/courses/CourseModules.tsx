'use client'

import { useState } from 'react'
import { levelVars, LEVEL_CODES } from '@/design/levels'
import s from './course.module.css'

export type ModuleView = {
  id: string
  title: string
  meta: string
  lessons: { id: string; title: string; minutes: string }[]
}

// Module cards cycle through the level pastels so the program reads as a
// colourful path, not a grey list. Opening animates height via grid rows.
export function CourseModules({ modules }: { modules: ModuleView[] }) {
  const [open, setOpen] = useState<string | null>(modules[0]?.id ?? null)

  return (
    <div className={s.modules}>
      {modules.map((mod, i) => {
        const isOpen = open === mod.id
        const lv = levelVars(LEVEL_CODES[(i + 2) % LEVEL_CODES.length])
        return (
          <div key={mod.id} className={[s.module, isOpen && s.moduleOpen].filter(Boolean).join(' ')}>
            <button type="button" className={s.moduleHead} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : mod.id)}>
              <span className={s.moduleNum} style={{ background: lv.bg, color: lv.fg }}>
                {i + 1}
              </span>
              <span className={s.moduleText}>
                <span className={s.moduleTitle}>{mod.title}</span>
                <span className={s.moduleMeta}>{mod.meta}</span>
              </span>
              <span className={s.moduleSign} aria-hidden="true" />
            </button>
            <div className={s.moduleBody}>
              <div className={s.moduleInner}>
                <ul className={s.lessonList}>
                  {mod.lessons.map(lesson => (
                    <li key={lesson.id}>
                      <span>{lesson.title}</span>
                      <span className={s.lessonMin}>{lesson.minutes}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
