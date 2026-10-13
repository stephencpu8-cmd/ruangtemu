import { STORAGE_KEYS } from '@/lib/constants';
import { sanitizeName } from '@/lib/sanitize';
import type { RoomSession } from '@/types';

/** Hanya menyimpan kode ruang, nama tampilan, dan status host. Tidak ada token/password. */
export function saveSession(session: RoomSession): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  } catch {
    /* storage bisa diblokir; abaikan */
  }
}

export function loadSession(roomCode?: string): RoomSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<RoomSession>;
    if (typeof data.roomCode !== 'string' || typeof data.displayName !== 'string') return null;
    if (roomCode && data.roomCode !== roomCode) return null;
    return { roomCode: data.roomCode, displayName: sanitizeName(data.displayName), isHost: data.isHost === true };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.session);
  } catch {
    /* abaikan */
  }
}
