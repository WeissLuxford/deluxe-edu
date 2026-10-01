// Small Russian formatters for the staff area (it is Russian-only).

const TASHKENT_MS = 5 * 60 * 60 * 1000

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export { plural }

/** "только что", "10 мин назад", "2 ч назад", "вчера", "3 дня назад", then a date. */
export function ago(date: Date, now: Date = new Date()): string {
  const min = Math.floor((+now - +date) / 60_000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин назад`
  const hours = Math.floor(min / 60)
  const dayOf = (d: Date) => Math.floor((+d + TASHKENT_MS) / 86_400_000)
  const days = dayOf(now) - dayOf(date)
  if (days === 0) return `${hours} ч назад`
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'Asia/Tashkent' }).format(date)
}

export const timeFmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' })

/** Greeting by the hour in Tashkent. */
export function greeting(now: Date = new Date()): string {
  const hour = new Date(+now + TASHKENT_MS).getUTCHours()
  if (hour < 5) return 'Доброй ночи.'
  if (hour < 12) return 'Доброе утро.'
  if (hour < 18) return 'Добрый день.'
  return 'Добрый вечер.'
}
