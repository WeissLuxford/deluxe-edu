import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardShell from '@/features/dashboard/DashboardShell'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/${locale}/signin`)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: { include: { course: true } },
      Payment: { include: { course: true } }
    }
  })

  if (!user) redirect(`/${locale}/signin`)

return (
  <main className="bg-gradient-dark">
    <div className="page-start">
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
        enrollments={user.enrollments}
        payments={user.Payment}
        progress={user.LessonProgress}
        submissions={user.submissions}
      />
    </div>
  </main>
)
}
