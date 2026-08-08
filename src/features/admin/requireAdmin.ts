import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

/**
 * Пускает дальше только администратора.
 *
 * Вызывается и в layout (чтобы закрыть страницы), и внутри каждого
 * server action отдельно. Проверка в layout защищает от «зашёл и увидел»,
 * но не защищает от прямого вызова action — поэтому дублируем в обоих местах.
 * Одной проверки в интерфейсе недостаточно никогда.
 */
export async function requireAdmin(locale = 'ru') {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/${locale}/signin`)
  }

  if (session.user.role !== 'ADMIN') {
    redirect(`/${locale}/dashboard`)
  }

  return session.user
}
