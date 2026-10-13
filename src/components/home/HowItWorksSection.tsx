import { Container } from '@/components/layout/Container';

const STEPS = [
  { title: 'Buat ruang', text: 'Ketik nama ruang atau klik acak, lalu tekan Mulai Rapat.' },
  { title: 'Isi nama tampilan', text: 'Nama ini yang dilihat peserta lain di rapat.' },
  { title: 'Cek kamera & mikrofon', text: 'Pastikan gambar dan suara berfungsi sebelum masuk.' },
  { title: 'Bagikan tautan, mulai rapat', text: 'Salin tautan undangan dan kirim ke peserta.' },
];

export function HowItWorksSection() {
  return (
    <section aria-labelledby="cara-judul" className="bg-surface py-14">
      <Container>
        <h2 id="cara-judul" className="text-xl font-bold text-ink">
          Cara kerjanya
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-app p-5">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-base font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
