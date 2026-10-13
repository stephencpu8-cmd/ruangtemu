/**
 * Server sinyal RuangTemu (WebSocket).
 * Tugasnya HANYA: mengelola ruang, meneruskan pesan SDP/ICE antar peserta, dan
 * menyiarkan obrolan + status. Video/audio TIDAK lewat server ini (WebRTC P2P).
 * Tidak ada data yang disimpan ke disk/database.
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT ?? 3001);
const MAX_ROOM_SIZE = Number(process.env.MAX_ROOM_SIZE ?? 6);
// Contoh produksi: ALLOWED_ORIGINS=https://rapat.contoh.id
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ROOM_RE = /^[a-z0-9-]{3,40}$/;
const CHAT_MAX = 500;
const CHAT_LIMIT = 5;
const CHAT_WINDOW_MS = 1000;
const UNSAFE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;

/** @type {Map<string, Map<string, any>>} */
const rooms = new Map();

const http = createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: http, maxPayload: 64 * 1024 });

const clean = (value, max) => String(value ?? '').replace(UNSAFE, '').replace(/[<>]/g, '').trim().slice(0, max);
const send = (ws, payload) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
};
const publicInfo = (c) => ({
  id: c.id,
  name: c.name,
  isHost: c.isHost,
  micOn: c.micOn,
  camOn: c.camOn,
  handRaised: c.handRaised,
  sharing: c.sharing,
});
const broadcast = (room, payload, exceptId) => {
  for (const peer of room.values()) if (peer.id !== exceptId) send(peer.ws, payload);
};
const fail = (client, code, message) => {
  send(client.ws, { type: 'error', code, message });
  client.ws.close(1008, code);
};

function handleJoin(client, msg) {
  if (client.room) return;
  const code = String(msg.room ?? '').trim().toLowerCase();
  const name = clean(msg.name, 40).replace(/\s+/g, ' ');
  if (!ROOM_RE.test(code)) return fail(client, 'invalid-code', 'Kode ruang tidak valid.');
  if (name.length < 2) return fail(client, 'invalid-name', 'Nama tampilan tidak valid.');

  let room = rooms.get(code);
  if (!room) {
    room = new Map();
    rooms.set(code, room);
  }
  if (room.size >= MAX_ROOM_SIZE) return fail(client, 'full', 'Ruang sudah penuh.');

  client.room = code;
  client.name = name;
  client.isHost = room.size === 0; // peserta pertama = host (ditentukan server)
  client.micOn = msg.micOn !== false;
  client.camOn = msg.camOn !== false;

  const peers = [...room.values()].map(publicInfo);
  room.set(client.id, client);
  send(client.ws, { type: 'joined', id: client.id, isHost: client.isHost, peers });
  broadcast(room, { type: 'peer-joined', peer: publicInfo(client) }, client.id);
}

function handle(client, msg) {
  if (msg.type === 'join') return handleJoin(client, msg);
  const room = client.room ? rooms.get(client.room) : null;
  if (!room) return;

  switch (msg.type) {
    case 'signal': {
      const target = room.get(String(msg.to ?? ''));
      if (target && msg.data && typeof msg.data === 'object') {
        send(target.ws, { type: 'signal', from: client.id, data: msg.data });
      }
      break;
    }
    case 'chat': {
      const now = Date.now();
      client.chatTimes = client.chatTimes.filter((t) => now - t < CHAT_WINDOW_MS);
      if (client.chatTimes.length >= CHAT_LIMIT) break; // rate limit di sisi server
      client.chatTimes.push(now);
      const text = clean(msg.text, CHAT_MAX);
      if (!text) break;
      broadcast(room, { type: 'chat', id: randomUUID(), from: client.id, name: client.name, text, ts: now }, client.id);
      break;
    }
    case 'state': {
      client.micOn = msg.micOn !== false;
      client.camOn = msg.camOn !== false;
      client.handRaised = msg.handRaised === true;
      client.sharing = msg.sharing === true;
      broadcast(
        room,
        { type: 'peer-state', id: client.id, micOn: client.micOn, camOn: client.camOn, handRaised: client.handRaised, sharing: client.sharing },
        client.id,
      );
      break;
    }
    case 'reaction': {
      const emoji = String(msg.emoji ?? '').slice(0, 8);
      if (emoji) broadcast(room, { type: 'reaction', id: client.id, emoji }, client.id);
      break;
    }
    default:
      break;
  }
}

function leave(client) {
  if (!client.room) return;
  const code = client.room;
  const room = rooms.get(code);
  client.room = null;
  if (!room) return;
  room.delete(client.id);
  if (room.size === 0) {
    rooms.delete(code);
    return;
  }
  broadcast(room, { type: 'peer-left', id: client.id });
  if (client.isHost) {
    const next = room.values().next().value; // peserta tertua menjadi host
    next.isHost = true;
    broadcast(room, { type: 'host', id: next.id });
  }
}

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    ws.close(1008, 'origin');
    return;
  }
  const client = {
    id: randomUUID(), ws, room: null, name: '', isHost: false,
    micOn: true, camOn: true, handRaised: false, sharing: false, alive: true, chatTimes: [],
  };
  const joinTimer = setTimeout(() => {
    if (!client.room) ws.close(1008, 'join-timeout');
  }, 10_000);

  ws.on('pong', () => {
    client.alive = true;
  });
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (msg && typeof msg.type === 'string') handle(client, msg);
  });
  ws.on('close', () => {
    clearTimeout(joinTimer);
    leave(client);
  });
  ws.on('error', () => {});
  client.ws.__client = client;
});

// Putuskan koneksi yang sudah mati.
setInterval(() => {
  for (const ws of wss.clients) {
    const c = ws.__client;
    if (c && !c.alive) {
      ws.terminate();
      continue;
    }
    if (c) c.alive = false;
    ws.ping();
  }
}, 30_000);

http.listen(PORT, () => {
  console.log(`Server sinyal RuangTemu berjalan di ws://localhost:${PORT} (maks ${MAX_ROOM_SIZE} peserta/ruang)`);
});
