import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { PageShell } from '@/components/layout/PageShell';
import { TEXT } from '@/lib/constants';

export default function PrivacyPage() {
  const { hash } = useLocation();

  // Router tidak otomatis scroll ke #anchor.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <PageShell>
      <Container className="max-w-3xl space-y-10 py-12">
        <section aria-labelledby="privasi">
          <h1 id="privasi" className="text-2xl font-bold text-ink">
            Privasi
          </h1>
          <p className="mt-4 text-base text-ink">{TEXT.privacyFooter} Komunikasi tidak disimpan.</p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base text-ink">
            <li>Video dan audio dikirim langsung antar peserta (WebRTC, terenkripsi) dan tidak melewati server RuangTemu.</li>
            <li>Server sinyal hanya meneruskan data koneksi, obrolan, nama tampilan, serta status mikrofon/kamera. Server contoh ini tidak menyimpan apa pun ke disk atau database.</li>
            <li>Untuk menemukan rute koneksi, browser Anda menghubungi server STUN (bawaan: milik Google), yang dapat melihat alamat IP Anda.</li>
            <li>Nama tampilan disimpan sementara di sessionStorage agar tidak hilang saat halaman dimuat ulang. Data ini terhapus saat tab ditutup atau Anda keluar dari rapat.</li>
            <li>Pilihan tema dan &quot;kurangi animasi&quot; disimpan di localStorage browser Anda.</li>
            <li>Aplikasi tidak menyimpan token atau kata sandi di sisi klien.</li>
          </ul>
          <p className="mt-4 rounded-xl bg-brandsoft px-4 py-3 text-sm text-ink">
            Siapa pun yang tahu kode ruang bisa bergabung. Bagikan tautan hanya kepada orang yang Anda percaya.
          </p>
        </section>

        <section id="bantuan" aria-labelledby="bantuan-judul">
          <h2 id="bantuan-judul" className="text-xl font-bold text-ink">
            Bantuan
          </h2>
          <dl className="mt-4 space-y-5 text-base">
            <div>
              <dt className="font-semibold text-ink">Akses kamera/mikrofon ditolak</dt>
              <dd className="mt-1 text-muted">
                Klik ikon gembok di sebelah alamat situs, izinkan Kamera dan Mikrofon, lalu tekan &quot;Coba Lagi&quot;.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Kamera sedang dipakai aplikasi lain</dt>
              <dd className="mt-1 text-muted">Tutup aplikasi lain yang memakai kamera (mis. aplikasi rapat lain), lalu coba lagi.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">&quot;Aplikasi butuh koneksi HTTPS&quot;</dt>
              <dd className="mt-1 text-muted">
                Browser hanya mengizinkan kamera/mikrofon di situs HTTPS atau di localhost. Buka lewat alamat https:// yang valid.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Perangkat tidak terdeteksi</dt>
              <dd className="mt-1 text-muted">Pastikan kamera/mikrofon terpasang, lalu pilih perangkat yang benar di Pengaturan.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Pintasan keyboard di ruang rapat</dt>
              <dd className="mt-1 text-muted">M = mikrofon, V = kamera, S = berbagi layar, C = obrolan, P = peserta, F = layar penuh untuk layar yang dibagikan, Esc = tutup panel.</dd>
            </div>
          </dl>
        </section>
      </Container>
    </PageShell>
  );
}
