import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Catatan: getUserMedia hanya jalan di localhost atau HTTPS.
// Untuk uji di HP via jaringan lokal, pakai HTTPS (mis. tunnel) — lihat README.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173 },
});
