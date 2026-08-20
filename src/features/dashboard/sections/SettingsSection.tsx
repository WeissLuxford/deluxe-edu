import { getTranslations } from 'next-intl/server'
import { LanguageField } from '../components/LanguageField'
import { DeviceList } from '../components/DeviceList'

type Device = { id: string; userAgent: string | null; ip: string | null; lastSeenAt: Date }

export async function SettingsSection({
  user,
  devices,
  currentDeviceId,
  locale
}: {
  user: { locale: string }
  devices: Device[]
  currentDeviceId: string | null
  locale: string
}) {
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <LanguageField user={user} />

      <section className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{t('devicesTitle')}</h3>
        <DeviceList devices={devices} currentDeviceId={currentDeviceId} locale={locale} />
      </section>
    </div>
  )
}
