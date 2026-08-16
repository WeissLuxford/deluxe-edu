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
import ContactFormSection from '@/features/home/ContactFormSection'

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
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
      <ContactFormSection /> 
    </main>
  )
}
