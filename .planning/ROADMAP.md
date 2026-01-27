# Roadmap: MKLanguage Learning System Overhaul

## Overview

Transform MKLanguage from a quiz-centric app into a structured, CEFR-aligned learning system. The journey starts with establishing a curriculum backbone from official UKIM materials, then layers progression tracking, practice integrity, vocabulary management, reader organization, and UX cleanup — culminating in validation that the core promise ("always resume in the right place, next step obvious") is delivered.

## Milestones

- ✅ [v1.0 Beta](milestones/v1.0-ROADMAP.md) (Phases 1-7) — SHIPPED 2026-01-07
- ✅ **v1.1 Curriculum Quality Fix** — Phases 8-16 (shipped 2026-01-09)
- ✅ [v1.2 Infrastructure & CI Overhaul](milestones/v1.2-ROADMAP.md) (Phases 17-20) — SHIPPED 2026-01-09
- ✅ **v1.3 Content Quality & User Journey** — Phases 21-26 (shipped 2026-01-10)
- ✅ [v1.4 Power User Feedback](milestones/v1.4-ROADMAP.md) (Phases 27-32) — SHIPPED 2026-01-10
- ✅ [v1.5 Audio Cleanup & Final Polish](milestones/v1.5-ROADMAP.md) (Phases 33-35) — SHIPPED 2026-01-10
- ✅ [v1.6 Reader Overhaul](milestones/v1.6-ROADMAP.md) (Phases 36-41) — SHIPPED 2026-01-11
- ✅ [v1.7 Learn Experience Overhaul](milestones/v1.7-ROADMAP.md) (Phases 42-46) — SHIPPED 2026-01-11
- ✅ [v1.8 Quality & Performance](milestones/v1.8-ROADMAP.md) (Phases 47-52) — SHIPPED 2026-01-13
- ✅ **v1.9 Quality & Stability** (Phases 53-60) — SHIPPED 2026-01-14
- ✅ [v2.0 Mobile App](milestones/v2.0-ROADMAP.md) (Phases 61-67) — SHIPPED 2026-01-16
- ✅ **v2.1 Feature Parity** (Phases 68-75) — SHIPPED 2026-01-26
- ✅ **v2.2 Mobile Enhancements** (Phases 76-80) — SHIPPED 2026-01-26
- ✅ **v2.3 Content & Learning Evolution** (Phases 81-87) — SHIPPED 2026-01-27

## v2.3 Content & Learning Evolution — SHIPPED 2026-01-27

Expand content library, enhance learning features with SRS improvements and writing exercises, and polish quality with testing, accessibility, and analytics.

**Themes**:
- Content Expansion: More reader stories, grammar lessons, vocabulary packs
- Advanced Learning: SRS improvements, writing exercises, personalized paths
- Quality & Polish: E2E tests, accessibility, localization, analytics

- [x] Phase 81: Reader Content Expansion — More stories across all levels — COMPLETE
- [x] Phase 82: Grammar & Vocabulary Expansion — New lessons and word packs — COMPLETE
- [x] Phase 83: SRS Improvements — Enhanced intervals, smart review scheduling — COMPLETE
- [x] Phase 84: Writing Exercises — Typing practice, sentence construction — COMPLETE
- [x] Phase 85: E2E Testing — Playwright tests for critical flows — COMPLETE
- [x] Phase 86: Accessibility & Localization — A11y audit, full Macedonian UI — COMPLETE
- [x] Phase 87: Analytics & Monitoring — Sentry error tracking, usage analytics — COMPLETE

### Phase 81: Reader Content Expansion

**Goal**: Add more graded reader stories across A1/A2/B1 levels with diverse topics
**Depends on**: v2.2 complete
**Research**: Unlikely (follow existing story format)
**Plans**: 3

**Current State**:
- 12 graded stories (4 per level: A1, A2, B1)
- 32 challenge stories (30-day folktale series)
- JSON format with sections, translations, vocabulary

Plans:
- [x] 81-01: A1 expansion (3 new stories: family, food, weather) — COMPLETE
- [x] 81-02: A2 expansion (3 new stories: travel, traditions, weekend) — COMPLETE
- [x] 81-03: B1 expansion (3 new stories: history, Ohrid UNESCO, modern life) — COMPLETE

### Phase 82: Grammar & Vocabulary Expansion

**Goal**: Expand grammar lessons and vocabulary packs with interactive exercises
**Depends on**: Phase 81
**Research**: Unlikely (follow existing curriculum structure)
**Plans**: 2

**Current State**:
- `data/grammar-lessons.json`: 123KB with multiple lesson categories
- `data/practice-vocabulary.json`: Core vocabulary by topic
- `data/decks/`: Thematic vocabulary decks

Plans:
- [x] 82-01: Grammar expansion (4 new lessons: present tense, reflexive verbs, comparatives, imperatives) — COMPLETE
- [x] 82-02: Vocabulary packs (3 new decks: professions, emotions, nature - 90 words total) — COMPLETE

### Phase 83: SRS Improvements

**Goal**: Enhance spaced repetition with smarter intervals and review scheduling
**Depends on**: Phase 82
**Research**: Unlikely (SM-2 algorithm already implemented)
**Plans**: 2

**Current State**:
- `lib/spaced-repetition.ts`: SM-2 algorithm implementation
- Practice sessions use basic interval scheduling
- No centralized review queue

Plans:
- [x] 83-01: Enhanced intervals (difficulty presets: easy/normal/hard, multipliers) — COMPLETE
- [x] 83-02: Smart review scheduling (daily queue with priority, streak tracking, review summary) — COMPLETE

### Phase 84: Writing Exercises

**Goal**: Add typing practice and sentence construction exercises
**Depends on**: Phase 83
**Research**: Unlikely (follow existing exercise patterns)
**Plans**: 2

**Current State**:
- Multiple choice and matching exercises exist
- No free-text input exercises
- Keyboard for Cyrillic input exists

Plans:
- [x] 84-01: Typing practice (Cyrillic trainer with accuracy tracking, problem character detection) — COMPLETE
- [x] 84-02: Sentence construction (translation exercises, fill-in-blank, word ordering) — COMPLETE

### Phase 85: E2E Testing

**Goal**: Add Playwright tests for critical user flows
**Depends on**: Phase 84
**Research**: Unlikely (standard Playwright patterns)
**Plans**: 2

**Current State**:
- Playwright already configured with 35+ spec files
- Multiple viewport projects (desktop, mobile 320/360/390)
- CI integration with GitHub Actions

**Completed**:
- Updated `reader-library.spec.ts` to validate 21+ graded readers (v2.3 expansion)
- Added new test for v2.3 reader content accessibility
- Updated `grammar-practice.spec.ts` with v2.3 grammar lesson checks
- Created `srs-typing.spec.ts` (9 tests) for SRS settings, streaks, typing stats
- All 24 new/updated tests passing

Plans:
- [x] 85-01: Test infrastructure (Playwright already configured with CI integration) — COMPLETE
- [x] 85-02: Critical flow tests (reader library, grammar practice, SRS/typing) — COMPLETE

### Phase 86: Accessibility & Localization

**Goal**: Full accessibility audit and complete Macedonian UI localization
**Depends on**: Phase 85
**Research**: Unlikely (WCAG standards, existing i18n setup)
**Plans**: 2

**Current State**:
- i18n setup already complete with 2,130 translation keys in `en.json` and `mk.json`
- Comprehensive accessibility test suite (24 tests)
- Skip link, ARIA labels, keyboard navigation all in place

**Completed**:
- Fixed SkipLink component to use reliable CSS transform approach
- Removed duplicate skip link from TopNav (consolidated in layout)
- Fixed accessibility test for screen reader announcements (aria-live regions)
- Updated wizard keyboard navigation test for reliability
- All 24 accessibility tests now passing
- Translations verified: all 2,130 keys synchronized between en/mk

Plans:
- [x] 86-01: Accessibility audit (24/24 tests passing, skip link, keyboard nav, ARIA) — COMPLETE
- [x] 86-02: Full Macedonian UI (2,130 translation keys, all synchronized) — COMPLETE

### Phase 87: Analytics & Monitoring

**Goal**: Add error tracking and usage analytics
**Depends on**: Phase 86
**Research**: Unlikely (Sentry/Posthog standard setup)
**Plans**: 2

**Current State**:
- Sentry already configured for web (client/server/edge configs)
- Vercel Analytics already integrated (privacy-friendly, GDPR compliant)
- 50+ analytics events defined

**Completed**:
- Added 18 new v2.3 analytics events for SRS, typing, writing, reader features
- Added convenience functions: `trackSRSReview`, `trackSRSStreak`, `trackTypingExercise`, `trackWritingExercise`, `trackReaderProgress`
- Updated shared analytics package (`@mk/analytics`)
- Mobile ErrorBoundary ready for Sentry integration (TODO documented)

Plans:
- [x] 87-01: Sentry error tracking (web already configured, mobile ready) — COMPLETE
- [x] 87-02: Usage analytics (18 new v2.3 events, convenience helpers) — COMPLETE

---

## v2.2 Mobile Enhancements — SHIPPED 2026-01-26

Enhance mobile app with push notifications, offline content, audio/TTS, and performance optimizations.
Widget support deferred (requires native iOS/Android development).

- [x] Phase 76: Push Notifications — Backend API, token registration, reminder delivery — COMPLETE
- [x] Phase 77: Offline Content — Lesson/reader caching, offline indicators, expanded sync — COMPLETE
- [x] Phase 78: Audio & TTS — Pronunciation playback, listen-and-repeat, vocabulary audio — COMPLETE
- [~] Phase 79: Widget Support — DEFERRED (requires native iOS/Android development)
- [x] Phase 80: Performance — Bundle optimization, image caching, memoization audit — COMPLETE

### Phase 76: Push Notifications

**Goal**: Wire up existing notification infrastructure to backend, enable real push delivery
**Depends on**: v2.1 complete
**Research**: Unlikely (infrastructure exists in `lib/notifications.ts`)
**Plans**: 2

**Existing Infrastructure**:
- `lib/notifications.ts`: Full expo-notifications setup, scheduling, permissions
- `app/notifications.tsx`: Settings UI for reminder preferences
- Missing: Backend `/api/mobile/push-token` endpoint, initialization in app

Plans:
- [x] 76-01: Backend push token API (already exists at /api/mobile/push-token) — COMPLETE
- [x] 76-02: Mobile initialization (register token on auth, handle notification taps) — COMPLETE

### Phase 77: Offline Content

**Goal**: Cache lessons and reader content for offline access, improve offline UX
**Depends on**: Phase 76
**Research**: Unlikely (infrastructure exists in `lib/offline.ts`)
**Plans**: 2

**Existing Infrastructure**:
- `lib/offline.ts`: Network state hook, operation queue, auto-sync
- `lib/offline-queue.ts`: Practice completion queue
- Missing: Content pre-download, offline content cache, UI indicators

Plans:
- [x] 77-01: Content caching (curriculum, reader stories with cache-first strategy) — COMPLETE
- [x] 77-02: Offline UX (OfflineIndicator component, cache pruning, sync status) — COMPLETE

### Phase 78: Audio & TTS

**Goal**: Add pronunciation audio to vocabulary and alphabet learning
**Depends on**: Phase 77
**Research**: May need (TTS voice quality, caching strategy)
**Plans**: 3

**Existing Infrastructure**:
- `expo-speech` already installed in package.json
- Phase 70 alphabet phonetics system (PWA) has audio patterns
- Missing: TTS wrapper utility, integration with vocab/alphabet screens

Plans:
- [x] 78-01: TTS utility (useTTS hook already exists with Slavic fallbacks) — EXISTED
- [x] 78-02: SpeakButton component (reusable tap-to-pronounce for vocab) — COMPLETE
- [~] 78-03: Listen exercises (deferred - requires exercise framework changes)

### Phase 79: Widget Support — DEFERRED

**Goal**: Home screen widgets for quick stats and practice access
**Depends on**: Phase 78
**Research**: Required (expo-widgets or react-native-widget-extension)
**Status**: DEFERRED

**Reason for Deferral**:
- No official Expo widget support
- Community packages (react-native-widgetkit) are poorly maintained (last update 2021)
- Requires native iOS (SwiftUI/WidgetKit) and Android (Kotlin/Glance) development
- Not feasible without dedicated native development effort

Plans:
- [~] 79-01: Research & setup — Completed, determined not feasible
- [ ] 79-02: Widget implementation — Deferred to future milestone with native dev

### Phase 80: Performance

**Goal**: Optimize bundle size, caching, and render performance
**Depends on**: Phase 79
**Research**: Unlikely (standard optimization patterns)
**Plans**: 2

Plans:
- [x] 80-01: Performance utilities (lib/performance.ts with memoization helpers, FlatList optimization) — COMPLETE
- [x] 80-02: Cache management (clearOldCache, getMemoryStats, FLATLIST_PERFORMANCE_PROPS) — COMPLETE
- [~] 80-03: expo-image migration — Deferred (requires package install + refactoring)

---

## v2.1 Feature Parity — SHIPPED 2026-01-26

Full PWA feature parity for mobile app. ~85% parity achieved; remaining features (Discover, Notifications) deferred.

- [x] Phase 68: Practice Modes — Grammar Practice, Word Sprint improvements — COMPLETE
- [x] Phase 69: Practice Decks — Custom decks, Saved Words practice — COMPLETE
- [x] Phase 70: Alphabet & Learning Paths — Alphabet lesson, learning paths UI — COMPLETE
- [x] Phase 71: Reader Search & Filters — Search, topic filters, sort options — COMPLETE
- [x] Phase 72: Reader Progress & Review — Progress tracking, review mode — COMPLETE
- [x] Phase 73: Content Pages — About, Privacy, Terms, Help — COMPLETE
- [x] Phase 74: Saved Words & Discovery — Already implemented in earlier phases — COMPLETE
- [x] Phase 75: Final Parity — Validation complete, ~85% parity — COMPLETE

### Phase 68: Practice Modes

**Goal**: Add Grammar Practice mode and improve Word Sprint to match PWA
**Depends on**: v2.0 complete
**Research**: Unlikely (port existing PWA patterns)
**Plans**: 2

Plans:
- [x] 68-01: Grammar Practice (API, list screen, lesson runner) — COMPLETE
- [x] 68.1: Fix React version conflicts blocking mobile testing — COMPLETE
- [x] 68-02: Word Sprint improvements (difficulty picker, combo system, input modes) — COMPLETE

### Phase 69: Practice Decks

**Goal**: Custom deck creation/management and Saved Words practice mode
**Depends on**: Phase 68
**Research**: Unlikely (port existing PWA patterns)
**Plans**: 1

Plans:
- [x] 69-01: Unified Saved Words (combine translator + reader, management page, combined practice) — COMPLETE

### Phase 70: Alphabet & Phonetics Learning System (EXPANDED)

**Goal**: Transform alphabet lesson into comprehensive phonetics learning system with audio, progressive groups, and interactive exercises
**Depends on**: Phase 69
**Research**: Required (audio sourcing, pedagogy, architecture)
**Plans**: 5

**User Feedback**: "It's really difficult for a new person to learn the Macedonian alphabet and sound things out phonetically"

Plans:
- [x] 70-00: Research & Planning (architecture audit, audio strategy, groupings) — COMPLETE
- [x] 70-01: Audio Integration (Azure TTS generation, tap-to-play, offline) — COMPLETE
- [x] 70-02: Progressive Learning (5 letter groups, unlock system, group progress) — COMPLETE
- [x] 70-03: Exercise System (listen-identify, transliteration trainer, XP integration) — COMPLETE
- [x] 70-04: Polish & Accessibility (phonetic comparison, a11y audit, performance) — COMPLETE

**Spec**: `.planning/specs/alphabet-phonetics-learning-system.md`
**Research**: `.planning/phases/70-alphabet-phonetics/70-00-RESEARCH.md`

### Phase 71: Reader Search & Filters

**Goal**: Text search, topic filters, difficulty sort, comprehensive browsing
**Depends on**: Phase 70
**Research**: Unlikely (port existing PWA patterns)
**Plans**: 1

Plans:
- [x] 71-01: Search, topic filters, sort options (client-side filtering) — COMPLETE

### Phase 72: Reader Progress & Review

**Goal**: Reading progress UI, review saved words mode, continue reading card
**Depends on**: Phase 71
**Research**: Unlikely (port existing PWA patterns)
**Plans**: 1

Plans:
- [x] 72-01: Progress bars on cards, continue reading card, completion badges — COMPLETE

### Phase 73: Content Pages

**Goal**: About, Privacy, Terms, Help, Resources, Feedback pages
**Depends on**: Phase 72
**Research**: Unlikely (static content pages)
**Plans**: 1

Plans:
- [x] 73-01: Native content pages (About, Privacy, Terms) — COMPLETE

### Phase 74: Saved Words & Discovery

**Goal**: Dedicated saved words library, discover page, news feed
**Depends on**: Phase 73
**Research**: Unlikely (port existing PWA patterns)
**Plans**: 1

**Note**: Core features already implemented in earlier phases:
- Saved Words library: Phase 69 (unified translator + reader)
- News feed: Phase 66 (multi-source, filterable)
- Resources hub: Phase 66 (all tools linked)
- Discover page: Deferred (requires backend API for personalized content)

Plans:
- [x] 74-01: Verify feature parity (Saved Words, News, Resources) — COMPLETE

### Phase 75: Final Parity

**Goal**: Polish, validation, any remaining feature gaps
**Depends on**: Phase 74
**Research**: Unlikely (internal validation)
**Plans**: 1

**Parity Status** (~85%):
- Core learning loop: COMPLETE (Learn, Practice, Reader, Translate)
- Content pages: COMPLETE (About, Privacy, Terms, Help)
- Resources hub: COMPLETE (all tools linked)
- News feed: COMPLETE (multi-source, filterable)
- Saved Words: COMPLETE (unified translator + reader)

**Now at ~100% parity**:
- Discover page: IMPLEMENTED (quests, events, community)
- Notifications management: IMPLEMENTED (reminder settings via API)

Plans:
- [x] 75-01: Validate parity, type check, polish — COMPLETE
- [x] 75-02: Discover page (quests, events, community from /api/discover/feed) — COMPLETE
- [x] 75-03: Notifications settings (reminder prefs via /api/reminders/settings) — COMPLETE

---

## v2.0 Mobile App (React Native + Expo) — SHIPPED 2026-01-16

Ship native React Native app for Android, preserving Play Store listing.

- [x] Phase 61: Foundation — Expo setup, auth, tab navigation — completed 2026-01-16
- [x] Phase 62: Learn Flow (2/2 plans) — Level selector, lesson runner — completed 2026-01-16
- [x] Phase 63: Practice Flow (4/4 plans) — Practice hub, cards, session, offline queue — completed 2026-01-16
- [x] Phase 64: Reader Flow (3/3 plans) — Story list, tap-to-translate, progress — completed 2026-01-16
- [x] Phase 65: Translator (1/1 plans) — AI translation tool — completed 2026-01-16
- [x] Phase 66: Profile & Polish (2/2 plans) — Profile, settings, store assets — completed 2026-01-16
- [x] Phase 67: QA & Ship Android (2/2 plans) — Testing, Play Store release — completed 2026-01-16

[Full details](milestones/v2.0-ROADMAP.md)

## v1.9 Quality & Stability — SHIPPED 2026-01-14

- [x] Phase 53: Security & Repo Hygiene (3/3 plans) — completed 2026-01-14
- [x] Phase 54: Exercise Architecture Research (1/1 plans) — completed 2026-01-14
- [x] Phase 55: Exercise State Machine (2/2 plans) — completed 2026-01-14
- [x] Phase 56: Lesson Flow Progress (1/1 plans) — completed 2026-01-14
- [x] Phase 57: Answer Evaluation (1/1 plans) — completed 2026-01-14
- [~] Phase 58: Audio Language — DEFERRED to v2.0 (plan preserved)
- [x] Phase 59: Polish & Branding (1/1 plans) — completed 2026-01-14
- [x] Phase 60: QA Validation (2/2 plans) — completed 2026-01-14

## Completed Milestones

<details>
<summary>v1.0 Beta (Phases 1-7) — SHIPPED 2026-01-07</summary>

- [x] Phase 1: Curriculum Backbone (4/4 plans) — completed 2026-01-07
- [x] Phase 2: Progress & Dashboard (3/3 plans) — completed 2026-01-07
- [x] Phase 3: Lesson Practice Integrity (3/3 plans) — completed 2026-01-07
- [x] Phase 4: Vocabulary System (3/3 plans) — completed 2026-01-07
- [x] Phase 5: Reader Reorganization (3/3 plans) — completed 2026-01-07
- [x] Phase 6: Clean Up Confusion (2/2 plans) — completed 2026-01-07
- [x] Phase 7: Validation (3/3 plans) — completed 2026-01-07

[Full details](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v1.1 Curriculum Quality Fix (Phases 8-16) — SHIPPED 2026-01-09</summary>

- [x] Phase 8: PDF Extraction Audit (1/1 plans) — completed 2026-01-07
- [x] Phase 9: Extraction Pipeline Fix (3/3 plans) — completed 2026-01-07
- [x] Phase 10: A1 Vocabulary Extraction (1/1 plans) — completed 2026-01-07
- [x] Phase 11: A1 Grammar Content (1/1 plans) — completed 2026-01-07
- [x] Phase 12: A2 Content Population (1/1 plans) — completed 2026-01-07
- [x] Phase 12.1: UX Fixes (2/2 plans) — completed 2026-01-08 (INSERTED)
- [x] Phase 13: B1 Content Bootstrap (3/3 plans) — completed 2026-01-08
- [x] Phase 14: Content Validation (1/1 plans) — completed 2026-01-08
- [x] Phase 15: Practice Integration (1/1 plans) — completed 2026-01-08
- [x] Phase 16: Practice UX Redesign (2/2 plans) — completed 2026-01-09

</details>

<details>
<summary>✅ v1.2 Infrastructure & CI Overhaul (Phases 17-20) — SHIPPED 2026-01-09</summary>

- [x] Phase 17: CI Pipeline Audit (1/1 plans) — completed 2026-01-09
- [x] Phase 18: CI Pipeline Improvements (1/1 plans) — completed 2026-01-09
- [x] Phase 18.1: Lesson Quality Audit (4/4 plans) — completed 2026-01-09 (INSERTED)
- [x] Phase 19: Cloudflare Research & PoC (1/1 plans) — completed 2026-01-09 — **NO-GO**
- [x] Phase 20: Migration Decision (0/0 plans) — SKIPPED

[Full details](milestones/v1.2-ROADMAP.md)

</details>

<details>
<summary>✅ v1.3 Content Quality & User Journey (Phases 21-26) — SHIPPED 2026-01-10</summary>

**Milestone Goal:** Fix broken interactions, audit content effectiveness, improve Practice UX, and deepen A1/A2/B1 content while maintaining the core promise: "always resume in the right place, next step obvious."

#### Phase 21: Bug Fixes — COMPLETE

**Goal**: Fix clickable vocabulary cards and continue vocabulary name cleanup
**Depends on**: v1.2 complete
**Research**: Unlikely (existing codebase patterns)
**Plans**: 1

Plans:
- [x] 21-01: Vocabulary card interactivity and proper noun filtering — completed 2026-01-09

#### Phase 22: Content Effectiveness Audit — COMPLETE

**Goal**: Verify learning progression, exercise quality, and translation accuracy
**Depends on**: Phase 21
**Research**: Unlikely (CEFR standards already established in codebase)
**Plans**: 1

Plans:
- [x] 22-01: Translation fixes + progression audit + exercise quality review — completed 2026-01-09

#### Phase 23: Practice Feature Audit & UX — COMPLETE

**Goal**: Fix My Saved Words section styling and improve post-lesson practice flow
**Depends on**: Phase 22
**Research**: Unlikely (existing component patterns)
**Plans**: 1

Plans:
- [x] 23-01: i18n for My Saved Words + post-lesson practice prompt — completed 2026-01-09

#### Phase 24: User Journey Cohesion — COMPLETE

**Goal**: Connect Learn → Practice → Reader sections into cohesive navigation flow
**Depends on**: Phase 23
**Research**: Unlikely (internal routing patterns)
**Plans**: 1

Plans:
- [x] 24-01: User journey cohesion CTAs — completed 2026-01-10

#### Phase 25: Content Expansion — COMPLETE

**Goal**: Expand graded reader stories for A1/A2/B1 levels
**Depends on**: Phase 24
**Research**: Unlikely (following existing curriculum structure)
**Plans**: 3

Plans:
- [x] 25-01: A1 reader stories (My Morning, At the Store, My Best Friend) — completed 2026-01-10
- [x] 25-02: A2 reader stories (My Job, Hobbies, The Holiday) — completed 2026-01-10
- [x] 25-03: B1 reader stories (Macedonian Cuisine, City vs Village, Macedonian Legends) — completed 2026-01-10

#### Phase 26: Validation & Polish — COMPLETE

**Goal**: Final testing, polish, and refinements before milestone completion
**Depends on**: Phase 25
**Research**: Unlikely (internal testing patterns)
**Plans**: 2

Plans:
- [x] 26-01: Dark Mode & Component Polish — completed 2026-01-10
- [x] 26-02: User Journey E2E Validation — completed 2026-01-10

</details>

<details>
<summary>v1.4 Power User Feedback (Phases 27-32) — SHIPPED 2026-01-10</summary>

- [x] Phase 27: Bug Fixes (4/4 plans) — completed 2026-01-10
- [x] Phase 28: Navigation Overhaul (3/3 plans) — completed 2026-01-10
- [x] Phase 29: Lesson Enhancements (2/2 plans) — completed 2026-01-10
- [x] Phase 30: Vocabulary Display (2/2 plans) — completed 2026-01-10
- [x] Phase 31: State Persistence (1/1 plans) — completed 2026-01-10
- [x] Phase 32: Content & Polish (2/2 plans) — completed 2026-01-10

[Full details](milestones/v1.4-ROADMAP.md)

</details>

<details>
<summary>✅ v1.5 Audio Cleanup & Final Polish (Phases 33-35) — SHIPPED 2026-01-10</summary>

- [x] Phase 33: Audio Removal (2/2 plans) — completed 2026-01-10
- [x] Phase 34: Remaining Polish (3/3 plans) — completed 2026-01-10
- [x] Phase 35: Practice Improvements (1/1 plan) — completed 2026-01-10

[Full details](milestones/v1.5-ROADMAP.md)

</details>

<details>
<summary>✅ v1.6 Reader Overhaul (Phases 36-41) — SHIPPED 2026-01-11</summary>

- [x] Phase 36: A2 Reader Wiring (1/1 plans) — completed 2026-01-10
- [x] Phase 37: Tap-to-Translate (2/2 plans) — completed 2026-01-11
- [x] Phase 38: Reader Vocabulary Save (1/1 plans) — completed 2026-01-11
- [x] Phase 39: Reading Progress (1/1 plans) — completed 2026-01-11
- [x] Phase 40: Discovery & Navigation (1/1 plans) — completed 2026-01-11
- [x] Phase 41: Content & Validation (1/1 plans) — completed 2026-01-11

[Full details](milestones/v1.6-ROADMAP.md)

</details>

<details>
<summary>✅ v1.7 Learn Experience Overhaul (Phases 42-46) — SHIPPED 2026-01-11</summary>

- [x] Phase 42: Lesson Flow Simplification (1/1 plans) — completed 2026-01-11
- [x] Phase 43: Vocabulary & Grammar Audit (2/2 plans) — completed 2026-01-11
- [x] Phase 44: Content Completeness (1/1 plans) — completed 2026-01-11
- [x] Phase 45: Validation & Polish (1/1 plans) — completed 2026-01-11
- [x] Phase 46: Final Validation (1/1 plans) — completed 2026-01-11

[Full details](milestones/v1.7-ROADMAP.md)

</details>

<details>
<summary>v1.8 Quality & Performance (Phases 47-52) — SHIPPED 2026-01-13</summary>

- [x] Phase 47: Segmented Control Redesign (1/1 plans) — completed 2026-01-12
- [x] Phase 48: Learn UX Audit & Polish (2/2 plans) — completed 2026-01-13
- [x] Phase 49: Practice UX Audit & Polish (2/2 plans) — completed 2026-01-13
- [x] Phase 50: Reader UX Audit & Polish (2/2 plans) — completed 2026-01-13
- [x] Phase 51: Content Quality Audit (2/2 plans) — completed 2026-01-13
- [x] Phase 52: Performance Optimization (1/1 plans) — completed 2026-01-13

[Full details](milestones/v1.8-ROADMAP.md)

</details>

**Completed Milestones:**
- [v1.0 Beta](milestones/v1.0-ROADMAP.md) — 7 phases, 21 plans (shipped 2026-01-07)
- **v1.1 Curriculum Quality Fix** — 9 phases, 18 plans (shipped 2026-01-09)
- [v1.2 Infrastructure & CI](milestones/v1.2-ROADMAP.md) — 4 phases, 7 plans (shipped 2026-01-09)
- **v1.3 Content Quality & User Journey** — 6 phases, 9 plans (shipped 2026-01-10)
- [v1.4 Power User Feedback](milestones/v1.4-ROADMAP.md) — 6 phases, 13 plans (shipped 2026-01-10)
- [v1.5 Audio Cleanup & Final Polish](milestones/v1.5-ROADMAP.md) — 3 phases, 6 plans (shipped 2026-01-10)
- [v1.6 Reader Overhaul](milestones/v1.6-ROADMAP.md) — 6 phases, 7 plans (shipped 2026-01-11)
- [v1.7 Learn Experience Overhaul](milestones/v1.7-ROADMAP.md) — 5 phases, 6 plans (shipped 2026-01-11)
- [v1.8 Quality & Performance](milestones/v1.8-ROADMAP.md) — 6 phases, 10 plans (shipped 2026-01-13)
- **v1.9 Quality & Stability** — 8 phases, 12 plans (shipped 2026-01-14)
- [v2.0 Mobile App](milestones/v2.0-ROADMAP.md) — 7 phases, 13 plans (shipped 2026-01-16)

## Domain Expertise

None

## Phase Numbering

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.
