import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { levelCode, levelVars } from '@/design/levels'
import s from './form.module.css'

// Form kit for the staff area: white sections on paper, fields with a label on
// top, and a sticky column on the right with switches and the save button.

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

/** Main column of sections + sticky side column (publication, save). */
export function FormLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={aside ? s.layout : s.single}>
      <div className={s.main}>{children}</div>
      {aside && <div className={s.aside}>{aside}</div>}
    </div>
  )
}

export function Section({ title, hint, action, children, tone }: { title?: string; hint?: ReactNode; action?: ReactNode; children: ReactNode; tone?: 'ink' }) {
  return (
    <section className={cx(s.section, tone === 'ink' && s.sectionInk)}>
      {(title || action) && (
        <div className={s.sectionHead}>
          {title && <h2 className={s.sectionTitle}>{title}</h2>}
          {action}
        </div>
      )}
      {hint && <p className={s.sectionHint}>{hint}</p>}
      {children}
    </section>
  )
}

export function Field({
  label,
  required,
  hint,
  htmlFor,
  extra,
  foot,
  children
}: {
  label?: ReactNode
  required?: boolean
  hint?: ReactNode
  htmlFor?: string
  /** Right side of the label row — locale tabs, a counter. */
  extra?: ReactNode
  /** Right side under the control — a character counter. */
  foot?: ReactNode
  children: ReactNode
}) {
  return (
    <div className={s.field}>
      {(label || extra) && (
        <div className={s.labelRow}>
          {label && (
            <label className={s.label} htmlFor={htmlFor}>
              {label}
              {required && <span className={s.req}> *</span>}
            </label>
          )}
          {extra}
        </div>
      )}
      {children}
      {(hint || foot) && (
        <div className={s.foot}>
          {hint && <span className={s.hint}>{hint}</span>}
          {foot}
        </div>
      )}
    </div>
  )
}

/** Fields side by side; wraps to one column when narrow. */
export function Row({ children, min = 200 }: { children: ReactNode; min?: number }) {
  return (
    <div className={s.row} style={{ ['--min' as string]: `${min}px` }}>
      {children}
    </div>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(s.control, className)} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(s.control, s.textarea, className)} />
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={cx(s.control, s.select, className)} />
}

export const controlClass = s.control

/** A switch row: title, one line of explanation, and the toggle on the right. */
export function Toggle({
  name,
  defaultChecked,
  checked,
  onChange,
  title,
  hint,
  form
}: {
  name?: string
  /** id of the <form> this switch belongs to, when it sits outside it. */
  form?: string
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (value: boolean) => void
  title: string
  hint?: string
}) {
  return (
    <label className={s.toggle}>
      <span className={s.toggleText}>
        <span className={s.toggleTitle}>{title}</span>
        {hint && <span className={s.toggleHint}>{hint}</span>}
      </span>
      <input
        type="checkbox"
        name={name}
        form={form}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange ? e => onChange(e.target.checked) : undefined}
        className={s.switchInput}
      />
      <span className={s.switch} aria-hidden="true" />
    </label>
  )
}

/** One-of choice as pills (radio buttons underneath). */
export function Chips<T extends string>({
  name,
  options,
  defaultValue,
  value,
  onChange
}: {
  name: string
  options: { value: T; label: string; hint?: string }[]
  defaultValue?: T
  value?: T
  onChange?: (value: T) => void
}) {
  return (
    <div className={s.chips} role="radiogroup">
      {options.map(o => (
        <label key={o.value || 'none'} className={s.chip} title={o.hint}>
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={value === undefined ? defaultValue === o.value : undefined}
            checked={value === undefined ? undefined : value === o.value}
            onChange={onChange ? () => onChange(o.value) : undefined}
            className={s.chipInput}
          />
          <span className={s.chipFace}>{o.label}</span>
        </label>
      ))}
    </div>
  )
}

/** Course level as the pastel stickers students see in the catalog. */
export function LevelPicker({ name, defaultValue, levels }: { name: string; defaultValue: string; levels: string[] }) {
  return (
    <div className={s.levels} role="radiogroup">
      {levels.map(l => {
        // "Other" has no CEFR code — it gets a neutral sticker.
        const code = l === 'Other' ? null : levelCode(l)
        const look = code ? levelVars(code) : { bg: 'var(--t-surface-2)', fg: 'var(--t-muted)' }
        return (
          <label key={l} className={s.level} style={{ ['--lv-bg' as string]: look.bg, ['--lv-fg' as string]: look.fg }}>
            <input type="radio" name={name} value={l} defaultChecked={defaultValue === l} className={s.chipInput} />
            <span className={s.levelFace}>
              <span className={s.levelCode}>{code ?? '—'}</span>
              <span className={s.levelName}>{l}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}

/** The save block at the bottom of the side column. */
export function SaveBox({
  pending,
  label,
  error,
  note,
  form
}: {
  pending: boolean
  label: string
  error?: string | null
  note?: ReactNode
  /** id of the <form> to submit, when the box sits outside it. */
  form?: string
}) {
  return (
    <div className={s.save}>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" form={form} className={s.submit} disabled={pending}>
        {pending ? 'Сохраняю…' : label}
      </button>
      {note && <p className={s.saveNote}>{note}</p>}
    </div>
  )
}

/** Inline submit for small forms (enroll, add module): an ink pill. */
export function Submit({ pending, label, pendingLabel = 'Сохраняю…', icon }: { pending: boolean; label: string; pendingLabel?: string; icon?: ReactNode }) {
  return (
    <button type="submit" className={s.inlineSubmit} disabled={pending}>
      {icon}
      {pending ? pendingLabel : label}
    </button>
  )
}

export function FormOk({ children }: { children: ReactNode }) {
  return (
    <p className={s.ok} role="status">
      {children}
    </p>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className={s.error} role="alert">
      {children}
    </p>
  )
}

/** Step switcher inside a form (lesson: video / notes / test). */
export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (value: T) => void; tabs: { value: T; label: ReactNode }[] }) {
  return (
    <div className={s.stepTabs} role="tablist">
      {tabs.map(t => (
        <button key={t.value} type="button" role="tab" aria-selected={value === t.value} data-on={value === t.value || undefined} className={s.stepTab} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

/** Raw class names for the few pieces built outside this file (locale tabs, slug, upload). */
export { s as formStyles }
