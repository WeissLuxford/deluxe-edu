'use client'

import { useEffect, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/design/components/Button'
import { ErrorScreen } from '@/features/errors/ErrorScreen'

// Something broke while rendering a page: say so plainly and offer a retry.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPage')
  const locale = useLocale()
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorScreen
      code=":("
      homeHref={`/${locale}`}
      title={t.rich('errorTitle', rich)}
      text={t('errorText')}
      actions={
        <>
          <Button variant="ink" size="lg" arrow onClick={() => reset()}>
            {t('retry')}
          </Button>
          <Button href={`/${locale}`} variant="white" size="lg">
            {t('home')}
          </Button>
        </>
      }
    />
  )
}
