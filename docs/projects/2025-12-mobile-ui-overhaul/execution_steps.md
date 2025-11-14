# Execution Steps – Mobile UI Overhaul

> Status Legend: ✅ Done, 🔄 In Progress, ⏳ Pending

## Step D: Localization & Safe-Area Polish
**Status**: ✅ Completed (2025-11-17)  
**Objective**: Ensure the primary navigation surfaces, hero shell, and install surfaces reflect the Macedonian-first branding while handling long translations + safe areas on mobile.  
**Files Touched**:
- `messages/en.json`, `messages/mk.json`
- `app/layout.tsx`, `public/manifest.json`
- `components/Sidebar.tsx`, `components/Footer.tsx`, `components/layout/TopNav.tsx`
- `app/[locale]/page.tsx`, `app/[locale]/test-sentry/page.tsx`
**Progress**:
- Added shared brand/go-home translation keys plus Macedonian strings for the privacy/terms back-home copy.
- Updated metadata + manifest names, Sidebar/Home hero/TopNav/Footer to pull from the new brand keys, and widened the mobile nav labels so Macedonian strings can wrap without clipping.
- Added safe-area padding to the footer and refreshed the hero header to call out the Македонски brand per the blueprint.
- Practice hub now mirrors the new mission-driven layout with stat pills, motivational panels, and redesigned Quick Practice cards so the entire flow feels mobile-first.
**Verification Steps**:
1. `npm run lint`

## Step F: News, Daily Lessons, and Resources surface refresh
**Status**: ✅ Completed (2025-11-14)
**Objective**: Apply the shared mobile-first patterns (card grids, chips, typography, and feedback states) from the UX blueprint to the web discovery routes so they feel consistent with the rest of the overhaul effort.
**Files to Modify**:
- `app/[locale]/news/page.tsx`
- `components/learn/DailyLessons.tsx`
- `app/[locale]/resources/page.tsx`
- `components/ui/filter-chip.tsx` (new)
- `messages/{en,mk}.json` (if new strings are required)
**Changes Required**:
- Introduce system-aligned filter chips, cards, and hero typography for the News feed plus grid-based article cards with inline badges.
- Update the Daily Lessons component to use the shared chip + skeleton patterns, and ensure alerts use the design system instead of ad-hoc banners.
- Flatten the static resources data into a searchable grid of cards with consistent CTAs, filter chips, and PDF hero actions.
- Ensure all loading states use `<Skeleton />` and all error banners use `<Alert />` for parity with the design tokens.
**Success Criteria**:
- News, Daily Lessons, and Resources routes render responsive grids with card layouts that match the mobile blueprint.
- Filters rely on the new chip primitive, skeletons match the design tokens, and alerts use the system component.
- ESLint passes for the touched files.
**Verification Steps**:
1. `npx eslint app/[locale]/news/page.tsx app/[locale]/resources/page.tsx components/learn/DailyLessons.tsx components/ui/filter-chip.tsx`
**Dependencies**: Alignment with `docs/projects/2025-12-mobile-ui-overhaul.md`
**Owner**: Agent F (Content Surfaces)
**Risk Level**: Medium (multi-surface UX changes)

## Lessons Learned and Step Improvements
- _Add insights once validation and QA are completed._
