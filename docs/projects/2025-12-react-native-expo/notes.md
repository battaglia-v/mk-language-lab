# Collaboration Notes – React Native + Expo

Use this scratchpad to record async hand-offs, owner changes, or blocking issues so both agents stay aligned.

| Date (UTC) | Author | Note |
| --- | --- | --- |
| 2025-11-14 | Agent Codex | Step 19 continuation: wired Discover + News rails into the dashboard with dedicated hooks, inline retry banners, and CTA links so the page now reflects the full mission-first UX brief. |
| 2025-11-14 | Agent Codex | Step 19 kickoff: rebuilt `app/[locale]/page.tsx` into the mission-focused dashboard (hero streak module, quick actions, checklist, tips, review/community rails) with loading/error states so the web surface mirrors the UX plan. |
| 2025-11-13 | Agent Codex | All Claude agents working on the React Native migration must read `docs/projects/2025-12-mobile-ui-overhaul.md` before committing changes so UX alignment stays intact; confirm access to that file (shared repo path) in your kickoff notes. |
| 2025-11-13 | Agent Codex | Verified and completed Expo/EAS setup: fixed `app.json` with correct projectId and slug, confirmed `eas.json` build profiles, validated `app.config.ts` scheme/projectId, updated `.env.local.example` and `apps/mobile/env.example` with actual project ID (5c712af3-a6e9-462d-8243-a119b56af569), verified package scripts (mobile:start, mobile:build:preview:android/ios), confirmed EAS CLI authentication. `npm run mobile:start` now boots successfully with only a non-critical expo-file-system version warning. All critical config files ready for commit. |
| 2025-11-15 | Agent Codex | Registered the Expo/EAS project (`@vbattaglia/makedonski-mk-language-lab`, projectId `5c712af3-a6e9-462d-8243-a119b56af569`) via `eas init`. `.env.local` and `apps/mobile/.env` now reference that ID so push tokens/EAS builds resolve the correct project. |
| 2025-11-15 | Agent Codex | Added Expo env placeholders to `.env.local.example` and committed `apps/mobile/env.example` so devs can copy/paste the required `EXPO_PUBLIC_*` settings. README’s native section now walks through copying those files and running `npm run dev` before launching `npm run mobile:start`, which should unblock anyone who ran the mobile app without configuring the API base URL. |
| 2025-11-14 | Agent Codex | Step 17 offline persistence landed: `MobileQueryClientProvider` now hydrates cached mission/discover/profile/practice queries via AsyncStorage key `@mk/query-cache:v1`, and the Quick Practice completion queue lives at `@mk/practice:pending-completions` (use the Practice tab banner to flush or delete the key to reset). |
| 2025-11-14 | Agent Codex | Audio prefetch task `practice-audio-cache` stores jobs at `@mk/practice:audio-prefetch-job` + manifest `@mk/practice:audio-cache-manifest`, runs daily on Wi-Fi, and writes clips under `FileSystem.cacheDirectory/practice-audio-cache`; clear those keys/folder to reclaim space or reset downloads. |
| 2025-11-14 | Agent Codex | Step 16 browser auth: replaced the temporary `/api/mobile/auth/authorize` flow with `/api/mobile/auth/expo-complete`, so `expo-auth-session` now launches the hosted NextAuth providers, bounces back through the `mkll://auth` deep link, and hands `AuthProvider` a signed JWT (persisted via SecureStore/AsyncStorage + React Query cache resets). `/sign-in` defaults to the “Continue with browser” CTA while keeping credentials as a fallback, and push-token registration automatically forwards the bearer header. |
| 2025-11-14 | Agent Codex | Step 16 release readiness: README + notes now spell out the Play Store internal testing + TestFlight checklists (assets, privacy, testers), `npm run test` runs the mobile offline smoke suite (mission/profile/practice fallbacks) via the new `unit-tests` CI job, and Maestro remains the go-to e2e option (`npm run mobile:test:maestro` w/ CLI + device). |
| 2025-11-14 | Agent Codex | Completed Step 15: shipped Prisma-backed `/api/missions/current`, `/api/profile/summary`, and `/api/discover/feed`, tightened the news client contract, documented the telemetry headers, and re-ran `npx eslint app/api/missions/current/route.ts app/api/discover/feed/route.ts app/api/profile/summary/route.ts packages/api-client/src/news.ts`. Expo now consumes live mission/discover/news/profile data whenever `EXPO_PUBLIC_API_BASE_URL` is set; JSON fixtures only appear when the backend is offline. |
| 2025-11-13 | Agent Codex | Step 15 follow-up: Discover cards/events now ship `ctaTarget` metadata, the Expo Discover tab routes CTAs to practice/translators/external links, and Profile badges/“Manage” open the appropriate tabs/modals instead of being inert. |
| 2025-11-13 | Agent Codex | Step 15 follow-up: `@mk/api-client` hooks now require `EXPO_PUBLIC_API_BASE_URL`, and the Home/Discover/Profile tabs surface warnings + read-only fixtures only when the API is intentionally missing. News/Discover fixtures stay for design previews, but live calls are now the default path. |
| 2025-11-13 | Agent Codex | Step 16 kickoff: converted Expo to `app.config.ts`, added `eas.json` profiles, stubbed `AuthProvider`, and added the Maestro smoke template. Run `npm run mobile:test:maestro` (requires Maestro CLI) and set `EXPO_PUBLIC_API_BASE_URL` + `EXPO_PUBLIC_PROJECT_ID` in `.env`/EAS secrets before building. |
| 2025-11-13 | Agent Codex | Step 16 auth flow iteration: introduced `/api/mobile/auth/{login,me}` plus `lib/mobile-auth.ts`, wired `AuthProvider` to SecureStore-backed bearer tokens, added `/sign-in` + Profile CTAs, and updated the push-token API/client to honor `Authorization` headers so reminders tie to the signed-in learner. |
| 2025-11-13 | Agent Codex | Step 16 fetch wiring: all Expo screens now call `@mk/api-client` queries with the shared `authenticatedFetch`, so mission/discover/news/profile/practice requests automatically include bearer tokens; the practice completion queue also reuses it, ensuring XP/streak sync respects the signed-in user. |
| 2025-11-13 | Agent Codex | Step 16 CI scaffolding: Maestro test suite now includes `smoke` + `profile` flows (run locally via `npm run mobile:test:maestro`), and `.github/workflows/ci.yml` ships an optional `mobile-maestro` job that executes once `MAESTRO_APP_URL`, `MAESTRO_APP_PATH`, and `MAESTRO_DEVICE_UDID` secrets point to a signed `.app`/`.apk` and target simulator UDID. |
| 2025-11-13 | Agent Codex | Step 14 instrumentation + monitoring: `/api/cron/reminders` now logs structured stats (runId, sent, revoked, duration), ignores failed Expo tickets, revokes `DeviceNotRegistered` tokens, and documents the env keys/device log we still need. Physical Android/iOS validation + cron smoke against production base URL remain blocked until we have hardware on hand. |
| 2025-11-13 | Agent Codex | Assigned Step 14 (push reminder device validation + cron wiring) to Agent Codex (Notifications) so the reminder smoke tests and cron rollout are done before we invite beta testers. |
| 2025-11-13 | Agent Codex | Step 8 backend work landed: shared reminder helpers/tests (`lib/mobile-reminders.*`), Prisma `MobilePushToken` model + migration, `/api/mobile/push-token` with opt-out + `nextReminderAt`, and Expo client now sends locale/timezone. Lint/tests: `npx eslint apps/mobile app/api/mobile/push-token/route.ts`, `npx vitest run lib/mobile-reminders.test.ts`, `npx prisma generate`. Device smoke + cron worker remain TODOs. |
| 2025-11-13 | Agent Infra | Finished Step 10: added `TranslatorHistoryProvider` (AsyncStorage), wired the Translator tab to persist entries, and hooked the Translator Inbox modal to real data. Lint: `npx eslint apps/mobile`. |
| 2025-11-13 | Agent Infra | Completed Step 11: Discover tab now pulls from `@mk/api-client`’s discover feed hook, supports category filters, shows upcoming events, and `/api/discover/feed` returns the curated JSON for future CMS swap. Lint: `npx eslint apps/mobile packages/api-client/src app/api/discover/feed/route.ts`. |

## Release Checklist – Android (Play Store internal testing)
1. `npm run test` (ensures shared + offline mobile smoke suites pass) and `npm run mobile:test:maestro` on a local emulator/physical device.
2. `eas build --platform android --profile preview` (set `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_PROJECT_ID`, `EXPO_PUBLIC_ENV`) → upload the resulting `.aab` to Play Console → Internal testing track.
3. Attach artifacts: privacy policy URL, store listing copy/screenshots (see `PLAY_STORE_LISTING.md`), tester emails, and the crash/ANR targets from `PLAY_STORE_NEXT_STEPS.md`.
4. Verify in-console checklist: Data safety form (analytics + push tokens), content rating (IARC), and review instructions linking to the Maestro smoke + QA doc.

## Release Checklist – iOS (TestFlight)
1. `npm run test` + `npm run mobile:test:maestro` (same as Android) and capture TalkBack/VoiceOver notes.
2. `eas build --platform ios --profile preview` (managed credentials) → `eas submit --platform ios` once the `.ipa` is generated.
3. Complete App Store Connect metadata: TestFlight notes, privacy questionnaire, export compliance, marketing screenshots (reuse the Play Store assets with iOS resolutions).
4. Add internal testers + QA instructions (link to this file + Maestro steps) and capture device logs for Step 14 once hardware access is available.

## Accessibility & Polish Acceptance Criteria
- TalkBack (Android) and VoiceOver (iOS) can navigate Home (mission hero/stat pills), Practice (Quick Practice cards/buttons), and Discover/Profile lists without getting trapped; focus order follows visual order.
- Reduce Motion / prefers-reduced-motion hides Practice card haptics/animations, and large text mode keeps CTA/button targets ≥44px with no clipped Macedonian glyphs.
- Mission hero, Practice HUD, and reminder banners have minimum 4.5:1 contrast; buttons expose textual labels in addition to icons.

## Maestro & QA Notes
- Local smoke: install the Maestro CLI (`curl -Ls https://get.maestro.mobile.dev | bash`), start the dev server (`npm run mobile:start`), then `npm run mobile:test:maestro`.
- CI: `.github/workflows/ci.yml` runs `npm run test` on every PR/merge (covers offline data + shared vitest suites). Once we have `MAESTRO_CLOUD_API_KEY` + signed `.apk/.ipa` artifacts we can wire up the optional Maestro Cloud job.
| 2025-11-13 | Agent Infra | Completed Step 13: Added `profile-summary` fallback + hook + `/api/profile/summary`, rebuilt the Profile tab to show live stats/badges, and ensured it degrades gracefully when the API base URL is missing. Lint: `npx eslint apps/mobile packages/api-client/src app/api/profile/summary/route.ts`. |
| 2025-11-13 | Agent Infra | Completed Step 9: Translator tab now calls `/api/translate` through the new `@mk/api-client` helper, shows detected language/retry hints, and warns when `EXPO_PUBLIC_API_BASE_URL` is missing. Lint: `npx eslint apps/mobile packages/api-client/src`. |
| 2025-11-13 | Agent Codex | Finished wiring Step 8 backend pieces: added `timezone` + reminder metadata fields, shared helper/tests, shipped `/api/mobile/push-token`, and introduced `/api/cron/reminders` that batches due windows + hits the Expo Push API. Lint/tests: `npx eslint app/api/{mobile/push-token,cron/reminders}/route.ts`, `npx vitest run lib/mobile-reminders.test.ts`. Remaining: physical device smoke + production cron wiring + Expo receipt monitoring. |
| 2025-11-13 | Agent Infra | Completed Step 8: added the Prisma enum/table, shipped `POST /api/mobile/push-token`, and refreshed the mission API docs. Lint/format commands: `npx prisma format`, `npx prisma generate`, `npx eslint app/api/mobile/push-token/route.ts`. Device smoke + cron wiring remain TODOs. |
| 2025-11-13 | Agent Infra | Wired up `/api/discover/feed` so Expo + future web clients hit the same data contract (for now backed by `data/discover-feed.json`). Lint: `npx eslint app/api/discover/feed/route.ts`. |
| 2025-11-13 | Agent Infra | Added the Headlines section on Discover powered by the `/api/news` endpoint + `useNewsFeedQuery`. Lint: `npx eslint apps/mobile packages/api-client/src app/api/news/route.ts`. |
| 2025-11-13 | Agent Infra | Handing Step 8 (backend push-token endpoint + device validation) to the next agent. See execution_steps.md for scope: Prisma model + `/api/mobile/push-token` route + on-device smoke test logging results. |
| 2025-11-13 | Agent Codex | Added the Prisma `MobilePushToken` model + `/api/mobile/push-token` route, refreshed the execution log/docs, and re-ran `npx prisma generate` & `npx eslint app/api/mobile/push-token/route.ts`. Physical device validation + cron wiring still pending. |
| 2025-11-13 | Agent Infra | Finished Step 7: expo-notifications provider now tracks permissions, background fetch, push-token sync, and mission deadline reminders; Mission/Practice settings expose reminder toggles + status; Home schedules streak nudges. Ran `npx eslint apps/mobile`. At that point backend `/api/mobile/push-token` + on-device validation remained follow-ups. |
| 2025-11-13 | Agent Codex | Started Step 7: wired `NotificationProvider` into the Expo shell, added the Mission Settings modal + hero CTA, hooked reminder windows to AsyncStorage/background sync, and drafted the `/api/mobile/push-token` contract (lint: `npx eslint apps/mobile`). Still need backend persistence + device validation before marking ✅. |
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

### Mobile release scaffolding (Step 16)
- `apps/mobile/app.config.ts` now owns the Expo scheme (`mkll`) and exposes `extra.eas.projectId`. Populate `EXPO_PUBLIC_PROJECT_ID`, `EXPO_PUBLIC_API_BASE_URL`, and `EXPO_PUBLIC_ENV` in `.env.local` or via EAS secrets so push token registration + deep links behave outside dev.
- `eas.json` defines `development`, `preview`, and `production` build profiles. Use `npm run mobile:build:preview:android` / `npm run mobile:build:preview:ios` (wrappers around `eas build --profile preview --non-interactive`) once your `EAS_TOKEN` and Expo secrets are configured; drop the resulting `.apk`/`.ipa` URL into the `MAESTRO_APP_URL` secret so CI can replay the artifact.
- Maestro suite now includes `smoke` (Home/Discover/Profile sanity) and `profile` (sign-in CTA) flows under `apps/mobile/tests/`. Execute them locally via `npm run mobile:test:maestro` after installing the Maestro CLI (https://maestro.mobile.dev). The optional `mobile-maestro` job in `.github/workflows/ci.yml` runs on `macos-latest` once `MAESTRO_APP_URL`, `MAESTRO_APP_PATH`, and `MAESTRO_DEVICE_UDID` secrets exist; until then it logs that the suite was skipped.
- `AuthProvider` is now part of the Expo root layout. Once the `expo-auth-session` flow lands, wire `signInWithBrowser`/`signOut` and persist the resulting session via secure storage.

### Device Validation Checklist – Notifications & Reminders
1. **Prep the build**
   - Set `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_PROJECT_ID`, and `EXPO_PUBLIC_ENV=prod` in `.env.local`.
   - Launch `npm run mobile:start` and connect a *physical* device via Expo Go (simulators cannot generate push tokens).
2. **Permissions & local reminders**
   - Open Mission Settings → tap “Enable notifications” and accept the OS prompt.
   - Toggle each reminder window (morning / lunch / evening); in the Expo Dev Menu run `Notifications.getAllScheduledNotificationsAsync()` to verify they exist locally.
3. **Push token registration**
   - Toggle a window again and watch the Next.js logs for a `POST /api/mobile/push-token` entry (should include `{ reminderWindows, locale, timezone }`).
   - In Prisma Studio (or SQL client) confirm the row now has `lastSuccessfulSync`, `timezone`, and the correct window list.
4. **Cron smoke test**
   - Trigger the worker manually via `npm run mobile:cron:smoke` (reads `REMINDER_CRON_BASE_URL`/`EXPO_PUBLIC_API_BASE_URL`) or `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/reminders`.
   - Response should include `{ ok: true, sent: N }`. A push should hit the device (foreground + background) with the deep link `mkll://practice/quick`.
5. **Log results**
   - Capture device OS + Expo SDK version plus any issues back in this file so the next agent knows what worked (or didn’t). Include screenshots if the notification copy looks off.

_Tip: use `npx expo run:ios --device`/`run:android` if you need a standalone build; the steps above assume Expo Go._

### Step 14 Device Validation Log
| Date (UTC) | Device | OS / Build | Expo SDK | Reminder Windows Tested | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2025-11-13 | Android hardware | Blocked in CLI-only environment | 52 | Midday, Evening (pending) | 🚧 Pending | Need a physical Android device connected to Expo Go to capture OS prompts, `Notifications.getAllScheduledNotificationsAsync()` output, and Prisma rows before onboarding beta testers. |
| 2025-11-13 | iOS hardware | Blocked in CLI-only environment | 52 | Midday, Evening (pending) | 🚧 Pending | Same as above—run through the checklist on iPhone hardware and link screenshots/logs here once available. |
| 2025-11-13 | CLI validation run | N/A | N/A | Cron invocation only | ⚠️ Blocked | `npm run mobile:cron:smoke` executed with `REMINDER_CRON_BASE_URL=http://127.0.0.1:3000` & `CRON_SECRET=dummy` to verify tooling, but the call fails locally (`connect EPERM`), and production validation is blocked until actual host + secret are provided. Hardware reminder evidence still outstanding. |

#### Step 18 To-Do – Detailed Run Book
- **Android sequence**
  1. `npm run mobile:start` on the workstation with `.env.local` populated (`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_PROJECT_ID`, `EXPO_PUBLIC_ENV=prod`). If testing against hosted builds, run `npx expo run:android --device` and keep Metro logs open.
  2. Connect a physical Android device (USB or LAN). In Expo Go, open the dev build and accept notification permissions via Mission Settings.
  3. Toggle each reminder window (morning/lunch/evening). Capture:
     - Screenshot/video of the OS permission prompt and Mission Settings toggles.
     - Dev Menu output of `Notifications.getAllScheduledNotificationsAsync()` showing the scheduled identifiers.
     - Terminal logs for `POST /api/mobile/push-token` (include `reminderWindows`, `locale`, `timezone`).
     - Prisma Studio screenshot of the affected `MobilePushToken` row (`lastSuccessfulSync`, `reminderWindows`, `timezone`).
  4. Trigger cron manually: `npm run mobile:cron:smoke` (set `REMINDER_CRON_BASE_URL=https://<prod-host>` and `CRON_SECRET=...`) or issue the raw curl. Save the JSON response (`runId`, `sent`, `windows`, `revoked`, `errors`) and capture Android foreground/background push notifications (screenshots or a video).
- **iOS sequence**
  1. Build via `npx expo run:ios --device` (or install the TestFlight build) using the same env vars (configure via EAS secrets if needed). Use `npx expo start --tunnel` for Metro logging.
  2. Repeat the Mission Settings toggles, Dev Menu dump, API log capture, and Prisma screenshots.
  3. Re-run `npm run mobile:cron:smoke` (or the raw curl) and record iOS foreground/background push receipts plus the JSON summary.
- **Monitoring/alerts**
  - Note where `[cron.reminders] Completed run` logs appear (e.g., Vercel/Render logs, Datadog). Confirm alerts exist for `sent === 0` for >24 h and for spikes in `errors`/`revoked`.
  - After each device run, paste links to screenshots/log snippets in the Notes column of the table above. If evidence lives outside the repo, use shared-drive links with timestamps.

_Evidence template_: when adding a row to the table, include device info, SDK, reminder windows tested, the `runId` from the cron curl, and links to (1) OS prompt screenshot, (2) Dev Menu dump, (3) Prisma screenshot, (4) push notification video/screenshot, and (5) cron response snippet.

### Step 14 Environment Prerequisites
- `EXPO_PUBLIC_API_BASE_URL` – required for Expo client builds so `/api/mobile/push-token` and `/api/cron/reminders` hit the correct backend.
- `EXPO_PUBLIC_PROJECT_ID` – surfaced through `app.config.ts` → `extra.eas.projectId`; needed for `Notifications.getExpoPushTokenAsync`.
- `EXPO_PUBLIC_ENV` – set to `prod` when validating push reminders against production services.
- `CRON_SECRET` – bearer token for `/api/cron/reminders`; store in Vercel/Render cron configs and local `.env.local` for manual curls.
