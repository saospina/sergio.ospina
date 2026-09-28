# AGENTS.md

Personal site for Antonio Ospina. One static Astro 5 page. No tests, lint, or typecheck.

## Commands

- `npm run dev` — local server
- `npm run build` — production build; this is the verification step
- `npm run preview` — serve `dist/`
- Deploy (`.github/workflows/deploy.yml`) uses Node 20 and `npm ci`, then `npm run build`. Keep `package-lock.json` in sync.

## Deploy

- GitHub Pages project site. The branch is `master`, not `main`. Push to `master` (or `workflow_dispatch`) publishes `./dist`.
- `astro.config.mjs` sets `site` to `https://saospina.github.io` and `base` to `/sergio.ospina`. Root-absolute paths (`/img/...`) 404 in production. Prefix public assets with `import.meta.env.BASE_URL`. Build canonical URLs with `new URL(import.meta.env.BASE_URL, Astro.site)`.

## Page

- Copy and data live in the frontmatter of `src/pages/index.astro`. Styles are CSS modules in `src/styles/home.module.css`. Do not add a UI framework.
- Public name is Antonio Ospina. Links are LinkedIn, GitHub, and Medium only. Do not publish an email.
- Text-first layout. `public/img/home.jpeg` is unused; do not restore a photo hero unless asked.
- Keep the existing gtag snippet (`G-V3TGD1L0Z4`).
- The EPAM Frontend Developer role ends Jan 2026, when Frontend Tech Lead starts. Do not mark both Present.
