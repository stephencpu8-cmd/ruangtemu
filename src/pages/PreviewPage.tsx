import { useLocation, useParams } from 'react-router-dom';
import { ErrorScreen } from '@/components/common/ErrorScreen';
import { Container } from '@/components/layout/Container';
import { PageShell } from '@/components/layout/PageShell';
import { PreviewLayout } from '@/components/preview/PreviewLayout';
import { isValidRoomCode, normalizeRoomCode } from '@/lib/roomCode';
import { getEnvironmentError } from '@/services/mediaService';
import type { PreviewState } from '@/types';

export default function PreviewPage() {
  const { kodeRuang } = useParams();
  const location = useLocation();
  const code = normalizeRoomCode(kodeRuang ?? '');
  const state = location.state as PreviewState | null;
  const environmentError = getEnvironmentError();

  if (!isValidRoomCode(code)) return <ErrorScreen kind="invalid-code" />;
  if (environmentError) return <ErrorScreen kind={environmentError} />;

  return (
    <PageShell>
      <Container className="py-8">
        <h1 className="text-xl font-bold text-ink">Cek kamera &amp; mikrofon</h1>
        <p className="mt-1 text-base text-muted">
          Ruang: <code className="rounded-md bg-brandsoft px-1.5 py-0.5 text-sm text-ink">{code}</code>
        </p>
        <div className="mt-6">
          <PreviewLayout roomCode={code} isHost={state?.isHost === true} />
        </div>
      </Container>
    </PageShell>
  );
}
