import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export async function requireTeacher(locale = 'ru') {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/${locale}/signin`)
  }

  if (session.user.role !== 'MENTOR') {
    redirect(`/${locale}/learn`)
  }

  return session.user
}
