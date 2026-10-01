import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'
import { getCampaign, campaignSlugs, pick } from '@/features/leads/campaigns'
import LandingForm from '@/features/leads/LandingForm'

// Лендинг живёт вне (site): у него нет ни шапки, ни футера, ни ссылок наружу.
// Человек пришёл из объявления — с этого экрана есть ровно один выход, форма.

export function generateStaticParams() {
  return campaignSlugs().map(campaign => ({ campaign }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; campaign: string }>
}) {
  const { locale, campaign } = await params
  const found = getCampaign(campaign)
  if (!found) return {}

  return {
    title: pick(found.headline, locale),
    description: pick(found.subhead, locale),
    // Лендинг — адрес объявления, а не страница сайта: в поиске ему делать
    // нечего, и дублировать им главную не нужно.
    robots: { index: false, follow: false }
  }
}

export default async function CampaignLandingPage({
  params
}: {
  params: Promise<{ locale: string; campaign: string }>
}) {
  const { locale, campaign } = await params
  const found = getCampaign(campaign)
  if (!found) notFound()

  const bullets = pick(found.bullets, locale)

  return (
    <main className="landing">
      <div className="landing__grid">
        <section className="landing__pitch">
          <span className="landing__offer">{pick(found.offer, locale)}</span>
          <h1 className="landing__headline">{pick(found.headline, locale)}</h1>
          <p className="landing__sub">{pick(found.subhead, locale)}</p>

          <ul className="landing__bullets">
            {bullets.map(item => (
              <li key={item}>
                <Check size={18} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Image
            src={found.image}
            alt=""
            width={520}
            height={380}
            className="landing__art"
            priority
          />
        </section>

        <section className="landing__form">
          <LandingForm campaign={found.slug} />
        </section>
      </div>
    </main>
  )
}
