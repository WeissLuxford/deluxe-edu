// How each achievement looks as a sticker: a short glyph and a pastel.
// Language-neutral on purpose — the title from achievements.json goes in the tooltip.
export const ACHIEVEMENT_LOOK: Record<string, { glyph: string; bg: string; fg: string; tilt: string }> = {
  first_lesson_watched: { glyph: '▶', bg: 'var(--lv-a2-bg)', fg: 'var(--lv-a2-fg)', tilt: '-6deg' },
  first_lesson_passed: { glyph: '1', bg: 'var(--lv-b2-bg)', fg: 'var(--lv-b2-fg)', tilt: '4deg' },
  five_lessons_passed: { glyph: '5', bg: 'var(--lv-b1-bg)', fg: 'var(--lv-b1-fg)', tilt: '-3deg' },
  first_course_completed: { glyph: '★', bg: 'var(--lv-a1-bg)', fg: 'var(--lv-a1-fg)', tilt: '5deg' },
  all_courses_completed: { glyph: '★★', bg: 'var(--lv-c1-bg)', fg: 'var(--lv-c1-fg)', tilt: '-4deg' },
  first_payment: { glyph: '✓', bg: 'var(--c-butter)', fg: 'var(--c-butter-ink)', tilt: '3deg' },
  streak_3: { glyph: '3', bg: 'var(--c-lime)', fg: 'var(--c-ink)', tilt: '-5deg' },
  streak_7: { glyph: '7', bg: 'var(--c-lime)', fg: 'var(--c-ink)', tilt: '4deg' },
  streak_30: { glyph: '30', bg: 'var(--c-lime)', fg: 'var(--c-ink)', tilt: '-2deg' }
}

export const FALLBACK_LOOK = { glyph: '★', bg: 'var(--c-lavender)', fg: 'var(--c-violet-ink)', tilt: '0deg' }
