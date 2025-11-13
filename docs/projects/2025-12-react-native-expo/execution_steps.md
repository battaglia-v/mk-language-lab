# Execution Steps – React Native + Expo

> Status Legend: ✅ Done, 🔄 In Progress, ⏳ Pending

## Step 1: Monorepo + Expo foundation hardening
**Status**: ✅
**Objective**: Ensure the Expo app consumes shared packages, uses the new router layout, and has clear workspace/test commands so other agents can build on top safely.
**Files to Modify**:
- `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/*`
- `packages/*` (shared tokens/practice utilities)
- `package.json`, `tsconfig.*` (only if new paths/scripts are needed)
**Changes Required**:
- Establish root layout + tab layout pattern for Expo Router (Stack + Tabs separation).
- Hook Expo screens into shared QueryClient/context wrappers.
- Document coordination + scripts in this project folder.
**Success Criteria**:
- `npm run mobile:start` boots without route warnings.
- Shared packages resolve from the Expo app without relative hacks.
**Verification Steps**:
1. `npm run mobile:web` (smoke tests bundler in CI-friendly mode).
2. `npm run lint -- apps/mobile` (if lint takes too long, run `npx eslint apps/mobile`).
_Latest run (2025-11-12)_: `npx eslint apps/mobile`
**Dependencies**: None
**Risk Level**: Medium

## Step 2: Shared Quick Practice logic + parity tests
**Status**: ✅
**Objective**: Reuse the same session logic (normalize, constants, cloze helpers) between web and native to avoid drift.
**Files to Modify**:
- `packages/practice/*`
- `components/learn/quick-practice/*`
- `apps/mobile/features/practice/useMobileQuickPracticeSession.ts`
**Changes Required**:
- Export practice helpers from `@mk/practice` and replace duplicated logic in both clients.
- Add light unit coverage (or shared fixtures) to ensure parity for normalization + cloze splitting.
**Success Criteria**:
- Both hooks rely on shared helpers; only platform-specific UI remains.
- Tests or type checks catch regressions when helpers change.
**Verification Steps**:
1. `npm run lint -- apps/mobile`
2. `npm run test -- QuickPracticeWidget`
3. `npm run test -- packages/practice`
_Latest run (2025-11-12)_: Commands above
**Dependencies**: Step 1
**Risk Level**: Medium

## Step 3: Mission shell + navigation polish
**Status**: ✅
**Objective**: Flesh out the Home + Practice tab experience (mission hero, stats, placeholder data) and wire future modals/stacks.
**Files to Modify**:
- `apps/mobile/app/(tabs)/home.tsx`
- Future components under `apps/mobile/features/home/*`
**Changes Required**:
- Implement mission hero layout & placeholder data matching the UX brief.
- Set up Stack routes for modals (practice settings, translator history) to unblock other agent.
**Success Criteria**:
- Home tab mirrors mission structure from `2025-12-mobile-ui-overhaul.md`.
- Navigation tree includes `(tabs)` + `(modals)` segments ready for deep links.
**Verification Steps**:
1. `npx eslint apps/mobile`
_Latest run (2025-11-12)_: `npx eslint apps/mobile`
**Dependencies**: Step 1
**Risk Level**: Medium

## Step 4: Mission API contract + shared client
**Status**: ✅
**Objective**: Define the mission status API, provide a local fallback payload, and ship a shared React Query hook so mobile/web can consume the same data.
**Files to Modify**:
- `docs/projects/2025-12-react-native-expo/mission-api.md`
- `data/mission-status.json`
- `packages/api-client/src/{mission.ts,index.ts}`
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/features/home/*`
**Changes Required**:
- Document JSON contract + error handling for `/api/missions/current`.
- Add `fetchMissionStatus`, `useMissionStatusQuery`, and `getLocalMissionStatus` in `@mk/api-client`.
- Replace the Home tab mocks with mission data derived from the hook (falling back to the local JSON for now).
**Success Criteria**:
- Both Expo + future web clients can import the same mission hook/types.
- Home hero/tips/review/community sections render using API data with no type errors.
**Verification Steps**:
1. `npx eslint apps/mobile packages/api-client/src`
**Dependencies**: Step 3
**Risk Level**: Medium

## Step 5: Tamagui theme + shared token system
**Status**: ✅
**Objective**: Move Expo UI primitives to Tamagui (or NativeWind fallback) using the same semantic tokens from `docs/design/tokens.md`, so Agent Experience can land the final polish once the Tamagui library is configured.
**Files to Modify**:
- `packages/ui` (introduce Tamagui config + wrapper components)
- `apps/mobile/app/_layout.tsx` (theme provider)
- `docs/design/tokens.md`, `docs/projects/2025-12-react-native-expo/notes.md`
**Changes Required**:
- Export tokens as Tamagui theme + fonts, document usage.
- Replace `NativeCard/Button/StatPill` internals with Tamagui primitives (props stay the same to avoid churn).
- Add Storybook or Expo Preview instructions for Experience.
**Success Criteria**:
- `npm run mobile:start` renders the Home + Practice tabs with the new theme, no runtime warnings.
- Tokens stay in sync between web Tailwind + Tamagui (documented process in notes).
**Verification Steps**:
1. `npx eslint apps/mobile packages/ui`
_Latest run (2025-11-13)_: `npx eslint apps/mobile packages/ui`
**Dependencies**: Step 4
**Owner**: Agent Experience
**Risk Level**: Medium

## Step 6: Quick Practice 2.0 swipe stack + audio hooks
**Status**: ✅
**Objective**: Implement the swipeable card UX (Cloze/Multiple Choice/Listening/Typing) + audio preview pipeline described in `2025-12-mobile-ui-overhaul.md`, reusing the shared `@mk/practice` helpers wherever possible.
> Spike reference: [`spikes/step-06-gesture-audio.md`](./spikes/step-06-gesture-audio.md)
**Files to Modify**:
- `apps/mobile/features/practice/*`, `apps/mobile/app/(tabs)/practice.tsx`
- `packages/practice/*` (new card format types)
- `components/learn/quick-practice/*` (to keep web + mobile aligned)
- `docs/projects/2025-12-react-native-expo/notes.md`
**Changes Required**:
- ✅ Build swipe stack component with gesture handlers + haptics (`apps/mobile/features/practice/components/SwipeableCard.tsx` + `PracticeCardContentView`).
- ✅ Add audio playback hooks (expo-av) with caching stubs (`apps/mobile/features/practice/hooks/useAudioPrompt.ts` + new Expo deps).
- ✅ Mirror the card definitions on web so future parity work is easier (`packages/practice/src/cards.ts`, `buildPracticeDeck`, `PracticeCardKind` exports).
- ✅ Update the native Practice screen HUD + modals to consume the stack/audio plumbing.
**Success Criteria**:
- Mobile practice screen uses the new card stack with working hearts/XP flow.
- Web still compiles; shared types cover the new card data.
**Verification Steps**:
1. `npx eslint apps/mobile`
2. `npm run test -- components/learn/QuickPracticeWidget.test.tsx`
**Dependencies**: Step 2
**Owner**: Agent Infra (with Experience on polish)
**Risk Level**: High

## Step 7: Notifications + mission reminders
**Status**: ✅
**Objective**: Wire expo-notifications and background tasks so missions can schedule streak reminders, and document how backend triggers push tokens.
> Spike reference: [`spikes/step-07-notifications.md`](./spikes/step-07-notifications.md)
**Files Touched (2025-11-13)**:
- `apps/mobile/app/_layout.tsx`, `apps/mobile/{app.json,package.json}`
- `apps/mobile/lib/notifications/*` (provider, scheduler, permissions, push-token helper, constants)
- `apps/mobile/app/(modals)/{mission-settings,practice-settings}.tsx`, `apps/mobile/app/(tabs)/home.tsx`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**Progress**:
- Expo tree now wraps every screen in `NotificationProvider`, reminder toggles live inside Mission/Practice Settings, and reminder windows persist across launches via AsyncStorage + background sync.
- Home hero CTA links directly to reminder settings, and analytics/docs capture the flows so other agents can extend them safely.
**Remaining To-Dos**:
- Run a physical-device Expo Go smoke test once the backend endpoint (Step 8) is verified.
**Success Criteria**:
- Dev builds can request permissions, store reminder preferences locally, and enqueue/cancel local reminders per window. ✅
- Notes include backend expectations & testing steps. ✅
**Verification Steps**:
1. `npx eslint apps/mobile`
_Latest run (2025-11-13)_: `npx eslint apps/mobile`
**Dependencies**: Steps 3-5
**Owner**: Agent Infra
**Risk Level**: Medium

## Step 8: Backend push-token endpoint + device validation
**Status**: ✅ (device smoke + cron fan-out still pending)
**Objective**: Ship the `/api/mobile/push-token` endpoint + Prisma model, then validate the full push/reminder loop on physical devices.
**Files Touched (2025-11-13)**:
- `prisma/schema.prisma`, `prisma/migrations/20251113180000_add_mobile_push_platform/migration.sql`
- `lib/mobile-reminders.{ts,test.ts}`
- `app/api/mobile/push-token/route.ts`
- `docs/projects/2025-12-react-native-expo/{mission-api.md,notes.md,execution_steps.md}`, `docs/agents/change-log.md`
**Progress**:
- Added the `MobilePushToken` model (userId optional, locale/timezone/reminder metadata, sync timestamps) plus shared helpers/tests so backend + mobile agree on reminder window math.
- Implemented the `/api/mobile/push-token` endpoint with zod validation, anonymous-friendly auth, reminder dedupe, opt-out handling, and `nextReminderAt` computation powered by the helper utilities.
- Updated docs/change-log with the new contract and hooked the Expo client to send locale/timezone + deduped window IDs.
**Remaining To-Dos**:
- Physical-device smoke test (Expo Go or dev build) to confirm permissions + scheduled reminders end-to-end.
- Worker/cron fan-out that calls the Expo Push API when mission reminders come due (depends on infra availability).
**Success Criteria**:
- API returns 200 and persists tokens (verified locally via Prisma client). ✅
- Docs describe the contract + follow-up work for cron/device validation. ✅
**Verification Steps**:
1. `npx eslint app/api/mobile/push-token/route.ts`
2. `npx vitest run lib/mobile-reminders.test.ts`
**Dependencies**: Step 7
**Owner**: Agent Infra (handoff-ready for backend-focused agent)
**Risk Level**: Medium

## Step 9: Translator tab – Next.js API integration
**Status**: ✅
**Objective**: Replace the Expo translator placeholder with the live `/api/translate` endpoint, reuse the shared API helpers, and surface richer UX states (detected language, retry hints).
**Files Touched (2025-11-13)**:
- `apps/mobile/lib/api.ts`, `apps/mobile/app/(tabs)/home.tsx`
- `packages/api-client/src/{translate.ts,index.ts}`
- `apps/mobile/app/(tabs)/translator.tsx`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**Progress**:
- Added a reusable API base resolver so Expo screens (home + translator) automatically call the deployed Next.js backend when `EXPO_PUBLIC_API_BASE_URL` is provided.
- Shipped `translateText` + `TranslateTextError` in `@mk/api-client`, mirroring the server contract (status + retryable flags) for consistent error handling.
- Rebuilt the Translator tab UI: live fetches, detected-language pills, retry-friendly error copy, configuration warning, and history entries that store real translations.
**Remaining To-Dos**:
- Validate the experience on a physical device (Expo Go or dev build) to ensure LAN/production URLs work as expected.
- Decide whether an offline fallback is needed when the API base URL is intentionally missing.
**Success Criteria**:
- Expo users see real translations whenever the API base is configured, and the UI clearly calls out missing configuration or retryable failures. ✅
- Shared client utilities keep translator calls consistent between future surfaces (web/native). ✅
**Verification Steps**:
1. `npx eslint apps/mobile packages/api-client/src`
**Dependencies**: Steps 1–4 (shared API utilities), Step 8 (backend endpoint)
**Owner**: Agent Infra
**Risk Level**: Medium

## Step 10: Translator history sync across surfaces
**Status**: ✅
**Objective**: Persist translation history (AsyncStorage) and surface it in both the Translator tab and the Translator Inbox modal so the mission links feel real.
**Files Touched (2025-11-13)**:
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/lib/translator/history.tsx`
- `apps/mobile/app/(tabs)/translator.tsx`
- `apps/mobile/app/(modals)/translator-history.tsx`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**Progress**:
- Added `TranslatorHistoryProvider` (AsyncStorage-backed) so any screen can add/read history without reimplementing storage logic; wired it into the Expo root layout.
- Translator tab now writes entries through the provider (deduped, with detected language metadata) and hydrates history on launch, displaying better loading/empty states.
- Translator Inbox modal consumes the shared history instead of mocks, showing timestamps, detected languages, and an empty-state message for new users.
**Remaining To-Dos**:
- Consider adding “Clear history” or pinning controls once the backend surfaces translator favorites.
- Mirror this provider on web if we ever need consistent cross-platform history counts.
**Success Criteria**:
- Recent translations persist between screen visits and feed the modal CTA. ✅
- UI communicates loading/empty states when history isn’t available yet. ✅
**Verification Steps**:
1. `npx eslint apps/mobile`
**Dependencies**: Step 9
**Owner**: Agent Infra
**Risk Level**: Low

## Step 11: Discover tab editorial feed
**Status**: ✅
**Objective**: Give the Discover tab a usable v1 with category filters, editorial cards, and upcoming events sourced from the new feed contract.
**Files Touched (2025-11-13)**:
- `data/discover-feed.json`
- `packages/api-client/src/{discover.ts,index.ts}`
- `apps/mobile/features/discover/*`, `apps/mobile/app/(tabs)/discover.tsx`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**Progress**:
- Defined the Discover feed schema (categories/cards/events), added `getLocalDiscoverFeed`, `fetchDiscoverFeed`, and `useDiscoverFeedQuery` so both web + native can share the contract once the backend ships.
- Built the Discover tab UI: filter pills, editorial cards with Tamagui accents, and an Upcoming Events list with local time formatting and CTA buttons.
- Stored fallback data in `data/discover-feed.json` so the screen renders immediately even before the API endpoint exists.
- Added `/api/discover/feed` so the mobile/web clients can already query the curated feed without waiting for CMS integration.
**Remaining To-Dos**:
- Hook the cards/actions up to real lesson or news deep links once those surfaces exist.
**Success Criteria**:
- Discover tab no longer shows a placeholder; it renders curated content with category filters and event summaries. ✅
- Feed contract lives in `@mk/api-client`, easing future backend connectivity. ✅
**Verification Steps**:
1. `npx eslint apps/mobile packages/api-client/src`
**Dependencies**: Steps 3–5
**Owner**: Agent Infra / Experience for polish
**Risk Level**: Medium

## Step 12: News headlines integration
**Status**: ✅
**Objective**: Surface the `/api/news` aggregator inside Discover so learners can skim live headlines alongside the curated feed.
**Files Touched (2025-11-13)**:
- `app/api/news/route.ts`, `data/news-fallback.json`
- `packages/api-client/src/{news.ts,index.ts}`
- `apps/mobile/app/(tabs)/discover.tsx`
- `apps/mobile/features/news/HeadlinesSection.tsx`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**Progress**:
- Extracted the news fallback data into `data/news-fallback.json`, exposed a shared `useNewsFeedQuery` in `@mk/api-client`, and wired `/api/news` to reuse the same fallback for offline scenarios.
- Added a Headlines section to the Discover tab with compact cards linking out to the source articles, reflecting the live aggregator whenever `EXPO_PUBLIC_API_BASE_URL` is set (falling back to the sample stories otherwise).
**Remaining To-Dos**:
- Replace external links with deep links once in-app article and audio experiences are available.
**Success Criteria**:
- Discover now shows up-to-date headlines with source + timestamps; the section gracefully handles loading/offline states. ✅
**Verification Steps**:
1. `npx eslint apps/mobile packages/api-client/src app/api/news/route.ts`
**Dependencies**: Steps 3–5, 11
**Owner**: Agent Infra
**Risk Level**: Low

## Lessons Learned and Step Improvements
_(Log insights here as the project evolves.)_
