# Collaboration Notes – React Native + Expo

Use this scratchpad to record async hand-offs, owner changes, or blocking issues so both agents stay aligned.

| Date (UTC) | Author | Note |
| --- | --- | --- |
| 2025-11-13 | Agent Codex | Kicked off Step 7: shipped `NotificationProvider`, AsyncStorage-backed reminder windows, Mission Settings modal + hero CTA, and the expo-notifications plugin wiring (lint: `npx eslint apps/mobile`). Still need the backend `POST /api/mobile/push-token` endpoint + physical device test before calling it done. |
| 2025-11-12 | Agent Infra | Bootstrapping Expo router split + shared helpers. Agent Experience owns tokens + polish next. |
| 2025-11-12 | Agent Codex | Ran `npx eslint apps/mobile` and `npm run test -- QuickPracticeWidget` to lock down the new foundations, then marked Steps 1-2 complete so the next agent can focus on the mission shell/modals work (Step 3). |
| 2025-11-12 | Agent Infra | Coordinated with Agent Experience: they’ll lead Tamagui/tokens + hero polish while we finish shared practice logic + tests. |
| 2025-11-13 | Agent Codex | Implemented the mission hero card, Smart Review rail, coach tips carousel, and wired the CTA buttons to the existing practice + modal routes. Linted with `npx eslint apps/mobile` after the refactor. |
| 2025-11-12 | Agent Codex | Added the mission hero/tips/review/community sections plus the new `(modals)` stack so Experience can jump straight into Tamagui polish; see Step 3 in `execution_steps.md` for details. |
| 2025-11-12 | Agent Infra | Shared session helpers now power both web + Expo hooks (`@mk/practice`), and parity tests cover normalization/cloze/selection so UI teams can iterate safely. |
| 2025-11-13 | Agent Codex | Applied the brief’s theming polish: new Home app bar, floating “Continue” pill, long-press checklist, and refreshed tip/review/community cards. Linted via `npx eslint apps/mobile`. |
| 2025-11-12 | Agent Codex | Drafted the mission API contract + `useMissionStatusQuery`, replaced the Home tab mocks with real mission data (still backed by the JSON fallback until the API ships). |
| 2025-11-13 | Agent Experience | Picked up Step 5 (Tamagui theme): added the Tamagui config/provider, migrated the native UI primitives (Button/Card/StatPill/Typography/ProgressRing), and wrapped the Expo app so Experience + Infra can share tokens going forward. |
| 2025-11-13 | Agent Infra | Queued Step 6 (Quick Practice 2.0 swipe stack) and Step 7 (notifications). Infra will own the gesture/audio plumbing; Experience will layer polish once Tamagui lands. |
| 2025-11-13 | Agent Infra | Step 6 in progress: hooked `useMobileQuickPracticeSession` into the new swipeable card deck, updated the practice screen to use `CardStack`, and wired the expo-av audio prompt hook + @mk/practice deck types. Remaining polish: Tamagui styling + haptics/analytics. |
| 2025-11-13 | Agent Infra | Added semantic surface/success/error tokens to `app/globals.css` + `@mk/tokens` and scrubbed the Home/translator/practice UIs to consume them. Experience can now hook Tamagui themes directly to these variables (Step 5), while Infra focuses on the swipe-stack/audio work in Step 6. |
| 2025-11-13 | Agent Infra | Authored spike plans for Step 6 (gesture/audio) and Step 7 (notifications). See `docs/projects/2025-12-react-native-expo/spikes/` for decisions, checklists, and testing strategy. |
| 2025-11-13 | Agent Infra | Landed Step 6: shared `buildPracticeDeck` types, Expo swipe stack (`SwipeableCard` + `PracticeCardContentView`), audio hook (`useAudioPrompt`), and the refreshed Practice tab HUD. Linted with `npx eslint apps/mobile` and kept web parity via `npm run test -- components/learn/QuickPracticeWidget.test.tsx`. Experience can layer Tamagui polish on top. |
| 2025-11-13 | Agent Infra | Landed the Step 6 foundations: shared practice card types, Expo card stack, `useAudioPrompt`, and the new Practice tab UI. Lint + `npm run test -- QuickPracticeWidget` both pass; Tamagui polish will follow via Step 5. |
| 2025-11-13 | Agent Infra | Wired `CardStack` results back into `useMobileQuickPracticeSession` (`handleResult` + `evaluateAnswer`), updated the listening card + audio hook so Expo playback actually works, and re-ran `npx eslint apps/mobile packages/practice` + `npm run test -- QuickPracticeWidget`. |
