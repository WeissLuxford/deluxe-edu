import { getTranslations } from 'next-intl/server'
import { Section } from '@/features/ui/components/Section'

export async function PlatformFacts({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  const facts = [
    { value: '6', label: t('factLevels') },
    { value: '10–15', label: t('factMinutes') },
    { value: '4', label: t('factSteps') },
    { value: '3', label: t('factPlans') }
  ]

  return (
    <Section width="wide">
      <div className="stat-band">
        {facts.map(fact => (
          <div key={fact.label} className="stat-band__cell">
            <span className="stat-band__value">{fact.value}</span>
            <span className="stat-band__label">{fact.label}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}
