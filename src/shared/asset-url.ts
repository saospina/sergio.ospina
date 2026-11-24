// BASE_URL can come with or without a trailing slash depending on config;
// normalize it once. Root-absolute paths 404 on GitHub Pages (base is
// /sergio.ospina), so every public asset goes through assetUrl().
export const BASE: string = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export function assetUrl(path: string): string {
  return `${BASE}${path.replace(/^\/+/, '')}`;
}
