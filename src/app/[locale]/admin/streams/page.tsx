import Link from 'next/link'
import { prisma } from '@/lib/db'
import { deleteStream } from '@/features/admin/streamActions'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { statusOf } from '@/features/streams/utils/streamHelpers'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'

function ru(value: any) {
  if (!value) return '—'
  if (typeof value === 'string') return value
  return value.ru || Object.values(value)[0] || '—'
}

const STATUS_LABEL: Record<string, string> = {
  live: 'в эфире',
  upcoming: 'скоро',
  past: 'прошёл'
}

export default async function AdminStreams({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const streams = await prisma.stream.findMany({ orderBy: { startsAt: 'desc' } })

  return (
    <div className="space-y-4">
      <AdminPageHead
        title="Трансляции"
        subtitle={`Всего ${streams.length}`}
        action={
          <Link href={`/${locale}/admin/streams/new`} className="btn btn-primary">
            Новый эфир
          </Link>
        }
      />

      {streams.length === 0 ? (
        <div className="admin-empty">Эфиров пока нет.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Начало</th>
                <th>Доступ</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {streams.map(s => {
                const status = statusOf(s.startsAt, s.durationMin)
                return (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/${locale}/admin/streams/${s.id}`} style={{ color: 'var(--gold-text)' }}>
                        {ru(s.title)}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{s.kind === 'ZOOM' ? 'Zoom' : 'YouTube'}</td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {s.startsAt.toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="num">
                      <span className="badge">{s.requiredPlan || 'всем'}</span>
                    </td>
                    <td className="num">
                      <span className={status === 'live' ? 'badge badge-error' : 'badge'}>
                        {STATUS_LABEL[status]}
                      </span>
                      {!s.published && <span className="badge badge-warning" style={{ marginLeft: '0.25rem' }}>черновик</span>}
                    </td>
                    <td className="right">
                      <DeleteButton
                        action={deleteStream.bind(null, s.id)}
                        confirmText={`Удалить эфир «${ru(s.title)}»?`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
