import Link from 'next/link'
import { createStream } from '@/features/admin/streamActions'
import { StreamForm } from '@/features/admin/components/StreamForm'

export default async function NewStream({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/admin/streams`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку эфиров
      </Link>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>Новый эфир</h2>
      <StreamForm
        action={createStream}
        submitLabel="Создать"
        redirectTo={`/${locale}/admin/streams`}
      />
    </div>
  )
}
