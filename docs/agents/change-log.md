# Shared Change Log

Add an entry whenever you introduce a change that affects other contributors (APIs, patterns, tooling, infra, data, etc.). Keep only the latest ~10 entries here; move older ones to `docs/agents/archive/`.

## How to Add an Entry
1. Append a new numbered section at the top.
2. Include date/time (UTC), files touched, summary, impact, guidance, and commit SHA.
3. Reference this update in your PR message.

---

## 🏗️ Deployment Architecture Overview

**This is a monorepo with TWO separate applications sharing code:**

### Applications
1. **Next.js Web App** (root directory)
   - Deployed to: **Vercel** (automatic on `git push`)
   - URL: https://mk-language-lab.com
   - Tech: Next.js 16, React, Server Components

2. **Expo Mobile App** (`apps/mobile/`)
   - Deployed to: **Apple App Store + Google Play Store** (manual via EAS)
   - Build: `eas build --platform all`
   - Submit: `eas submit --platform all`
   - Tech: Expo, React Native

### Shared Code (maintains parity)
```
packages/
├── @mk/api-client     # API calls (both platforms)
├── @mk/practice       # Practice logic (both platforms)
├── @mk/analytics      # Event tracking (both platforms)
├── @mk/tokens         # Design tokens (both platforms)
└── @mk/ui            # UI components (both platforms)
```

### Deployment Workflow
```bash
# One codebase, two deployments:
git push origin main

✅ Vercel auto-deploys web app
✅ Shared packages updated for both

# Mobile requires manual trigger:
🔨 eas build --platform all
📱 eas submit --platform all
```

### How Parity Works
- **Business logic**: Shared in `packages/practice`
- **API contracts**: Shared in `packages/api-client`
- **UI layer**: Platform-specific (Next.js vs React Native components)
- **Deployment cadence**: Web continuous, mobile weekly/monthly

### Key Point
You maintain **ONE codebase** with shared TypeScript, but deploy to **TWO platforms** independently. Changes to shared packages affect both web and mobile automatically.

---

### 27. 2025-11-14 – Vercel native cron for reminders (`e43c0ab`)
**Files**: `vercel.json`, `.github/workflows/reminder-cron.yml`
**What Changed**: Configured Vercel's built-in cron system in `vercel.json` to invoke `/api/cron/reminders` hourly at :10 past the hour. This replaces the GitHub Actions workflow as the primary reminder delivery mechanism, automatically bypassing Vercel's deployment protection and integrating seamlessly with the platform. All required secrets (CRON_SECRET, DATABASE_URL, etc.) were added to both Vercel production environment and GitHub Actions.
**Impact**: Push reminders will now be delivered reliably via Vercel's native cron infrastructure. The `/api/cron/reminders` endpoint is accessible to Vercel cron jobs without authentication barriers, while still requiring the CRON_SECRET bearer token for security. GitHub Actions workflow remains as a fallback smoke test but is no longer the primary delivery mechanism.
**Action for Agents**: Monitor Vercel's cron logs in the dashboard (Settings → Cron) to verify hourly executions. The endpoint returns structured JSON with `{ ok, sent, evaluated, errors, revoked, durationMs, runId }` for monitoring. If adding new cron jobs, add them to the `crons` array in `vercel.json` and ensure CRON_SECRET is set in Vercel environment variables.

### 26. 2025-11-14 – Vercel deployment errors resolved (`cb58320`)
**Files**: `app/api/mobile/auth/{callback,expo-complete}/route.ts`, `lib/mobile-auth{,-token}.ts`, `lib/mobile-reminders.ts`, `vitest.react-native.stub.ts`, `scripts/run-reminder-cron-smoke.mjs`, `app/[locale]/translate/page.tsx`, `components/{layout,translate}/*`, `hooks/useMissionStatus.ts`
**What Changed**: Fixed all TypeScript/ESLint errors blocking CI/CD: added required `salt: ''` parameter to JWT encode/decode calls (NextAuth beta.30 requirement), fixed mobile-reminders type narrowing with explicit type assertion, removed unused imports/variables, added missing layout and translate components to git, added useMissionStatus hook. All checks now pass: TypeScript ✅, Build ✅, ESLint ✅, Deployment ✅.
**Impact**: Vercel deployments succeed automatically on every push. The web app is now continuously deployed. Mobile app remains separate (deploy via EAS when ready).
**Action for Agents**: All JWT operations require `salt: ''` parameter with NextAuth beta.30. When adding new components, ensure they're committed to git (not just locally created). Run `npx tsc --noEmit && npx eslint .` before pushing to catch errors early.

### 25. 2025-11-15 – Translator workspace dual-pane redesign (`TBD`)
**Files**: `app/[locale]/translate/page.tsx`, `components/translate/{useTranslatorWorkspace.ts,HistoryList.tsx,InfoPanel.tsx}`, `messages/{en,mk}.json`
**What Changed**: Rebuilt the translator route to match the mobile UI overhaul blueprint: dual-pane layout on desktop, mobile tabs, segmented direction control, shared history cards, consistent info panels, and a new hook that centralizes translation/state management (including analytics + local history). Added skeleton states, reusable components, and localized strings for the new UI.
**Impact**: Users get a richer translator experience that mirrors the native blueprint, and future work can reuse the new hook/components instead of duplicating state logic. Any translator-related updates should go through the hook so analytics/history stay in sync, and new strings must be added to both `en` and `mk`.
**Action for Agents**: Use `useTranslatorWorkspace` for future translator features, extend `components/translate/*` rather than re-implementing history/info UIs, and update both locale files when adding translator copy.

### 24. 2025-11-15 – Quick Practice difficulty presets + telemetry (`TBD`)
**Files**: `apps/mobile/features/practice/useMobileQuickPracticeSession.ts`, `apps/mobile/app/(tabs)/practice.tsx`, `apps/mobile/features/practice/usePracticeCompletionQueue.ts`, `packages/api-client/src/practice.ts`, `app/api/mobile/practice-completions/route.ts`, `docs/projects/2025-12-react-native-expo/execution_steps.md`
**What Changed**: Added the Casual/Focus/Blitz difficulty selector to Quick Practice (timers, heart penalties, XP multipliers) plus the UI polish to surface it in the HUD. Session completions now record the selected difficulty, and the `/api/mobile/practice-completions` payload/schema learned an optional `difficulty` field so analytics and rewards can differentiate between tiers.
**Impact**: Learners see the difficulty tier, countdown timer, and XP boost inside the mobile Practice screen, and queued completions tag the new enum. Any consumers of `PracticeCompletionEventPayload` must tolerate (and eventually store) the optional `difficulty` value.
**Action for Agents**: When adding new difficulty tiers or changing timers/multipliers, update the hook presets and the queue/API schema in tandem. Downstream services should persist the `difficulty` field before relying on it for rewards or streak tuning.

### 23. 2025-11-14 – Expo NextAuth sign-in + mobile release docs (`TBD`)
**Files**: `app/api/mobile/auth/expo-complete/route.ts`, `apps/mobile/lib/auth/{AuthProvider.tsx,index.ts,mobileAuthApi.ts,tokenStore.ts}`, `apps/mobile/app/sign-in.tsx`, `apps/mobile/package.json`, `.github/workflows/ci.yml`, `apps/mobile/__tests__/offline-smoke.test.ts`, `README.md`, `docs/projects/2025-12-react-native-expo/{notes.md,execution_steps.md}`
**What Changed**: Replaced the temporary `/api/mobile/auth/authorize` flow with `/api/mobile/auth/expo-complete`, so the Expo browser session now bounces through the hosted NextAuth providers, returns a signed JWT via `mkll://auth`, and hydrates SecureStore/React Query automatically. `/sign-in` defaults to the “Continue with browser” CTA (credentials remain for QA), `registerPushTokenWithBackend` continues to forward the bearer header, `npm run test` now covers the offline mission/profile/practice fallbacks, and CI gained a `unit-tests` job alongside a refreshed README/release checklist describing Play Store/TestFlight prep + Maestro smoke expectations.
**Impact**: Signing into the Expo app mirrors the web NextAuth experience (OAuth + credentials) and reuses the exact tokens the backend expects, so reminders, XP queues, and analytics all tie back to the signed-in learner. Contributors must keep the offline fixtures/tests updated when changing mission/profile/practice payloads, and CI will fail if these smoke checks regress.
**Action for Agents**: Use `npm run mobile:start` + the “Continue with browser” CTA whenever you need authenticated API data, update `apps/mobile/__tests__/offline-smoke.test.ts` when touching the fallback fixtures, keep `.github/workflows/ci.yml`’s `unit-tests` job green, and follow the release checklist in `docs/projects/2025-12-react-native-expo/notes.md` before cutting new preview/beta builds.

### 22. 2025-11-13 – Live data required for Home/Discover/Profile (`TBD`)
**Files**: `packages/api-client/src/{mission,discover,news,profile}.ts`, `app/api/discover/feed/route.ts`, `data/discover-feed.json`, `apps/mobile/app/(tabs)/{home,discover,profile}.tsx`, `apps/mobile/features/discover/sections.tsx`, `apps/mobile/features/news/HeadlinesSection.tsx`, `apps/mobile/lib/api.ts`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: The API client hooks now throw when `EXPO_PUBLIC_API_BASE_URL` is missing instead of silently returning JSON fixtures, Discover cards/events include `ctaTarget` metadata, the Expo Discover tab routes CTAs to the correct tab/modal/external link, and Profile badges (plus the “Manage” CTA) navigate to their respective settings/practice/discover views instead of being inert. Headlines gained clearer empty/error messaging, and `apps/mobile/lib/api.ts` exposes `requireApiBaseUrl()` for future call sites.
**Impact**: Expo builds no longer mask missing backend config—real Prisma/RSS data is the default path, CTA buttons actually land users in the right surfaces, and QA/beta testers can trust that tapping any badge or Discover card hits a real route. Fixtures remain opt-in previews with prominent warnings.
**Action for Agents**: Always set `EXPO_PUBLIC_API_BASE_URL` (and `EXPO_PUBLIC_PROJECT_ID`) before running `npm run mobile:start`. When adding new Discover cards/events or badges, wire `ctaTarget` appropriately so buttons continue to deep-link into the app; only fall back to fixtures when intentionally testing offline.

### 21. 2025-11-14 – Prisma-backed mission/profile/discover APIs (`TBD`)
**Files**: `app/api/cron/reminders/route.ts`, `lib/expo-push.ts`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: The cron endpoint now logs structured summaries (runId, sent, revoked, duration), only stamps `lastReminderSentAt` for successful deliveries, and auto-revokes tokens when Expo returns `DeviceNotRegistered`. `lib/expo-push` now surfaces per-ticket results so we can act on Expo errors, and the project notes include the env prerequisites + device validation log required for Step 14.
**Impact**: Cron runs are auditable, unhealthy runs (“sent === 0”) are easy to alert on, and dead Expo tokens are cleaned up automatically instead of spamming errors.
**Action for Agents**: Preserve the structured logging when touching `/api/cron/reminders`, inspect the run summary before/after deploying cron jobs, and update the Step 14 device log once you complete physical Android/iOS validation.

### 21. 2025-11-14 – Prisma-backed mission/profile/discover APIs (`TBD`)
**Files**: `app/api/{missions/current,profile/summary,discover/feed}/route.ts`, `packages/api-client/src/news.ts`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md,mission-api.md}`
**What Changed**: Implemented authenticated Prisma-powered routes for missions (GameProgress + JourneyProgress aggregation), profile summaries (XP/streak/quests/badges), and the Discover feed (modules/lessons + Word Lab events), plus tightened the news client hook so Expo/web consume the live `/api/news` payload. All three endpoints emit `x-*-source` headers and fall back to the JSON fixtures only when Prisma or upstream RSS is unavailable.
**Impact**: Setting `EXPO_PUBLIC_API_BASE_URL` now delivers real learner data end-to-end in the Expo Home/Discover/Profile tabs; QA can inspect the response headers to confirm whether a payload came from Prisma or the local fixture. Docs/logs were updated so future agents know the telemetry and verification steps.
**Action for Agents**: Keep Prisma models/contracts in sync with `@mk/api-client`, update the mission/profile docs when adding new fields, and surface any additional deep links/CTA targets through the shared payloads instead of hard-coding them in clients.

### 19. 2025-11-13 – Discover headlines powered by `/api/news` (`TBD`)
**Files**: `data/news-fallback.json`, `app/api/news/route.ts`, `packages/api-client/src/{news.ts,index.ts}`, `apps/mobile/app/(tabs)/discover.tsx`, `apps/mobile/features/news/HeadlinesSection.tsx`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Moved the news fallback data into a shared JSON file, exposed `useNewsFeedQuery` in `@mk/api-client`, and wired the Discover tab to show live headlines via `/api/news` (with graceful fallbacks + external links).
**Impact**: Editors only update one JSON (or the future CMS) to feed both the API and the Expo UI; the Discover tab now showcases real headlines next to its curated cards/events.
**Action for Agents**: When adding new sources or CMS-backed data, update `app/api/news/route.ts` + `packages/api-client/src/news.ts` and keep the fallback file in sync. Use the new `HeadlinesSection` when embedding headlines elsewhere.

### 18. 2025-11-13 – `/api/discover/feed` endpoint for shared editorial data (`TBD`)
**Files**: `app/api/discover/feed/route.ts`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Added a server route that returns the curated Discover feed (currently backed by `data/discover-feed.json`) with cache headers so web + Expo call the same endpoint instead of relying on local fallbacks.
**Impact**: Discover surfaces now consume identical data whether they run against localhost or production, unblocking backend/CMS work to swap in live content without touching the mobile client.
**Action for Agents**: When the CMS or backend feed lands, update this route (and `@mk/api-client` helpers) rather than introducing new fetch logic in clients; keep cache headers aligned with editorial cadence.

### 15. 2025-11-13 – Expo translator wired to Next API (`TBD`)
**Files**: `apps/mobile/lib/api.ts`, `apps/mobile/app/(tabs)/{home.tsx,translator.tsx}`, `packages/api-client/src/{translate.ts,index.ts}`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Added a reusable API base resolver, introduced `translateText`/`TranslateTextError` in `@mk/api-client`, pointed the Home mission query at the configured backend URL, and rebuilt the Translator tab so it calls `/api/translate`, surfaces detected languages, dedupes history, and warns when `EXPO_PUBLIC_API_BASE_URL` is missing.
**Impact**: Expo builds now reach the live translator + mission endpoints whenever the API base env is set, and failures deliver actionable retry/config guidance instead of silent placeholders.
**Action for Agents**: Configure the API base env variable when testing on device, and use `translateText` for any future translator surfaces to keep error handling consistent across platforms.

### 16. 2025-11-13 – Translator history provider + inbox (`TBD`)
**Files**: `apps/mobile/app/_layout.tsx`, `apps/mobile/lib/translator/history.tsx`, `apps/mobile/app/(tabs)/translator.tsx`, `apps/mobile/app/(modals)/translator-history.tsx`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Added `TranslatorHistoryProvider` (AsyncStorage-backed) so any screen can add/read translation entries, wrapped the Expo tree with it, updated the Translator tab to write through the shared store, and swapped the Translator Inbox modal to render real data with loading/empty states.
**Impact**: The mission “Translator inbox” CTA now reflects recent activity, and translations persist between sessions without copy/pasting sample data. Future analytics or pinning features can reuse the same provider.
**Action for Agents**: Use `useTranslatorHistory()` whenever you need to display or mutate translation history, and avoid duplicating AsyncStorage logic elsewhere.

### 17. 2025-11-13 – Discover feed + events (`TBD`)
**Files**: `data/discover-feed.json`, `packages/api-client/src/{discover.ts,index.ts}`, `apps/mobile/features/discover/*`, `apps/mobile/app/(tabs)/discover.tsx`, `app/api/discover/feed/route.ts`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Defined the Discover feed contract + fallback data, added `useDiscoverFeedQuery` so both clients can consume it, shipped `/api/discover/feed`, and rebuilt the Discover tab with filter pills, editorial cards, and upcoming event entries.
**Impact**: The Discover tab now showcases real content while the backend route gives us a single place to swap in CMS data later.
**Action for Agents**: Extend the feed via `data/discover-feed.json` (or the API once hooked to CMS) and reuse the new components when adding additional categories/events.

### 18. 2025-11-13 – Profile summary hook + API (`TBD`)
**Files**: `data/profile-summary.json`, `packages/api-client/src/{profile.ts,index.ts}`, `app/api/profile/summary/route.ts`, `apps/mobile/app/(tabs)/profile.tsx`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Added the profile summary contract + fallback data, exposed `useProfileSummaryQuery`, wired `/api/profile/summary`, and rebuilt the Profile tab so it displays XP/streak/quest stats and badges tied to the shared payload.
**Impact**: Both mobile and future web profile surfaces can rely on the same schema today, and backend teams have a single endpoint to replace with Prisma data when ready.
**Action for Agents**: Update `data/profile-summary.json` (or the API) when changing profile stats, and reuse the new hook instead of hard-coding numbers in UI components.


### 14. 2025-11-13 – Mobile push-token API + reminder helpers (`TBD`)
**Files**: `prisma/schema.prisma`, `prisma/migrations/20251113180000_add_mobile_push_platform/migration.sql`, `lib/mobile-reminders.{ts,test.ts}`, `app/api/mobile/push-token/route.ts`, `apps/mobile/lib/notifications/{constants.ts,registerPushToken.ts}`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md,mission-api.md}`
**What Changed**: Added the `MobilePushToken` model (userId optional, locale/timezone/reminder metadata), introduced shared reminder window helpers + Vitest coverage, shipped `/api/mobile/push-token` with zod validation/opt-out handling/`nextReminderAt`, and updated the Expo notification stack to send locale + timezone with deduped reminder IDs.
**Impact**: Expo clients can now register or revoke reminder windows against a documented backend contract, backend helpers ensure cron jobs share the same reminder math as the device, and the docs spell out the remaining work (device smoke + cron fan-out) for the next agent.
**Action for Agents**: Run `npx vitest run lib/mobile-reminders.test.ts` + `npx eslint app/api/mobile/push-token/route.ts` after changes, keep `lib/mobile-reminders.ts` and `apps/mobile/lib/notifications/constants.ts` in sync when adding windows, and capture device/cron validation notes once those follow-ups land.

### 13. 2025-11-13 – Expo mission reminders scaffolding (`TBD`)
**Files**: `apps/mobile/{package.json,package-lock.json,app.json,app/_layout.tsx,app/(modals)/practice-settings.tsx}`, `apps/mobile/lib/notifications/*`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**What Changed**: Installed `expo-notifications` + AsyncStorage, wired the shared `NotificationProvider` into the app shell, exposed reminder toggles inside the Practice/Mission Settings modals, and documented the reminder windows/background sync flow ahead of the backend work.
**Impact**: Reminder windows now persist locally, the mission hero can surface scheduling status, and teammates know exactly where to plug in backend push support (Step 8).
**Action for Agents**: Use `useNotifications()` for reminder UI, update `apps/mobile/lib/notifications/constants.ts` if new windows are added, and run `npx eslint apps/mobile` after touching the notification stack.

### 12. 2025-11-13 – Quick Practice swipe stack + audio hook foundation (`TBD`)
**Files**: `packages/practice/src/{types.ts,cards.ts}`, `apps/mobile/features/practice/**/*`, `apps/mobile/app/(tabs)/practice.tsx`, `docs/projects/2025-12-react-native-expo/*`
**What Changed**: Added shared practice card unions + deck builder helpers, built the Expo card stack (typing/cloze/multiple choice/listening) with gesture + skip handling, implemented `useAudioPrompt` on top of expo-av/file-system, and rebuilt the mobile Practice tab around the new components.
**Impact**: Both platforms now draw from the same card definitions, the swipe UX is ready for Tamagui polish, and audio hooks/caching exist for the upcoming listening drills. Future Step 6/7 work can focus on polish + notifications without rethinking the core engine.
**Action for Agents**: Use the new `PracticeCardContent` types when touching Quick Practice, extend the deck builder instead of duplicating logic, and reuse `useAudioPrompt` for any audio playback so caching remains centralized.

### 9. 2025-11-12 – Mobile mission shell + practice modals (`TBD`)
**Files**: `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/{home,practice}.tsx`, `apps/mobile/app/(modals)/*`, `apps/mobile/features/home/*`, `docs/projects/2025-12-react-native-expo/*`
**What Changed**: Added the `(modals)` stack plus placeholder Practice Settings and Translator Inbox screens, rebuilt the Home tab around modular mission hero/tips/review/community sections, and wired quick actions on the Practice tab so Experience can focus on Tamagui polish. Execution steps + notes now reflect Step 3 being completed.
**Impact**: Native engineers have ready-made routes for future overlays, and both the home + practice tabs share a clear structure for follow-up design work. Navigation changes mean anyone adding new modals should register them under `app/(modals)/`.
**Action for Agents**: Import home sections from `apps/mobile/features/home/`, extend the data mock as needed, and use `router.push('/(modals)/...')` for any new overlays rather than ad-hoc modals.

### 10. 2025-11-12 – Mission API contract + shared hook (`TBD`)
**Files**: `docs/projects/2025-12-react-native-expo/mission-api.md`, `data/mission-status.json`, `packages/api-client/src/{mission.ts,index.ts}`, `apps/mobile/app/(tabs)/home.tsx`, `apps/mobile/features/home/*`
**What Changed**: Defined the `/api/missions/current` JSON contract, checked in a fallback payload, and shipped `useMissionStatusQuery` plus helper types so both web + native can consume the same mission data. The Expo Home tab now renders the mission hero/tips/review/community sections from the hook instead of hard-coded mocks.
**Impact**: Backend teams know the exact schema to build, while front-end teams can keep iterating using the JSON fallback. Any future mission changes should flow through `@mk/api-client`.
**Action for Agents**: Import `useMissionStatusQuery` for mission data, update `data/mission-status.json` when adjusting placeholder content, and keep the contract doc in sync with backend changes.

### 11. 2025-11-13 – Tamagui provider + native component migration (`TBD`)
**Files**: `package.json`, `package-lock.json`, `apps/mobile/app/_layout.tsx`, `packages/ui/src/theme/*`, `packages/ui/src/native/{Button,Card,ProgressRing,StatPill,Typography}.tsx`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Installed Tamagui, created the shared `AppThemeProvider` + config using our design tokens, and migrated all Expo-facing UI primitives to Tamagui so we stop duplicating style logic per screen. The Expo root now wraps screens in the Tamagui provider, keeping tokens/fonts consistent across native surfaces.
**Impact**: Future mobile work can rely on Tamagui variants instead of bespoke `StyleSheet`s, and design tokens stay in sync between web + native. Any new primitives should live in `packages/ui` so both platforms benefit.
**Action for Agents**: Import `AppThemeProvider` when you need the Tamagui context (Next.js will adopt it later), use the updated `Native*` components instead of rolling custom styles, and extend `tamaguiConfig.ts` if you introduce new token categories.

### 12. 2025-11-13 – Quick Practice swipe stack integration (`TBD`)
**Files**: `apps/mobile/app/(tabs)/practice.tsx`, `apps/mobile/features/practice/*`, `packages/practice/src/{cards.ts,session.ts}`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`
**What Changed**: Wired the new gesture-driven `CardStack` (plus expo-av audio cache) into the practice screen, replaced the legacy form UI with card modes (typing/cloze/multiple-choice/listening), and extended the shared `@mk/practice` deck + evaluation helpers so mobile/web share the same card definitions.
**Impact**: Mobile users now get the Step 6 swipe experience with hearts/accuracy updates, and future polish (Tamagui cosmetics, haptics, analytics) can iterate on the shared card deck without touching business logic twice.
**Action for Agents**: Use `useMobileQuickPracticeSession` and `CardStack` for Quick Practice work, add new card flavors via `packages/practice/src/cards.ts`, and keep evaluation logic in `session.ts` aligned with the web widget.

### 8. 2025-11-12 – Expo router foundation + shared practice helpers (`TBD`)
**Files**: `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/*`, `apps/mobile/features/practice/useMobileQuickPracticeSession.ts`, `components/learn/quick-practice/*`, `packages/practice/*`, `tsconfig.json`, `vitest.config.ts`, `docs/projects/2025-12-react-native-expo/*`
**What Changed**: Finalized the Expo Router Stack→Tabs layout with a shared `QueryClient` wrapper, pointed the mobile practice hook at the `@mk/practice` helpers, and added package-level Vitest coverage so web + native share the exact same constants/normalizers. Project docs now spell out the mobile scripts/workflow.
**Impact**: Native screens load without router warnings, and any change to the shared helpers automatically affects both platforms (with tests guarding parity). Future Expo work can focus on mission UI/modals instead of wiring.
**Action for Agents**: Keep importing practice utilities from `@mk/practice` (don’t duplicate normalization or cloze logic), update `docs/projects/2025-12-react-native-expo/` whenever you touch mobile scaffolding, and run `npx eslint apps/mobile` plus `npm run test -- QuickPracticeWidget` before shipping practice-related changes.

### 7. 2025-11-12 – Quick Practice UI split into modular components (`TBD`)
**Files**: `components/learn/QuickPracticeWidget.tsx`, `components/learn/quick-practice/{Header.tsx,Prompt.tsx,Controls.tsx,utils.ts}`, `docs/projects/2025-11-quick-practice-refactor/*`
**What Changed**: Broke the 900+ line widget into a thin orchestrator plus dedicated Header/Prompt/Controls components and shared utilities; added Vitest coverage for each subcomponent and the session hook; updated the project docs with the new structure and recorded the change. Verified with `npm run test -- Header Prompt Controls useQuickPracticeSession QuickPracticeWidget`.
**Impact**: Future UI tweaks can target the smaller components without scrolling through the full widget, shared helpers now live in `utils.ts`, and regressions will surface in the new unit tests before they hit the integration suite.
**Action for Agents**: When modifying Quick Practice, adjust the relevant subcomponent instead of editing the main widget, add any shared helpers to `utils.ts`, and extend the nearby component/hook tests when behavior changes.

### 6. 2025-11-12 – Removed legacy Android/iOS Capacitor shells (`TBD`)
**Files**: `android/` (deleted), `ios/` (deleted), `capacitor.config.ts`, `package.json`, `package-lock.json`, `README.md`, `MOBILE_APP_GUIDE.md`, `docs/github-issues-template.md`, `docs/create-issues-commands.md`, `docs/project-setup-complete.md`, `docs/poc-production-roadmap.md`, `docs/github-milestones-guide.md`, `docs/agents/handbook.md`
**What Changed**: Deleted the dormant Capacitor projects + config, removed dependencies, and marked all related documentation/milestones as “paused” so future contributors know mobile wrappers aren’t maintained.
**Impact**: Smaller repo/install footprint; no more `@capacitor/*` packages. Mobile workstreams now require a fresh implementation if/when they return.
**Action for Agents**: Don’t resurrect the old shells. If mobile becomes a priority again, plan a new approach (e.g., Expo/React Native) and document it under `docs/projects/`.

### 5. 2025-11-12 – Retired legacy automation scripts (`TBD`)
**Files**: `/scripts/*` (removed), `package.json`, `eslint.config.mjs`, `docs/IMPLEMENTATION-COMPLETE.md`, `docs/project-setup-complete.md`, `docs/google-sheets-content-template.md`, `VOCABULARY_AUDIT_REPORT.md`, `docs/agents/handbook.md`
**What Changed**: Deleted the unused `scripts/` directory (Google Sheets sync, audit helpers, etc.) and removed all references (`npm run sync:content`, ESLint ignores). Documentation now labels the automation as legacy, and the change log reminds agents to manage lesson data manually.
**Impact**: No more `npm run sync:content`; any content updates must use Prisma/admin tooling until a new pipeline exists. Reintroduce automation via `docs/projects/` if needed.
**Action for Agents**: Remove stale instructions in future docs, log new tooling in this change log, and avoid referencing the retired commands.

### 4. 2025-11-12 – Removed unused Continue Learning components (`TBD`)
**Files**: `components/learn/ContinueLearningServer.tsx`, `components/learn/ContinueLearningWidget.tsx`, `docs/IMPLEMENTATION-COMPLETE.md`
**What Changed**: Deleted the unused “Continue Learning” server/widget pair and annotated the documentation so new contributors don’t expect the widget to exist.
**Impact**: Slightly smaller bundle, fewer unused imports to maintain; no user-visible change.
**Action for Agents**: If a future widget is needed, build it fresh (don’t resurrect these files) and document the new flow in `docs/projects/`.

### 3. 2025-11-12 – Quick Practice modals split into shared components (`TBD`)
**Files**: `components/learn/QuickPracticeWidget.tsx`, `components/learn/quick-practice/CompletionModal.tsx`, `components/learn/quick-practice/GameOverModal.tsx`, `components/learn/quick-practice/confetti.ts`
**What Changed**: Extracted the celebration/game-over dialogs (and confetti CSS) into dedicated components under `components/learn/quick-practice/`, eliminating duplicated JSX between default and compact layouts.
**Impact**: Easier to iterate on modals or reuse them elsewhere without wading through the 1.5K-line widget; no behavioral change.
**Action for Agents**: When tweaking completion/game-over experiences, update the new subcomponents rather than inlining changes inside `QuickPracticeWidget`.

### 2. 2025-11-12 – Quick Practice hook + state refactor (`TBD`)
**Files**: `components/learn/QuickPracticeWidget.tsx`, `components/learn/quick-practice/useQuickPracticeSession.ts`, `components/learn/quick-practice/types.ts`, `components/learn/quick-practice/constants.ts`
**What Changed**: Moved all Quick Practice state/logic into `useQuickPracticeSession` (plus shared constants/types) so the widget component just orchestrates UI; kept existing behavior and tests green.
**Impact**: Easier to reuse session state, test logic, and extract additional subcomponents incrementally.
**Action for Agents**: When touching Quick Practice, update the hook (and accompanying tests) instead of stuffing more state into `QuickPracticeWidget`.

### 1. 2025-11-09 – Quick Practice mobile fixes & Vitest parity (`da13dad`)
**Files**: `components/learn/QuickPracticeWidget.tsx`, `components/learn/QuickPracticeWidget.test.tsx`
**What Changed**: Rebuilt Quick Practice CTA flow, added touch-only guard, replaced `style jsx` confetti with shared styles, updated Vitest helpers to mirror the new mobile workflow.
**Impact**: `npm run test -- QuickPracticeWidget` now passes; future UI tweaks must keep the pointer guard and blur textarea before hiding controls.
**Action for Agents**: Update co-located tests whenever you change Quick Practice; rely on the new drill-mode strings and helper utilities in tests.

### 1. 2025-11-08 – Next.js 15 API adjustments & toast fix (`a06e147`)
**Files**: `app/api/news/route.ts`, `app/[locale]/translate/page.tsx`, `app/api/admin/practice-vocabulary/*`, `components/ui/toast.tsx`
**What Changed**: Removed `request.ip` usages (use `request.headers.get('x-forwarded-for') ?? ...`), fixed duplicate vars and Zod enums, added `'use client'` to toast context component.
**Impact**: Builds no longer fail on Next.js 15; hooks/context now load on the client only.
**Action for Agents**: Do not reference `request.ip`; keep React hooks before conditional returns; mark hook-using components as client components.

---

_Archive older entries by copying them into `docs/agents/archive/change-log-<year>.md`._
