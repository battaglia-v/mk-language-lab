# Execution Steps – 2025-12 Mobile UX Refresh

> Status Legend: ✅ Done, 🔄 In Progress, ⏳ Pending

## Step 1: Brand naming + icon surfaces stay in sync
**Status**: ✅  
**Objective**: Make every web + native entry point reflect the Macedonian-first name from `docs/projects/2025-12-mobile-ui-overhaul.md` and document the static icon sources so we no longer rely on generated `app/icon.tsx`.

**Files to Modify**:
- `packages/tokens/src/index.ts` – export shared `brandNames` constants.
- `app/layout.tsx`, `app/opengraph-image.tsx`, `app/api/mobile/auth/expo-complete/route.ts` – consume `brandNames.full` for metadata, OG art, and Expo auth hand-off copy.
- `apps/mobile/app/sign-in.tsx` – reuse the shared brand label inside the native auth screen.
- `public/manifest.json` – ensure the PWA strings surface the Macedonian-first brand and reference the static favicon set.

**Changes Required**:
- Add `brandNames` to the shared tokens package so both Next.js and Expo screens import the same strings.
- Update metadata, OG image, manifest, and Expo auth messaging to use `Македонски • MK Language Lab`.
- Point the native sign-in helper text at the shared brand string so copy stays consistent with the marketing hero.

**Success Criteria**:
- All metadata (SEO, OG, Twitter, Apple web app) renders the Macedonian-first name.
- Manifest/PWA prompts display the same brand and reference the exported `favicon-16/32/64`, `.ico`, and icon PNGs that live under `public/`.
- Expo auth/signon UI copy no longer says “MK Language Lab” in isolation.

**Verification Steps**:
1. `npx eslint app/layout.tsx app/opengraph-image.tsx app/api/mobile/auth/expo-complete/route.ts packages/tokens/src/index.ts apps/mobile/app/sign-in.tsx`

**Dependencies**: Blueprint in `docs/projects/2025-12-mobile-ui-overhaul.md`  
**Risk Level**: Medium

## Step 2: Global layout, nav streak summary, and cohesive footer
**Status**: ✅  
**Objective**: Refresh the shared shell so every `app/[locale]/` route inherits the responsive grid, sticky streak summary nav, and footer spec defined in the UX blueprint.

**Files to Modify**:
- `app/layout.tsx`, `app/[locale]/layout.tsx` – wire the new shell (TopNav + footer) and ensure brand metadata flows from tokens.
- `components/layout/TopNav.tsx`, `hooks/useMissionStatus.ts` – implement sticky nav with mission fetch, streak/Xp/hearts summary, and responsive menus.
- `components/Footer.tsx` – rebuild footer with brand story, product/support links, and safe-area padding.
- `messages/en.json`, `messages/mk.json` – add translation keys for nav summary + footer sections.

**Changes Required**:
- Replace the ad-hoc top bar with the shared `TopNav`, including mobile menu, translator shortcuts, and streak summary fed by `/api/missions/current`.
- Expand the footer into three columns (brand story, product links, support) plus localized social links and contact info.
- Update the locale layout grid so the sticky nav and sidebar spacing stay in sync across breakpoints, and ensure the global metadata uses `brandNames.full`.

**Success Criteria**:
- Nav shows streak days, XP progress, and hearts with graceful loading/error states.
- Footer links, social badges, and copyright lines render consistently in both locales with safe-area padding above the mobile nav.
- All localized routes inherit the new responsive spacing without manual `pt-14` offsets.

**Verification Steps**:
1. `npx eslint app/layout.tsx app/[locale]/layout.tsx components/layout/TopNav.tsx components/Footer.tsx hooks/useMissionStatus.ts`

**Dependencies**: Step 1 design tokens  
**Risk Level**: Medium
