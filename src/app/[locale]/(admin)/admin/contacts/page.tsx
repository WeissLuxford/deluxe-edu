import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ContactRow } from '@/features/admin/components/ContactRow'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { localized } from '@/lib/localized'

export default async function AdminContacts({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ campaign?: string }>
}) {
  const { locale } = await params
  const { campaign = '' } = await searchParams
  const active = campaign.trim()

  const requests = await prisma.contactRequest.findMany({
    where: active ? { campaign: active } : {},
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200,
    include: { course: { select: { title: true } } }
  })

  const newCount = requests.filter(r => r.status === 'NEW').length

  // Кампании берём из самих заявок, а не из реестра: сюда должны попадать и
  // те, что уже отключены, — иначе история открученной рекламы пропадает.
  const campaigns = await prisma.contactRequest.groupBy({
    by: ['campaign'],
    where: { campaign: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { campaign: 'desc' } }
  })

  const base = `/${locale}/admin/contacts`

  return (
    <div className="space-y-4">
      <AdminPageHead
        title="Заявки с сайта"
        subtitle={newCount > 0 ? `${newCount} новых` : 'Новых нет'}
      />

      {campaigns.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={base} className={active ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm'}>
            Все
          </Link>
          {campaigns.map(c => (
            <Link
              key={c.campaign}
              href={`${base}?campaign=${encodeURIComponent(c.campaign!)}`}
              className={active === c.campaign ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            >
              <span className="doc-serial">{c.campaign}</span>
              <span style={{ marginLeft: '0.375rem', color: 'var(--muted)' }}>{c._count._all}</span>
            </Link>
          ))}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="admin-empty">
          {active ? `По кампании «${active}» заявок нет.` : 'Заявок пока нет.'}
        </div>
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
                  name={[r.firstName, r.lastName].filter(Boolean).join(' ')}
                  phone={r.phone}
                  email={r.email}
                  message={r.message}
                  createdAt={r.createdAt.toISOString()}
                  status={r.status}
                  source={r.source}
                  campaign={r.campaign}
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
