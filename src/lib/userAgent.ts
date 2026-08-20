const OS_PATTERNS: [RegExp, string][] = [
  [/windows/i, 'Windows'],
  [/iphone|ipad|ipod/i, 'iOS'],
  [/android/i, 'Android'],
  [/mac os x/i, 'macOS'],
  [/linux/i, 'Linux']
]

const BROWSER_PATTERNS: [RegExp, string][] = [
  [/edg\//i, 'Edge'],
  [/opr\/|opera/i, 'Opera'],
  [/chrome\//i, 'Chrome'],
  [/crios\//i, 'Chrome'],
  [/fxios\//i, 'Firefox'],
  [/firefox\//i, 'Firefox'],
  [/safari\//i, 'Safari']
]

export function summarizeUserAgent(ua: string | null | undefined): string {
  if (!ua) return 'Неизвестное устройство'

  const os = OS_PATTERNS.find(([re]) => re.test(ua))?.[1] ?? 'Неизвестная ОС'
  const browser = BROWSER_PATTERNS.find(([re]) => re.test(ua))?.[1] ?? 'Неизвестный браузер'

  return `${browser} · ${os}`
}
