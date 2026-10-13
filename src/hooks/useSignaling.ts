import { useEffect } from 'react';
import { receiveChatMessage } from '@/lib/chat';
import { sanitizeName } from '@/lib/sanitize';
import { PeerManager } from '@/services/webrtcService';
import { createSignalingService, type PeerInfo, type SignalingService } from '@/services/signalingService';
import { useMediaStore } from '@/store/mediaStore';
import { useRoomStore } from '@/store/roomStore';
import type { Participant } from '@/types';

/** Koneksi aktif (satu per ruang) — dipakai fungsi kirim di bawah. */
let active: { signaling: SignalingService; peers: PeerManager } | null = null;

export function sendChat(text: string): void {
  active?.signaling.emit('chat', { text });
}

export function sendReaction(emoji: string): void {
  active?.signaling.emit('reaction', { emoji });
}

export function sendState(): void {
  const m = useMediaStore.getState();
  active?.signaling.emit('state', {
    micOn: m.micOn,
    camOn: m.camOn,
    handRaised: m.handRaised,
    sharing: m.sharingScreen,
  });
}

export function reconnectSignaling(): void {
  active?.signaling.reconnect();
}

function toParticipant(peer: PeerInfo): Participant {
  return {
    id: peer.id,
    name: sanitizeName(peer.name) || 'Peserta',
    isSelf: false,
    isHost: peer.isHost === true,
    micOn: peer.micOn !== false,
    camOn: peer.camOn !== false,
    handRaised: peer.handRaised === true,
    speaking: false,
    sharing: peer.sharing === true,
    reaction: null,
  };
}

/**
 * Menghubungkan ruang ke server sinyal + WebRTC mesh:
 *  - peserta baru -> kita yang dipanggil; peserta lama -> kita yang memanggil
 *  - stream jauh, obrolan, status, reaksi, host masuk ke roomStore
 */
export function useSignaling(roomCode: string, displayName: string): void {
  const localStream = useMediaStore((s) => s.localStream);
  const screenStream = useMediaStore((s) => s.screenStream);
  const micOn = useMediaStore((s) => s.micOn);
  const camOn = useMediaStore((s) => s.camOn);
  const handRaised = useMediaStore((s) => s.handRaised);
  const sharingScreen = useMediaStore((s) => s.sharingScreen);

  useEffect(() => {
    const room = () => useRoomStore.getState();
    const signaling = createSignalingService();
    const peers = new PeerManager({
      onSignal: (to, data) => signaling.emit('signal', { to, data }),
      onRemoteStream: (id, stream) => room().setRemoteStream(id, stream),
    });
    active = { signaling, peers };

    const media = useMediaStore.getState();
    peers.setLocalStream(media.localStream);
    peers.setScreenTrack(media.screenStream?.getVideoTracks()[0] ?? null);

    signaling.on('connection-state', ({ state, attempt }) => room().setConnectionState(state, attempt));

    signaling.on('joined', ({ isHost, peers: existing }) => {
      // Setelah (re)connect, mulai dari nol agar tidak ada peserta/stream basi.
      peers.closeAll();
      room().clearRemotes();
      room().setSelfHost(isHost === true);
      existing.forEach((p) => {
        room().addParticipant(toParticipant(p));
        void peers.callPeer(p.id).catch(() => undefined);
      });
      sendState();
    });

    signaling.on('peer-joined', ({ peer }) => room().addParticipant(toParticipant(peer)));
    signaling.on('peer-left', ({ id }) => {
      peers.removePeer(id);
      room().removeParticipant(id);
    });
    signaling.on('signal', ({ from, data }) => {
      void peers.handleSignal(from, data).catch(() => undefined);
    });
    signaling.on('chat', (m) =>
      receiveChatMessage({ id: m.id, senderId: m.from, senderName: m.name, text: m.text, timestamp: m.ts }),
    );
    signaling.on('peer-state', ({ id, micOn: mic, camOn: cam, handRaised: hand, sharing }) => {
      const before = room().participants.find((p) => p.id === id);
      room().updateParticipant(id, { micOn: mic, camOn: cam, handRaised: hand, sharing });
      // Pembagi layar otomatis di-pin agar tampil besar; dilepas saat berhenti berbagi.
      if (sharing && !before?.sharing && room().pinnedId === null) room().togglePin(id);
      if (!sharing && before?.sharing && room().pinnedId === id) room().togglePin(id);
    });
    signaling.on('reaction', ({ id, emoji }) => {
      room().updateParticipant(id, { reaction: emoji.slice(0, 8) });
      window.setTimeout(() => room().updateParticipant(id, { reaction: null }), 3000);
    });
    signaling.on('host', ({ id }) => room().applyHost(id));
    signaling.on('error', ({ code }) => room().setRoomError(code === 'full' ? 'full' : 'invalid-code'));

    void signaling
      .connect(roomCode, { name: displayName, micOn: media.micOn, camOn: media.camOn })
      .catch(() => undefined); // percobaan ulang ditangani service

    return () => {
      active = null;
      signaling.disconnect();
      peers.closeAll();
    };
  }, [roomCode, displayName]);

  // Ganti kamera/mikrofon -> kirim track baru ke semua peserta.
  useEffect(() => {
    active?.peers.setLocalStream(localStream);
  }, [localStream]);

  // Mulai/berhenti berbagi layar.
  useEffect(() => {
    active?.peers.setScreenTrack(screenStream?.getVideoTracks()[0] ?? null);
  }, [screenStream]);

  // Siarkan status mic/kamera/tangan/layar ke peserta lain.
  useEffect(() => {
    sendState();
  }, [micOn, camOn, handRaised, sharingScreen]);
}
