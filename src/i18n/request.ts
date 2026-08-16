import { getRequestConfig } from 'next-intl/server'

const SUPPORTED = ['ru', 'uz', 'en'] as const
const DEFAULT_LOCALE = 'ru'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = SUPPORTED.includes(requested as any) ? (requested as string) : DEFAULT_LOCALE

  const messages = (await import(`@/locales/${locale}/common.json`)).default

  return { locale, messages }
})
