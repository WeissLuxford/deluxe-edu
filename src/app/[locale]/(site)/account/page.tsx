import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getDashboardUser } from '@/features/dashboard/getDashboardUser'
import DashboardShell from '@/features/dashboard/DashboardShell'

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/account`)

  const user = await getDashboardUser(session.user.id)

  if (!user) redirect(`/${locale}/signin`)

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        locale: user.locale,
        createdAt: user.createdAt,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        emailVerified: user.emailVerified
      }}
      coursesCount={user._count.enrollments}
      payments={user.Payment ?? []}
      progress={user.LessonProgress ?? []}
      submissions={user.submissions ?? []}
      locale={locale}
    />
  )
}
