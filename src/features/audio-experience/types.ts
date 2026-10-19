export interface GuitarAudioEngine {
  initialize(): Promise<void>;
  playString(stringIndex: number): Promise<void>;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  onUnavailable(listener: () => void): () => void;
  dispose(): Promise<void>;
}
