# RuangTemu

Aplikasi web konferensi video berbahasa Indonesia, **real-time** (WebRTC P2P mesh + server sinyal WebSocket).
Stack: React 18 · Vite · TypeScript · TailwindCSS · React Router v6 · Zustand · lucide-react · Node (`ws`).

## Menjalankan (development)

```bash
npm install
npm run dev:all      # web (http://localhost:5173) + server sinyal (ws://localhost:3001)
```
Atau di dua terminal: `npm run dev` dan `npm run server`.

**Uji cepat di satu komputer:** buka `http://localhost:5173` di dua tab Chrome, buat ruang di tab 1,
salin tautan undangan, buka di tab 2. Beda browser (mis. Chrome + Edge) di Windows sering gagal karena
kamera hanya bisa dipakai satu aplikasi — gunakan dua tab di browser yang sama, atau perangkat lain.

**Uji dengan HP / komputer lain:** `getUserMedia` hanya jalan di `localhost` atau **HTTPS**, jadi alamat
`http://192.168.x.x:5173` TIDAK akan bisa memakai kamera. Gunakan tunnel HTTPS untuk web (port 5173)
dan server sinyal (port 3001, isi `VITE_SIGNALING_URL=wss://...` di `.env`), atau deploy ke server ber-HTTPS.

## Cara kerja

- **Server sinyal** (`server/index.js`): mengatur ruang, host (peserta pertama), meneruskan SDP/ICE,
  menyiarkan obrolan/status. Tidak menyimpan apa pun. Batas ruang: `MAX_ROOM_SIZE` (default 6).
- **WebRTC mesh** (`src/services/webrtcService.ts`): tiap peserta terhubung langsung ke semua peserta lain.
  Video/audio tidak melewati server. Cocok untuk ~2–6 orang. Untuk ruang besar, ganti dengan SFU
  (LiveKit / mediasoup) — UI hanya bergantung pada `SignalingService` dan `PeerManager`.
- **Berbagi layar** nyata (`getDisplayMedia`); tidak tersedia di sebagian browser HP.

## Variabel lingkungan

Salin `.env.example` menjadi `.env` bila perlu:

| Variabel | Fungsi |
|---|---|
| `VITE_SIGNALING_URL` | Alamat server sinyal. Kosong = `ws(s)://<host halaman>:3001` |
| `VITE_ICE_SERVERS` | JSON daftar STUN/TURN. Default: STUN Google |

Server: `PORT`, `MAX_ROOM_SIZE`, `ALLOWED_ORIGINS` (daftar origin dipisah koma; **isi di produksi**).

## Hal penting sebelum dipakai publik

1. **TURN.** Hanya dengan STUN, sekitar 10–20% pasangan peserta (jaringan kantor/seluler/NAT ketat) gagal
   tersambung. Pasang server TURN (mis. coturn atau layanan terkelola). Jangan taruh password TURN statis
   di `VITE_ICE_SERVERS` untuk produksi — terbitkan kredensial berumur pendek dari server.
2. **HTTPS/WSS** wajib, dan aktifkan SPA fallback (semua path -> `index.html`).
3. **Siapa pun yang tahu kode ruang bisa masuk.** Kode acak (kata-sifat-kata-benda-angka) mudah ditebak;
   untuk produksi gunakan kode panjang dari server atau tambahkan kata sandi ruang.
4. **Moderasi host** (mute/kick) masih tombol "segera hadir"; status Host ditentukan server tetapi belum
   memberi kewenangan apa pun.
5. Tidak ada autentikasi pengguna; `ALLOWED_ORIGINS` dan rate limit chat (5 pesan/detik) hanya perlindungan dasar.

## Struktur

- `server/index.js` — server sinyal
- `src/services/` — `mediaService`, `signalingService` (klien WS), `webrtcService` (PeerManager mesh)
- `src/hooks/` — `useLocalMedia`, `useSignaling`, `useRoomState`, `useAudioLevel`, dll.
- `src/store/` — Zustand: `uiStore`, `mediaStore`, `roomStore`
- `src/components/` — `ui`, `home`, `preview`, `room`, `layout`, `common`
- `src/styles/tokens.css` — token warna & tipografi (termasuk mode gelap)

Pintasan: `M` mikrofon · `V` kamera · `S` berbagi layar · `C` obrolan · `P` peserta · `F` layar penuh (layar yang dibagikan orang lain) · `Esc` tutup.
