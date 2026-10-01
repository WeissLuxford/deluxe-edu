import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'authFlow' })
  return { title: `${t('meta.signin')} — Highgate`, robots: { index: false, follow: true } }
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
