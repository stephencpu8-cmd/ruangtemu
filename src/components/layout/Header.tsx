import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/layout/Logo';

const linkClass =
  'inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-brandsoft';

export function Header() {
  return (
    <header className="border-b border-line bg-surface">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          <Link to="/privasi" className={linkClass}>
            Privasi
          </Link>
          <Link to="/privasi#bantuan" className={linkClass}>
            Bantuan
          </Link>
        </nav>
      </Container>
    </header>
  );
}
