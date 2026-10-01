import { Fragment, type ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/design/components/Bits'
import { ThemeSync } from '@/design/layout/ThemeSync'
import { campaignSlugs, getCampaign, pick } from '@/features/leads/campaigns'
import { CallbackForm } from '@/features/leads/CallbackForm'
import s from '@/features/leads/landing.module.css'

// The landing lives outside (site): no header, footer or outbound links.
// Someone arrived from an ad — the form is the one way forward.

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

type Props = {
  params: Promise<{ locale: string; campaign: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export function generateStaticParams() {
  return campaignSlugs().map(campaign => ({ campaign }))
}

const plain = (text: string) => text.replace(/<\/?it>/g, '')

/** Campaign headlines may mark 1–2 words as <it>…</it> for the italic accent. */
function withItalics(text: string): ReactNode {
  return text.split(/(<it>.*?<\/it>)/g).map((part, i) =>
    part.startsWith('<it>') ? (
      <span key={i} className="it">
        {part.slice(4, -5)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  )
}

export async function generateMetadata({ params }: Props) {
  const { locale, campaign } = await params
  const found = getCampaign(campaign)
  if (!found) return {}
  return {
    title: plain(pick(found.headline, locale)),
    description: pick(found.subhead, locale),
    // An ad address, not a site page: nothing to do in search results.
    robots: { index: false, follow: false }
  }
}

export default async function CampaignLandingPage({ params, searchParams }: Props) {
  const { locale, campaign } = await params
  const query = await searchParams
  const found = getCampaign(campaign)
  if (!found) notFound()

  const t = await getTranslations({ locale, namespace: 'landingPage' })
  const bullets = pick(found.bullets, locale)
  // Campaign tags live in the ad's URL: without them there's no telling which ad pays off.
  const utm = Object.fromEntries(UTM_KEYS.filter(k => query[k]).map(k => [k, String(query[k]).slice(0, 200)]))
  const rich = { it: (c: ReactNode) => <span className="it">{c}</span> }

  return (
    <main className={s.page}>
      <ThemeSync area="site" />
      <div className={s.inner}>
        <section className={s.pitch}>
          <Logo ring="var(--c-violet)" inverse />
          <span className={s.offer}>{pick(found.offer, locale)}</span>
          <h1 className={s.headline}>{withItalics(pick(found.headline, locale))}</h1>
          <p className={s.sub}>{pick(found.subhead, locale)}</p>
          <ol className={s.bullets}>
            {bullets.map((item, i) => (
              <li key={item} style={{ animationDelay: `${200 + i * 90}ms` }}>
                <span className={s.num}>{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className={s.formCol}>
          <div className={s.card}>
            <span className={s.cardTitle}>{t.rich('formTitle', rich)}</span>
            <CallbackForm source="LANDING" campaign={found.slug} utm={Object.keys(utm).length ? utm : undefined} tone="onWhite" submitLabel={t('submit')} />
            <span className={s.privacy}>{t('privacy')}</span>
          </div>
          <div className={s.after}>
            <span className={s.afterTitle}>{t('afterTitle')}</span>
            <span className={s.afterText}>{t('afterText')}</span>
          </div>
        </section>
      </div>
      <footer className={s.foot}>© Highgate Education</footer>
    </main>
  )
}
