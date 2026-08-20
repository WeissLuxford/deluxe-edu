import { getTranslations } from 'next-intl/server';
import { AboutHero } from '@/features/about/components/AboutHero';
import { OurMission } from '@/features/about/components/OurMission';
import { WhyUs } from '@/features/about/components/WhyUs';
import { AboutCtaBanner } from '@/features/about/components/AboutCtaBanner';
import { HowItWorks } from '@/features/about/components/HowItWorks';
import { OurTeam } from '@/features/about/components/OurTeam';
import { JoinMovement } from '@/features/about/components/JoinMovement';

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <main className="page-start">
      <AboutHero />
      <OurMission />
      <WhyUs />
      <AboutCtaBanner />
      <HowItWorks />
      <OurTeam />
      <JoinMovement />
    </main>
  );
}