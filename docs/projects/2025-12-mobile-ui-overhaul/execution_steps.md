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

## Step H: Mission loop onboarding + Home hero refresh
**Status**: ⏳ Pending  
**Objective**: Deliver Section 5.1–5.2 of the UX plan – the 3-step onboarding wizard that seeds a Daily Mission plus the streak-first Home hero, coach carousel, review rail, and community row.  
**Key Surfaces / Files**:
- `app/[locale]/(auth)/onboarding/*` (new wizard, mascot art, mission pledge copy)  
- `app/[locale]/page.tsx`, `components/home/*` for hero, mission checklist modal, and rails  
- `hooks/useMissionStatus.ts`, `packages/api-client/src/mission.ts` (extend API contract for schedule + quest seeds)  
- `messages/{en,mk}.json`, `public/coach-illustrations/*`  
**Changes Required**:
- Implement wizard steps (Goal → Level check → Schedule) with illustrated coach, scheduling UI, and mission preview; persist results via `/api/missions/setup`.  
- Create hero card with streak flame, XP meter, and long-pressable mission checklist plus coach tips carousel, Smart Review chips, and community row.  
- Wire analytics + reminder intent: mission creation triggers reminder defaults and populates the Home hero on first load.  
**Success Criteria**:
- New users hit the wizard before the dashboard, see localized copy, and land on Home with an active mission (target XP + reminders).  
- Home hero, tips, review rail, and community row match the blueprint layout across breakpoints with loading/error states tied to mission API data.  
- ESLint + integration tests (`npm run test -- home-mission`) cover the wizard flow and hero state machine.  
**Verification Steps**:
1. `npx eslint app/[locale]/page.tsx app/[locale]/(auth)/onboarding hooks/useMissionStatus.ts`  
2. `npm run test -- mission-onboarding`  
3. Manual: sign up → complete wizard → verify mission hero content and reminder defaults.  
**Dependencies**: Step D (brand tokens), Mission API spec updates.  
**Owner**: Agent A (Mission UX)  
**Risk Level**: High (net-new flows, copy, data contract)

## Step I: Quick Practice 2.0 + talismans/audio hooks
**Status**: ⏳ Pending  
**Objective**: Rebuild Quick Practice as the swipeable sheet with difficulty presets, talismans, HUD, and inline audio pipeline described in Section 5.3 + 7 of the plan.  
**Key Surfaces / Files**:
- `components/learn/QuickPracticeWidget/*`, `hooks/useQuickPracticeSession.ts`, `packages/practice/*`  
- `app/[locale]/practice/page.tsx`, `components/ui/SwipeableStack.tsx` (new)  
- `app/api/practice/audio/*`, Prisma schema migration for `practiceAudio`  
- Admin route `app/admin/practice-audio/*` + worker scripts  
**Changes Required**:
- Introduce swipeable card stack with Cloze/MC/Listening/Typing layouts, HUD (accuracy, XP, hearts), difficulty selector, timers, and talisman rewards.  
- Implement talisman logic (earned thresholds, XP multipliers) with persistence + analytics events.  
- Build audio pipeline: admin upload page, worker normalization, Prisma tables, API payload with `audioClip` metadata; hook UI to prefetch/play clips with slow replay + waveform.  
- Update completion queue + missions so XP/heart changes respect difficulty + talismans.  
**Success Criteria**:
- Practice modal matches the blueprint (motion, HUD, difficulty) and audio cards autoplay with slow replay + waveform.  
- Admins can upload, review, and publish audio clips; 70% of cards can surface human audio at launch.  
- Automated tests cover talisman eligibility, deck building, and audio metadata handling.  
**Verification Steps**:
1. `npx prisma migrate dev` for new tables.  
2. `npm run lint -- components/learn/QuickPracticeWidget hooks/useQuickPracticeSession.ts app/admin/practice-audio`  
3. `npm run test -- practice`  
4. Manual: run upload flow → confirm clip shows in Quick Practice and analytics fire.  
**Dependencies**: Step H (mission data), audio storage budget approvals (Section 10).  
**Owner**: Agent B (Practice Systems)  
**Risk Level**: High (full-stack refactor, infra cost)

## Step J: Gamification loops (XP/hearts, quests, badge shop, reminders)
**Status**: ⏳ Pending  
**Objective**: Implement Section 6 systems – refreshed XP/hearts mechanics, streak leagues, daily/weekly quests, currency/badge shop, and reminder intelligence surfaces.  
**Key Surfaces / Files**:
- `app/[locale]/profile/page.tsx`, `components/profile/*`, `packages/gamification/*`  
- `app/api/missions/*`, `app/api/quests/*`, background jobs for streak/leagues  
- `app/[locale]/notifications/page.tsx` (inbox) + push/email scheduler configs  
**Changes Required**:
- Add XP regeneration + heart timers, talisman bonuses, and updated mission summary surfaces.  
- Build quests data model (solo + squad), leaderboard/league APIs, profile map visualization, badge shop UI + currency balances.  
- Ship reminder intelligence: inbox UI, quiet-hours settings, analytics-driven triggers.  
**Success Criteria**:
- Learners see live streak tier, XP regen timers, and quests with completion + rewards synced across web/mobile.  
- Badge shop transactions update balances + cosmetics with localization; squad quest progress reflects friend activity.  
- Reminder scheduler sends targeted nudges; inbox surfaces streak warnings, quest invites, admin notes.  
**Verification Steps**:
1. `npm run lint -- app/[locale]/profile app/[locale]/notifications app/api/{missions,quests}`  
2. `npm run test -- gamification`  
3. Manual: complete quests, purchase badges, validate reminder fan-out.  
**Dependencies**: Step I (talisman + XP metadata), backend queue capacity.  
**Owner**: Agent C (Retention Systems)  
**Risk Level**: High (multi-service coordination)

## Step K: Discover + Tutor/Translator polish & accessibility
**Status**: ⏳ Pending  
**Objective**: Close out Sections 5.4–5.9 with AI Tutor redesign, translator saved phrases/audio, Discover editorial stream, Profile stats map, and admin console updates – plus an accessibility audit.  
**Key Surfaces / Files**:
- `app/[locale]/tutor/page.tsx`, `components/tutor/*`  
- `app/[locale]/translate/page.tsx`, `components/translate/*` (saved phrases, audio playback)  
- `app/[locale]/discover/page.tsx`, `components/discover/*`, `app/[locale]/profile/page.tsx`  
- `app/admin/*` (consolidated content/audio management)  
**Changes Required**:
- Apply chat bubble redesign with grammar callouts, micro-quests, XP/heart recap.  
- Add Saved Phrases drawer w/ “Practice this set” button, translator audio playback tied to Section 7 pipeline.  
- Build Discover editorial cards, upcoming events calendar, quest/social rails, skill map heatmaps, shareable achievement cards, and admin health dashboards.  
- Run a11y/Localization audit (SUS target >80, WCAG focus order, screen reader labels).  
**Success Criteria**:
- Tutor/Translator surfaces match blueprint UX + audio integrations; saved phrases launch Quick Practice sets.  
- Discover + Profile show the planned cards/maps/stats with localization + responsive behavior.  
- Admin dashboard covers content/audio readiness, release gating, and translations; accessibility checklist signed off.  
**Verification Steps**:
1. `npx eslint app/[locale]/tutor app/[locale]/translate app/[locale]/discover app/[locale]/profile app/admin`  
2. `npm run test -- tutor translator discover profile`  
3. Accessibility + localization audit (VoiceOver/TalkBack, long-string review).  
**Dependencies**: Steps H–J, audio pipeline (Step I), localization sign-off.  
**Owner**: Agent D (Experience Polish)  
**Risk Level**: Medium

## Lessons Learned and Step Improvements
- _Add insights once validation and QA are completed._
