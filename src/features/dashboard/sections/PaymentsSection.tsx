import { getTranslations } from 'next-intl/server'

type Payment = {
  id: string
  amountCents: number
  currency: string
  provider: string
  status: string
  createdAt: string | Date
  course: { slug: string } | null
}

export async function PaymentsSection({ payments, locale }: { payments: Payment[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return (
    <section className="card">
      {payments.length === 0 ? (
        <div className="text-sm text-muted">{t('noPayments')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">{t('courseColumn')}</th>
                <th className="text-left p-2">{t('amount')}</th>
                <th className="text-left p-2">{t('provider')}</th>
                <th className="text-left p-2">{t('date')}</th>
                <th className="text-left p-2">{t('status')}</th>
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
