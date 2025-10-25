import { useTranslations, useLocale } from 'next-intl'

export default function UserInfo({ user }: { user: any }) {
  const t = useTranslations('common')
  const locale = useLocale()

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
      <img
        src={user.image || '/images/avatar-default.png'}
        alt=""
        className="w-24 h-24 rounded-full object-cover border border-gray-300 dark:border-gray-700"
      />
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.name || user.email}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
        <p className="text-sm mt-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t('dashboard.roleLabel')}:</span> {user.role}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('dashboard.joinedAt')}: {new Date(user.createdAt).toLocaleDateString(locale)}
        </p>
      </div>
    </section>
  )
}
