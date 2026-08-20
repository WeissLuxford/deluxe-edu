import Link from 'next/link'
import { Eye } from 'lucide-react'
import { prisma } from '@/lib/db'
import { deleteNews, toggleNewsPublished } from '@/features/admin/newsActions'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { ActionButton } from '@/features/admin/components/ActionButton'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { localized } from '@/lib/localized'

export default async function AdminNews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const items = await prisma.news.findMany({ orderBy: { publishedAt: 'desc' } })

  return (
    <div className="space-y-4">
      <AdminPageHead
        title="Новости"
        subtitle={`${items.length} записей`}
        action={
          <Link href={`/${locale}/admin/news/new`} className="btn btn-primary">
            Новая новость
          </Link>
        }
      />

      {items.length === 0 ? (
        <div className="admin-empty">Новостей пока нет.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Заголовок</th>
                <th>Адрес</th>
                <th>Публикация</th>
                <th className="num">Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map(n => (
                <tr key={n.id}>
                  <td>
                    <Link href={`/${locale}/admin/news/${n.id}`} style={{ color: 'var(--gold-text)' }}>
                      {localized(n.title, 'ru')}
                    </Link>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {n.slug}
                  </td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {n.publishedAt
                      ? n.publishedAt.toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })
                      : '—'}
                  </td>
                  <td className="num">
                    <ActionButton
                      action={toggleNewsPublished.bind(null, n.id)}
                      className={n.published ? 'badge badge-success toggle-badge' : 'badge badge-warning toggle-badge'}
                      title="Переключить публикацию"
                    >
                      {n.published ? 'опубликована' : 'черновик'}
                    </ActionButton>
                  </td>
                  <td className="right">
                    <div className="row-actions">
                      <Link
                        href={`/ru/news/${n.slug}`}
                        target="_blank"
                        className="row-icon-btn"
                        title="Посмотреть на сайте"
                      >
                        <Eye size={14} />
                      </Link>
                      <DeleteButton
                        action={deleteNews.bind(null, n.id)}
                        confirmText={`Удалить «${localized(n.title, 'ru')}»?`}
                        variant="icon"
                        title="Удалить новость"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
