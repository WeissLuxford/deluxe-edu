import { getRequestConfig } from 'next-intl/server'
export default getRequestConfig(async ({ locale }) => ({
  messages: {
    ...(await import(`../locales/${locale}/common.json`)),
    ...(await import(`../locales/${locale}/nav.json`)),
    ...(await import(`../locales/${locale}/auth.json`)),
    ...(await import(`../locales/${locale}/pricing.json`)),
    ...(await import(`../locales/${locale}/course.json`)),
    ...(await import(`../locales/${locale}/lesson.json`))
  }
}))
