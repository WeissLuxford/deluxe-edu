import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateNews } from '@/features/admin/newsActions'
import { NewsForm } from '@/features/admin/components/NewsForm'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'

function localInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default async function EditNews({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const item = await prisma.news.findUnique({ where: { id } })
  if (!item) notFound()

  const siblings = await prisma.news.findMany({
    where: { groupId: item.groupId, id: { not: id } },
    select: { locale: true }
  })

  return (
    <div className="space-y-4">
      <AdminPageHead
        title={item.title}
        subtitle={
          siblings.length > 0
            ? `Переводы: ${siblings.map(s => s.locale.toUpperCase()).join(', ')}`
            : 'Переводов пока нет'
        }
        backHref={`/${locale}/admin/news`}
        backLabel="К новостям"
      />

      <NewsForm
        action={updateNews.bind(null, id)}
        news={{
          groupId: item.groupId,
          locale: item.locale,
          slug: item.slug,
          title: item.title,
          lead: item.lead,
          body: item.body,
          metaTitle: item.metaTitle ?? '',
          metaDescription: item.metaDescription ?? '',
          coverUrl: item.coverUrl ?? '',
          published: item.published,
          publishedAt: localInput(item.publishedAt ?? item.createdAt)
        }}
        submitLabel="Сохранить"
        redirectTo={`/${locale}/admin/news`}
        lockLocale
      />
    </div>
  )
}
