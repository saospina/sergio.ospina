import { watchActiveSection } from '../profile/watch-active-section';
import { track, type NavVia } from './track';

// How long a section must stay active, with the tab visible, to count as read.
const READ_AFTER_MS = 8000;
// A click's intent only applies to a section_view that follows it this fast.
const INTENT_WINDOW_MS = 5000;

type NavIntent = { target: string; via: NavVia; at: number };

let intent: NavIntent | null = null;
let hasInteracted: boolean = false;
let currentSection: string = '';

// Called by the click tracker before the browser scrolls to the target.
export function noteNavIntent(target: string, via: NavVia): void {
  if (target) {
    intent = { target, via, at: performance.now() };
  }
}

function viaFor(sectionId: string): NavVia {
  const pending: NavIntent | null = intent;
  if (pending && pending.target === sectionId && performance.now() - pending.at < INTENT_WINDOW_MS) {
    intent = null;
    return pending.via;
  }
  return hasInteracted ? 'scroll' : 'landing';
}

export function trackSections(): void {
  const viewed: Set<string> = new Set();
  const read: Set<string> = new Set();
  let readTimer: number | undefined;

  const markInteracted = (): void => {
    hasInteracted = true;
  };
  for (const type of ['scroll', 'pointerdown', 'keydown'] as const) {
    window.addEventListener(type, markInteracted, { once: true, passive: true });
  }

  const startReadTimer = (): void => {
    window.clearTimeout(readTimer);
    const sectionId: string = currentSection;
    if (!sectionId || read.has(sectionId) || document.visibilityState !== 'visible') {
      return;
    }
    readTimer = window.setTimeout((): void => {
      read.add(sectionId);
      track('section_read', { section_id: sectionId });
    }, READ_AFTER_MS);
  };

  watchActiveSection((sectionId: string): void => {
    if (!viewed.has(sectionId)) {
      viewed.add(sectionId);
      track('section_view', { section_id: sectionId, via: viaFor(sectionId) });
    }
    if (sectionId !== currentSection) {
      currentSection = sectionId;
      startReadTimer();
    }
  });

  // Hidden tabs pause reading; coming back restarts the full window.
  document.addEventListener('visibilitychange', startReadTimer);

  let printed: boolean = false;
  window.addEventListener('beforeprint', (): void => {
    if (printed) {
      return;
    }
    printed = true;
    track('print', { section_id: currentSection });
  });
}
