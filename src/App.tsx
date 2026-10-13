import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastViewport } from '@/components/ui/Toast';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import PreviewPage from '@/pages/PreviewPage';
import PrivacyPage from '@/pages/PrivacyPage';
import RoomPage from '@/pages/RoomPage';
import { useUIStore } from '@/store/uiStore';

export default function App() {
  const theme = useUIStore((s) => s.theme);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reducedMotion);
  }, [reducedMotion]);

  return (
    <ErrorBoundary>
      <a
        href="#konten"
        className="sr-only z-[70] rounded-xl bg-brand-500 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Lewati ke konten utama
      </a>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pratinjau/:kodeRuang" element={<PreviewPage />} />
        <Route path="/rapat/:kodeRuang" element={<RoomPage />} />
        <Route path="/privasi" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ErrorBoundary>
  );
}
