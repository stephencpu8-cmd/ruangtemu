import { Link2, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/layout/Container';

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: UserRound, title: 'Tanpa Akun', text: 'Langsung pakai. Cukup isi nama tampilan, tidak perlu daftar atau masuk.' },
  { icon: Link2, title: 'Bagikan Sekali Klik', text: 'Salin tautan undangan dan kirim ke siapa saja lewat aplikasi favorit Anda.' },
  { icon: ShieldCheck, title: 'Aman & Privat', text: 'Tidak ada rekaman tanpa izin. Obrolan tidak disimpan oleh RuangTemu.' },
];

export function FeaturesSection() {
  return (
    <section aria-labelledby="fitur-judul" className="py-14">
      <Container>
        <h2 id="fitur-judul" className="text-xl font-bold text-ink">
          Dibuat sederhana
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brandsoft text-brand-500 dark:text-brand-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-base text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
