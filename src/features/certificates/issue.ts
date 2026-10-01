import { randomInt } from 'node:crypto'
import { ALPHABET, GROUP, GROUPS } from './serial'

// Серийный номер — единственное, что нужно для проверки. У конкурента вход в
// проверку это номер плюс дата рождения; мы дат рождения не храним и не начнём
// ради этого. Значит номер обязан быть неугадываемым сам по себе: 10 знаков из
// алфавита в 30 символов — это ~49 бит, перебор бессмысленен даже без учёта
// лимита запросов.
export function newCertificateSerial(issuedAt = new Date()): string {
  const parts: string[] = []
  for (let g = 0; g < GROUPS; g += 1) {
    let chunk = ''
    for (let i = 0; i < GROUP; i += 1) {
      chunk += ALPHABET[randomInt(ALPHABET.length)]
    }
    parts.push(chunk)
  }
  return `HG-${issuedAt.getUTCFullYear()}-${parts.join('-')}`
}
