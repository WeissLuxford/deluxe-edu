import { getRequestConfig } from 'next-intl/server'

const SUPPORTED = ['ru', 'uz', 'en'] as const
const DEFAULT_LOCALE = 'ru'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = SUPPORTED.includes(requested as any) ? (requested as string) : DEFAULT_LOCALE

  const common = (await import(`@/locales/${locale}/common.json`)).default
  // Design v2 strings. Old namespaces in common.json go away as pages are ported.
  const app = (await import(`@/locales/${locale}/app.json`)).default
  const messages = { ...common, ...app }

  return { locale, messages }
})
