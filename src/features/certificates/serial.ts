// Разбор и нормализация серийного номера сертификата.
//
// Здесь нет ничего из node:crypto: этот модуль импортирует и форма проверки на
// клиенте. Генерация номера живёт в issue.ts, который выполняется только на
// сервере — иначе node:crypto уезжает в браузерный бандл и сборка падает.

// Алфавит без I, L, O, U и без цифр 0/1: номер диктуют по телефону и
// переписывают с бумаги, а «ноль или буква О» — это звонок в поддержку.
export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'
export const GROUP = 5
export const GROUPS = 2

/**
 * Приводит то, что человек ввёл в форму, к каноническому виду. Принимаем ввод с
 * пробелами, в нижнем регистре и без дефисов — переписывание с бумаги не должно
 * заканчиваться «сертификат не найден» из-за формата.
 */
export function normalizeSerial(input: string): string | null {
  const cleaned = input.trim().toUpperCase().replace(/[\s–—]/g, '-').replace(/-+/g, '')
  const match = cleaned.match(/^HG(\d{4})([A-Z0-9]{10})$/)
  if (!match) return null

  const [, year, body] = match
  // Символы вне алфавита означают опечатку, а не другой сертификат.
  if (![...body].every(char => ALPHABET.includes(char))) return null

  return `HG-${year}-${body.slice(0, GROUP)}-${body.slice(GROUP)}`
}
