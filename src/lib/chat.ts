import { CHAT_MAX_LENGTH } from '@/lib/constants';
import { sanitizeName, sanitizeText } from '@/lib/sanitize';
import { useRoomStore } from '@/store/roomStore';
import { useUIStore } from '@/store/uiStore';
import type { ChatMessage } from '@/types';

/** Pesan dari peserta lain: dibersihkan dulu, lalu masuk ke store + badge belum dibaca. */
export function receiveChatMessage(message: ChatMessage): void {
  const text = sanitizeText(message.text, CHAT_MAX_LENGTH);
  if (!text) return;
  useRoomStore.getState().addMessage({
    ...message,
    senderName: sanitizeName(message.senderName) || 'Peserta',
    text,
  });
  const ui = useUIStore.getState();
  if (ui.activePanel !== 'chat') ui.incrementUnread();
}
