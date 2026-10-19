const PANEL_SELECTOR = '[data-profile-panel]';
const SECTION_SELECTOR = '[data-section-id]';
const LIVE_SELECTOR = '[data-section-live]';

function setArticleActive(article: HTMLElement, active: boolean): void {
  if (active) {
    article.removeAttribute('hidden');
    article.setAttribute('aria-current', 'true');
    article.setAttribute('data-active', 'true');
    return;
  }
  article.setAttribute('hidden', '');
  article.removeAttribute('aria-current');
  article.removeAttribute('data-active');
}

function readSectionTitle(article: HTMLElement): string {
  const heading: HTMLHeadingElement | null = article.querySelector('h2');
  const text: string = heading?.textContent?.trim() ?? '';
  if (text.length > 0) {
    return text;
  }
  return article.dataset.sectionId ?? '';
}

function writeLiveRegion(panel: HTMLElement, title: string): void {
  const live: HTMLElement | null = panel.querySelector<HTMLElement>(LIVE_SELECTOR);
  if (!live || title.length === 0) {
    return;
  }
  live.textContent = title;
}

export function activateSection(sectionId: string): void {
  const panel: HTMLElement | null = document.querySelector<HTMLElement>(PANEL_SELECTOR);
  if (!panel) {
    return;
  }

  const articles: HTMLElement[] = Array.from(panel.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
  const match: HTMLElement | undefined = articles.find(
    (article: HTMLElement) => article.dataset.sectionId === sectionId,
  );
  if (!match) {
    return;
  }

  panel.setAttribute('data-enhanced', '');

  let title = '';
  for (const article of articles) {
    const active: boolean = article === match;
    setArticleActive(article, active);
    if (active) {
      title = readSectionTitle(article);
    }
  }

  writeLiveRegion(panel, title);
}
