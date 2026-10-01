import raw from '@/content/teachers.json'

// Профили преподавателей. JSON, а не таблица: людей единицы, а страница —
// это страница, а не система. Переезд в базу оправдан, когда их станет десяток.

export type Teacher = {
  slug: string
  published: boolean
  name: string
  photo: string
  videoUrl: string
  credentials: string[]
  role: Record<string, string>
  bio: Record<string, string>
}

const ALL = ((raw as { teachers?: Teacher[] }).teachers ?? []) as Teacher[]

/**
 * Наружу отдаём только заполненные карточки. Профиль без имени — это не «почти
 * готово», это пустое место на странице, которая существует ради доверия.
 */
const PUBLISHED = ALL.filter(teacher => teacher.published && teacher.name.trim().length > 0)

export function publishedTeachers(): Teacher[] {
  return PUBLISHED
}

export function getTeacher(slug: string): Teacher | null {
  return PUBLISHED.find(teacher => teacher.slug === slug) ?? null
}

export function teacherSlugs(): string[] {
  return PUBLISHED.map(teacher => teacher.slug)
}

export function pickText(field: Record<string, string>, locale: string): string {
  return field[locale] ?? field.ru ?? ''
}
