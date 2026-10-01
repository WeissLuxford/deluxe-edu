import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CONTACTS } from '@/content/contacts'
import s from './SiteFooter.module.css'

// The locale comes in as a prop: our middleware doesn't set next-intl's
// request locale, so getLocale()/getTranslations() without one fall back to ru.
export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'siteFooter' })
  const base = `/${locale}`

  return (
    <footer className={s.wrap}>
      <div className={s.box}>
        <div className={s.grid}>
          <div className={s.say}>
            <span className={s.sayText}>
              {t('say')}
              <br />
              <span className={`it ${s.sayIt}`}>{t('sayIt')}</span>
            </span>
            <span className={s.contacts}>
              <a href={`tel:${CONTACTS.phoneE164}`}>{CONTACTS.phoneDisplay}</a>
              <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank" rel="noreferrer">@{CONTACTS.telegram}</a>
            </span>
          </div>
          <div className={s.col}>
            <span className={s.colTitle}>{t('learn')}</span>
            <Link href={`${base}/courses`}>{t('allCourses')}</Link>
            <Link href={`${base}/level-test`}>{t('levelTest')}</Link>
            <Link href={`${base}/trial-lesson`}>{t('trial')}</Link>
          </div>
          <div className={s.col}>
            <span className={s.colTitle}>{t('school')}</span>
            <Link href={`${base}/teachers`}>{t('teachers')}</Link>
            <Link href={`${base}/results`}>{t('results')}</Link>
            <Link href={`${base}/news`}>{t('news')}</Link>
            <Link href={`${base}/about`}>{t('about')}</Link>
          </div>
          <div className={s.col}>
            <span className={s.colTitle}>{t('language')}</span>
            <span className={s.langs}>
              {(['ru', 'uz', 'en'] as const).map(l => (
                <Link key={l} href={`/${l}`} hrefLang={l} className={[s.lang, l === locale && s.langActive].filter(Boolean).join(' ')}>
                  {l.toUpperCase()}
                </Link>
              ))}
            </span>
          </div>
        </div>
        <div className={s.bottom}>
          <span className={s.word} aria-hidden="true">highgate</span>
          <span className={s.copy}>{t('copy')}</span>
        </div>
      </div>
    </footer>
  )
}
