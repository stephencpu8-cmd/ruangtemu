import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { APP_NAME, TEXT } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="flex flex-col gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">
            {APP_NAME} © {new Date().getFullYear()}
          </p>
          <p className="mt-1 text-xs text-muted">{TEXT.privacyFooter}</p>
        </div>
        <nav aria-label="Tautan kaki halaman" className="flex items-center gap-4 text-sm">
          <Link to="/privasi" className="rt-link">
            Privasi
          </Link>
          <Link to="/privasi#bantuan" className="rt-link">
            Bantuan
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
