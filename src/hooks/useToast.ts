import { useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';

export function useToast() {
  const toast = useUIStore((s) => s.pushToast);
  const dismiss = useUIStore((s) => s.dismissToast);
  return useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
}
