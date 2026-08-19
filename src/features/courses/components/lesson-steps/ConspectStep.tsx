'use client'

import { useTranslations } from 'next-intl'
import { FileText } from 'lucide-react'
import { RichText } from '@/features/ui/components/RichText'

type Props = {
  content: string
  locale: string
}

export function ConspectStep({ content }: Props) {
  const t = useTranslations('lesson')

  if (!content.trim()) {
    return (
      <div className="test-empty">
        <FileText size={40} />
        <h3>{t('notesEmptyTitle')}</h3>
        <p>{t('notesEmptyText')}</p>
      </div>
    )
  }

  return (
    <div className="conspect">
      <RichText text={content} />
    </div>
  )
}
