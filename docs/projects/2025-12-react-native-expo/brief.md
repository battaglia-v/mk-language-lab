# 2025 React Native + Expo Implementation Plan

Native app initiative (Android first, iOS next) powered by Expo/React Native while sharing as much logic and design system DNA as possible with the Next.js web app.

## Collaboration & Ownership
- **Agent Infra (Codex CLI – this session):** Own monorepo + Expo scaffolding, shared packages (`@mk/*`), Quick Practice parity hooks, and navigation/shell patterns.
- **Agent Experience (other Codex agent):** Own visual polish, design tokens/Tamagui adoption, mission hero components, and future animation/audio passes.
- **Shared expectations:** Update `execution_steps.md` after each milestone, reference coordination notes in PR descriptions, and avoid overlapping file edits without async agreement (drop a short note in `docs/projects/2025-12-react-native-expo/notes.md` if new workstreams spin up).

## 1. Goals & Constraints
- Ship an Android beta in <4 months that mirrors the redesigned mobile UX (see `2025-12-mobile-ui-overhaul.md`).
- Reuse TypeScript, design tokens, analytics events, and business logic between web and native clients.
- Support offline-friendly Quick Practice with audio, notifications, in-app purchases for future premium tiers, and push-based streak reminders.
- Keep DevOps overhead manageable: one repository, automated builds (EAS), consistent lint/test pipelines.

## 2. Stack Selection Summary
| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime | React Native 0.76 + Expo SDK 52 | Enables OTA (EAS Updates), simplifies native modules, aligns with TS/React skills. |
| Navigation | Expo Router (files-as-routes) | Mirrors Next.js mental model; supports nested stacks/tabs and deep links. |
| Styling | Tamagui or NativeWind + shared tokens | Pulls from `docs/design/tokens.md`; ensures theming parity with web Tailwind. |
| State/data | React Query + Zustand (session) | React Query syncs with API routes; Zustand for lightweight UI state (missions, audio playback). |
| Forms | React Hook Form | Consistent with web forms. |
| Animations | React Native Reanimated 3 + Moti | Handles micro-interactions, confetti, card stacks. |
| Audio | expo-av + expo-file-system | Streaming + local caching of practice clips. |
| Auth | `expo-auth-session` (PKCE) + existing Next Auth endpoints | Reuse JWT/session APIs. |
| Notifications | expo-notifications + server triggers | For streak reminders, quests, admin updates. |
| Testing | Jest + React Native Testing Library, Maestro for e2e | Maestro works well on both Android/iOS. |
| Builds | EAS Build/Submit, Play Store internal testing, TestFlight | Automates binaries + submissions. |

## 3. Repository & Monorepo Layout
Adopt a Turborepo-style structure to share code:
```
/
  apps/
    web/        (existing Next.js app moved here when ready)
    mobile/     (new Expo app)
  packages/
    ui/         (cross-platform components using Tamagui/React Native primitives)
    tokens/     (design tokens + theme definitions pulled from docs/design/tokens.md)
    api-client/ (typed SDK for Next.js API routes / Prisma services)
    analytics/  (event constants + helper)
```
- Start by adding `apps/mobile` while keeping web at root; migrate web into `apps/web` once tooling ready.
- Configure `tsconfig.base.json` paths for shared packages; use `expo-yarn-workspaces` or npm workspaces.
- Ensure ESLint + Prettier config extends across packages; use `@react-native/eslint-config` plus existing rules where possible.

## 4. Mobile App Architecture
### Navigation
- Bottom tabs: Home, Practice, Discover, Profile (matching new UX). Each tab hosts stack navigators for detail/modals.
- Use Expo Router's nested layouts to mimic Next routes; e.g., `app/(tabs)/home.tsx`, `app/(modals)/practice-audio-modal.tsx`.
- Deep links: `mkll://practice/quick` for Quick Practice entry; configure Android `intentFilters` and iOS `universalLinks`.

### Theming & Components
- Generate token JSON from `docs/design/tokens.md`; feed into Tamagui (or NativeWind theme) to keep colors/spacing consistent.
- Core primitives: Card, ProgressRing, XPBadge, AudioControls, SwipeStack, MissionChecklist.
- Support platform differences (Android ripple vs iOS opacity) via component props; keep brand colors identical.

### Data Layer
- Create `packages/api-client` using `openapi-typescript` or zod schemas derived from Next.js route contracts.
- React Query handles caching, optimistic updates, and offline queueing (for XP submissions, heart usage).
- For Quick Practice: prefetch decks/audio metadata; store progress offline, replay when online.

### Audio Pipeline Integration
- Mirror schema from Section 7 of the UI overhaul plan.
- On device: use expo-av for playback, expo-file-system for caching, `react-native-background-fetch` (via Expo Task Manager) to download upcoming sessions over Wi-Fi.
- Provide waveform visualization via lightweight canvas (e.g., `react-native-svg`).

### Offline & Sync
- Use `react-query` persist plugin with MMKV/AsyncStorage for mission state, last session, Smart Review queue.
- Create background task to sync XP/streak when network returns; show toast if pending actions exist.

### Analytics & Telemetry
- Reuse `lib/analytics.ts` events; expose wrapper `logEvent(event, payload)` inside `packages/analytics`.
- Batch events offline; send via HTTPS to existing endpoint or Segment (if adopted later).

## 5. Feature Roadmap (Native)
| Phase | Timeline | Deliverables |
| --- | --- | --- |
| A. Bootstrap (Weeks 0-2) | Repo restructuring (apps/mobile), Expo config, theming tokens, CI lint/test. |
| B. Mission Shell (Weeks 2-5) | Navigation, onboarding wizard, Home hero, missions API integration, push notification scaffolding. |
| C. Practice Core (Weeks 4-8) | Swipeable Quick Practice cards, audio playback/caching, Smart Review rail, analytics events. |
| D. Content & Social (Weeks 7-11) | Discover feed, quests/squads UI, profile stats, shareable cards via `expo-sharing`. |
| E. Polish + Beta (Weeks 10-14) | Motion tuning, accessibility (TalkBack/VoiceOver), Maestro e2e flows, Play Store internal release. |
| F. iOS Readiness (Weeks 12-16) | iOS-specific QA, push certs, TestFlight build, platform-specific polish. |

## 6. Tooling & CI/CD
- **Version control:** same repo; protect `apps/mobile` directories via code owners (mobile squad).
- **CI:** GitHub Actions matrix (lint, typecheck, unit tests). For instrumented tests use EAS Build preview or `maestro cloud`.
- **Builds:** EAS Build for development (simulator), preview, production; automate submission using EAS Submit.
- **OTA updates:** enable EAS Updates for minor UI/content tweaks between store releases.
- **Secrets:** Reuse `.env` approach via Expo config plugin; integrate with Doppler or Vercel env store for parity.

## 7. Collaboration & Design System Sync
- Own a single Figma library for tokens and components; export JSON for Tamagui + Tailwind simultaneously.
- Establish weekly design/dev sync to review cross-platform parity.
- Document component props, platform nuances, and accessibility expectations in Storybook (web) and Expo Preview (mobile).

## 8. Technical Risks & Mitigations
- **Monorepo complexity:** Start with npm workspaces + Turborepo to avoid reinventing build orchestration.
- **Native module gaps:** Audit future needs (in-app purchases, background audio) early; prefer Expo plugins, eject only if necessary.
- **Offline reliability:** Prototype react-query persistence + audio caching before feature sprint to validate storage/perf limits.
- **Notification deliverability:** Align expo push tokens with backend cron jobs; add analytics to detect opt-out rates.
- **Store compliance:** Keep privacy policy updated, declare data usage (audio, analytics) per Google/Apple guidelines.

## 9. Next Actions
1. Approve stack + repo restructuring approach.
2. Spin up `apps/mobile` via `npx create-expo-app --template` and integrate with monorepo tooling.
3. Generate token JSON + starter component library (Card, Button, Typography).
4. Define API contracts for missions, practice sessions, audio metadata to unblock data-layer work.
5. Create engineering issues per phase (Bootstrap, Mission Shell, Practice Core, etc.) and align owners.

With this plan, the Expo app can evolve alongside the redesigned web experience while delivering the native capabilities (push, offline audio, in-app rewards) required for Android and iOS success.
