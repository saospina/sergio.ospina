import gsap from 'gsap';

export const STRING_TOTAL_S = 0.55;
export const STRING_SWINGS = 4;
export const STRING_AMPLITUDE = 6;
export const STRING_GLOW_PX = 7;
export const CONTENT_Y_PX = 8;
export const CONTENT_FROM_OPACITY = 0.72;
export const CONTENT_S = 0.28;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const STRING_BUTTON = 'button[data-guitar-string]';
const STRING_VISUAL = '[data-string-visual]';
const STRING_PATH = 'path[data-string-path]';
const SECTION = '[data-section-id]';
const REST_PATH = 'M22 1 Q22 50 22 99';

type StringTargets = {
  visual: SVGElement;
  path: SVGPathElement;
};

const stringTargets = new Map<number, StringTargets>();
const sectionTargets = new Map<string, HTMLElement>();
const stringTimelines = new Map<number, gsap.core.Timeline>();
const contentTimelines = new Map<string, gsap.core.Timeline>();

let watchingMotion = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

export function initGuitarMotion(root: HTMLElement): () => void {
  stringTargets.clear();
  sectionTargets.clear();

  const buttons: NodeListOf<HTMLButtonElement> = root.querySelectorAll(STRING_BUTTON);
  for (const button of buttons) {
    const stringIndex: number = Number(button.dataset.stringIndex);
    const visual: Element | null = button.querySelector(STRING_VISUAL);
    const path: Element | null = button.querySelector(STRING_PATH);
    if (Number.isInteger(stringIndex) && visual instanceof SVGElement && path instanceof SVGPathElement) {
      stringTargets.set(stringIndex, { visual, path });
    }
  }

  const articles: NodeListOf<HTMLElement> = document.querySelectorAll(SECTION);
  for (const article of articles) {
    const sectionId: string | undefined = article.dataset.sectionId;
    if (sectionId) {
      sectionTargets.set(sectionId, article);
    }
  }

  return (): void => {
    resetGuitarState();
  };
}

function clearStringTargets(targets: StringTargets): void {
  const { visual, path } = targets;
  gsap.killTweensOf(visual);
  gsap.killTweensOf(path);
  gsap.set(path, { attr: { d: REST_PATH } });
  gsap.set(visual, { '--pluck-glow': '0px' });
}

function clearArticleStyles(article: HTMLElement): void {
  gsap.killTweensOf(article);
  gsap.set(article, { clearProps: 'opacity,transform' });
}

function pluckFrames(stringIndex: number): gsap.TweenVars[] {
  const swingCount: number = STRING_SWINGS * 2;
  const stepDuration: number = STRING_TOTAL_S / (swingCount + 1);
  const amplitude: number = STRING_AMPLITUDE * (1 + (stringIndex - 1) * 0.05);
  const frames: gsap.TweenVars[] = [];

  for (let swing = 1; swing <= swingCount; swing += 1) {
    const decay: number = Math.exp(-swing * 0.4);
    const direction: number = swing % 2 === 0 ? -1 : 1;
    const controlX: string = (22 + amplitude * decay * direction).toFixed(2);
    frames.push({
      attr: { d: `M22 1 Q${controlX} 50 22 99` },
      duration: stepDuration,
      ease: 'none',
    });
  }

  frames.push({
    attr: { d: REST_PATH },
    duration: stepDuration * 1.4,
    ease: 'power2.out',
  });

  return frames;
}

function stringTimeline(targets: StringTargets, stringIndex: number): gsap.core.Timeline {
  const existing: gsap.core.Timeline | undefined = stringTimelines.get(stringIndex);
  if (existing) {
    return existing;
  }

  const { visual, path } = targets;
  const timeline: gsap.core.Timeline = gsap.timeline({
    paused: true,
    onComplete: (): void => {
      clearStringTargets(targets);
    },
  });

  for (const frame of pluckFrames(stringIndex)) {
    timeline.to(path, frame);
  }

  timeline
    .to(
      visual,
      {
        '--pluck-glow': `${STRING_GLOW_PX}px`,
        duration: STRING_TOTAL_S * 0.18,
        ease: 'power2.out',
      },
      0,
    )
    .to(
      visual,
      {
        '--pluck-glow': '0px',
        duration: STRING_TOTAL_S * 0.82,
        ease: 'power2.out',
      },
      STRING_TOTAL_S * 0.18,
    );

  stringTimelines.set(stringIndex, timeline);
  return timeline;
}

function contentTimeline(article: HTMLElement, sectionId: string): gsap.core.Timeline {
  const existing: gsap.core.Timeline | undefined = contentTimelines.get(sectionId);
  if (existing) {
    return existing;
  }

  const timeline: gsap.core.Timeline = gsap.timeline({
    paused: true,
    onComplete: (): void => {
      clearArticleStyles(article);
    },
  });
  timeline.fromTo(
    article,
    { y: CONTENT_Y_PX, opacity: CONTENT_FROM_OPACITY },
    {
      y: 0,
      opacity: 1,
      duration: CONTENT_S,
      ease: 'power2.out',
      immediateRender: false,
    },
  );
  contentTimelines.set(sectionId, timeline);
  return timeline;
}

function settleOtherContent(sectionId: string): void {
  for (const [id, timeline] of contentTimelines) {
    if (id === sectionId) {
      continue;
    }
    timeline.pause(0);
  }

  for (const [id, article] of sectionTargets) {
    if (id === sectionId) {
      continue;
    }
    clearArticleStyles(article);
  }
}

export function animateString(stringIndex: number): void {
  if (prefersReducedMotion()) {
    return;
  }
  const targets: StringTargets | undefined = stringTargets.get(stringIndex);
  if (!targets) {
    return;
  }
  gsap.set(targets.path, { attr: { d: REST_PATH } });
  stringTimeline(targets, stringIndex).restart();
}

export function animateContentTransition(sectionId: string): void {
  if (prefersReducedMotion()) {
    return;
  }
  const article: HTMLElement | undefined = sectionTargets.get(sectionId);
  if (!article) {
    return;
  }
  settleOtherContent(sectionId);
  contentTimeline(article, sectionId).restart();
}

export function resetGuitarState(): void {
  for (const timeline of stringTimelines.values()) {
    timeline.kill();
  }
  stringTimelines.clear();
  for (const timeline of contentTimelines.values()) {
    timeline.kill();
  }
  contentTimelines.clear();

  for (const targets of stringTargets.values()) {
    clearStringTargets(targets);
  }
  for (const article of sectionTargets.values()) {
    clearArticleStyles(article);
  }
}

export function watchReducedMotion(): void {
  if (watchingMotion) {
    return;
  }
  watchingMotion = true;
  const media: MediaQueryList = window.matchMedia(REDUCED_MOTION);
  media.addEventListener('change', (): void => {
    if (media.matches) {
      resetGuitarState();
    }
  });
}
