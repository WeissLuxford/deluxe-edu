import { Fragment } from 'react'
import { HOME_SECTIONS } from '@/features/home/sections'

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const ctx = { locale, base: `/${locale}` }

  return (
    <main className="relative">
      {HOME_SECTIONS.filter(section => section.enabled).map(section => (
        <Fragment key={section.key}>{section.render(ctx)}</Fragment>
      ))}
    </main>
  )
}
