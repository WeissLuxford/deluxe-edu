import UserAvatar from '../UserAvatar'
import { useTranslations, useLocale } from 'next-intl'

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  locale: string
  createdAt: string | Date
}

export default function ProfileSection({ user }: { user: User }) {
  const t = useTranslations('common')
  const locale = useLocale()

  return (
    <section className="card">
      <div className="flex items-center gap-4">
        <UserAvatar src={user.image || undefined} name={user.name} email={user.email} size={72} />
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">{user.name || user.email}</div>
          <div className="text-sm text-muted truncate">{user.email}</div>
        </div>
      </div>
      <div className="divider" />
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="text-sm"><span className="text-muted">{t('dashboard.roleLabel')}:</span> {user.role}</div>
        <div className="text-sm"><span className="text-muted">{t('dashboard.localeLabel')}:</span> {user.locale}</div>
        <div className="text-sm sm:col-span-2">
          <span className="text-muted">{t('dashboard.joinedAt')}:</span> {new Date(user.createdAt).toLocaleDateString(locale)}
        </div>
      </div>
    </section>
  )
}
