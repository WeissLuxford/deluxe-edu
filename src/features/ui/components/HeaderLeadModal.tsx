'use client'

import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import LeadForm from '@/features/leads/LeadForm'

export function HeaderLeadModal({ onClose }: { onClose: () => void }) {
  const tLead = useTranslations('lead')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-gold)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--brand-text)' }}>{tLead('title')}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg p-2 transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--fg)' }}
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-5 text-sm" style={{ color: 'var(--muted)' }}>{tLead('headerLead')}</p>

        <LeadForm source="HOME_FORM" />
      </div>
    </div>
  )
}
