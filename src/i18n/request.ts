import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  const supported = ['ru', 'uz', 'en']
  const current = supported.includes(locale) ? locale : 'ru'
  const common = (await import(`@/locales/${current}/common.json`)).default
  return { locale: current, messages: { common } }
})
