'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(ch => (MAP[ch] !== undefined ? MAP[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

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
    <div>
      <label className="label">
        {label}
        {required && ' *'}
      </label>
      <div className="slug-field">
        <input
          name={name}
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="input"
          pattern="[a-z0-9\-]+"
          required={required}
        />
        <button
          type="button"
          className="btn btn-secondary slug-field__gen"
          onClick={() => setSlug(slugify(source))}
          disabled={!source.trim()}
          title="Сгенерировать из названия"
        >
          <RefreshCw size={15} />
        </button>
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}
