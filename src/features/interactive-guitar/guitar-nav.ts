import { pluckString } from './guitar-motion';

export type GuitarNavOptions = {
  // Plays the note for a string. Called only after the visitor has interacted,
  // because browsers block audio that starts without a gesture.
  playSound: (stringIndex: number) => void;
};

const LINK_SELECTOR = 'a[data-string-index]';
const ACTIVE_ROOT_MARGIN = '-40% 0px -55% 0px';

function stringIndexOf(link: Element): number | null {
  const raw: string | undefined = (link as HTMLElement | SVGElement).dataset.stringIndex;
  if (raw === undefined) {
    return null;
  }
  const index: number = Number(raw);
  return Number.isInteger(index) ? index : null;
}

// Marks the string for one section. Each string link and mobile label carries
// the same href, so both are updated together.
export function setActiveSection(root: HTMLElement, sectionId: string): void {
  const href: string = `#${sectionId}`;
  for (const link of root.querySelectorAll<HTMLElement | SVGElement>(LINK_SELECTOR)) {
    if (link.getAttribute('href') === href) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

export function bindGuitarNav(root: HTMLElement, options: GuitarNavOptions): void {
  let hasInteracted: boolean = false;
  const markInteracted = (): void => {
    hasInteracted = true;
  };
  document.addEventListener('pointerdown', markInteracted, { passive: true });
  document.addEventListener('keydown', markInteracted);

  for (const link of root.querySelectorAll<HTMLElement | SVGElement>(LINK_SELECTOR)) {
    const stringIndex: number | null = stringIndexOf(link);
    if (stringIndex === null) {
      continue;
    }

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

    link.addEventListener('click', (): void => {
      hasInteracted = true;
      pluckString(stringIndex);
      options.playSound(stringIndex);
      const href: string | null = link.getAttribute('href');
      if (href) {
        setActiveSection(root, href.slice(1));
      }
    });
  }
}

// Watches the stacked sections and marks the string whose section crosses the
// reading band in the middle of the viewport.
export function watchActiveSection(root: HTMLElement): () => void {
  if (!('IntersectionObserver' in window)) {
    return (): void => {};
  }

  const observer: IntersectionObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]): void => {
      for (const entry of entries) {
        const sectionId: string | undefined =
          entry.isIntersecting && entry.target instanceof HTMLElement
            ? entry.target.dataset.sectionId
            : undefined;
        if (sectionId) {
          setActiveSection(root, sectionId);
        }
      }
    },
    { rootMargin: ACTIVE_ROOT_MARGIN },
  );

  for (const section of document.querySelectorAll<HTMLElement>('[data-section-id]')) {
    observer.observe(section);
  }

  return (): void => {
    observer.disconnect();
  };
}
