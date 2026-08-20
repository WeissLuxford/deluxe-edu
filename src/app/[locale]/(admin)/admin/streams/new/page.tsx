import Link from 'next/link'
import { createStream } from '@/features/admin/streamActions'
import { StreamForm } from '@/features/admin/components/StreamForm'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'

export default async function NewStream({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/admin/streams`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку эфиров
      </Link>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>Новый эфир</h2>
      <LocaleTabsProvider>
        <StreamForm
          action={createStream}
          submitLabel="Создать"
          redirectTo={`/${locale}/admin/streams`}
        />
      </LocaleTabsProvider>
    </div>
  )
}
