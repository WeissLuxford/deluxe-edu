import { prisma } from '@/lib/db'
import { ContactRow } from '@/features/admin/components/ContactRow'

export default async function AdminContacts() {
  const requests = await prisma.contactRequest.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200
  })

  const newCount = requests.filter(r => r.status === 'NEW').length

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        Заявки с сайта {newCount > 0 && <span className="badge badge-warning">{newCount} новых</span>}
      </h2>

      {requests.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          Заявок пока нет.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Кто</th>
                <th style={{ textAlign: 'left' }}>Телефон</th>
                <th style={{ textAlign: 'left' }}>Сообщение</th>
                <th style={{ textAlign: 'left' }}>Когда</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <ContactRow
                  key={r.id}
                  id={r.id}
                  name={`${r.firstName} ${r.lastName}`}
                  phone={r.phone}
                  email={r.email}
                  message={r.message}
                  createdAt={r.createdAt.toISOString()}
                  status={r.status}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
