'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import avatarSkins from '@/content/avatars.json'
import { Avatar } from '@/features/ui/components/Avatar'
import { localized } from '@/lib/localized'

type Skin = { id: string; src: string; alt: Record<string, string> }

export function AvatarPicker({
  seed,
  name,
  avatarSkinId,
  locale
}: {
  seed: string
  name?: string | null
  avatarSkinId?: string | null
  locale: string
}) {
  const t = useTranslations('dashboard')
  const { update } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  const skins = avatarSkins as Skin[]

  const choose = async (id: string | null) => {
    setSaving(id ?? 'none')
    try {
      await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarSkinId: id })
      })
      await update()
      router.refresh()
      setOpen(false)
    } finally {
      setSaving(null)
    }
  }

  return (
    <>
      <button type="button" className="avatar-edit-btn" onClick={() => setOpen(true)} title={t('changeAvatar')}>
        <Pencil size={13} />
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-card__head">
              <div>
                <h3 className="modal-card__title">{t('changeAvatar')}</h3>
                <p className="modal-card__sub">{t('changeAvatarHint')}</p>
              </div>
              <button type="button" className="modal-card__close" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="avatar-picker__grid">
              {skins.map(skin => (
                <button
                  key={skin.id}
                  type="button"
                  className={`avatar-picker__option${avatarSkinId === skin.id ? ' is-selected' : ''}`}
                  disabled={saving !== null}
                  onClick={() => choose(skin.id)}
                  title={localized(skin.alt, locale) || skin.id}
                >
                  <Avatar seed={seed} name={name} avatarSkinId={skin.id} size={56} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
