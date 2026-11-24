export type NavVia = 'landing' | 'guitar' | 'cta' | 'next_link' | 'scroll';

type NoParams = Record<string, never>;

// GA4 events sent by the site. Key events (generate_lead, cv_download) are
// marked as such in the GA4 admin UI, not here.
export type AnalyticsEvents = {
  generate_lead: { method: 'whatsapp'; location: string };
  cv_download: { location: string; file_name: string };
  social_click: { platform: string; location: string };
  cta_click: { cta: string };
  section_view: { section_id: string; via: NavVia };
  section_read: { section_id: string };
  guitar_pluck: { string_index: number; section_id: string; input: 'svg' | 'chip' };
  sound_toggle: { muted: boolean };
  sound_first_play: NoParams;
  audio_unavailable: NoParams;
  print: { section_id: string };
  web_vital: {
    metric_name: string;
    metric_value: number;
    metric_rating: string;
    metric_id: string;
  };
  exception: { description: string; fatal: boolean };
};

export type AnalyticsEvent = keyof AnalyticsEvents;

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void;

// gtag is missing in dev builds and when an ad blocker drops the script, so
// tracking is always a silent no-op in that case.
export function track<E extends AnalyticsEvent>(event: E, params: AnalyticsEvents[E]): void {
  const gtag: unknown = (window as { gtag?: unknown }).gtag;
  if (typeof gtag === 'function') {
    (gtag as Gtag)('event', event, params);
  }
}
