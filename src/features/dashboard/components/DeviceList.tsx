import { getTranslations } from 'next-intl/server'
import { Smartphone } from 'lucide-react'
import { summarizeUserAgent } from '@/lib/userAgent'
import { RevokeDeviceButton } from './RevokeDeviceButton'

type Device = {
  id: string
  userAgent: string | null
  ip: string | null
  lastSeenAt: Date
}

export async function DeviceList({
  devices,
  currentDeviceId,
  locale
}: {
  devices: Device[]
  currentDeviceId: string | null
  locale: string
}) {
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  if (!devices.length) {
    return <div className="empty-state"><p>{t('devicesEmpty')}</p></div>
  }

  return (
    <ul className="progress-list">
      {devices.map(d => (
        <li key={d.id} className="progress-row">
          <span className="progress-row__icon">
            <Smartphone size={18} />
          </span>

          <div className="progress-row__body">
            <span className="progress-row__course">{summarizeUserAgent(d.userAgent)}</span>
            <span className="progress-row__lesson">
              {d.ip ? `${d.ip} · ` : ''}
              {new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(d.lastSeenAt))}
            </span>
          </div>

          <div className="progress-row__action">
            {d.id === currentDeviceId ? (
              <span className="badge badge-success">{t('thisDevice')}</span>
            ) : (
              <RevokeDeviceButton
                deviceId={d.id}
                locale={locale}
                confirmText={t('deviceRevokeConfirm')}
                label={t('deviceRevoke')}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
