import { ROOM_CODE_MAX, ROOM_CODE_MIN } from '@/lib/constants';

const ADJECTIVES = [
  'cerah', 'ramah', 'tenang', 'hangat', 'segar', 'cepat', 'santai', 'bijak', 'ceria', 'jernih',
  'lincah', 'mantap', 'rapi', 'sejuk', 'terang', 'damai', 'gesit', 'lembut', 'kreatif', 'sigap',
];
const NOUNS = [
  'bulan', 'pelangi', 'sungai', 'gunung', 'pantai', 'bintang', 'embun', 'langit', 'hutan', 'ombak',
  'senja', 'fajar', 'awan', 'taman', 'pulau', 'angin', 'kopi', 'buku', 'lentera', 'layar',
];

export const ROOM_CODE_ERROR = `Kode ruang hanya boleh huruf, angka, dan tanda hubung (${ROOM_CODE_MIN}–${ROOM_CODE_MAX} karakter).`;

const ROOM_CODE_REGEX = new RegExp(`^[a-z0-9-]{${ROOM_CODE_MIN},${ROOM_CODE_MAX}}$`);

function randomInt(max: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

/** Format: kata-sifat-kata-benda-angka, contoh "cerah-bulan-42". */
export function generateRoomCode(): string {
  const adjective = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const noun = NOUNS[randomInt(NOUNS.length)];
  const number = randomInt(90) + 10;
  return `${adjective}-${noun}-${number}`;
}

export function normalizeRoomCode(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidRoomCode(value: string): boolean {
  return ROOM_CODE_REGEX.test(normalizeRoomCode(value));
}

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const LOOKS_LIKE_HOST = /^(localhost(:\d+)?|[\w-]+(\.[\w-]+)*\.[a-z]{2,}(:\d+)?)\//i;

/** Jika input berupa URL, ambil kode ruangnya; selain itu pakai input apa adanya. */
export function extractRoomCode(input: string): string {
  const raw = input.trim();
  if (!raw) return '';
  if (HAS_SCHEME.test(raw) || LOOKS_LIKE_HOST.test(raw)) {
    try {
      const url = new URL(HAS_SCHEME.test(raw) ? raw : `https://${raw}`);
      const segments = url.pathname.split('/').filter(Boolean);
      const idx = segments.findIndex((s) => s === 'pratinjau' || s === 'rapat');
      const segment = idx >= 0 ? segments[idx + 1] : segments[segments.length - 1];
      return normalizeRoomCode(decodeURIComponent(segment ?? ''));
    } catch {
      return normalizeRoomCode(raw);
    }
  }
  return normalizeRoomCode(raw);
}

/** Tautan undangan mengarah ke halaman pratinjau agar tamu mengisi nama dulu. */
export function buildInviteLink(code: string): string {
  return `${window.location.origin}/pratinjau/${code}`;
}
