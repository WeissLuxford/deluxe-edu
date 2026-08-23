'use client'

import { useTranslations } from 'next-intl'

export default function StructurePreview() {
  const t = useTranslations('home')
  return (
    <section aria-labelledby="structure-head">
      <h2 id="structure-head">{t('structTitle')}</h2>
      <p>{t('structLead')}</p>

      <div>
        <article>
          <div>
            <span>{t('s1')}</span>
            <div>{t('s1d')}</div>
          </div>
        </article>

        <article>
          <div>
            <div>{t('s2')}</div>
            <div>{t('s2d')}</div>
            <div>{t('s3')}</div>
            <div>{t('s3d')}</div>
          </div>
        </article>

        <article>
          <div>
            <div>{t('s4')}</div>
            <div>{t('s4d')}</div>
          </div>
        </article>

        <article>
          <div>
            <div>{t('s5')}</div>
            <div>{t('s5d')}</div>
            <div>{t('s6')}</div>
            <div>{t('s6d')}</div>
          </div>
        </article>
      </div>
    </section>
  )
}