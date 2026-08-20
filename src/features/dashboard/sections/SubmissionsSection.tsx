import { getTranslations } from 'next-intl/server'
import { localized } from '@/lib/localized'

type Row = {
  id: string
  grade: number | null
  createdAt: string | Date
  assignment: { title: any; lesson: { slug: string; course: { slug: string } } }
}

export async function SubmissionsSection({ rows, locale }: { rows: Row[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  if (!rows?.length) {
    return (
      <div className="empty-state">
        <p>{t('noSubmissions')}</p>
      </div>
    )
  }

  return (
    <section className="card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">{t('courseColumn')}</th>
              <th className="p-2 text-left">{t('assignmentColumn')}</th>
              <th className="p-2 text-left">{t('gradeColumn')}</th>
              <th className="p-2 text-left">{t('submittedColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="p-2">{s.assignment.lesson.course.slug}</td>
                <td className="p-2">{localized(s.assignment.title, locale) || s.assignment.lesson.slug}</td>
                <td className="p-2">{s.grade ?? t('gradePending')}</td>
                <td className="p-2">{new Date(s.createdAt).toLocaleDateString(locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
