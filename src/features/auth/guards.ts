import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeNext } from './identity'

export async function requireSession(locale: string, next: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/${locale}/signin?next=${encodeURIComponent(safeNext(next, locale))}`)
  }

  return session
}

export async function requireVerifiedPhone(locale: string, next: string) {
  const session = await requireSession(locale, next)

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      phone: true,
      phoneVerified: true,
      _count: { select: { enrollments: true } }
    }
  })

  if (!account) {
    redirect(`/${locale}/signin?next=${encodeURIComponent(safeNext(next, locale))}`)
  }

  const needsPhone = !account.phone || !account.phoneVerified

  if (needsPhone && account._count.enrollments > 0) {
    redirect(`/${locale}/account/phone?next=${encodeURIComponent(safeNext(next, locale))}`)
  }

  return session
}
