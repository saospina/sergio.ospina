---
name: interactive-guitar-web
description: Build and maintain a personal website's interactive guitar experience using Astro, SVG, GSAP, and the Web Audio API. Use this when modifying the architecture, guitar, audio, animations, associated content, or accessibility.
disable-model-invocation: true
---

# Interactive Guitar Web

## Objective

Maintain a fast, scalable personal website featuring a 2D guitar as a narrative interface. Interacting with each string must animate the guitar, play a sound, and display a profile section.

## Architecture

Adhere to "Screaming Architecture" principles:

```text
src/
pages/
layouts/
features/
profile/
interactive-guitar/
audio-experience/
shared/
ui/
accessibility/
styles/
content/
public/
audio/guitar/
```

Keep the following separate:

- personal content;
- SVG representation;
- interaction state;
- animations;
- audio playback;
- shared visual elements.

## Implementation Rules

1. Audit the project before migrating or rewriting.
2. Preserve existing functionality, links, and content.
3. Use TypeScript with types for strings, sections, and events.
4. Use inline SVG for the guitar.
5. Use GSAP only for necessary animations.
6. Use a reusable `AudioContext` and initialize audio only after an interaction.
7. The experience must remain functional if audio fails, is muted, or cannot start.
8. Support keyboard navigation, visible focus indicators, accessible labels, and `prefers-reduced-motion`.
9. Do not use Three.js for a 2D experience.
10. Do not load heavy audio samples during initial load without justification.
11. Always verify the GitHub Pages base URL.

## Mandatory Workflow

1. Inspect structure, dependencies, and scripts.
2. Define the minimum necessary change.
3. Implement an isolated feature.
4. Run available type checks, linting, tests, or builds.
5. Review responsiveness and accessibility.
6. Summarize modified files, validations, and pending items.

## Acceptance criteria

- The six strings have visible interaction.
- Each string displays the correct section of the profile.
- Audio does not start automatically.
- Muting does not break the visual interaction.
- Keyboard navigation works.
- The site does not overflow on mobile.
- The production build works on GitHub Pages.