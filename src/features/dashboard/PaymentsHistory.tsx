import { useTranslations, useLocale } from 'next-intl'

export default function PaymentsHistory({ payments }: { payments: any[] }) {
  const t = useTranslations('common')
  const locale = useLocale()

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('dashboard.payments')}</h3>
      {payments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">{t('dashboard.noPayments')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-2 text-left">{t('dashboard.courseColumn')}</th>
                <th className="p-2 text-left">{t('dashboard.amount')}</th>
                <th className="p-2 text-left">{t('dashboard.provider')}</th>
                <th className="p-2 text-left">{t('dashboard.date')}</th>
                <th className="p-2 text-left">{t('dashboard.status')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2">{p.course?.slug || p.courseId || '-'}</td>
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
