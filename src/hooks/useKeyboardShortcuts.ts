import { useEffect, useRef } from 'react';

export interface ShortcutHandlers {
  onMic?: () => void;
  onCam?: () => void;
  onShare?: () => void;
  onChat?: () => void;
  onParticipants?: () => void;
  onFullscreen?: () => void;
  onEscape?: () => void;
}

/** M = mic, V = kamera, S = layar, C = obrolan, P = peserta, F = layar penuh, Esc = tutup panel/modal. */
export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true): void {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      if (event.key === 'Escape') {
        // Modal / popover menangani Esc sendiri.
        if (document.querySelector('[data-rt-modal]')) return;
        ref.current.onEscape?.();
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;

      const h = ref.current;
      switch (event.key.toLowerCase()) {
        case 'm':
          event.preventDefault();
          h.onMic?.();
          break;
        case 'v':
          event.preventDefault();
          h.onCam?.();
          break;
        case 's':
          event.preventDefault();
          h.onShare?.();
          break;
        case 'c':
          event.preventDefault();
          h.onChat?.();
          break;
        case 'p':
          event.preventDefault();
          h.onParticipants?.();
          break;
        case 'f':
          event.preventDefault();
          h.onFullscreen?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
