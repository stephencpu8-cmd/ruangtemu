import { Camera } from 'lucide-react';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { TEXT } from '@/lib/constants';
import type { MediaError, PermissionState } from '@/types';

interface PermissionBannerProps {
  state: PermissionState;
  error: MediaError | null;
  requesting: boolean;
  onRequest: () => void;
}

export function PermissionBanner({ state, error, requesting, onRequest }: PermissionBannerProps) {
  if (state === 'granted') return null;

  if (state === 'denied' || state === 'error') {
    return (
      <ErrorMessage
        title="Tidak bisa mengakses kamera/mikrofon"
        message={error?.message ?? 'Terjadi kesalahan saat mengakses perangkat.'}
        actionLabel={requesting ? 'Mencoba…' : 'Coba Lagi'}
        onAction={onRequest}
      />
    );
  }

  return (
    <div className="rounded-xl border border-line bg-brandsoft p-4">
      <div className="flex gap-3">
        <Camera className="mt-0.5 h-5 w-5 shrink-0 text-brand-500 dark:text-brand-400" aria-hidden="true" />
        <p className="text-sm text-ink">{TEXT.permissionIntro}</p>
      </div>
      <Button className="mt-3" fullWidth loading={requesting} onClick={onRequest}>
        Izinkan Akses
      </Button>
    </div>
  );
}
