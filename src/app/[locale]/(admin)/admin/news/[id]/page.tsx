import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateNews } from '@/features/admin/newsActions'
import { NewsForm } from '@/features/admin/components/NewsForm'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'
import { localized } from '@/lib/localized'

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

  return (
    <div className="space-y-4">
      <AdminPageHead
        title={localized(item.title, 'ru')}
        backHref={`/${locale}/admin/news`}
        backLabel="К новостям"
      />

      <LocaleTabsProvider>
        <NewsForm
          action={updateNews.bind(null, id)}
          news={{
            slug: item.slug,
            title: item.title as any,
            lead: item.lead as any,
            body: item.body as any,
            metaTitle: (item.metaTitle as any) ?? {},
            metaDescription: (item.metaDescription as any) ?? {},
            coverUrl: item.coverUrl ?? '',
            published: item.published,
            publishedAt: localInput(item.publishedAt ?? item.createdAt)
          }}
          submitLabel="Сохранить"
          redirectTo={`/${locale}/admin/news`}
        />
      </LocaleTabsProvider>
    </div>
  )
}
