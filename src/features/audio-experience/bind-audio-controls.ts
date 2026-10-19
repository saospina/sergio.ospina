import type { GuitarAudioEngine } from './types';

const AUDIO_UNAVAILABLE = 'Sound is unavailable. You can still read each section.';

export function bindAudioControls(root: HTMLElement, engine: GuitarAudioEngine): () => void {
  const slider: HTMLInputElement | null = root.querySelector<HTMLInputElement>('[data-volume]');
  const mute: HTMLButtonElement | null = root.querySelector<HTMLButtonElement>('[data-mute]');
  const status: HTMLElement | null = root.querySelector<HTMLElement>('[data-audio-status]');
  root.hidden = false;

  const stopUnavailable: () => void = engine.onUnavailable((): void => {
    if (!status || status.textContent === AUDIO_UNAVAILABLE) {
      return;
    }
    status.textContent = AUDIO_UNAVAILABLE;
    status.hidden = false;
  });

  if (slider) {
    engine.setVolume(Number(slider.value));
  }

  function onVolume(): void {
    if (!slider) {
      return;
    }
    engine.setVolume(Number(slider.value));
  }

  function onMute(): void {
    if (!mute) {
      return;
    }
    const pressed: boolean = mute.getAttribute('aria-pressed') === 'true';
    if (pressed) {
      engine.unmute();
      mute.setAttribute('aria-pressed', 'false');
      mute.textContent = 'Mute';
      return;
    }
    engine.mute();
    mute.setAttribute('aria-pressed', 'true');
    mute.textContent = 'Unmute';
  }

  slider?.addEventListener('input', onVolume);
  mute?.addEventListener('click', onMute);

  return (): void => {
    stopUnavailable();
    slider?.removeEventListener('input', onVolume);
    mute?.removeEventListener('click', onMute);
  };
}
