import { Link } from 'react-router-dom';
import logoUrl from '@/assets/logo.svg';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** false = tidak berupa tautan (dipakai di ruang rapat agar tak sengaja keluar). */
  asLink?: boolean;
  size?: 'sm' | 'md';
  hideName?: boolean;
  className?: string;
}

export function Logo({ asLink = true, size = 'md', hideName = false, className }: LogoProps) {
  const dimension = size === 'sm' ? 28 : 36;
  const content = (
    <>
      <img src={logoUrl} alt="" width={dimension} height={dimension} className="shrink-0" />
      <span className={cn('font-bold text-ink', size === 'sm' ? 'text-base' : 'text-lg', hideName && 'sr-only')}>{APP_NAME}</span>
    </>
  );
  const classes = cn('inline-flex items-center gap-2', className);

  if (!asLink) {
    return <span className={classes}>{content}</span>;
  }
  return (
    <Link to="/" aria-label={`${APP_NAME} — ke beranda`} className={cn(classes, 'rounded-lg')}>
      {content}
    </Link>
  );
}
