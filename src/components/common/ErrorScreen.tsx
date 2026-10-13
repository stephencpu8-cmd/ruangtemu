import { Link } from 'react-router-dom';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { buttonClasses } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { PageShell } from '@/components/layout/PageShell';
import { MAX_PARTICIPANTS } from '@/lib/constants';
import type { RoomErrorCode } from '@/types';

const CONTENT: Record<RoomErrorCode, { title: string; message: string }> = {
  'invalid-code': { title: 'Ruang tidak ditemukan', message: 'Kode ruang tidak valid atau sudah berakhir.' },
  'not-found': { title: 'Ruang tidak ditemukan', message: 'Kode ruang tidak valid atau sudah berakhir.' },
  full: { title: 'Ruang penuh', message: `Ruang sudah penuh (${MAX_PARTICIPANTS}/${MAX_PARTICIPANTS}).` },
  insecure: { title: 'Koneksi tidak aman', message: 'Aplikasi butuh koneksi aman (HTTPS).' },
  unsupported: { title: 'Browser tidak didukung', message: 'Browser belum mendukung WebRTC.' },
};

/** Layar penuh untuk error tingkat ruang (lihat matriks error di spesifikasi). */
export function ErrorScreen({ kind }: { kind: RoomErrorCode }) {
  const { title, message } = CONTENT[kind];
  return (
    <PageShell>
      <Container className="max-w-xl py-16">
        <ErrorMessage title={title} message={message}>
          <Link to="/" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Kembali
          </Link>
          {kind === 'unsupported' && (
            <a
              href="https://browsehappy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: 'primary', size: 'sm' })}
            >
              Perbarui browser
            </a>
          )}
          {kind === 'insecure' && (
            <Link to="/privasi#bantuan" className={buttonClasses({ variant: 'primary', size: 'sm' })}>
              Info
            </Link>
          )}
        </ErrorMessage>
      </Container>
    </PageShell>
  );
}
