import { prisma } from '@/lib/db'
import { ContactRow } from '@/features/admin/components/ContactRow'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { localized } from '@/lib/localized'

export default async function AdminContacts() {
  const requests = await prisma.contactRequest.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200,
    include: { course: { select: { title: true } } }
  })

  const newCount = requests.filter(r => r.status === 'NEW').length

  return (
    <div className="space-y-4">
      <AdminPageHead
        title="Заявки с сайта"
        subtitle={newCount > 0 ? `${newCount} новых` : 'Новых нет'}
      />

      {requests.length === 0 ? (
        <div className="admin-empty">Заявок пока нет.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Кто</th>
                <th>Телефон</th>
                <th>Откуда</th>
                <th>Сообщение</th>
                <th>Когда</th>
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
                  source={r.source}
                  courseTitle={r.course ? localized(r.course.title, 'ru') : null}
                  plan={r.plan}
                  locale={r.locale}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
