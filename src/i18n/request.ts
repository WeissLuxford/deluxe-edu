import { getRequestConfig } from 'next-intl/server'

const SUPPORTED = ['ru', 'uz', 'en'] as const
const DEFAULT_LOCALE = 'ru'

export default getRequestConfig(async ({ requestLocale }) => {
  // В next-intl v4 приходит именно requestLocale (промис), а не locale.
  // Со старым параметром locale был всегда undefined, и сайт молча
  // отдавал русский на любом языке.
  const requested = await requestLocale
  const locale = SUPPORTED.includes(requested as any) ? (requested as string) : DEFAULT_LOCALE

  const messages = (await import(`@/locales/${locale}/common.json`)).default

  // Сообщения кладём в корень, без обёртки common: тогда
  // useTranslations('lesson') находит секцию lesson напрямую.
  return { locale, messages }
})
