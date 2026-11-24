export interface GuitarAudioEngine {
  initialize(): Promise<void>;
  playString(stringIndex: number): Promise<void>;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  // True when a pluck right now would be heard: not muted, volume above
  // zero, and audio has not failed.
  isAudible(): boolean;
  onUnavailable(listener: () => void): () => void;
  dispose(): Promise<void>;
}
