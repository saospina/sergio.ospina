# Antonio Ospina: personal site

[![CI](https://github.com/saospina/sergio.ospina/actions/workflows/ci.yml/badge.svg)](https://github.com/saospina/sergio.ospina/actions/workflows/ci.yml)

**Live:** https://saospina.github.io/sergio.ospina/

A one-page CV you navigate by plucking the strings of an SVG guitar. Each of the six strings opens a section: About, Experience, Skills, Work, Off the Clock and Contact. Sound is optional and never autoplays. The page works fully by keyboard, with a screen reader and with sound off.

## Stack

- [Astro 7](https://astro.build): a static single page with no UI framework. TypeScript, CSS modules.
- Web Audio API: plucks are synthesized, so there are no audio files to download.
- GSAP for string motion. It respects `prefers-reduced-motion`.
- Fonts are self-hosted. The background is AVIF/WebP generated at build time.
- GA4 for analytics, in production builds only.

## Structure

```
src/
  pages/index.astro         the only page; wires the features together
  features/
    interactive-guitar/     SVG guitar, string navigation, motion
    audio-experience/       Web Audio engine and sound controls
    profile/                all copy and data (profile.ts) and section panels
    analytics/              GA4 events through a single track() helper
    site-notice/            "under construction" banner
  shared/                   asset URLs, icons, reduced-motion helper
```

Conventions and constraints for contributors (human or AI) live in [AGENTS.md](AGENTS.md).

## Development

Requires Node ≥ 22.23 (CI uses 24).

```sh
npm install
npm run dev       # local server
npm run check     # astro check (strict TypeScript)
npm run build     # production build into dist/
npm run preview   # serve dist/
```

## Quality and deploy

- Every PR into `master` must pass **Typecheck and build** and **Lighthouse** (accessibility, SEO, performance and CLS budgets in `lighthouserc.json`).
- Dependabot opens grouped weekly updates for npm and GitHub Actions.
- Merging a PR into `master` deploys to GitHub Pages (`.github/workflows/deploy.yml`). Nothing deploys from other branches or from direct pushes.
