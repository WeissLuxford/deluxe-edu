import Link from 'next/link'
import { Eye } from 'lucide-react'
import { prisma } from '@/lib/db'
import { deleteNews, syncInstagramNow, toggleNewsPublished } from '@/features/admin/newsActions'
import { instagramStatus } from '@/features/news/instagram'
import { ago, plural } from '@/features/staff/format'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { ActionButton } from '@/features/admin/components/ActionButton'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { localized } from '@/lib/localized'
import { requireAdmin } from '@/features/admin/requireAdmin'

export default async function AdminNews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireAdmin(locale)
  const [items, ig] = await Promise.all([prisma.news.findMany({ orderBy: { publishedAt: 'desc' } }), instagramStatus()])

  return (
    <div className="space-y-4">
      <AdminPageHead
        title="Новости"
        subtitle={`${items.length} ${plural(items.length, 'новость', 'новости', 'новостей')}`}
        action={
          <Link href={`/${locale}/admin/news/new`} className="btn btn-primary">
            Новая новость
          </Link>
        }
      />

      <section className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span
          aria-hidden="true"
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: 'var(--lv-c1-bg)',
            color: 'var(--lv-c1-fg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900
          }}
        >
          IG
        </span>
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong style={{ fontSize: 17 }}>
            {ig.configured ? `Instagram${ig.username ? ` · @${ig.username}` : ''}` : 'Instagram не подключён'}
          </strong>
          <span className="hint">
            {!ig.configured
              ? 'Посты из Instagram будут сами появляться здесь как новости — нужен ключ доступа INSTAGRAM_ACCESS_TOKEN.'
              : ig.lastSyncAt
                ? `Проверено ${ago(ig.lastSyncAt)}${ig.lastImported ? ` · перенесено постов: ${ig.lastImported}` : ''}. Новые посты подтягиваются сами, раз в 30 минут.`
                : 'Ещё ни разу не проверяли — нажми «Синхронизировать».'}
            {ig.configured && !ig.storesPhotos && ' Хранилище Bunny не настроено — посты придут без фото.'}
          </span>
          {ig.lastError && (
            <span className="hint" style={{ color: 'var(--c-err-ink)' }}>
              Последняя ошибка: {ig.lastError}
            </span>
          )}
        </div>
        {ig.configured && (
          <ActionButton action={syncInstagramNow} className="btn btn-secondary">
            Синхронизировать сейчас
          </ActionButton>
        )}
      </section>

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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        className="badge"
                        style={n.instagramId ? { background: 'var(--lv-c1-bg)', color: 'var(--lv-c1-fg)' } : undefined}
                      >
                        {n.instagramId ? 'Instagram' : 'Сайт'}
                      </span>
                      <Link href={`/${locale}/admin/news/${n.id}`}>{localized(n.title, 'ru')}</Link>
                    </span>
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
