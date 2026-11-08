import type { GuitarAudioEngine } from './types';

const AUDIO_UNAVAILABLE = 'Sound is unavailable. You can still read each section.';
const STORAGE_KEY = 'sergio-ospina:sound';

type StoredSound = {
  volume: number;
  muted: boolean;
};

// Storage can be blocked or hold junk, so every read and write is guarded.
function readStored(): StoredSound | null {
  try {
    const raw: string | null = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    const { volume, muted } = parsed as Partial<Record<keyof StoredSound, unknown>>;
    if (typeof volume !== 'number' || !Number.isFinite(volume) || typeof muted !== 'boolean') {
      return null;
    }
    return { volume: Math.min(100, Math.max(0, volume)), muted };
  } catch {
    return null;
  }
}

function writeStored(value: StoredSound): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Remembering the setting is a convenience; the controls work without it.
  }
}

export function bindAudioControls(root: HTMLElement, engine: GuitarAudioEngine): () => void {
  const slider: HTMLInputElement | null = root.querySelector<HTMLInputElement>('[data-volume]');
  const mute: HTMLButtonElement | null = root.querySelector<HTMLButtonElement>('[data-mute]');
  const status: HTMLElement | null = root.querySelector<HTMLElement>('[data-audio-status]');
  const iconOn: SVGElement | null = root.querySelector<SVGElement>('[data-icon-on]');
  const iconOff: SVGElement | null = root.querySelector<SVGElement>('[data-icon-off]');
  root.hidden = false;

  const stopUnavailable: () => void = engine.onUnavailable((): void => {
    if (!status || status.textContent === AUDIO_UNAVAILABLE) {
      return;
    }
    status.textContent = AUDIO_UNAVAILABLE;
    status.hidden = false;
  });

  const stored: StoredSound | null = readStored();
  if (slider && stored) {
    slider.value = String(stored.volume);
  }
  let muted: boolean = stored?.muted ?? false;

  function currentVolume(): number {
    return Number(slider?.value ?? 60);
  }

  function renderMute(): void {
    mute?.setAttribute('aria-pressed', String(muted));
    mute?.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    iconOn?.toggleAttribute('hidden', muted);
    iconOff?.toggleAttribute('hidden', !muted);
  }

  engine.setVolume(currentVolume() / 100);
  if (muted) {
    engine.mute();
  }
  renderMute();

  function onVolume(): void {
    engine.setVolume(currentVolume() / 100);
    writeStored({ volume: currentVolume(), muted });
  }

  function onMute(): void {
    muted = !muted;
    if (muted) {
      engine.mute();
    } else {
      engine.unmute();
    }
    renderMute();
    writeStored({ volume: currentVolume(), muted });
  }

  slider?.addEventListener('input', onVolume);
  mute?.addEventListener('click', onMute);

  return (): void => {
    stopUnavailable();
    slider?.removeEventListener('input', onVolume);
    mute?.removeEventListener('click', onMute);
  };
}
