import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { PageShell } from '@/components/layout/PageShell';

export default function HomePage() {
  return (
    <PageShell>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </PageShell>
  );
}
