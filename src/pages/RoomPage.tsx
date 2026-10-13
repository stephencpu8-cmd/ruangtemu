import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ErrorScreen } from '@/components/common/ErrorScreen';
import { RoomLayout } from '@/components/room/RoomLayout';
import { isValidRoomCode, normalizeRoomCode } from '@/lib/roomCode';
import { sanitizeName, validateName } from '@/lib/sanitize';
import { loadSession } from '@/lib/session';
import { getEnvironmentError } from '@/services/mediaService';
import type { PreviewState } from '@/types';

interface RoomNavState extends PreviewState {
  displayName?: string;
}

export default function RoomPage() {
  const { kodeRuang } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();

  const code = normalizeRoomCode(kodeRuang ?? '');
  const state = location.state as RoomNavState | null;
  const session = loadSession(code);

  // Nama dari state navigasi -> query (?nama=) -> sessionStorage (tahan refresh).
  const displayName = sanitizeName(state?.displayName ?? params.get('nama') ?? session?.displayName ?? '');
  const isHost = state?.isHost ?? session?.isHost ?? false;

  if (!isValidRoomCode(code)) return <ErrorScreen kind="invalid-code" />;
  const environmentError = getEnvironmentError();
  if (environmentError) return <ErrorScreen kind={environmentError} />;

  // Tanpa nama valid -> arahkan ke pratinjau dulu.
  if (validateName(displayName)) return <Navigate to={`/pratinjau/${code}`} replace />;

  return <RoomLayout roomCode={code} displayName={displayName} isHost={isHost} />;
}
