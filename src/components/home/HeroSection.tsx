import { ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { HeroIllustration } from '@/components/home/HeroIllustration';
import { RoomInputCard } from '@/components/home/RoomInputCard';
import { TEXT } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-brandsoft to-app">
      <Container className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Mulai rapat video gratis, tanpa ribet.</h1>
          <p className="mt-4 text-lg text-muted">
            Buat ruang, bagikan tautan, langsung ngobrol. Tanpa unduh, tanpa akun.
          </p>
          <RoomInputCard className="mt-8" />
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            {TEXT.privacyShort}
          </p>
        </div>
        <div className="hidden justify-center lg:flex">
          <HeroIllustration />
        </div>
      </Container>
    </section>
  );
}
