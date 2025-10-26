type Row = {
  id: string
  grade: number | null
  createdAt: string | Date
  assignment: { title: any; lesson: { slug: string; course: { slug: string } } }
}

export default function SubmissionsSection({ rows }: { rows: Row[] }) {
  if (!rows?.length) return <section className="card"><div className="text-sm text-muted">Домашек пока нет</div></section>
  return (
    <section className="card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">Курс</th>
              <th className="p-2 text-left">Задание</th>
              <th className="p-2 text-left">Оценка</th>
              <th className="p-2 text-left">Отправлено</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.id} className="border-t" style={{borderColor:'var(--border)'}}>
                <td className="p-2">{s.assignment.lesson.course.slug}</td>
                <td className="p-2">{s.assignment.title?.ru || s.assignment.title?.en || s.assignment.lesson.slug}</td>
                <td className="p-2">{s.grade ?? 'Ожидает'}</td>
                <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
