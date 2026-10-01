'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Reveal } from '@/features/ui/components/Reveal'
import { HeaderLeadModal } from '@/features/ui/components/HeaderLeadModal'

export function AboutCtaBanner() {
  const t = useTranslations('about')
  const [open, setOpen] = useState(false)

  return (
    <section>
      <div className="container">
        <Reveal className="cta-panel">
          <span className="cta-panel__glow cta-panel__glow--a" aria-hidden="true" />
          <span className="cta-panel__glow cta-panel__glow--b" aria-hidden="true" />

          <h2 className="cta-panel__title">{t('midCtaTitle')}</h2>
          <p className="cta-panel__lead">{t('midCtaLead')}</p>

          <div className="cta-panel__actions">
            <button type="button" className="action-btn" onClick={() => setOpen(true)}>
              <span>{t('midCtaButton')}</span>
            </button>
          </div>
        </Reveal>
      </div>

      {open && <HeaderLeadModal onClose={() => setOpen(false)} />}
    </section>
  )
}
