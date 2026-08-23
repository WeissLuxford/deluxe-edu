import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'

const LEVELS = [
  { code: 'A1', name: 'Beginner', key: 'levelBeginner' },
  { code: 'A2', name: 'Elementary', key: 'levelElementary' },
  { code: 'B1', name: 'Pre-Intermediate', key: 'levelPreIntermediate' },
  { code: 'B2', name: 'Intermediate', key: 'levelIntermediate' },
  { code: 'C1', name: 'Upper-Intermediate', key: 'levelUpper' }
] as const

export async function LevelsLadder({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  return (
    <Section
      eyebrow={t('levelsEyebrow')}
      title={t('levelsTitle')}
      subtitle={t('levelsSub')}
      width="wide"
    >
      <ol>
        {LEVELS.map(level => (
          <li key={level.code}>
            <Link href={`/${locale}/courses?level=${encodeURIComponent(level.name)}`}>
              <span>{level.code}</span>
              <span>{level.name}</span>
              <p>{t(level.key)}</p>
              <span>
                <ArrowRight size={14} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  )
}
