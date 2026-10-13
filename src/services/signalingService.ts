import { MAX_RECONNECT_ATTEMPTS } from '@/lib/constants';
import type { ConnectionState } from '@/types';

/**
 * Klien signaling WebSocket. UI hanya bergantung pada interface `SignalingService`,
 * jadi server/protokol bisa diganti (mis. LiveKit) tanpa mengubah komponen.
 * Protokolnya didefinisikan di server/index.js.
 */

export interface PeerInfo {
  id: string;
  name: string;
  isHost: boolean;
  micOn: boolean;
  camOn: boolean;
  handRaised: boolean;
  sharing: boolean;
}

export type SignalData =
  | { kind: 'offer' | 'answer'; sdp: string }
  | { kind: 'candidate'; candidate: RTCIceCandidateInit };

export interface SignalingEvents {
  joined: { id: string; isHost: boolean; peers: PeerInfo[] };
  'peer-joined': { peer: PeerInfo };
  'peer-left': { id: string };
  signal: { from: string; data: SignalData };
  chat: { id: string; from: string; name: string; text: string; ts: number };
  'peer-state': { id: string; micOn: boolean; camOn: boolean; handRaised: boolean; sharing: boolean };
  reaction: { id: string; emoji: string };
  host: { id: string };
  error: { code: string; message?: string };
  'connection-state': { state: ConnectionState; attempt: number };
}

export type SignalingEventName = keyof SignalingEvents;
export type SignalingOutgoing = 'signal' | 'chat' | 'state' | 'reaction';

export interface SignalingUser {
  name: string;
  micOn: boolean;
  camOn: boolean;
}

export interface SignalingService {
  connect(roomCode: string, user: SignalingUser): Promise<void>;
  disconnect(): void;
  /** Sambung ulang manual (setelah percobaan otomatis habis). */
  reconnect(): void;
  on<K extends SignalingEventName>(event: K, handler: (payload: SignalingEvents[K]) => void): void;
  off<K extends SignalingEventName>(event: K, handler: (payload: SignalingEvents[K]) => void): void;
  emit(type: SignalingOutgoing, payload: Record<string, unknown>): void;
}

const SERVER_EVENTS: SignalingEventName[] = ['joined', 'peer-joined', 'peer-left', 'signal', 'chat', 'peer-state', 'reaction', 'host', 'error'];

export function getSignalingUrl(): string {
  const configured = import.meta.env.VITE_SIGNALING_URL;
  if (configured) return configured;
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${scheme}://${window.location.hostname}:3001`;
}

class WebSocketSignaling implements SignalingService {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<(payload: unknown) => void>>();
  private roomCode = '';
  private user: SignalingUser = { name: '', micOn: true, camOn: true };
  private attempt = 0;
  private stopped = false;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;

  connect(roomCode: string, user: SignalingUser): Promise<void> {
    this.roomCode = roomCode;
    this.user = user;
    this.stopped = false;
    this.attempt = 0;
    this.fire('connection-state', { state: 'connecting', attempt: 0 });
    return this.open();
  }

  disconnect(): void {
    this.stopped = true;
    clearTimeout(this.retryTimer);
    const ws = this.ws;
    this.ws = null;
    ws?.close();
  }

  reconnect(): void {
    clearTimeout(this.retryTimer);
    this.stopped = false;
    this.attempt = 0;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
    this.fire('connection-state', { state: 'connecting', attempt: 0 });
    void this.open().catch(() => undefined);
  }

  on<K extends SignalingEventName>(event: K, handler: (payload: SignalingEvents[K]) => void): void {
    const set = this.handlers.get(event) ?? new Set<(payload: unknown) => void>();
    set.add(handler as (payload: unknown) => void);
    this.handlers.set(event, set);
  }

  off<K extends SignalingEventName>(event: K, handler: (payload: SignalingEvents[K]) => void): void {
    this.handlers.get(event)?.delete(handler as (payload: unknown) => void);
  }

  emit(type: SignalingOutgoing, payload: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ type, ...payload }));
  }

  private fire(event: SignalingEventName, payload: unknown): void {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }

  private open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const ws = new WebSocket(getSignalingUrl());
      this.ws = ws;

      ws.onopen = () => {
        settled = true;
        ws.send(
          JSON.stringify({ type: 'join', room: this.roomCode, name: this.user.name, micOn: this.user.micOn, camOn: this.user.camOn }),
        );
        resolve();
      };
      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') return;
        try {
          this.dispatch(JSON.parse(event.data) as Record<string, unknown>);
        } catch {
          /* pesan rusak diabaikan */
        }
      };
      ws.onclose = () => {
        if (this.ws !== ws) return; // sudah diganti/ditutup sengaja
        this.ws = null;
        if (!settled) {
          settled = true;
          reject(new Error('Tidak bisa terhubung ke server sinyal.'));
        }
        if (!this.stopped) this.scheduleRetry();
      };
      ws.onerror = () => {
        /* onclose menyusul */
      };
    });
  }

  private dispatch(msg: Record<string, unknown>): void {
    const type = msg.type;
    if (typeof type !== 'string' || !SERVER_EVENTS.includes(type as SignalingEventName)) return;
    if (type === 'joined') {
      this.attempt = 0;
      this.fire('connection-state', { state: 'connected', attempt: 0 });
    }
    if (type === 'error') this.stopped = true; // error fatal (mis. ruang penuh): jangan coba lagi
    this.fire(type as SignalingEventName, msg);
  }

  private scheduleRetry(): void {
    if (this.attempt >= MAX_RECONNECT_ATTEMPTS) {
      this.fire('connection-state', { state: 'disconnected', attempt: this.attempt });
      return;
    }
    this.attempt += 1;
    this.fire('connection-state', { state: 'disconnected', attempt: this.attempt });
    this.retryTimer = setTimeout(() => {
      void this.open().catch(() => undefined);
    }, Math.min(1000 * this.attempt, 5000));
  }
}

export function createSignalingService(): SignalingService {
  return new WebSocketSignaling();
}
