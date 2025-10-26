type Row = {
  id: string
  watched: boolean
  passed: boolean
  updatedAt: string | Date
  lesson: { slug: string; title: any; course: { slug: string } }
}

export default function ProgressSection({ rows }: { rows: Row[] }) {
  if (!rows?.length) return <section className="card"><div className="text-sm text-muted">Нет прогресса</div></section>
  return (
    <section className="card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">Курс</th>
              <th className="p-2 text-left">Урок</th>
              <th className="p-2 text-left">Просмотрен</th>
              <th className="p-2 text-left">Сдан</th>
              <th className="p-2 text-left">Обновлен</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t" style={{borderColor:'var(--border)'}}>
                <td className="p-2">{r.lesson.course.slug}</td>
                <td className="p-2">{r.lesson.title?.ru || r.lesson.title?.en || r.lesson.slug}</td>
                <td className="p-2">{r.watched ? 'Да' : 'Нет'}</td>
                <td className="p-2">{r.passed ? 'Да' : 'Нет'}</td>
                <td className="p-2">{new Date(r.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
