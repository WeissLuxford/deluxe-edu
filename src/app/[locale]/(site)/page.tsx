import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/design/components/Button'
import { Chip, LevelSticker } from '@/design/components/Bits'
import { Accordion } from '@/design/components/Accordion'
import { Reveal } from '@/design/components/Reveal'
import { Container, Heading, Lead } from '@/design/components/Type'
import { LEVEL_CODES } from '@/design/levels'
import { HeroCollage } from '@/features/home/HeroCollage'
import { CallbackForm } from '@/features/leads/CallbackForm'
import { formatSum, startingPrices, type PlanKey } from '@/features/pricing/planPrices'
import { organizationJsonLd } from '@/features/seo/jsonLd'
import s from '@/features/home/home.module.css'

const LOCALES = ['ru', 'uz', 'en'] as const
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const rich = {
  it: (c: ReactNode) => <span className="it">{c}</span>,
  hl: (c: ReactNode) => <span className="hl">{c}</span>,
  soft: (c: ReactNode) => <span className={s.manifestoSoft}>{c}</span>
}

type FaqItem = { q: string; a: string }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'homePage.meta' })
  const url = `${SITE_URL}/${locale}`
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map(l => [l, `${SITE_URL}/${l}`])) },
    openGraph: { title: t('title'), description: t('description'), url, siteName: 'Highgate', locale, type: 'website' },
    robots: { index: true, follow: true }
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const base = `/${locale}`
  const t = await getTranslations({ locale, namespace: 'homePage' })
  const tu = await getTranslations({ locale, namespace: 'ui' })
  const prices = await startingPrices()
  const faq = t.raw('faq.items') as FaqItem[]

  const price = (plan: PlanKey) => {
    const amount = prices[plan]
    return amount === null ? '—' : tu('from', { price: tu('perMonth', { price: tu('sum', { amount: formatSum(amount) }) }) })
  }

  const jsonLd = [
    organizationJsonLd(locale),
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } }))
    }
  ]

  return (
    <div className={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container as="section" className={s.hero}>
        <div className={s.heroText}>
          <Reveal>
            <span className={s.heroChip}>
              <Chip tone="violet">A1–C1</Chip>
              {t('hero.chip')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <Heading size="display">{t.rich('hero.title', rich)}</Heading>
          </Reveal>
          <Reveal delay={160}>
            <Lead style={{ maxWidth: 540 }}>{t('hero.lead')}</Lead>
          </Reveal>
          <Reveal delay={240} className={s.heroActions}>
            <Button href={`${base}/trial-lesson`} size="lg" arrow>
              {t('hero.primary')}
            </Button>
            <Button href={`${base}/level-test`} size="lg" variant="ghost">
              {t('hero.secondary')}
            </Button>
          </Reveal>
          <Reveal delay={300}>
            <span className={s.heroNote}>{t('hero.note')}</span>
          </Reveal>
        </div>
        <HeroCollage locale={locale} />
      </Container>

      <section className={s.bleed}>
        <Reveal className={s.manifesto}>
          <p>{t.rich('manifesto', rich)}</p>
        </Reveal>
      </section>

      <Container as="section" className={s.section}>
        <Reveal>
          <Heading>{t.rich('feel.title', rich)}</Heading>
        </Reveal>
        <div className={s.feelGrid}>
          <Reveal className={`${s.feelCard} ${s.feelBig}`}>
            <span className={s.feelMinutes}>
              {t('feel.minutes')}
              <span> {t('feel.minutesUnit')}</span>
            </span>
            <span className={s.feelBody}>
              <span className={s.feelTitleLg}>{t('feel.oneTitle')}</span>
              <span className={s.feelTextLg}>{t('feel.oneText')}</span>
            </span>
          </Reveal>
          <Reveal delay={80} className={`${s.feelCard} ${s.feelLime}`}>
            <span className={s.feelTitle}>{t('feel.mistakesTitle')}</span>
            <span className={s.feelText}>{t('feel.mistakesText')}</span>
          </Reveal>
          <Reveal delay={160} className={`${s.feelCard} ${s.feelWhite}`}>
            <span className={s.feelTitle}>{t('feel.humanTitle')}</span>
            <span className={s.feelText}>{t('feel.humanText')}</span>
          </Reveal>
          <Reveal delay={120} className={`${s.feelCard} ${s.feelPeach}`}>
            <span className={s.feelBody}>
              <span className={s.feelTitle}>{t('feel.langTitle')}</span>
              <span className={s.feelText}>{t('feel.langText')}</span>
            </span>
            <span className={s.langPills}>
              <span className={s.langPillOn}>RU</span>
              <span className={s.langPill}>UZ</span>
              <span className={s.langPill}>EN</span>
            </span>
          </Reveal>
        </div>
      </Container>

      <Container as="section" className={s.section}>
        <div className={s.sectionHead}>
          <Reveal>
            <Heading>{t.rich('levels.title', rich)}</Heading>
          </Reveal>
          <Reveal delay={80}>
            <Lead style={{ maxWidth: 360 }}>{t('levels.lead')}</Lead>
          </Reveal>
        </div>
        <div className={s.levels}>
          {LEVEL_CODES.map((code, i) => (
            <Reveal key={code} delay={i * 60}>
              <LevelSticker level={code} title={tu(`levels.${code}.title`)} desc={tu(`levels.${code}.desc`)} href={`${base}/courses?level=${code}`} />
            </Reveal>
          ))}
          <Reveal delay={LEVEL_CODES.length * 60}>
            <a href={`${base}/level-test`} className={s.levelUnknown}>
              <span className={s.levelQ}>?</span>
              <span className={s.levelUnknownBody}>
                <span className={s.levelUnknownTitle}>{t('levels.unknownTitle')}</span>
                <span className={s.levelUnknownDesc}>{t('levels.unknownDesc')}</span>
              </span>
            </a>
          </Reveal>
        </div>
      </Container>

      <Container as="section" className={`${s.section} ${s.steps}`}>
        {(['s1', 's2', 's3'] as const).map((key, i) => (
          <Reveal key={key} delay={i * 100} className={s.step}>
            <span className={s.stepNum}>0{i + 1}</span>
            <span className={s.stepTitle}>{t(`steps.${key}.title`)}</span>
            <span className={s.stepText}>{t(`steps.${key}.text`)}</span>
          </Reveal>
        ))}
      </Container>

      <Container as="section" className={s.section}>
        <Reveal>
          <Heading>{t.rich('pricing.title', rich)}</Heading>
        </Reveal>
        <div className={s.plans}>
          {(['BASIC', 'PRO', 'DELUXE'] as const).map((plan, i) => (
            <Reveal key={plan} delay={i * 80} className={s.planCell}>
              <div className={`${s.plan} ${s[`plan${plan}`]}`}>
              {plan === 'PRO' && <span className={s.planBadge}>{t('pricing.popular')}</span>}
              <span className={s.planTag}>
                {tu(`plans.${plan}.name`)} · {tu(`plans.${plan}.tagline`)}
              </span>
              <span className={s.planPrice}>{price(plan)}</span>
              <span className={s.planDesc}>{tu(`plans.${plan}.desc`)}</span>
              <Button href={`${base}/courses`} size="lg" block variant={plan === 'BASIC' ? 'soft' : plan === 'PRO' ? 'white' : 'lime'}>
                {t('pricing.choose', { plan: tu(`plans.${plan}.name`) })}
              </Button>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className={s.planNote}>{t('pricing.note')}</p>
        </Reveal>
      </Container>

      <Container as="section" className={`${s.section} ${s.faq}`}>
        <Reveal>
          <Heading>{t.rich('faq.title', rich)}</Heading>
        </Reveal>
        <Reveal delay={80}>
          <Accordion items={faq} />
        </Reveal>
      </Container>

      <section className={s.bleed} id="lead">
        <Reveal className={s.lead}>
          <div className={s.leadText}>
            <Heading size="h1" as="h2">{t.rich('lead.title', rich)}</Heading>
            <p className={s.leadP}>{t('lead.text')}</p>
          </div>
          <CallbackForm source="HOME_FORM" />
        </Reveal>
      </section>
    </div>
  )
}
