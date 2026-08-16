import { getTranslations } from 'next-intl/server';
import { AboutHero } from '@/features/about/components/AboutHero';
import { OurMission } from '@/features/about/components/OurMission';
import { WhyUs } from '@/features/about/components/WhyUs';
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
      <HowItWorks />
      <OurTeam />
      <JoinMovement />
    </main>
  );
}