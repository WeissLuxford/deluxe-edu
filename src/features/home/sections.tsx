import { ReactNode } from 'react'
import TilesCarousel from './TilesCarousel'
import StructurePreview from './StructurePreview'
import HeroVertex from './HeroVertex'
import AccessTiers from './AccessTiers'
import BrandMarquee from './BrandMarquee'
import HowItWorks from './HowItWorks'
import CTASection from './CTASection'
import MentorIntro from './MentorIntro'
import FAQSection from './FAQSection'
import ContactFormSection from './ContactFormSection'
import { LearningFormat } from './LearningFormat'
import { LevelsLadder } from './LevelsLadder'
import { PriceHonesty } from './PriceHonesty'
import { Reviews, REVIEWS } from './Reviews'

export type SectionContext = { locale: string; base: string }

export type HomeSection = {
  key: string
  enabled: boolean
  render: (ctx: SectionContext) => ReactNode
}

export const HOME_SECTIONS: HomeSection[] = [
  { key: 'hero', enabled: true, render: () => <HeroVertex /> },
  { key: 'tiles', enabled: true, render: () => <TilesCarousel /> },
  { key: 'format', enabled: true, render: ({ locale }) => <LearningFormat locale={locale} /> },
  { key: 'structure', enabled: true, render: () => <StructurePreview /> },
  { key: 'levels', enabled: true, render: ({ locale }) => <LevelsLadder locale={locale} /> },
  { key: 'howItWorks', enabled: true, render: () => <HowItWorks /> },
  { key: 'mentor', enabled: true, render: ({ base }) => <MentorIntro base={base} /> },
  { key: 'marquee', enabled: true, render: () => <BrandMarquee /> },
  { key: 'tiers', enabled: true, render: ({ base }) => <AccessTiers base={base} /> },
  { key: 'priceHonesty', enabled: true, render: ({ locale }) => <PriceHonesty locale={locale} /> },
  { key: 'reviews', enabled: REVIEWS.length > 0, render: ({ locale }) => <Reviews locale={locale} /> },
  { key: 'faq', enabled: true, render: () => <FAQSection /> },
  { key: 'cta', enabled: true, render: ({ base }) => <CTASection base={base} /> },
  { key: 'contactForm', enabled: true, render: () => <ContactFormSection /> }
]
