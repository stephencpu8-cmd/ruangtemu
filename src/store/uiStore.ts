import { create } from 'zustand';
import { STORAGE_KEYS } from '@/lib/constants';
import { uid } from '@/lib/utils';
import type { PanelId, ToastItem, ToastTone } from '@/types';

type Theme = 'light' | 'dark';

interface Prefs {
  theme: Theme;
  reducedMotion: boolean;
}

function loadPrefs(): Prefs {
  const systemReduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const fallback: Prefs = { theme: 'light', reducedMotion: Boolean(systemReduced) };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.prefs);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<Prefs>;
    return {
      theme: data.theme === 'dark' ? 'dark' : 'light',
      reducedMotion: typeof data.reducedMotion === 'boolean' ? data.reducedMotion : fallback.reducedMotion,
    };
  } catch {
    return fallback;
  }
}

function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(prefs));
  } catch {
    /* abaikan */
  }
}

interface UIState extends Prefs {
  activePanel: PanelId | null;
  toasts: ToastItem[];
  unreadChat: number;
  setTheme: (theme: Theme) => void;
  setReducedMotion: (value: boolean) => void;
  openPanel: (panel: PanelId) => void;
  togglePanel: (panel: PanelId) => void;
  closePanel: () => void;
  pushToast: (message: string, tone?: ToastTone) => string;
  dismissToast: (id: string) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

const initialPrefs = loadPrefs();

export const useUIStore = create<UIState>((set, get) => ({
  ...initialPrefs,
  activePanel: null,
  toasts: [],
  unreadChat: 0,

  setTheme: (theme) => {
    set({ theme });
    savePrefs({ theme, reducedMotion: get().reducedMotion });
  },
  setReducedMotion: (reducedMotion) => {
    set({ reducedMotion });
    savePrefs({ theme: get().theme, reducedMotion });
  },

  openPanel: (panel) => set({ activePanel: panel, unreadChat: panel === 'chat' ? 0 : get().unreadChat }),
  togglePanel: (panel) => {
    const next = get().activePanel === panel ? null : panel;
    set({ activePanel: next, unreadChat: next === 'chat' ? 0 : get().unreadChat });
  },
  closePanel: () => set({ activePanel: null }),

  pushToast: (message, tone = 'info') => {
    const existing = get().toasts.find((t) => t.message === message);
    if (existing) return existing.id; // hindari toast ganda
    const id = uid('toast');
    set((state) => ({ toasts: [...state.toasts.slice(-3), { id, message, tone }] }));
    return id;
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  incrementUnread: () => set((state) => ({ unreadChat: state.unreadChat + 1 })),
  resetUnread: () => set({ unreadChat: 0 }),
}));
