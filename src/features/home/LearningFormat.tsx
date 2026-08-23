import type { CSSProperties } from 'react'
import { getTranslations } from 'next-intl/server'
import { Video, FileText, ListChecks, Radio } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'

export async function LearningFormat({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  const steps = [
    { icon: Video, title: t('formatVideo'), text: t('formatVideoText'), accent: 'var(--accent-blue)' },
    { icon: FileText, title: t('formatConspect'), text: t('formatConspectText'), accent: 'var(--accent-violet)' },
    { icon: ListChecks, title: t('formatTest'), text: t('formatTestText'), accent: 'var(--accent-green)' },
    { icon: Radio, title: t('formatLive'), text: t('formatLiveText'), accent: 'var(--accent-amber)' }
  ]

  return (
    <Section
      id="format"
      tone="raised"
      eyebrow={t('formatEyebrow')}
      title={t('formatTitle')}
      subtitle={t('formatSub')}
    >
      <span className="deco-grid" aria-hidden="true" />
      <div className="fmt-grid">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Reveal
              as="div"
              delay={index * 0.08}
              className="fmt-card-wrap"
              key={step.title}
              style={{ '--accent': step.accent } as CSSProperties}
            >
              <div className="fmt-card">
                <div className="fmt-card__orbit" aria-hidden="true">
                  <span className="fmt-card__ring" />
                  <span className="fmt-card__ring" />
                  <span className="fmt-card__ring" />
                  <span className="fmt-card__badge">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="fmt-card__body">
                  <span className="fmt-card__num">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
