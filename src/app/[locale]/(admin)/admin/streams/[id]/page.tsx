import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateStream } from '@/features/admin/streamActions'
import { StreamForm } from '@/features/admin/components/StreamForm'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default async function EditStream({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const stream = await prisma.stream.findUnique({ where: { id } })
  if (!stream) notFound()

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/admin/streams`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку эфиров
      </Link>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>Эфир</h2>
      <LocaleTabsProvider>
        <StreamForm
          action={updateStream.bind(null, id)}
          stream={{
            title: stream.title as any,
            description: stream.description as any,
            kind: stream.kind,
            youtubeId: stream.youtubeId ?? '',
            zoomJoinUrl: stream.zoomJoinUrl ?? '',
            startsAt: toLocalInput(stream.startsAt),
            durationMin: stream.durationMin,
            recordingUrl: stream.recordingUrl ?? '',
            requiredPlan: stream.requiredPlan ?? '',
            published: stream.published
          }}
          submitLabel="Сохранить"
          redirectTo={`/${locale}/admin/streams`}
        />
      </LocaleTabsProvider>
    </div>
  )
}
