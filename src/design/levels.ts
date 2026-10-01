export type LevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export const LEVEL_CODES: LevelCode[] = ['A1', 'A2', 'B1', 'B2', 'C1']

// Course.level is stored as a name; the design speaks CEFR.
const BY_NAME: Record<string, LevelCode> = {
  beginner: 'A1',
  elementary: 'A2',
  'pre-intermediate': 'A2',
  intermediate: 'B1',
  'upper-intermediate': 'B2',
  advanced: 'C1'
}

export function levelCode(level: string | null | undefined): LevelCode {
  if (!level) return 'A1'
  const upper = level.trim().toUpperCase()
  if ((LEVEL_CODES as string[]).includes(upper)) return upper as LevelCode
  return BY_NAME[level.trim().toLowerCase()] ?? 'A1'
}

/** CSS custom properties for a level's sticker colors. */
export function levelVars(code: LevelCode) {
  const key = code.toLowerCase()
  return { bg: `var(--lv-${key}-bg)`, fg: `var(--lv-${key}-fg)` }
}

/** Small rotation that makes a row of stickers look hand-placed, stable per level. */
export const LEVEL_TILT: Record<LevelCode, string> = {
  A1: '-2deg',
  A2: '1.5deg',
  B1: '-1deg',
  B2: '2deg',
  C1: '-1.5deg'
}
