import { createNews } from '@/features/admin/newsActions'
import { NewsForm } from '@/features/admin/components/NewsForm'
import { AdminPageHead } from '@/features/admin/components/AdminPageHead'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'

function localInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default async function NewNews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="space-y-4">
      <AdminPageHead
        title="Новая новость"
        backHref={`/${locale}/admin/news`}
        backLabel="К новостям"
      />

      <LocaleTabsProvider>
        <NewsForm
          action={createNews}
          news={{
            slug: '',
            title: {},
            lead: {},
            body: {},
            metaTitle: {},
            metaDescription: {},
            coverUrl: '',
            published: false,
            publishedAt: localInput(new Date())
          }}
          submitLabel="Создать"
          redirectTo={`/${locale}/admin/news`}
        />
      </LocaleTabsProvider>
    </div>
  )
}
