import { getTranslations } from 'next-intl/server'
import { Check, X } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'

export async function PriceHonesty({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  const us = [t('priceUs1'), t('priceUs2'), t('priceUs3')]
  const them = [t('priceThem1'), t('priceThem2'), t('priceThem3')]

  return (
    <Section
      tone="raised"
      eyebrow={t('priceEyebrow')}
      title={t('priceTitle')}
      subtitle={t('priceSub')}
    >
      <div className="compare">
        <div className="compare__col compare__col--us">
          <h3 className="compare__title">{t('priceUsTitle')}</h3>
          <ul className="compare__list">
            {us.map(item => (
              <li key={item}>
                <Check size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="compare__col compare__col--them">
          <h3 className="compare__title">{t('priceThemTitle')}</h3>
          <ul className="compare__list">
            {them.map(item => (
              <li key={item}>
                <X size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
