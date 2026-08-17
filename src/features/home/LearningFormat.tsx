import { getTranslations } from 'next-intl/server'
import { Video, FileText, ListChecks, Radio } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Media } from '@/features/ui/components/Media'

export async function LearningFormat({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  const steps = [
    { icon: Video, title: t('formatVideo'), text: t('formatVideoText') },
    { icon: FileText, title: t('formatConspect'), text: t('formatConspectText') },
    { icon: ListChecks, title: t('formatTest'), text: t('formatTestText') },
    { icon: Radio, title: t('formatLive'), text: t('formatLiveText') }
  ]

  return (
    <Section
      tone="raised"
      eyebrow={t('formatEyebrow')}
      title={t('formatTitle')}
      subtitle={t('formatSub')}
    >
      <div className="format-split">
        <ol className="format-steps">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.title} className="format-step">
                <span className="format-step__icon">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="format-step__title">
                    <span className="format-step__num">{index + 1}</span>
                    {step.title}
                  </h3>
                  <p className="format-step__text">{step.text}</p>
                </div>
              </li>
            )
          })}
        </ol>

        <Media slot="home.format.preview" locale={locale} className="format-preview" sizes="(max-width: 900px) 100vw, 480px" />
      </div>
    </Section>
  )
}
