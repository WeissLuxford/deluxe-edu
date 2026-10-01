import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

// Any address under a language that matches no page lands here, so it gets our
// 404 (with the locale's texts) instead of Next's bare default.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'errorPage' })
  return { title: t('meta') }
}

export default function CatchAll() {
  notFound()
}
