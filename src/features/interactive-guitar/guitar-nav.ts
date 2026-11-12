import { pluckString } from './guitar-motion';

export type GuitarNavOptions = {
  // Plays the note for a string. Called only after the visitor has interacted,
  // because browsers block audio that starts without a gesture.
  playSound: (stringIndex: number) => void;
};

// Matches the SVG string links and the mobile StringNav chips alike.
const LINK_SELECTOR = 'a[data-string-index]';
const CHIP_ROOT_SELECTOR = '[data-string-nav]';

function stringIndexOf(link: Element): number | null {
  const raw: string | undefined = (link as HTMLElement | SVGElement).dataset.stringIndex;
  if (raw === undefined) {
    return null;
  }
  const index: number = Number(raw);
  return Number.isInteger(index) ? index : null;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Restarts the chip's mini-string wobble. The attribute is removed and re-added
// so the CSS animation runs again on every tap.
function wobbleChip(chip: HTMLElement): void {
  if (prefersReducedMotion()) {
    return;
  }
  chip.removeAttribute('data-plucked');
  void chip.offsetWidth;
  chip.setAttribute('data-plucked', '');
}

// Scrolls the chip strip so the active chip sits in the middle. Only the strip
// moves; the page does not.
function keepChipVisible(chip: HTMLElement): void {
  const strip: HTMLElement | null = chip.closest('ul');
  if (!strip) {
    return;
  }
  const stripBox: DOMRect = strip.getBoundingClientRect();
  const chipBox: DOMRect = chip.getBoundingClientRect();
  const left: number =
    strip.scrollLeft + (chipBox.left - stripBox.left) - (strip.clientWidth - chipBox.width) / 2;
  strip.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

// Marks the string for one section across the SVG and the mobile chips. Both
// use the same href, so they are updated together.
export function setActiveSection(sectionId: string): void {
  const href: string = `#${sectionId}`;
  for (const link of document.querySelectorAll<HTMLElement | SVGElement>(LINK_SELECTOR)) {
    if (link.getAttribute('href') !== href) {
      link.removeAttribute('aria-current');
      continue;
    }
    if (link.getAttribute('aria-current') === 'true') {
      continue;
    }
    link.setAttribute('aria-current', 'true');
    if (link instanceof HTMLElement && link.closest(CHIP_ROOT_SELECTOR)) {
      keepChipVisible(link);
    }
  }
}

export function bindGuitarNav(options: GuitarNavOptions): void {
  let hasInteracted: boolean = false;
  const markInteracted = (): void => {
    hasInteracted = true;
  };
  document.addEventListener('pointerdown', markInteracted, { passive: true });
  document.addEventListener('keydown', markInteracted);

  for (const link of document.querySelectorAll<HTMLElement | SVGElement>(LINK_SELECTOR)) {
    const stringIndex: number | null = stringIndexOf(link);
    if (stringIndex === null) {
      continue;
    }
    const isChip: boolean = link.closest(CHIP_ROOT_SELECTOR) !== null;

    link.addEventListener('pointerenter', (event: Event): void => {
      if ((event as PointerEvent).pointerType !== 'mouse') {
        return;
      }
      pluckString(stringIndex);
      if (hasInteracted) {
        options.playSound(stringIndex);
      }
    });

    link.addEventListener('focus', (): void => {
      if (!link.matches(':focus-visible')) {
        return;
      }
      pluckString(stringIndex);
      if (hasInteracted) {
        options.playSound(stringIndex);
      }
    });

    // A tap plucks and plays. The native anchor still scrolls to the section,
    // so the links work without JavaScript; this only adds the feedback.
    link.addEventListener('click', (): void => {
      hasInteracted = true;
      pluckString(stringIndex);
      options.playSound(stringIndex);
      if (link instanceof HTMLElement && isChip) {
        wobbleChip(link);
      }
      const href: string | null = link.getAttribute('href');
      if (href) {
        setActiveSection(href.slice(1));
      }
    });
  }
}
