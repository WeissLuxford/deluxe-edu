import { useTranslations } from 'next-intl'
export default function Home() {
  const t = useTranslations('common')
  return (
    <main>
      <h1>{t('hero.title')}</h1>
    </main>
  )
}
