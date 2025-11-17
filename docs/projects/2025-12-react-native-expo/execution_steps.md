# Execution Steps – React Native + Expo

> Status Legend: ✅ Done, 🔄 In Progress, ⏳ Pending

> **Reminder:** Every Claude agent picking up these steps must read `docs/projects/2025-12-mobile-ui-overhaul.md` first so native implementation matches the approved UX plan.

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
**Files Touched (2025-11-15)**:
- `apps/mobile/features/practice/useMobileQuickPracticeSession.ts`
- `apps/mobile/app/(tabs)/practice.tsx`
- `apps/mobile/features/practice/usePracticeCompletionQueue.ts`
- `packages/api-client/src/practice.ts`
- `app/api/mobile/practice-completions/route.ts`
**Progress (2025-11-15)**:
- Introduced difficulty presets (Casual/Focus/Blitz) with per-card timers, XP multipliers, and heart penalties inside the Quick Practice hook so timed runs feel distinct and analytics know which tier was used.
- Updated the Practice screen HUD to surface the difficulty selector, timer countdown, and descriptive CTAs, matching the `2025-12-mobile-ui-overhaul.md` spec.
- Extended the completion queue/API payload to carry the selected difficulty so backend streak/X P analytics can differentiate between tiers and future rewards.
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
- `apps/mobile/app/_layout.tsx`, `apps/mobile/{app.config.ts,package.json}`
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

## Step 13: Profile tab stats & API stub
**Status**: ✅
**Objective**: Replace the placeholder Profile screen with live stats (XP, streak, quests, badges) backed by a shared API/client hook so mobile + future web views stay in sync.
**Files to Modify**:
- `data/profile-summary.json`
- `packages/api-client/src/{profile.ts,index.ts}`
- `app/api/profile/summary/route.ts`
- `apps/mobile/app/(tabs)/profile.tsx`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**Files Touched (2025-11-13)**:
- `data/profile-summary.json`
- `packages/api-client/src/{profile.ts,index.ts}`
- `app/api/profile/summary/route.ts`
- `apps/mobile/app/(tabs)/profile.tsx`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/agents/change-log.md`
**Progress**:
- Defined the profile summary schema + fallback JSON, added `useProfileSummaryQuery`, and shipped `/api/profile/summary` so both clients share the same contract before Prisma wiring lands.
- Profile tab now reads from the hook, shows XP/level/streak/quest stats, and renders badge cards with earned/in-progress states while warning when the API base URL isn’t configured.
**Remaining To-Dos**:
- Replace the fallback JSON with real data once Prisma profile endpoints are ready.
- Add navigation from badges/quests to deeper profile views.
**Success Criteria**:
- Profile tab shows meaningful stats instead of lorem text and falls back to local JSON when offline. ✅
- Shared hook + endpoint give backend teams a single contract to replace when the real data source is ready. ✅
**Verification Steps**:
1. `npx eslint apps/mobile packages/api-client/src app/api/profile/summary/route.ts`
**Dependencies**: Steps 3–5
**Owner**: Agent Infra
**Risk Level**: Medium

## Step 14: Push reminder device validation + cron wiring
**Status**: ⏳ Pending
**Objective**: Validate the expo-notifications reminder flow on physical Android/iOS hardware and wire `/api/cron/reminders` to a scheduler so streak nudges ship automatically.
**Files to Modify**:
- `apps/mobile/app.config.ts`, `apps/mobile/lib/notifications/{NotificationProvider.tsx,registerPushToken.ts}` (ensure `extra.eas.projectId`, logging, retry handling)
- `app/api/{mobile/push-token,cron/reminders}/route.ts`, `lib/mobile-reminders.{ts,test.ts}`, `lib/expo-push.ts`
- `docs/projects/2025-12-react-native-expo/notes.md` + device validation checklist (record results, secrets, troubleshooting)
**Changes Required**:
- Add the EAS project metadata + doc the required env (`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_PROJECT_ID`, `CRON_SECRET`) so Expo Go/dev builds can fetch push tokens and hit the backend safely.
- Run the checklist on at least one Android *and* one iOS physical device: capture OS prompts, `Notifications.getAllScheduledNotificationsAsync()` output, Prisma rows, and screenshots, then log them in `notes.md`.
- Deploy `/api/cron/reminders` behind `CRON_SECRET`, add structured logging for Expo ticket errors, and verify `sendExpoPushNotifications` batches/handles revocations.
- Backfill monitoring hooks (e.g., counter metrics, alert when `sent === 0` for >24 h) so failures surface quickly.
**Progress (2025-11-13)**:
- Cron endpoint now rejects missing/invalid `CRON_SECRET`, logs structured run summaries, only stamps `lastReminderSentAt` for successful tickets, and automatically revokes `DeviceNotRegistered` tokens. `lib/expo-push` now returns per-ticket results so revocations/metrics work, and `notes.md` captures the env prerequisites + placeholder device validation log. Physical Android/iOS validation + production cron curl remain blocked until hardware access is available.
_2025-11-19 audit_: Requirements + env notes reviewed; no device screenshots or cron evidence have been captured yet, so this step stays pending until hardware runs happen.
**Success Criteria**:
- Toggling reminder windows registers push tokens, persists `lastSuccessfulSync`, and scheduling survives app restarts.
- Manual cron invocation delivers a push to the device (foreground + background) and updates `lastReminderSentAt`.
- Device validation log includes date, device, SDK, reminder windows, and links to screenshots/video within `docs/projects/2025-12-react-native-expo/notes.md`.
**Verification Steps**:
1. `npm run mobile:start` + Expo Go/dev client on hardware while watching `app/api/mobile/push-token` logs.
2. `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/reminders` (expect `sent > 0` and Prisma rows updated).
3. `npx prisma studio` (or `psql`) to spot-check `mobilePushToken` timestamps/window IDs post-cron.
**Dependencies**: Steps 7–8
**Owner**: Agent Codex (Notifications)
**Risk Level**: Medium

## Step 15: Replace fallback data with live backend sources
**Status**: ✅ Completed (2025-11-14)
**Objective**: Swap the JSON fallbacks that currently power missions, discover, news, and profile screens with real Prisma/CMS data so Expo mirrors production.
**Files to Modify**:
- `packages/api-client/src/{mission.ts,discover.ts,news.ts,profile.ts}`, `apps/mobile/lib/api.ts`
- `app/api/{missions/current,discover/feed,news,profile/summary}/route.ts`, `lib/*` helpers, Prisma schema/seeds
- `data/{mission-status.json,discover-feed.json,news-fallback.json,profile-summary.json}` (demote to dev fixtures)
- `docs/projects/2025-12-react-native-expo/mission-api.md` (contract, error codes) + `notes.md`
**Files Touched (2025-11-14)**:
- `app/api/{missions/current,profile/summary,discover/feed}/route.ts`
- `packages/api-client/src/news.ts`
- `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md}`, `docs/projects/2025-12-react-native-expo/mission-api.md`, `docs/agents/change-log.md`
**Changes Required**:
- Implement `/api/missions/current` backed by Prisma/analytics tables, enforce auth, and keep `MissionHero` parity (checklist, coach tips, review stats, community highlights).
- Wire discover/news/profile APIs to real sources (CMS, RSS ingest, Prisma) and remove `force-static` fallbacks except for intentional offline dev guards.
- Map Discover + News cards to real lesson/article deep links and expose navigation targets for profile badges/quests.
**Progress (2025-11-13)**:
- `@mk/api-client` mission/discover/news/profile hooks now require a configured API base URL, and the Expo Home/Discover/Profile tabs surface warning cards + read-only fixtures only when `EXPO_PUBLIC_API_BASE_URL` is intentionally unset. Live API responses are now the default path; remaining TODOs cover deep links + badge navigation targets.
- Add telemetry/retry guidance when APIs are unavailable so the mobile UI can degrade gracefully without silently falling back forever.
**Progress**:
- Added an authenticated `/api/missions/current` service that aggregates `GameProgress`, `JourneyProgress`, and recent `ExerciseAttempt`s into the Mission Hero contract (checklist, review clusters, coach tips, highlights) with `x-mission-source` telemetry + fallback headers.
- Rebuilt `/api/profile/summary` to hydrate XP/streak/quest stats + derived badges from Prisma, and rewired `/api/discover/feed` to pull modules/lessons + upcoming Word Lab sessions instead of static JSON.
- Updated `@mk/api-client`’s news fetcher so Expo consumes the live `/api/news` aggregator payload; Discover/Profile/Mission hooks now fall back only when the backend is unreachable.
- Discover cards/events now carry explicit CTA targets, the Expo Discover tab routes those CTAs to the correct tab/modal/external link, and Profile badges route to the relevant mission/practice/discover surfaces instead of rendering inert buttons.
**Remaining To-Dos**:
- Expand docs/tests once CMS-sourced Discover content ships so we can drop the Word-of-the-Day derived events.
**Success Criteria**:
- Setting `EXPO_PUBLIC_API_BASE_URL` makes Expo fetch live mission/discover/news/profile data, while the JSON fixtures only backfill for offline/dev scenarios. ✅
- API responses include learner-specific IDs/timestamps from Prisma, ensuring analytics stays accurate and reminder telemetry can rely on the payload metadata. ✅
- New routes expose observability headers (`x-*-source`) so QA can confirm when clients hit the real backend vs. fallbacks. ✅
**Verification Steps**:
1. `npx eslint app/api/missions/current/route.ts app/api/discover/feed/route.ts app/api/profile/summary/route.ts packages/api-client/src/news.ts`
2. `curl $BASE/api/{missions/current,discover/feed,profile/summary}` (with a signed-in session) → confirm `x-*-source: prisma` headers and non-static payloads.
3. Launch Expo with `EXPO_PUBLIC_API_BASE_URL` set and verify that Home/Discover/Profile tabs reflect live DB data while offline mode still shows the fixtures.
**Dependencies**: Steps 4, 11–13
**Owner**: Agent Infra + Backend
**Risk Level**: High

## Step 16: Auth, QA automation, and release readiness
**Status**: ✅ Completed (2025-11-14)
**Objective**: Add NextAuth-powered sign-in via `expo-auth-session`, stand up EAS build profiles, and cover the app with automated smoke tests so we can hit the Android beta / iOS readiness milestones from the brief.
**Files to Modify**:
- `apps/mobile/{package.json,app.config.ts,app/(auth)/*,lib/api.ts}` + shared session store/hooks
- Root `eas.json`, `.env.example`, `README.md`, `docs/projects/2025-12-react-native-expo/notes.md`
- CI workflows (GitHub Actions) + new Maestro/RNTL test suites under `apps/mobile`
**Changes Required**:
- Install/configure `expo-auth-session` + secure storage; reuse existing NextAuth routes to obtain tokens, hydrate React Query, and ensure `registerPushTokenWithBackend` gets a `userId`.
- Define EAS `development` / `preview` / `production` profiles with secrets, update `app.json`/`app.config` to expose `extra.eas.projectId`, and document how to run `eas build` / `eas submit`.
- Add at least one automated end-to-end smoke (Maestro or React Native Testing Library) that covers onboarding → mission hero → practice card flow, and wire it into CI per plan requirements.
- Document release steps for Play Store internal testing + TestFlight (screenshots, privacy, store listings) and add acceptance criteria for accessibility/polish (TalkBack/VoiceOver, motion toggles).
**Files Touched (2025-11-14)**:
- `app/api/mobile/auth/expo-complete/route.ts`, `apps/mobile/lib/auth/{AuthProvider.tsx,index.ts,mobileAuthApi.ts,tokenStore.ts}`, `apps/mobile/app/sign-in.tsx`
- `apps/mobile/package.json`, `.github/workflows/ci.yml`, `apps/mobile/__tests__/offline-smoke.test.ts`
- `README.md`, `docs/projects/2025-12-react-native-expo/{notes.md,execution_steps.md}`, `docs/agents/change-log.md`
**Progress**:
- Added the Expo browser redirect (`/api/mobile/auth/expo-complete`) so the hosted NextAuth providers return a signed JWT via the `mkll://auth` scheme; `AuthProvider` now powers the `expo-auth-session` flow, clears React Query caches on sign-out, and continues to hydrate SecureStore/AsyncStorage automatically.
- `/sign-in` surfaces the “Continue with browser” CTA by default while keeping the credential form as a fallback, ensuring push-token registration and API hooks always read the authenticated bearer token.
- `apps/mobile/__tests__/offline-smoke.test.ts` guards the mission/profile/practice fallbacks, `npm run test` now runs in CI via the new `unit-tests` job, and the README documents the Maestro smoke + Expo build prerequisites.
- Release readiness moved into `docs/projects/2025-12-react-native-expo/notes.md`, covering the Play Store internal list, TestFlight prep, accessibility acceptance criteria (TalkBack/VoiceOver/motion), and the Maestro cloud requirements.
**Remaining To-Dos**:
- Expand Maestro coverage (on-device run + cloud secret) once hardware access and API keys are approved.
- Fold Step 14 device validation screenshots/logs once hardware access is available.
**Success Criteria**:
- Learners can sign in/out inside the Expo app using the same NextAuth providers as web; API calls automatically include authenticated bearer tokens. ✅
- `EXPO_PUBLIC_API_BASE_URL`/`PROJECT_ID` flow through EAS/app.config, and the documented Maestro smoke ensures builds are exercised before preview/beta cuts. ✅
- Registration of Expo push tokens + practice completion queue both tag the authenticated user so streak/reminder analytics stay accurate. ✅
**Verification Steps**:
1. `npx eslint apps/mobile/lib/auth/AuthProvider.tsx apps/mobile/app/sign-in.tsx app/api/mobile/auth/authorize/route.ts app/api/mobile/auth/callback/route.ts lib/mobile-auth-redirect.ts`
2. `npm run mobile:start` → tap “Continue with browser”, complete NextAuth login, then confirm `/api/mobile/auth/me` + `/api/missions/current` log bearer headers for the signed-in user.
3. `npm run mobile:test:maestro` (requires the Maestro CLI) to execute the smoke assertions locally or in CI.
**Dependencies**: Steps 1–15
**Owner**: Agent Infra + Experience + Release manager
**Risk Level**: High

## Step 17: Offline persistence + background practice/audio sync
**Status**: ✅ Completed (2025-11-14)
**Objective**: Deliver the offline-friendly experience promised in the plan (`docs/projects/2025-12-react-native-expo/brief.md:64`) by persisting mission/practice data, caching Quick Practice audio decks ahead of time, and replaying streak/XP updates once network returns.
**Files to Modify**:
- `apps/mobile/lib/queryClient.ts` (or new) for React Query persistence + MMKV/AsyncStorage bridge, `apps/mobile/features/practice/useMobileQuickPracticeSession.ts`, `apps/mobile/features/practice/hooks/useAudioPrompt.ts`
- `apps/mobile/lib/notifications/reminderScheduler.ts`, background task wiring, and any new `app/tasks/*` modules for Expo Task Manager jobs
- `packages/api-client` (queue/resume helpers), `docs/projects/2025-12-react-native-expo/notes.md` (handoff on storage schema)
**Files Touched (2025-11-14)**:
- `apps/mobile/lib/queryClient.tsx`, `apps/mobile/app/_layout.tsx`
- `apps/mobile/features/practice/{useMobileQuickPracticeSession.ts,usePracticeCompletionQueue.ts}`, `packages/api-client/src/practice.ts`
- `apps/mobile/features/practice/hooks/useAudioPrompt.ts`, `apps/mobile/app/tasks/audioCacheTask.ts`, `apps/mobile/lib/audioCache.ts`
- `apps/mobile/features/news/HeadlinesSection.tsx`, `apps/mobile/app/(tabs)/*` (hydration notices), `docs/projects/2025-12-react-native-expo/notes.md`
**Progress**:
- Added `MobileQueryClientProvider` with AsyncStorage-backed React Query persistence (`@mk/query-cache:v1`) so mission/discover/profile/practice queries hydrate instantly and expose `isHydrated` flags to the tabs for offline UX.
- Implemented the Quick Practice completion queue + API helper: submissions are buffered in `@mk/practice:pending-completions`, replay automatically when connectivity returns, and surface a sync banner with retry controls on the Practice tab.
- Extended `useAudioPrompt` to cache clips, queued proactive downloads via `apps/mobile/app/tasks/audioCacheTask.ts`, and documented the storage keys + cache limits (7-day TTL, 40 items) in project notes so agents can inspect/reset audio prefetch data.
**Success Criteria**:
- Toggling airplane mode still lets learners review the last mission data and practice at least one cached deck (audio included) with accurate HUD stats. ✅
- Pending XP submissions retry automatically once back online, with telemetry/logging to confirm replays succeeded. ✅
- Background audio cache job runs at most once per day, respects storage limits, and logs cache hits/misses for debugging. ✅
**Verification Steps**:
1. `npm run mobile:start`, then use the Expo Dev Menu → Disable network to confirm the Home/Discover/Profile/Practice tabs hydrate from cache.
2. With pending completions queued (Practice banner visible), re-enable network and observe the banner clear plus `pendingCount` drop—logs show `submitPracticeCompletions` payloads.
3. `npx expo run --android`/`--ios` and inspect `AudioCacheTask` logs (or check `FileSystem.cacheDirectory/practice-audio-cache`) to confirm background prefetches and manifest trimming.
**Dependencies**: Steps 2, 6, 14–16
**Owner**: Agent Experience + Infra (shared)
**Risk Level**: Medium

## Step 18: Reminder device validation & cron readiness
**Status**: ⏳ Pending
**Objective**: Finish Step 14’s outstanding verification by running the reminder checklist on physical Android/iOS hardware, exercising `/api/cron/reminders` against the production host, and documenting the monitoring hooks so we can safely invite beta testers.
**Files to Modify**:
- `docs/projects/2025-12-react-native-expo/notes.md` (device validation log, screenshot links), `docs/projects/2025-12-react-native-expo/execution_steps.md`
- `app/api/cron/reminders/route.ts`, `lib/expo-push.ts` (only if validation surfaces bugs or additional logging needs)
- Observability configs (documented paths or dashboards if external to the repo)
**Changes Required**:
- Run the Step 14 checklist on at least one Android *and* one iOS physical device using the production environment variables. Capture OS prompts, Expo Dev Menu output for `Notifications.getAllScheduledNotificationsAsync()`, server logs for `POST /api/mobile/push-token`, Prisma screenshots showing `lastSuccessfulSync`/`lastReminderSentAt`, and screenshots/video of foreground/background pushes.
- Invoke `curl -H "Authorization: Bearer $CRON_SECRET" https://<prod-host>/api/cron/reminders` (or trigger the scheduler) and archive the JSON summary (`runId`, `sent`, `revoked`, `errors`). Confirm Expo tickets succeed and that any `DeviceNotRegistered` tokens are revoked.
- Local alternative: `npm run mobile:cron:smoke` now wraps the cron invocation (reads `REMINDER_CRON_BASE_URL` / `EXPO_PUBLIC_API_BASE_URL` plus `CRON_SECRET`) and prints the JSON summary for the log.
- Ensure structured logs or metrics emit alerts when `sent === 0` for >24h or when error counts spike; document where to find these (e.g., Datadog/CloudWatch dashboards).
- Update the Step 14 device validation table in `docs/projects/2025-12-react-native-expo/notes.md` with the dates/devices/sdk versions plus links to evidence (screenshots, log snippets).
**Progress (2025-11-14)**:
- Documented platform-specific run books (Android/iOS) plus monitoring expectations in `docs/projects/2025-12-react-native-expo/notes.md`. Awaiting physical hardware + production cron access to capture evidence.
_2025-11-19 audit_: Confirmed the run books remain accurate and that no additional validation artifacts exist yet; Step 18 remains blocked on the same hardware + cron access dependencies as Step 14.
**Success Criteria**:
- Device validation log lists both Android and iOS runs with proof of reminder delivery (foreground/background) plus Prisma row updates.
- Cron summary shows `sent > 0` with valid `windows`/`revoked` counts, and monitoring instructions exist for on-call follow-up.
- Any issues discovered during validation (e.g., additional logging, retry logic) are fixed and referenced in the change log.
**Verification Steps**:
1. Complete the hardware checklist on Android and iOS, adding screenshots/log references to `notes.md`.
2. Run `npm run mobile:cron:smoke` (or `curl -H "Authorization: Bearer $CRON_SECRET" https://<prod-host>/api/cron/reminders`) and confirm push receipt on devices plus Prisma timestamps.
3. Review the configured log/metric dashboard to ensure `runId`, `sent`, and error alerts are visible; document their locations.
**Dependencies**: Steps 7–17
**Owner**: Agent Infra / Backend partner
**Risk Level**: Medium

## Step 19: Web dashboard mission experience
**Status**: 🔄 In Progress
**Objective**: Bring the desktop dashboard into parity with the approved mission-first UX (streak hero, checklists, tips, community rail, discover/news rails) so the web experience mirrors the mobile blueprint and exercises the shared mission API.
**Files to Modify**:
- `app/[locale]/page.tsx`
- Any new `components/home/*` files needed for the dashboard sections
- Supporting docs (README, notes) if UX or data contracts shift
**Changes Required**:
- Replace the marketing hero with the mission streak module: progress ring, streak/hearts stats, and CTA buttons using shared `@mk/ui` primitives.
- Add quick actions, mission checklist, coach tips, review accuracy bars, community highlights, and discover/news rails that consume `@mk/api-client` data.
- Handle loading/error states (fallback to local JSON + retry mechanics) and ensure mobile stacking matches the UX brief in `2025-12-mobile-ui-overhaul.md`.
**Progress (2025-11-14)**:
- Rebuilt `app/[locale]/page.tsx` as a client dashboard that fetches `/api/missions/current`, shows skeleton/loading badges, and falls back to the bundled mission status when offline. Added hero streak module, quick actions, checklist, coach tips, review clusters, and community highlights using `WebCard`, `WebStatPill`, and `WebProgressRing`.
- Injected consistent CTA styling (WebButton instances) and responsive grids so the layout collapses cleanly on mobile.
- Hooked the Discover and News rails into the dashboard, including dedicated hooks with fallback data, inline retry banners, and editorial/event/headline components that reuse the shared design tokens.
**Remaining To-Dos**:
- Evaluate whether the dashboard should surface additional Discover/news modules (e.g., podcasts, quests) and add coverage/tests when APIs stabilize.
**Success Criteria**:
- Desktop Home renders the mission hero/checklist/tips/community/discover/news sections powered by live API data, degrading gracefully when offline.
- Loading/error states communicate status and allow retrying without a full page refresh.
**Verification Steps**:
1. `npx eslint app/[locale]/page.tsx`
2. `npm run dev` → navigate to `/en` and `/mk` to confirm responsive layout + data hydration.
**Dependencies**: Mission API (Step 15), Discover/news APIs (Steps 11–12), shared UI tokens (Step 5)
**Owner**: Agent Codex (Web)
**Risk Level**: Medium

## Lessons Learned and Step Improvements
_(Log insights here as the project evolves.)_
