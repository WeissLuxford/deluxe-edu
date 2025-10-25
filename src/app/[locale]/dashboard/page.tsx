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
    <main className="min-h-screen bg-gradient-dark py-10">
      <div className="container">
        <DashboardShell
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            locale: user.locale,
            createdAt: user.createdAt
          }}
          enrollments={user.enrollments}
          payments={user.Payment}
        />
      </div>
    </main>
  )
}
