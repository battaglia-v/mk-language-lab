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
**Status**: 🔄
**Objective**: Wire expo-notifications and background tasks so missions can schedule streak reminders, and document how backend triggers push tokens.
> Spike reference: [`spikes/step-07-notifications.md`](./spikes/step-07-notifications.md)
**Files to Modify**:
- `apps/mobile/app/_layout.tsx`, `apps/mobile/app.json`
- `apps/mobile/lib/notifications/*` (provider, permissions, push-token helper, AsyncStorage settings)
- `apps/mobile/app/(modals)/mission-settings.tsx`, `apps/mobile/app/(modals)/_layout.tsx`
- `apps/mobile/app/(tabs)/home.tsx`, `apps/mobile/features/home/sections.tsx`
- `docs/projects/2025-12-react-native-expo/{notes.md,mission-api.md}`, `docs/agents/change-log.md`
**Changes Implemented (2025-11-13)**:
- Added `NotificationProvider` + `useNotificationSettings`, including Android channel config, permission polling, reminder scheduling via `expo-notifications`, and Expo push-token registration helper.
- Introduced the Mission Settings modal with reminder toggles, status chips, and Sync controls; wired it to the Home hero CTA.
- Enabled the expo-notifications plugin in `app.json` and surfaced reminder metadata across the UI + docs.
**Remaining To-Dos**:
- Ship the backend `POST /api/mobile/push-token` endpoint + persistence wiring.
- Run a physical-device Expo Go smoke test to validate push tokens + scheduled notifications.
**Success Criteria**:
- Dev builds can request permissions, store reminder preferences locally, and enqueue/cancel local reminders per window.
- Notes include backend expectations & testing steps.
**Verification Steps**:
1. `npx eslint apps/mobile`
**Dependencies**: Steps 3-5
**Owner**: Agent Infra
**Risk Level**: Medium

## Lessons Learned and Step Improvements
_(Log insights here as the project evolves.)_
