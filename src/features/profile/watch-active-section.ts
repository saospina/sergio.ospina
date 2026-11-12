export type ActiveSectionListener = (sectionId: string) => void;

// The reading band across the middle of the viewport.
const ACTIVE_ROOT_MARGIN = '-40% 0px -55% 0px';

// Reports each profile section that crosses the reading band. Lives in the
// profile domain so the guitar never has to read the profile's DOM.
export function watchActiveSection(onChange: ActiveSectionListener): () => void {
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
          onChange(sectionId);
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
