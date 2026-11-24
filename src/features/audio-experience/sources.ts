export const DEFAULT_VOLUME = 0.6;
export const STRING_COUNT = 6;

// The MP3 samples are not committed yet, so every fetch would 404. Flip this
// to true after adding public/audio/guitar/string-1.mp3 … string-6.mp3.
export const SAMPLES_ENABLED = false;

// String 1-6 maps to About D3, Experience A2, Skills E2, Projects G3,
// Interests B3, Contact E4.
const FALLBACK_HZ: readonly number[] = [146.83, 110, 82.41, 196, 246.94, 329.63];

export function fallbackFrequency(stringIndex: number): number | null {
  const hz: number | undefined = FALLBACK_HZ[stringIndex - 1];
  return hz ?? null;
}

export function stringAudioPath(stringIndex: number): string {
  const base: string = import.meta.env.BASE_URL;
  const prefix: string = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}audio/guitar/string-${stringIndex}.mp3`;
}
