import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorMessage } from '@/components/common/ErrorMessage';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // Sengaja tidak mencatat error ke console agar tidak membocorkan data sensitif.
  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    /* TODO: kirim ke layanan pelaporan error (tanpa data pengguna) bila sudah ada */
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center p-6">
        <ErrorMessage
          title="Terjadi kesalahan"
          message="Aplikasi mengalami masalah tak terduga. Muat ulang halaman untuk mencoba lagi."
          actionLabel="Muat Ulang"
          onAction={() => window.location.assign('/')}
        />
      </div>
    );
  }
}
