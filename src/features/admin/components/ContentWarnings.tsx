import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'

const ru = (value: unknown) => localized(value, 'ru') || '—'

// Content that students can't use properly yet: empty courses and modules,
// tests without answers, lessons outside any module. Hidden when all is well.
export async function ContentWarnings({ base }: { base: string }) {
  const [publishedNoLessons, emptyModules, testsWithoutKey, orphanLessons] = await Promise.all([
    prisma.course.findMany({ where: { published: true, lessons: { none: {} } }, select: { id: true, title: true } }),
    prisma.module.findMany({ where: { lessons: { none: {} } }, select: { id: true, title: true, courseId: true } }),
    prisma.assignment.findMany({ where: { answerKey: { equals: Prisma.DbNull } }, select: { id: true, lessonId: true, title: true } }),
    prisma.lesson.count({ where: { moduleId: null } })
  ])

  const groups = [
    {
      key: 'empty-courses',
      count: publishedNoLessons.length,
      text: 'опубликованных курсов без единого урока',
      hint: 'для витрины это нормально, для запуска — нет',
      items: publishedNoLessons.map(c => ({ id: c.id, label: ru(c.title), href: `${base}/courses/${c.id}` }))
    },
    {
      key: 'empty-modules',
      count: emptyModules.length,
      text: 'пустых модулей — студенту они не показываются',
      items: emptyModules.map(m => ({ id: m.id, label: ru(m.title), href: `${base}/courses/${m.courseId}` }))
    },
    {
      key: 'tests',
      count: testsWithoutKey.length,
      text: 'тестов без правильных ответов — сервер не сможет их проверить',
      items: testsWithoutKey.map(a => ({ id: a.id, label: ru(a.title), href: `${base}/lessons/${a.lessonId}` }))
    },
    { key: 'orphans', count: orphanLessons, text: 'уроков не привязаны к модулю', items: [] as { id: string; label: string; href: string }[] }
  ].filter(g => g.count > 0)

  if (groups.length === 0) return null

  return (
    <section className="admin-card">
      <h3 className="admin-card__title">Требует внимания</h3>
      <ul className="admin-warnings">
        {groups.map(group => (
          <li key={group.key}>
            {group.items.length > 0 ? (
              <details>
                <summary>
                  <strong>{group.count}</strong> {group.text}
                  {group.hint && <em> — {group.hint}</em>}
                </summary>
                <ul className="admin-warnings__items">
                  {group.items.map(item => (
                    <li key={item.id}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <p className="admin-warnings__plain">
                <strong>{group.count}</strong> {group.text}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
