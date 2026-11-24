export type ActiveSectionListener = (sectionId: string) => void;

// The reading band across the middle of the viewport.
const ACTIVE_ROOT_MARGIN = '-40% 0px -55% 0px';
// How close to the bottom of the page counts as "at the end", in px.
const BOTTOM_TOLERANCE = 4;

// Reports each profile section that crosses the reading band. Lives in the
// profile domain so the guitar never has to read the profile's DOM.
export function watchActiveSection(onChange: ActiveSectionListener): () => void {
  if (!('IntersectionObserver' in window)) {
    return (): void => {};
  }

  const sections: HTMLElement[] = [...document.querySelectorAll<HTMLElement>('[data-section-id]')];
  // A short last section may never reach the reading band, even at the very
  // bottom of the page. Reaching the end of the page activates it instead.
  const lastId: string | undefined = sections.at(-1)?.dataset.sectionId;
  const atBottom = (): boolean =>
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - BOTTOM_TOLERANCE;

  const observer: IntersectionObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]): void => {
      for (const entry of entries) {
        const sectionId: string | undefined =
          entry.isIntersecting && entry.target instanceof HTMLElement
            ? entry.target.dataset.sectionId
            : undefined;
        // At the bottom the last section wins, whatever sits in the band.
        if (sectionId && !(lastId && sectionId !== lastId && atBottom())) {
          onChange(sectionId);
        }
      }
    },
    { rootMargin: ACTIVE_ROOT_MARGIN },
  );

  for (const section of sections) {
    observer.observe(section);
  }

  let frame: number = 0;
  const checkBottom = (): void => {
    frame = 0;
    if (lastId && atBottom()) {
      onChange(lastId);
    }
  };
  const onScroll = (): void => {
    if (!frame) {
      frame = window.requestAnimationFrame(checkBottom);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  return (): void => {
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.cancelAnimationFrame(frame);
  };
}
