import raw from '@/content/courseExtras.json'
import { getTeacher, type Teacher } from '@/features/teachers/registry'

type Entry = { teacher?: string; outcomes?: Record<string, string[]> }

const ALL = ((raw as { courses?: Record<string, Entry> }).courses ?? {}) as Record<string, Entry>

/** Outcomes and teacher for a course page. Missing data hides the block — nothing is made up. */
export function courseExtras(slug: string, locale: string): { outcomes: string[]; teacher: Teacher | null } {
  const entry = ALL[slug]
  if (!entry) return { outcomes: [], teacher: null }
  const outcomes = (entry.outcomes?.[locale] ?? entry.outcomes?.ru ?? []).filter(Boolean)
  return { outcomes, teacher: entry.teacher ? getTeacher(entry.teacher) : null }
}
