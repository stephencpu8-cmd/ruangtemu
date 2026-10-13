import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { PageShell } from '@/components/layout/PageShell';
import { buttonClasses } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <PageShell>
      <Container className="py-20 text-center">
        <p className="text-3xl font-bold text-brand-500 dark:text-brand-400" aria-hidden="true">
          404
        </p>
        <h1 className="mt-3 text-xl font-bold text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-base text-muted">Alamat yang Anda buka tidak ada atau sudah dipindahkan.</p>
        <Link to="/" className={buttonClasses({ size: 'lg', className: 'mt-8' })}>
          Kembali ke Beranda
        </Link>
      </Container>
    </PageShell>
  );
}
