import type { CSSProperties } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/features/ui/components/Section'
import { PLAYFUL_PALETTE } from '@/features/ui/lib/palette'

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
      <ol className="ladder">
        {LEVELS.map((level, index) => (
          <li key={level.code} style={{ '--ladder-accent': PLAYFUL_PALETTE[index % PLAYFUL_PALETTE.length] } as CSSProperties}>
            <Link href={`/${locale}/courses?level=${encodeURIComponent(level.name)}`} className="ladder__card">
              <span className="ladder__code">{level.code}</span>
              <span className="ladder__name">{level.name}</span>
              <p className="ladder__text">{t(level.key)}</p>
              <span className="ladder__go">
                <ArrowRight size={14} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  )
}
