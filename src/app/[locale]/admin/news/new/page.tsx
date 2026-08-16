import { createNews } from '@/features/admin/newsActions'
import { NewsForm } from '@/features/admin/components/NewsForm'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { prisma } from '@/lib/db'

function localInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default async function NewNews({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ group?: string }>
}) {
  const { locale } = await params
  const { group } = await searchParams

  const siblings = group
    ? await prisma.news.findMany({ where: { groupId: group }, select: { locale: true } })
    : []

  const taken = siblings.map(s => s.locale)
  const suggested = ['ru', 'uz', 'en'].find(l => !taken.includes(l)) ?? 'ru'

  return (
    <div className="space-y-4">
      <AdminPageHead
        title={group ? 'Перевод новости' : 'Новая новость'}
        subtitle={group ? `Уже есть: ${taken.join(', ').toUpperCase()}` : undefined}
        backHref={`/${locale}/admin/news`}
        backLabel="К новостям"
      />

      <NewsForm
        action={createNews}
        news={{
          groupId: group ?? '',
          locale: suggested,
          slug: '',
          title: '',
          lead: '',
          body: '',
          metaTitle: '',
          metaDescription: '',
          coverUrl: '',
          published: false,
          publishedAt: localInput(new Date())
        }}
        submitLabel="Создать"
        redirectTo={`/${locale}/admin/news`}
      />
    </div>
  )
}
