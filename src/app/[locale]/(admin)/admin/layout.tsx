import { prisma } from '@/lib/db'
import { requireAdmin } from '@/features/admin/requireAdmin'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'

export const metadata = {
  title: 'Админка — Vertex',
  robots: { index: false, follow: false }
}

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = await requireAdmin(locale)

  const [courses, students, streams, news, newContacts, teachers] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.stream.count(),
    prisma.news.count(),
    prisma.contactRequest.count({ where: { status: 'NEW' } }),
    prisma.user.count({ where: { role: 'MENTOR' } })
  ])

  return (
    <div className="admin-shell">
      <AdminSidebar
        locale={locale}
        adminName={admin.name || 'Администратор'}
        adminPhone={admin.phone}
        counters={{ courses, students, streams, news, newContacts, teachers }}
      />

      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}
