// Фиксированное смещение вместо серверного локального времени: на Vercel
// сервер живёт в UTC, и без этого «день» сбрасывался бы в 5 утра по Ташкенту,
// а не в полночь.
const DAY_OFFSET_MS = 5 * 60 * 60 * 1000 // Asia/Tashkent, UTC+5

export function dayBounds(date: Date = new Date()): { start: Date; end: Date } {
  const shifted = new Date(date.getTime() + DAY_OFFSET_MS)
  const startShiftedMs = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate())
  const start = new Date(startShiftedMs - DAY_OFFSET_MS)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}
