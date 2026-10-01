import Link from 'next/link'
import { createGroup } from '@/features/teacher/groupActions'
import { GroupForm } from '@/features/teacher/components/GroupForm'
import { requireTeacher } from '@/features/teacher/requireTeacher'

export default async function NewGroup({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireTeacher(locale)

  return (
    <div className="space-y-4">
      <Link href={`/${locale}/teacher/groups`} className="admin-page-head__back">
        ← К списку групп
      </Link>

      <h1 className="admin-page-head__title">
        Новая группа
      </h1>

      <GroupForm action={createGroup} submitLabel="Создать группу" redirectTo={`/${locale}/teacher/groups`} />
    </div>
  )
}
