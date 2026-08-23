import { getTranslations } from 'next-intl/server'
import { Quote } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'

export type Review = {
  id: string
  name: string
  level: string
  text: string
}

export const REVIEWS: Review[] = []

export async function Reviews({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  return (
    <Section
      eyebrow={t('reviewsEyebrow')}
      title={t('reviewsTitle')}
      subtitle={t('reviewsSub')}
    >
      {REVIEWS.length === 0 ? (
        <p>{t('reviewsEmpty')}</p>
      ) : (
        <div>
          {REVIEWS.map(review => (
            <figure key={review.id}>
              <Quote size={18} />
              <blockquote>{review.text}</blockquote>
              <figcaption>
                <strong>{review.name}</strong>
                <span>{review.level}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Section>
  )
}
