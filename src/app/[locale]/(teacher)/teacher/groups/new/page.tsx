import Link from 'next/link'
import { createGroup } from '@/features/teacher/groupActions'
import { GroupForm } from '@/features/teacher/components/GroupForm'

export default async function NewGroup({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/teacher/groups`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К списку групп
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        Новая группа
      </h2>

      <GroupForm action={createGroup} submitLabel="Создать группу" redirectTo={`/${locale}/teacher/groups`} />
    </div>
  )
}
