import type { SignalData } from '@/services/signalingService';

/**
 * WebRTC P2P mesh: setiap peserta punya satu RTCPeerConnection ke tiap peserta lain.
 * Peserta BARU yang membuat offer ke peserta lama (menghindari tabrakan offer).
 * Video/audio dikirim langsung antar browser (terenkripsi DTLS-SRTP), tidak lewat server.
 *
 * Untuk ruang besar (> ~6 orang) ganti dengan SFU (LiveKit / mediasoup): cukup
 * implementasikan ulang kelas ini dengan API yang sama.
 */

const DEFAULT_ICE: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

export function getIceServers(): RTCIceServer[] {
  const raw = import.meta.env.VITE_ICE_SERVERS;
  if (!raw) return DEFAULT_ICE;
  try {
    const parsed = JSON.parse(raw) as RTCIceServer[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ICE;
  } catch {
    return DEFAULT_ICE;
  }
}

export interface PeerCallbacks {
  onSignal: (to: string, data: SignalData) => void;
  onRemoteStream: (id: string, stream: MediaStream) => void;
}

interface Peer {
  pc: RTCPeerConnection;
  stream: MediaStream;
  pending: RTCIceCandidateInit[];
  remoteSet: boolean;
}

export class PeerManager {
  private peers = new Map<string, Peer>();
  private local: MediaStream | null = null;
  private screenTrack: MediaStreamTrack | null = null;

  constructor(
    private readonly callbacks: PeerCallbacks,
    private readonly iceServers: RTCIceServer[] = getIceServers(),
  ) {}

  private audioTrack(): MediaStreamTrack | null {
    return this.local?.getAudioTracks()[0] ?? null;
  }

  /** Saat berbagi layar, track layar menggantikan track kamera. */
  private videoTrack(): MediaStreamTrack | null {
    return this.screenTrack ?? this.local?.getVideoTracks()[0] ?? null;
  }

  private createPeer(id: string): Peer {
    this.closePeer(id);
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    const peer: Peer = { pc, stream: new MediaStream(), pending: [], remoteSet: false };

    pc.onicecandidate = (event) => {
      if (event.candidate) this.callbacks.onSignal(id, { kind: 'candidate', candidate: event.candidate.toJSON() });
    };
    pc.ontrack = (event) => {
      if (!peer.stream.getTracks().includes(event.track)) peer.stream.addTrack(event.track);
      // Objek baru tiap kali agar React & analyser audio ikut diperbarui.
      this.callbacks.onRemoteStream(id, new MediaStream(peer.stream.getTracks()));
    };

    this.peers.set(id, peer);
    return peer;
  }

  /** Dipanggil untuk setiap peserta yang sudah ada saat kita baru masuk. */
  async callPeer(id: string): Promise<void> {
    const peer = this.createPeer(id);
    peer.pc.addTransceiver(this.audioTrack() ?? 'audio', { direction: 'sendrecv' });
    peer.pc.addTransceiver(this.videoTrack() ?? 'video', { direction: 'sendrecv' });
    const offer = await peer.pc.createOffer();
    await peer.pc.setLocalDescription(offer);
    this.callbacks.onSignal(id, { kind: 'offer', sdp: offer.sdp ?? '' });
  }

  async handleSignal(from: string, data: SignalData): Promise<void> {
    if (data.kind === 'offer') {
      const peer = this.createPeer(from);
      await peer.pc.setRemoteDescription({ type: 'offer', sdp: data.sdp });
      peer.remoteSet = true;
      for (const transceiver of peer.pc.getTransceivers()) {
        transceiver.direction = 'sendrecv';
        const track = transceiver.receiver.track.kind === 'audio' ? this.audioTrack() : this.videoTrack();
        if (track) await transceiver.sender.replaceTrack(track);
      }
      const answer = await peer.pc.createAnswer();
      await peer.pc.setLocalDescription(answer);
      this.callbacks.onSignal(from, { kind: 'answer', sdp: answer.sdp ?? '' });
      await this.flushCandidates(peer);
      return;
    }

    const peer = this.peers.get(from);
    if (!peer) return;
    if (data.kind === 'answer') {
      await peer.pc.setRemoteDescription({ type: 'answer', sdp: data.sdp });
      peer.remoteSet = true;
      await this.flushCandidates(peer);
    } else if (data.kind === 'candidate') {
      if (peer.remoteSet) {
        await peer.pc.addIceCandidate(data.candidate).catch(() => undefined);
      } else {
        peer.pending.push(data.candidate); // tunggu remote description
      }
    }
  }

  private async flushCandidates(peer: Peer): Promise<void> {
    const queued = peer.pending.splice(0);
    for (const candidate of queued) await peer.pc.addIceCandidate(candidate).catch(() => undefined);
  }

  /** Ganti stream lokal (mis. setelah ganti kamera) tanpa negosiasi ulang. */
  setLocalStream(stream: MediaStream | null): void {
    this.local = stream;
    this.applyTracks();
  }

  setScreenTrack(track: MediaStreamTrack | null): void {
    this.screenTrack = track;
    this.applyTracks();
  }

  private applyTracks(): void {
    this.peers.forEach((peer) => {
      for (const transceiver of peer.pc.getTransceivers()) {
        const kind = transceiver.receiver.track.kind;
        void transceiver.sender.replaceTrack(kind === 'audio' ? this.audioTrack() : this.videoTrack()).catch(() => undefined);
      }
    });
  }

  removePeer(id: string): void {
    this.closePeer(id);
  }

  private closePeer(id: string): void {
    const peer = this.peers.get(id);
    if (!peer) return;
    peer.pc.onicecandidate = null;
    peer.pc.ontrack = null;
    peer.pc.close();
    this.peers.delete(id);
  }

  closeAll(): void {
    [...this.peers.keys()].forEach((id) => this.closePeer(id));
  }
}