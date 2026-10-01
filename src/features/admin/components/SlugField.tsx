'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Field, Input, formStyles as fs } from '@/features/staff/form/Form'
import { slugify } from '@/lib/slugify'

export function SlugField({
  name = 'slug',
  label = 'Адрес',
  value,
  source,
  hint,
  required = true
}: {
  name?: string
  label?: string
  value: string
  source: string
  hint?: string
  required?: boolean
}) {
  const [slug, setSlug] = useState(value)

  return (
    <Field label={label} required={required} htmlFor={`slug-${name}`} hint={hint}>
      <div className={fs.withButton}>
        <Input
          id={`slug-${name}`}
          name={name}
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className={fs.mono}
          pattern="[a-z0-9\-]+"
          required={required}
        />
        <button
          type="button"
          className={fs.sideBtn}
          onClick={() => setSlug(slugify(source))}
          disabled={!source.trim()}
          title="Сгенерировать из названия"
          aria-label="Сгенерировать из названия"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </Field>
  )
}
