import Link from "next/link"
import { getTranslations } from "next-intl/server"
import TilesCarousel from "@/features/home/TilesCarousel"
import StructurePreview from '@/features/home/StructurePreview'
import HeroVertex from '@/features/home/HeroVertex'     
import AccessTiers from "@/features/home/AccessTiers"
import BrandMarquee from "@/features/home/BrandMarquee"
import HowItWorks from "@/features/home/HowItWorks"
import CTASection from "@/features/home/CTASection"
import MentorIntro from "@/features/home/MentorIntro"
import FAQSection from "@/features/home/FAQSection"

export default async function LocaleHome({ params }: any) {
  const locale = params.locale
  const t = await getTranslations({ locale, namespace: "common" })
  const base = `/${locale}`

  return (
    <main className="relative">
      <HeroVertex />
      <TilesCarousel />
      <StructurePreview />
      <HowItWorks />
      <MentorIntro base={base} />
      <BrandMarquee />
      <AccessTiers base={base} />
      <FAQSection />
      <CTASection base={base} />
    </main>
  )
}
