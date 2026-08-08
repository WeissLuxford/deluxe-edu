export const locales = ['ru','uz','en'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'ru'
export const namespaces = ['common','nav','auth','pricing','course','lesson'] as const
