import gsap from 'gsap';
import { stringPath, type GuitarString } from './strings';

export const PLUCK_SECONDS = 0.8;
export const PLUCK_BEND = 9;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

type StringMotion = {
  string: GuitarString;
  path: SVGPathElement;
  tween: gsap.core.Tween | null;
};

const motions = new Map<number, StringMotion>();
let watchingMotion = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

export function initStringMotion(root: HTMLElement, strings: readonly GuitarString[]): void {
  motions.clear();
  for (const string of strings) {
    const path: SVGPathElement | null = root.querySelector<SVGPathElement>(
      `a[data-string-index="${string.index}"] [data-string-path]`,
    );
    if (path) {
      motions.set(string.index, { string, path, tween: null });
    }
  }
  watchReducedMotion();
}

function restAt(motion: StringMotion): void {
  motion.path.setAttribute('d', stringPath(motion.string, 0));
}

// Elastic pluck: the string's control point starts offset and springs back to
// rest. Reduced motion skips the tween; sound is handled separately.
export function pluckString(stringIndex: number): void {
  const motion: StringMotion | undefined = motions.get(stringIndex);
  if (!motion || prefersReducedMotion()) {
    return;
  }

  motion.tween?.kill();
  const state: { bend: number } = { bend: PLUCK_BEND };
  motion.tween = gsap.to(state, {
    bend: 0,
    duration: PLUCK_SECONDS,
    ease: 'elastic.out(1, 0.35)',
    onUpdate: (): void => {
      motion.path.setAttribute('d', stringPath(motion.string, state.bend));
    },
    onComplete: (): void => {
      motion.tween = null;
      restAt(motion);
    },
  });
}

export function resetStrings(): void {
  for (const motion of motions.values()) {
    motion.tween?.kill();
    motion.tween = null;
    restAt(motion);
  }
}

function watchReducedMotion(): void {
  if (watchingMotion) {
    return;
  }
  watchingMotion = true;
  const media: MediaQueryList = window.matchMedia(REDUCED_MOTION);
  media.addEventListener('change', (): void => {
    if (media.matches) {
      resetStrings();
    }
  });
}
