'use client'

import { useTranslations } from 'next-intl'
import { Section } from '@/features/ui/components/Section'
import { ArrowLinkButton } from '@/features/ui/components/ArrowLinkButton'

/**
 * Текстовый блок под длинный хвост запросов: онлайн-формат, свой темп,
 * открытые цены, бесплатный тест уровня. Головной запрос («лучший центр
 * английского в Узбекистане») занят конкурентом с 23 000 учеников — спорить за
 * него бессмысленно, а хвост вокруг формата и прозрачных цен свободен.
 *
 * Стоит после FAQ: это текст для поиска и для тех, кто дочитал, а не витрина.
 */
export default function SeoIntro({ base }: { base: string }) {
  const t = useTranslations('home')

  return (
    <Section id="about-format" tone="plain" width="narrow" title={t('seoTitle')}>
      <div className="seo-intro">
        <p>{t('seoBody1')}</p>
        <p>{t('seoBody2')}</p>
        <p>{t('seoBody3')}</p>
        <ArrowLinkButton href={`${base}/level-test`}>{t('seoCta')}</ArrowLinkButton>
      </div>
    </Section>
  )
}
