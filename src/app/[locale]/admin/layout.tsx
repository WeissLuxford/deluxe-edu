import Link from 'next/link'
import { requireAdmin } from '@/features/admin/requireAdmin'

export const metadata = {
  title: 'Админка — Vertex',
  robots: { index: false, follow: false }
}

const nav = [
  { href: 'courses', label: 'Курсы' },
  { href: 'students', label: 'Студенты' },
  { href: 'streams', label: 'Эфиры' },
  { href: 'contacts', label: 'Заявки' }
]

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = await requireAdmin(locale)

  return (
    <main className="bg-gradient-dark mb-auto">
      <div className="page-start" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              Панель управления
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {admin.name || admin.phone}
            </p>
          </div>
          <Link href={`/${locale}/dashboard`} className="btn btn-secondary">
            К кабинету
          </Link>
        </div>

        <nav className="tabs" style={{ marginBottom: '1.5rem' }}>
          {nav.map(item => (
            <Link key={item.href} href={`/${locale}/admin/${item.href}`} className="tab">
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </main>
  )
}
