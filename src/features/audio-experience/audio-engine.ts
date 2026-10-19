import {
  DEFAULT_VOLUME,
  STRING_COUNT,
  fallbackFrequency,
  stringAudioPath,
} from './sources';
import type { GuitarAudioEngine } from './types';

const PLUCK_SECONDS = 0.55;

class WebGuitarAudio implements GuitarAudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume = DEFAULT_VOLUME;
  private muted = false;
  private failed = false;
  private disposed = false;
  private readonly unavailableListeners = new Set<() => void>();
  private initTask: Promise<void> | null = null;
  private abort = new AbortController();
  private readonly buffers = new Map<number, AudioBuffer>();
  private readonly unavailable = new Set<number>();
  private readonly loading = new Map<number, Promise<void>>();
  private readonly active = new Set<AudioScheduledSourceNode>();

  initialize(): Promise<void> {
    if (this.disposed) {
      return Promise.resolve();
    }
    if (!this.initTask) {
      this.initTask = this.loadAll();
    }
    return this.initTask;
  }

  playString(stringIndex: number): Promise<void> {
    try {
      this.ensureContext();
      this.schedule(stringIndex);
      void this.initialize();
    } catch {
      this.markFailed();
    }
    return Promise.resolve();
  }

  setVolume(volume: number): void {
    if (!Number.isFinite(volume)) {
      return;
    }
    this.volume = Math.min(1, Math.max(0, volume));
    this.applyGain();
  }

  mute(): void {
    this.muted = true;
    this.applyGain();
  }

  unmute(): void {
    this.muted = false;
    try {
      this.ensureContext();
    } catch {
      this.markFailed();
    }
    this.applyGain();
  }

  onUnavailable(listener: () => void): () => void {
    this.unavailableListeners.add(listener);
    if (this.failed) {
      listener();
    }
    return (): void => {
      this.unavailableListeners.delete(listener);
    };
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.abort.abort();
    for (const source of this.active) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        source.disconnect();
      }
    }
    this.active.clear();
    this.master?.disconnect();
    this.master = null;
    const context: AudioContext | null = this.context;
    this.context = null;
    this.buffers.clear();
    this.loading.clear();
    if (context && context.state !== 'closed') {
      await context.close();
    }
  }

  private async loadAll(): Promise<void> {
    if (!this.ensureContext()) {
      return;
    }
    const loads: Promise<void>[] = [];
    for (let index = 1; index <= STRING_COUNT; index += 1) {
      loads.push(this.loadString(index));
    }
    await Promise.all(loads);
  }

  private ensureContext(): AudioContext | null {
    if (this.disposed || this.failed) {
      return null;
    }
    if (this.context?.state === 'closed') {
      this.markFailed();
      return null;
    }
    if (!this.context) {
      if (typeof window.AudioContext !== 'function') {
        this.markFailed();
        return null;
      }
      try {
        this.context = new window.AudioContext();
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.applyGain();
      } catch {
        this.markFailed();
        this.context = null;
        this.master = null;
        return null;
      }
    }
    if (this.context.state === 'suspended') {
      void this.context.resume().catch(() => {
        this.markFailed();
      });
    }
    return this.context;
  }

  private markFailed(): void {
    if (this.disposed || this.failed) {
      return;
    }
    this.failed = true;
    for (const listener of this.unavailableListeners) {
      listener();
    }
  }

  private applyGain(): void {
    if (!this.context || !this.master) {
      return;
    }
    const value: number = this.muted ? 0 : this.volume;
    this.master.gain.setValueAtTime(value, this.context.currentTime);
  }

  private schedule(stringIndex: number): void {
    if (this.muted || this.failed || this.disposed) {
      return;
    }
    if (!Number.isInteger(stringIndex) || stringIndex < 1 || stringIndex > STRING_COUNT) {
      return;
    }
    const buffer: AudioBuffer | undefined = this.buffers.get(stringIndex);
    if (buffer) {
      this.playBuffer(buffer);
      return;
    }
    this.playSynth(stringIndex);
  }

  private playBuffer(buffer: AudioBuffer): void {
    const context: AudioContext | null = this.context;
    const master: GainNode | null = this.master;
    if (!context || !master) {
      return;
    }
    const source: AudioBufferSourceNode = context.createBufferSource();
    source.buffer = buffer;
    source.connect(master);
    this.track(source);
    source.start();
  }

  private playSynth(stringIndex: number): void {
    const frequency: number | null = fallbackFrequency(stringIndex);
    const context: AudioContext | null = this.context;
    const master: GainNode | null = this.master;
    if (frequency === null || !context || !master) {
      return;
    }
    const now: number = context.currentTime;
    const oscillator: OscillatorNode = context.createOscillator();
    const envelope: GainNode = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency * 1.02, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.08);
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.exponentialRampToValueAtTime(0.45, now + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + PLUCK_SECONDS);
    oscillator.connect(envelope);
    envelope.connect(master);
    this.track(oscillator, envelope);
    oscillator.start(now);
    oscillator.stop(now + PLUCK_SECONDS + 0.02);
  }

  private track(source: AudioScheduledSourceNode, extra?: AudioNode): void {
    this.active.add(source);
    source.onended = (): void => {
      this.active.delete(source);
      source.disconnect();
      extra?.disconnect();
    };
  }

  private loadString(stringIndex: number): Promise<void> {
    const pending: Promise<void> | undefined = this.loading.get(stringIndex);
    if (pending) {
      return pending;
    }
    const task: Promise<void> = this.fetchString(stringIndex).finally(() => {
      this.loading.delete(stringIndex);
    });
    this.loading.set(stringIndex, task);
    return task;
  }

  private async fetchString(stringIndex: number): Promise<void> {
    if (
      this.disposed ||
      this.unavailable.has(stringIndex) ||
      this.buffers.has(stringIndex)
    ) {
      return;
    }
    const context: AudioContext | null = this.context;
    if (!context) {
      return;
    }
    try {
      const response: Response = await fetch(stringAudioPath(stringIndex), {
        signal: this.abort.signal,
      });
      if (!response.ok) {
        this.unavailable.add(stringIndex);
        return;
      }
      const data: ArrayBuffer = await response.arrayBuffer();
      if (this.disposed || context.state === 'closed') {
        return;
      }
      const buffer: AudioBuffer = await context.decodeAudioData(data.slice(0));
      this.buffers.set(stringIndex, buffer);
    } catch {
      if (!this.abort.signal.aborted) {
        this.unavailable.add(stringIndex);
      }
    }
  }
}

export const guitarAudio: GuitarAudioEngine = new WebGuitarAudio();
