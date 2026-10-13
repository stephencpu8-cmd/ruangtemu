export const APP_NAME = 'RuangTemu';
export const APP_VERSION = '0.2.0';

/** P2P mesh: tiap peserta mengirim video ke semua peserta lain, jadi dibatasi kecil. */
export const MAX_PARTICIPANTS = 6;
export const NAME_MIN = 2;
export const NAME_MAX = 40;
export const ROOM_CODE_MIN = 3;
export const ROOM_CODE_MAX = 40;

export const CHAT_MAX_LENGTH = 500;
export const CHAT_RATE_LIMIT = 5; // pesan
export const CHAT_RATE_WINDOW_MS = 1000; // per detik
export const MAX_CHAT_HISTORY = 200;

export const MAX_RECONNECT_ATTEMPTS = 5;
export const SPEAKING_THRESHOLD = 0.12;

export const REACTIONS = ['👍', '👏', '😂', '😮', '❤️', '🎉'] as const;

export const STORAGE_KEYS = {
  session: 'ruangtemu.session',
  prefs: 'ruangtemu.prefs',
} as const;

/** Warna avatar — semuanya lolos kontras >= 4.5:1 dengan teks putih. */
export const AVATAR_COLORS = ['#1E6FF2', '#142B52', '#1A7F5A', '#7A3FD1', '#B45309', '#0F766E', '#BE185D'] as const;

export const TEXT = {
  privacyShort: 'Tidak ada rekaman tanpa izin.',
  privacyFooter: 'RuangTemu tidak merekam audio/video tanpa izin.',
  privacyRoom: 'RuangTemu tidak merekam. Komunikasi tidak disimpan.',
  permissionIntro: 'RuangTemu butuh akses kamera & mikrofon untuk pratinjau. Kami tidak merekam atau menyimpan.',
} as const;
