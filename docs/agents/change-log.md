# Shared Change Log

Add an entry whenever you introduce a change that affects other contributors (APIs, patterns, tooling, infra, data, etc.). Keep only the latest ~10 entries here; move older ones to `docs/agents/archive/`.

## How to Add an Entry
1. Append a new numbered section at the top.
2. Include date/time (UTC), files touched, summary, impact, guidance, and commit SHA.
3. Reference this update in your PR message.

---

### 13. 2025-11-13 – Expo mission reminders scaffolding (`TBD`)
**Files**: `apps/mobile/{package.json,package-lock.json,app.json,app/_layout.tsx,app/(tabs)/home.tsx,app/(modals)/{_layout,mission-settings}.tsx}`, `apps/mobile/features/home/sections.tsx`, `apps/mobile/lib/notifications/*`, `docs/projects/2025-12-react-native-expo/{execution_steps.md,notes.md,mission-api.md}`
**What Changed**: Installed `expo-notifications` + AsyncStorage, added a `NotificationProvider` (permission polling, Android channel config, reminder scheduling, push-token helper), exposed a Mission Settings modal + hero CTA for selecting reminder windows, and documented the draft `POST /api/mobile/push-token` contract.
**Impact**: All reminder/notification logic now flows through a single provider, reminder windows persist locally, and backend teams know exactly what payload to accept once the API ships. Until the server endpoint exists, token registration no-ops gracefully.
**Action for Agents**: Use `useNotifications()` for any reminder UI, add new windows via `apps/mobile/lib/notifications/useNotificationSettings.ts`, and coordinate before modifying `/api/mobile/push-token` expectations. Run `npx eslint apps/mobile` after touching these files.

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
