# Manual QA Report – January 15, 2025

## Scope and environment
- **Build**: Local Next.js dev server (`npm run dev -- --hostname 0.0.0.0 --port 3000`)
- **Locale**: mk
- **Devices/breakpoints**: mobile (390x844), tablet (820-1024px), desktop (1280px+)
- **Screens exercised**: Translate, Practice, Resources

## Observations
### Translate
- **Desktop (1280px)**: Layout, spacing, and buttons render cleanly with clear separation between panels and no overflow.
- **Mobile (390px)**: The fixed bottom tab bar overlays the translation direction chips and CTA section when scrolling, making the primary input and action partially inaccessible.
  - Screenshot: ![Translate mobile overlay](browser:/invocations/yzuhmgkg/artifacts/artifacts/translate-mobile.png)

### Practice
- **Tablet (820px)**: Hero, deck tabs, and flashcard controls align correctly with consistent padding; bottom nav hides as expected on medium breakpoints.
- **Desktop (1024px+)**: No spacing or overflow issues; navigation chips remain within container and buttons retain generous hit areas.
  - Screenshots: ![Practice tablet](browser:/invocations/xdwrhnvg/artifacts/artifacts/practice-tablet.png), ![Practice desktop](browser:/invocations/yzuhmgkg/artifacts/artifacts/practice-desktop.png)

### Resources
- **Desktop (1280px)**: Grid, filters, and instant list column stay aligned with balanced gutter spacing; no text clipping observed.
- **Mobile (390px)**: Bottom tab bar overlaps the first resource cards and search inputs while scrolling, reducing readable area and tappable space for top results.
  - Screenshots: ![Resources desktop](browser:/invocations/yzuhmgkg/artifacts/artifacts/resources-desktop.png), ![Resources mobile overlay](browser:/invocations/xdwrhnvg/artifacts/artifacts/resources-mobile.png)

## Follow-up tickets
1. **Prevent mobile tab bar from obscuring content** – Add safe-area-aware bottom padding to the main content container and/or reserve vertical space equal to the `MobileTabNav` height so translation controls and resource cards are not covered on small screens. Relevant components: `AppShell` main wrapper and `MobileTabNav` fixed bar.
