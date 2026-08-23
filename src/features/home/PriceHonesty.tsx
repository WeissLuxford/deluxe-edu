import { getTranslations } from 'next-intl/server'
import { Check, X } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { Reveal } from '@/features/ui/components/Reveal'

export async function PriceHonesty({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  const us = [t('priceUs1'), t('priceUs2'), t('priceUs3')]
  const them = [t('priceThem1'), t('priceThem2'), t('priceThem3')]

  return (
    <Section
      id="price-honesty"
      tone="raised"
      eyebrow={t('priceEyebrow')}
      title={t('priceTitle')}
      subtitle={t('priceSub')}
    >
      <span className="deco-grid" aria-hidden="true" />
      <div className="compare">
        <Reveal x={-24} y={0} className="compare__col compare__col--us">
          <h3 className="compare__title">{t('priceUsTitle')}</h3>
          <ul className="compare__list">
            {us.map(item => (
              <li key={item}>
                <Check size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal x={24} y={0} delay={0.1} className="compare__col compare__col--them">
          <h3 className="compare__title">{t('priceThemTitle')}</h3>
          <ul className="compare__list">
            {them.map(item => (
              <li key={item}>
                <X size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}
