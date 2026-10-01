import { prisma } from '@/lib/db'
import { requireAdmin } from '@/features/admin/requireAdmin'
import { StaffShell, type StaffItem } from '@/design/layout/StaffShell'

export const metadata = {
  title: 'Админка — Highgate',
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
  await requireAdmin(locale)
  const base = `/${locale}/admin`

  const newLeads = await prisma.contactRequest.count({ where: { status: 'NEW' } })

  const items: StaffItem[] = [
    { href: base, label: 'Обзор', icon: 'overview', exact: true },
    { href: `${base}/contacts`, label: 'Заявки', icon: 'leads', badge: newLeads },
    { href: `${base}/students`, label: 'Студенты', icon: 'students' },
    { href: `${base}/courses`, label: 'Курсы', icon: 'courses' },
    { href: `${base}/teachers`, label: 'Преподаватели', icon: 'teachers' },
    { href: `${base}/streams`, label: 'Эфиры', icon: 'live' },
    { href: `${base}/news`, label: 'Новости', icon: 'news' }
  ]

  return (
    <StaffShell tone="admin" items={items} siteHref={`/${locale}`}>
      {children}
    </StaffShell>
  )
}
