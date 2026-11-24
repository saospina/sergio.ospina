import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';
import { track } from './track';

const MAX_EXCEPTIONS = 5;
// GA4 truncates event parameter values at 100 characters.
const MAX_DESCRIPTION = 100;

export function trackErrors(): void {
  const sent: Set<string> = new Set();
  const report = (description: string): void => {
    const text: string = description.slice(0, MAX_DESCRIPTION);
    if (!text || sent.has(text) || sent.size >= MAX_EXCEPTIONS) {
      return;
    }
    sent.add(text);
    track('exception', { description: text, fatal: false });
  };

  window.addEventListener('error', (event: ErrorEvent): void => {
    // Cross-origin scripts (extensions, gtag) report only "Script error.".
    if (!event.filename || event.message === 'Script error.') {
      return;
    }
    const file: string = event.filename.split('/').pop() ?? '';
    report(`${event.message} @ ${file}:${event.lineno}`);
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent): void => {
    const reason: unknown = event.reason;
    report(`Unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
  });
}

function sendVital(metric: Metric): void {
  track('web_vital', {
    metric_name: metric.name,
    // CLS is a small unitless score; scale it so GA keeps the precision.
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
  });
}

export function trackWebVitals(): void {
  onLCP(sendVital);
  onINP(sendVital);
  onCLS(sendVital);
}

let firstSoundSent: boolean = false;

// Reports the first string actually heard (not muted) on this page load.
export function trackFirstSound(): void {
  if (firstSoundSent) {
    return;
  }
  const mute: Element | null = document.querySelector('[data-mute]');
  if (mute?.getAttribute('aria-pressed') === 'true') {
    return;
  }
  firstSoundSent = true;
  track('sound_first_play', {});
}
