import { trackClicks } from './clicks';
import { trackErrors, trackWebVitals } from './diagnostics';
import { trackSections } from './sections';

export { trackFirstSound } from './diagnostics';
export { track } from './track';

// Single entry point for page-level analytics. Every listener is passive and
// every event is a no-op when gtag is absent.
export function initAnalytics(): void {
  trackErrors();
  trackClicks();
  trackSections();
  trackWebVitals();
}
