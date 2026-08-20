'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { ModuleForm } from './ModuleForm'
import { updateModule } from '../moduleActions'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

export function ModuleTitle({
  module
}: {
  module: { id: string; title: unknown; description?: unknown }
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="struct-module__edit">
        <ModuleForm
          action={updateModule.bind(null, module.id)}
          module={{
            title: module.title as Record<string, string>,
            description: module.description as Record<string, string> | null
          }}
          submitLabel="Сохранить"
          onSuccess={() => setEditing(false)}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
          Отмена
        </button>
      </div>
    )
  }

  return (
    <>
      <h4 className="struct-module__title">{ru(module.title)}</h4>
      <button
        type="button"
        className="row-icon-btn"
        title="Переименовать модуль"
        onClick={() => setEditing(true)}
      >
        <Pencil size={13} />
      </button>
    </>
  )
}
