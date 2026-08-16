import Link from 'next/link'
import { prisma } from '@/lib/db'
import { deleteNews, toggleNewsPublished } from '@/features/admin/newsActions'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { ActionButton } from '@/features/admin/components/ActionButton'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'

const LOCALE_LABEL: Record<string, string> = { ru: 'RU', uz: 'UZ', en: 'EN' }

export default async function AdminNews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const items = await prisma.news.findMany({ orderBy: { publishedAt: 'desc' } })

  const groups = new Map<string, typeof items>()
  for (const n of items) {
    const list = groups.get(n.groupId) ?? []
    list.push(n)
    groups.set(n.groupId, list)
  }

  return (
    <div className="space-y-4">
      <AdminPageHead
        title="Новости"
        subtitle={`${items.length} записей в ${groups.size} новостях`}
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
                <th>Язык</th>
                <th>Адрес</th>
                <th>Публикация</th>
                <th className="num">Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[...groups.values()].map(group =>
                group.map((n, i) => (
                  <tr key={n.id}>
                    <td>
                      <Link href={`/${locale}/admin/news/${n.id}`} style={{ color: 'var(--gold-text)' }}>
                        {n.title}
                      </Link>
                      {i === 0 && group.length < 3 && (
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>
                          переводов: {group.length} из 3
                        </div>
                      )}
                    </td>
                    <td><span className="badge">{LOCALE_LABEL[n.locale] ?? n.locale}</span></td>
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
                      <div className="flex items-center gap-2 justify-end">
                        {i === 0 && group.length < 3 && (
                          <Link
                            href={`/${locale}/admin/news/new?group=${n.groupId}`}
                            className="btn btn-ghost"
                            title="Добавить перевод"
                          >
                            + перевод
                          </Link>
                        )}
                        <DeleteButton
                          action={deleteNews.bind(null, n.id)}
                          confirmText={`Удалить «${n.title}» (${LOCALE_LABEL[n.locale]})?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
