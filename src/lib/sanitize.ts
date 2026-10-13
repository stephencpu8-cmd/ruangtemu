import { NAME_MAX, NAME_MIN } from '@/lib/constants';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

// Karakter kontrol, zero-width, dan override arah teks (bidi) dibuang.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;

/** Escape HTML — dipakai bila teks pengguna suatu hari disisipkan ke string HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"'`]/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Membersihkan teks pengguna (nama, chat). Semua teks dirender lewat React
 * (otomatis di-escape) dan TIDAK PERNAH lewat dangerouslySetInnerHTML,
 * jadi di sini kita buang karakter berbahaya/tak terlihat dan tanda < >.
 */
export function sanitizeText(value: string, max = 500): string {
  return value.replace(UNSAFE_CHARS, '').replace(/[<>]/g, '').trim().slice(0, max);
}

export function sanitizeName(value: string): string {
  return sanitizeText(value, NAME_MAX * 2).replace(/\s+/g, ' ').slice(0, NAME_MAX).trim();
}

/** Mengembalikan pesan error, atau null bila valid. */
export function validateName(value: string): string | null {
  const clean = sanitizeName(value);
  if (clean.length < NAME_MIN) return `Nama tampilan minimal ${NAME_MIN} karakter.`;
  if (clean.length > NAME_MAX) return `Nama tampilan maksimal ${NAME_MAX} karakter.`;
  return null;
}
