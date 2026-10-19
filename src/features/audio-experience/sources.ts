export const DEFAULT_VOLUME = 0.7;
export const STRING_COUNT = 6;

const FALLBACK_HZ: readonly number[] = [329.63, 246.94, 196, 146.83, 110, 82.41];

export function fallbackFrequency(stringIndex: number): number | null {
  const hz: number | undefined = FALLBACK_HZ[stringIndex - 1];
  return hz ?? null;
}

export function stringAudioPath(stringIndex: number): string {
  const base: string = import.meta.env.BASE_URL;
  const prefix: string = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}audio/guitar/string-${stringIndex}.mp3`;
}
