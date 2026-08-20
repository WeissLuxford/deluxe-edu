import { getTranslations } from 'next-intl/server'
import { Avatar } from '@/features/ui/components/Avatar'
import { AvatarPicker } from './components/AvatarPicker'
import { LanguageField } from './components/LanguageField'
import ProfileSection from './sections/ProfileSection'

type User = {
  id: string
  name: string | null
  image: string | null
  avatarSkinId: string | null
  phone: string | null
  firstName: string | null
  locale: string
}

export async function SiteAccountCard({ user, locale }: { user: User; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="container">
          <div className="dash-head">
            <span className="avatar-frame">
              <Avatar name={user.name} seed={user.phone || user.id} image={user.image} avatarSkinId={user.avatarSkinId} size={72} />
              <AvatarPicker seed={user.phone || user.id} name={user.name} avatarSkinId={user.avatarSkinId} locale={locale} />
            </span>
            <div>
              <h1 className="page-hero__title dash-head__title">
                {t('welcome', { name: user.firstName || user.name || '' })}
              </h1>
              <p className="page-hero__sub">{user.phone ? `+${user.phone}` : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container page-body" style={{ display: 'grid', gap: '1.5rem', maxWidth: '40rem' }}>
        <ProfileSection />
        <LanguageField user={user} />
      </div>
    </main>
  )
}
