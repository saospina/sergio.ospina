# AGENTS.md

Personal site for Antonio Ospina. One static Astro 5 page. No tests, lint, or typecheck — `npm run build` is the only verification step.

## Commands

- `npm run dev` — local server
- `npm run build` — production build; run after every change
- `npm run preview` — serve `dist/`
- Deploy (`.github/workflows/deploy.yml`) runs **only when a PR is merged into `master`**. The trigger is the push that the merge creates, and the `merged-pr` job skips any commit that is not a merged PR's `merge_commit_sha` (the `Master` ruleset also requires PRs). No `workflow_dispatch`. Then `build` uploads the Pages artifact and `deploy` publishes it. Keeping them separate avoids a race where `deploy-pages` cannot find the artifact. Uses Node 24 and `npm ci`; keep `package-lock.json` in sync.
- Do not switch the trigger to `pull_request` (its `refs/pull/<n>/merge` ref is rejected by the `github-pages` environment, which only allows `master`) or back to `pull_request_target` (GitHub restricts it on public repos from 2026-12-02).
- If only `deploy` fails, use "Re-run failed jobs": it reuses the existing artifact. "Re-run all jobs" uploads a second `github-pages` artifact to the same run and `deploy-pages` then fails with "Multiple artifacts"; delete the old one first (`gh api -X DELETE repos/saospina/sergio.ospina/actions/artifacts/<id>`).

## Deploy

- GitHub Pages project site. The branch is `master`, not `main`.
- `astro.config.mjs` sets `site` to `https://saospina.github.io` and `base` to `/sergio.ospina`. Root-absolute paths (`/img/...`) 404 in production. Prefix public assets with `import.meta.env.BASE_URL`. Build canonical URLs with `new URL(import.meta.env.BASE_URL, Astro.site)`.

## Architecture

- `src/pages/index.astro` is the only page; it wires three features under `src/features/`:
  - `interactive-guitar/` — inline SVG guitar, GSAP motion (`guitar-motion.ts`), links and pluck wiring (`guitar-nav.ts`)
  - `audio-experience/` — Web Audio engine + controls. MP3 samples (`public/audio/guitar/string-N.mp3`) are **not committed** (dir holds only `.gitkeep`), so `SAMPLES_ENABLED` in `sources.ts` is `false` and nothing is fetched; plucks are synthesized (`fallbackFrequency`). Set it to `true` only after adding all six files. Audio must never autoplay and the experience must work without it.
  - `profile/` — all copy and data live in `profile.ts` (`currentRole` and `homeLocation` feed the headline and the JSON-LD); string index → section mapping is `getSectionByStringIndex`. `ProfilePanel.astro` renders the shared section shell; per-section content lives in `sections/*Extras.astro`, mapped by section id.
  - `site-notice/` — the "Under construction" banner at the top of the page (hidden in print).
- `src/shared/` holds cross-feature helpers: `assetUrl()` / `BASE` (`asset-url.ts`), inline SVG icons (`icons.ts`), and `prefersReducedMotion()` (`motion.ts`). Build public asset URLs with `assetUrl()`.
- Landing chrome stays in `src/styles/home.module.css`. Do not add a UI framework.
- `src/assets/home.jpeg` is used only as the darkened full-page background. `index.astro` turns it into AVIF + WebP with `getImage()` and passes `--background-image` / `--background-fallback`. Keep the layout text-first; no photo hero.
- Fonts are self-hosted with `@fontsource/*` (Latin, 400/500), imported in `index.astro`. Do not add Google Fonts links back.
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
