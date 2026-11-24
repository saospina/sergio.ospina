import { noteNavIntent } from './sections';
import { track } from './track';

function hashTarget(el: Element): string {
  return (el.getAttribute('href') ?? '').replace(/^#/, '');
}

// Elements opt in with data-track plus optional data-track-location and
// data-track-label. One delegated listener covers the whole page.
function onClick(event: MouseEvent): void {
  const target: EventTarget | null = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const string: Element | null = target.closest('a[data-string-index]');
  if (string) {
    const stringIndex: number = Number((string as HTMLElement | SVGElement).dataset.stringIndex);
    const sectionId: string = hashTarget(string);
    if (Number.isInteger(stringIndex)) {
      track('guitar_pluck', {
        string_index: stringIndex,
        section_id: sectionId,
        input: string.closest('[data-string-nav]') ? 'chip' : 'svg',
      });
    }
    noteNavIntent(sectionId, 'guitar');
    return;
  }

  const el: HTMLElement | null = target.closest<HTMLElement>('[data-track]');
  if (!el) {
    return;
  }
  const location: string = el.dataset.trackLocation ?? '';
  const label: string = el.dataset.trackLabel ?? '';

  switch (el.dataset.track) {
    case 'lead':
      track('generate_lead', { method: 'whatsapp', location });
      break;
    case 'cv':
      track('cv_download', { location, file_name: el.getAttribute('download') ?? '' });
      break;
    case 'social':
      track('social_click', { platform: label.toLowerCase(), location });
      break;
    case 'cta':
      track('cta_click', { cta: label });
      noteNavIntent(hashTarget(el), 'cta');
      break;
    case 'next':
      // No event of its own: the next section_view carries via: 'next_link'.
      noteNavIntent(hashTarget(el), 'next_link');
      break;
  }
}

export function trackClicks(): void {
  document.addEventListener('click', onClick);
}
