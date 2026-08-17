import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DashboardShell from '@/features/dashboard/DashboardShell'

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/account`)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      Payment: { include: { course: true }, orderBy: { createdAt: 'desc' } },
      LessonProgress: {
        include: { lesson: { include: { course: { select: { slug: true, title: true } } } } },
        orderBy: { updatedAt: 'desc' }
      },
      submissions: true,
      _count: { select: { enrollments: true } }
    }
  })

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
        emailVerified: user.emailVerified,
        passwordTail: user.passwordTail
      }}
      coursesCount={user._count.enrollments}
      payments={user.Payment ?? []}
      progress={user.LessonProgress ?? []}
      submissions={user.submissions ?? []}
      locale={locale}
    />
  )
}
