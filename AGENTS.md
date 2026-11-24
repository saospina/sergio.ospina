# AGENTS.md

Personal site for Antonio Ospina. One static Astro 5 page. No tests, lint, or typecheck — `npm run build` is the only verification step.

## Commands

- `npm run dev` — local server
- `npm run build` — production build; run after every change
- `npm run preview` — serve `dist/`
- Deploy (`.github/workflows/deploy.yml`) runs only when a PR is **merged into `master`** (it checks out the merge commit). No push or `workflow_dispatch` trigger exists. Uses Node 20 and `npm ci`; keep `package-lock.json` in sync.
- The trigger is `pull_request_target`, not `pull_request`, on purpose. Plain `pull_request` runs use `refs/pull/<n>/merge`, which the `github-pages` environment rejects. Do not change it back without rechecking that policy.

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
- Guitar/audio work follows the repo-local skill `.claude/skills/interactive-guitar-web/SKILL.md`. It sets `disable-model-invocation: true`, so load it explicitly when touching that feature.

## Content

- Public name is Antonio Ospina. Links are LinkedIn, GitHub, and Medium, plus the WhatsApp CTA (`whatsapp` in `profile.ts`, username `ospinasa.music`). Do not publish an email or phone number.
- The CV PDF is `public/cv/antonio-ospina-cv.pdf` (committed; the build fails if it is missing). It must not contain an email or phone number. Bump `cv.updated` in `profile.ts` when the file changes.
- Keep the existing gtag snippet (`G-V3TGD1L0Z4`).
- The EPAM Frontend Developer role ends Jan 2026, when Frontend Tech Lead starts. Do not mark both Present.

## Analytics

- GA4 (`G-V3TGD1L0Z4`, free tier). The gtag snippet renders only in production builds (`import.meta.env.PROD`), so `npm run dev` sends nothing.
- Events go through `track()` in `src/features/analytics/track.ts`, which no-ops when gtag is blocked. Add new event names to its `AnalyticsEvents` type.
- Clicks are tracked declaratively: add `data-track="lead|cv|social|cta"` plus `data-track-location` / `data-track-label` to an element. One delegated listener (`clicks.ts`, started by `initAnalytics()`) handles them, along with `guitar_pluck` on string links and a one-time `section_view` per section.
- `section_view` carries `via` (`landing`, `guitar`, `cta`, `next_link`, `scroll`): clicks call `noteNavIntent()` and the next view of that target inherits it. `data-track="next"` on the "Next · string" links exists only for this.
- `section_read` fires once per section after 8s active with the tab visible. Also sent: `print`, `sound_first_play`, `audio_unavailable`, `exception` (deduped, max 5/page), and `web_vital` (LCP/INP/CLS via `web-vitals`; CLS ×1000).
- Key events (`generate_lead`, `cv_download`) and custom dimensions are configured in the GA4 admin UI, not in code. Do not re-add a manual `file_download`; Enhanced Measurement already sends it.
