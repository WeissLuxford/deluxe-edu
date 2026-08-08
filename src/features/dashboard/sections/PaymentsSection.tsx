import { useTranslations, useLocale } from 'next-intl'

type Payment = {
  id: string
  amountCents: number
  currency: string
  provider: string
  status: string
  createdAt: string | Date
  course: { slug: string } | null
}

export default function PaymentsSection({ payments }: { payments: Payment[] }) {
  const t = useTranslations('common')
  const locale = useLocale()

  return (
    <section className="card">
      {payments.length === 0 ? (
        <div className="text-sm text-muted">{t('dashboard.noPayments')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">{t('dashboard.courseColumn')}</th>
                <th className="text-left p-2">{t('dashboard.amount')}</th>
                <th className="text-left p-2">{t('dashboard.provider')}</th>
                <th className="text-left p-2">{t('dashboard.date')}</th>
                <th className="text-left p-2">{t('dashboard.status')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="p-2">{p.course?.slug || '-'}</td>
                  <td className="p-2">
                    {new Intl.NumberFormat(locale, { style: 'currency', currency: p.currency }).format(p.amountCents / 100)}
                  </td>
                  <td className="p-2">{p.provider}</td>
                  <td className="p-2">{new Date(p.createdAt).toLocaleDateString(locale)}</td>
                  <td className="p-2">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
