'use client'

import { useTranslations } from 'next-intl'

export default function StructurePreview() {
  const t = useTranslations('home')
  return (
    <section className="container structure-wrap py-20" aria-labelledby="structure-head">
      <div className="text-center mb-12">
        <h2 id="structure-head" className="structure-head text-3xl md:text-4xl font-extrabold text-gradient mb-3">
          {t('structTitle')}
        </h2>
        <p className="text-muted text-lg">{t('structLead')}</p>
      </div>

      <div className="structure-track">
        <article className="structure-item">
          <div className="struct-card">
            <div className="struct-title">
              <span className="accent">{t('s1')}</span>
            </div>
            <div className="struct-desc">
              {t('s1d')}
            </div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card struct-split">
            <div className="row">
              <div className="struct-title">{t('s2')}</div>
              <div className="struct-desc">{t('s2d')}</div>
            </div>
            <div className="row">
              <div className="struct-title">{t('s3')}</div>
              <div className="struct-desc">{t('s3d')}</div>
            </div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card" style={{ background: 'linear-gradient(135deg, rgba(199,164,90,0.1), rgba(212,176,106,0.05))' }}>
            <div className="struct-title">{t('s4')}</div>
            <div className="struct-desc">
              {t('s4d')}
            </div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card struct-split">
            <div className="row">
              <div className="struct-title">{t('s5')}</div>
              <div className="struct-desc">{t('s5d')}</div>
            </div>
            <div className="row">
              <div className="struct-title">{t('s6')}</div>
              <div className="struct-desc">{t('s6d')}</div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}