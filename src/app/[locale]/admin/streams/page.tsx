import Link from 'next/link'
import { prisma } from '@/lib/db'
import { deleteStream } from '@/features/admin/streamActions'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { statusOf } from '@/features/streams/utils/streamHelpers'

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
          Трансляции ({streams.length})
        </h2>
        <Link href={`/${locale}/admin/streams/new`} className="btn btn-primary">
          Новый эфир
        </Link>
      </div>

      {streams.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          Эфиров пока нет.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Название</th>
                <th style={{ textAlign: 'left' }}>Тип</th>
                <th style={{ textAlign: 'left' }}>Начало</th>
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
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge">{s.requiredPlan || 'всем'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={status === 'live' ? 'badge badge-error' : 'badge'}>
                        {STATUS_LABEL[status]}
                      </span>
                      {!s.published && <span className="badge badge-warning" style={{ marginLeft: '0.25rem' }}>черновик</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
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
