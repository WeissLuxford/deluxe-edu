import { getTranslations } from 'next-intl/server'
import { Section } from '@/features/ui/components/Section'
import { LevelsDiagram } from './LevelsDiagram'

const LEVELS = [
  { code: 'A1', name: 'Beginner', key: 'levelBeginner' },
  { code: 'A2', name: 'Elementary', key: 'levelElementary' },
  { code: 'B1', name: 'Pre-Intermediate', key: 'levelPreIntermediate' },
  { code: 'B2', name: 'Intermediate', key: 'levelIntermediate' },
  { code: 'C1', name: 'Upper-Intermediate', key: 'levelUpper' }
] as const

export async function LevelsLadder({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blocks' })

  const levels = LEVELS.map(level => ({
    code: level.code,
    name: level.name,
    text: t(level.key),
    href: `/${locale}/courses?level=${encodeURIComponent(level.name)}`
  }))

  return (
    <Section
      eyebrow={t('levelsEyebrow')}
      title={t('levelsTitle')}
      subtitle={t('levelsSub')}
      width="wide"
    >
      <LevelsDiagram levels={levels} />
    </Section>
  )
}
