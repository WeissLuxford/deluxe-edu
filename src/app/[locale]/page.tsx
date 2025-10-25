import Link from "next/link"
import { getTranslations } from "next-intl/server"
import TilesCarousel from "@/features/home/TilesCarousel"
import StructurePreview from '@/features/home/StructurePreview'
import HeroVertex from '@/features/home/HeroVertex'     

export default async function LocaleHome({ params }: { params: { locale: string } }) {
  const locale = params.locale
  const t = await getTranslations({ locale, namespace: "common" })
  const base = `/${locale}`

  return (
    <main className="relative">
      


      <HeroVertex />

      <TilesCarousel />

      <section id="block-access" data-section="access-tiers">
        <div className="container py-16">
          <div className="access-head">
            <h2 className="text-2xl font-semibold">Access tiers</h2>
            <p className="text-sm text-muted">One course, different access levels</p>
          </div>
          <div className="access-grid">
            <div className="card card-interactive">
              <div className="flex items-center justify-between mb-2"><div className="font-medium">Basic</div><span className="badge badge-primary">RU UZ EN</span></div>
              <p className="text-sm text-muted">Recordings, summaries, assignments</p>
              <div className="divider" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{t("course.price")}: Free</span>
                <Link href={`${base}/signin`} className="btn btn-secondary btn-auto-right">{t("buttons.signIn")}</Link>
              </div>
            </div>
            <div className="card card-interactive card-shadow-gold">
              <div className="flex items-center justify-between mb-2"><div className="font-medium">Pro</div><span className="badge badge-primary">Priority</span></div>
              <p className="text-sm text-muted">Everything in Basic plus quizzes and feedback</p>
              <div className="divider" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{t("course.price")}: 99</span>
                <Link href={`${base}/signin`} className="btn btn-primary btn-auto-right">{t("buttons.buyNow")}</Link>
              </div>
            </div>
            <div className="card card-interactive">
              <div className="flex items-center justify-between mb-2"><div className="font-medium">Deluxe</div><span className="badge badge-primary">Live</span></div>
              <p className="text-sm text-muted">Live streams, Q and A, mentor sessions</p>
              <div className="divider" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{t("course.price")}: 199</span>
                <Link href={`${base}/signin`} className="btn btn-primary btn-auto-right">{t("buttons.buyNow")}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <StructurePreview />

      <section id="block-marquee" data-section="marquee" className="marquee-wrap">
        <div className="marquee">
          <div className="marquee-row">
            <div className="marquee-track">
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
            </div>
          </div>
          <div className="marquee-row">
            <div className="marquee-track reverse">
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
              <span className="text-6xl md:text-8xl font-black">VERTEX</span>
            </div>
          </div>
        </div>
      </section>

      <section className="events">
        <div className="container py-20">
          <div className="events-grid">
            <div className="card"><div className="text-sm text-muted">Streams</div><div className="font-medium">Live and Q and A</div></div>
            <div className="card"><div className="text-sm text-muted">Recordings</div><div className="font-medium">Watch anytime</div></div>
            <div className="card"><div className="text-sm text-muted">Lessons</div><div className="font-medium">Summaries and tasks</div></div>
          </div>
        </div>
      </section>
    </main>
  )
}
