import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading } from '@/design/components/Type'
import { CONTACTS } from '@/content/contacts'
import { organizationJsonLd } from '@/features/seo/jsonLd'
import s from '@/features/site/info.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'aboutPage.meta' })
  return { title: t('title'), description: t('description') }
}

const VALUES = [
  { key: 'v1', bg: 'var(--lv-a1-bg)', fg: 'var(--lv-a1-fg)' },
  { key: 'v2', bg: 'var(--lv-a2-bg)', fg: 'var(--lv-a2-fg)' },
  { key: 'v3', bg: 'var(--lv-c1-bg)', fg: 'var(--lv-c1-fg)' }
] as const

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'aboutPage' })
  const rich = {
    it: (c: ReactNode) => <span className="it">{c}</span>,
    hl: (c: ReactNode) => <span className="hl">{c}</span>
  }

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }} />

      <div className={s.aboutHead}>
        <div className={s.aboutText}>
          <Reveal>
            <Heading size="h1">{t.rich('title', rich)}</Heading>
          </Reveal>
          <Reveal delay={80}>
            <p className={s.story2}>{t.rich('story', rich)}</p>
          </Reveal>
        </div>

        <div className={s.contacts}>
          <Reveal delay={80}>
            <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank" rel="noreferrer" className={`${s.contact} ${s.contactViolet}`}>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{t('fastest')}</span>
                <span className={s.contactValue}>Telegram @{CONTACTS.telegram}</span>
              </span>
              <span className={s.contactArrow} aria-hidden="true">→</span>
            </a>
          </Reveal>
          <Reveal delay={140}>
            <a href={`tel:${CONTACTS.phoneE164}`} className={`${s.contact} ${s.contactWhite}`}>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{t('call')}</span>
                <span className={s.contactValue}>{CONTACTS.phoneDisplay}</span>
              </span>
              <span className={s.contactArrow} style={{ color: 'var(--c-violet)' }} aria-hidden="true">→</span>
            </a>
          </Reveal>
          <Reveal delay={200}>
            <div className={`${s.contact} ${s.contactWhite}`}>
              <span className={s.contactBody}>
                <span className={s.contactLabel}>{t('hours')}</span>
                <span className={s.contactValue} style={{ fontSize: 20 }}>{t('hoursValue')}</span>
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      <div className={s.values}>
        {VALUES.map((v, i) => (
          <Reveal key={v.key} delay={i * 80} className={s.value} style={{ background: v.bg, color: v.fg }}>
            <span className={s.valueTitle}>{t(`${v.key}Title`)}</span>
            <span className={s.valueText}>{t(`${v.key}Text`)}</span>
          </Reveal>
        ))}
      </div>
    </Container>
  )
}
