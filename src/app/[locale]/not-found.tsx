import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/design/components/Button'
import { ErrorScreen } from '@/features/errors/ErrorScreen'

const LOCALES = ['ru', 'uz', 'en']

// not-found gets no params; the middleware puts the locale into x-locale.
export default async function NotFound() {
  const requested = (await headers()).get('x-locale') ?? ''
  const locale = LOCALES.includes(requested) ? requested : 'ru'
  const t = await getTranslations({ locale, namespace: 'errorPage' })
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  return (
    <ErrorScreen
      code="404"
      homeHref={`/${locale}`}
      title={t.rich('notFoundTitle', rich)}
      text={t('notFoundText')}
      actions={
        <>
          <Button href={`/${locale}`} variant="ink" size="lg" arrow>
            {t('home')}
          </Button>
          <Button href={`/${locale}/courses`} variant="white" size="lg">
            {t('courses')}
          </Button>
        </>
      }
    />
  )
}
