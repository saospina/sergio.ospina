# AGENTS.md

Personal site for Antonio Ospina. One static Astro 5 page. No tests, lint, or typecheck — `npm run build` is the only verification step.

## Commands

- `npm run dev` — local server
- `npm run build` — production build; run after every change
- `npm run preview` — serve `dist/`
- Deploy (`.github/workflows/deploy.yml`) runs only when a PR is **merged into `master`** (it checks out the merge commit). No push or `workflow_dispatch` trigger exists. Uses Node 20 and `npm ci`; keep `package-lock.json` in sync.

## Deploy

- GitHub Pages project site. The branch is `master`, not `main`.
- `astro.config.mjs` sets `site` to `https://saospina.github.io` and `base` to `/sergio.ospina`. Root-absolute paths (`/img/...`) 404 in production. Prefix public assets with `import.meta.env.BASE_URL`. Build canonical URLs with `new URL(import.meta.env.BASE_URL, Astro.site)`.

## Architecture

- `src/pages/index.astro` is the only page; it wires three features under `src/features/`:
  - `interactive-guitar/` — inline SVG guitar, GSAP motion (`guitar-motion.ts`, `guitar-controller.ts`)
  - `audio-experience/` — Web Audio engine + controls. MP3 samples (`public/audio/guitar/string-N.mp3`) are **not committed** (dir holds only `.gitkeep`); missing samples fall back to synthesized plucks (`fallbackFrequency` in `sources.ts`). Audio must never autoplay and the experience must work without it.
  - `profile/` — all copy and data live in `profile.ts`; string index → section mapping is `getSectionByStringIndex`.
- Landing chrome stays in `src/styles/home.module.css`. Do not add a UI framework.
- `public/img/home.jpeg` is used only as the darkened full-page background (`--background-image`). Keep the layout text-first; no photo hero.
- Guitar/audio work follows the repo-local skill `.opencode/skills/interactive-guitar-web/SKILL.md`. It sets `disable-model-invocation: true`, so load it explicitly when touching that feature.

## Content

- Public name is Antonio Ospina. Links are LinkedIn, GitHub, and Medium only. Do not publish an email.
- Keep the existing gtag snippet (`G-V3TGD1L0Z4`).
- The EPAM Frontend Developer role ends Jan 2026, when Frontend Tech Lead starts. Do not mark both Present.
