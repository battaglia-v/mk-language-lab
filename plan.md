# Mobile Migration Plan (React Native + Expo)

## Overview

Ship a native React Native app (iOS + Android) that provides core learning functionality, preserving the Play Store listing and sharing logic packages with the web app.

## Decisions (Locked)

| Decision | Value | Rationale |
|----------|-------|-----------|
| Package ID | `com.mklanguage.app` | Preserve Play Store listing (TWA's ID) |
| Bundle ID (iOS) | `com.mklanguage.app` | Match Android for consistency |
| Expo workflow | Managed | Simpler builds, no native code needed |
| Auth providers | Email/password + Google | Existing web auth; Apple added for iOS later |
| State management | Zustand + React Query | Proven pattern, offline-friendly |
| UI approach | NativeWind + custom components | Don't share UI with web; share logic only |
| Navigation | Expo Router (file-based) | Matches old app pattern |
| Keystore | `android-twa/mklanguage.keystore` | Existing Play Store signing key |

## Scope

### In Scope (v1)

| Screen | Description |
|--------|-------------|
| Home | Dashboard with continue learning, progress stats |
| Learn | Level selector, lesson list, lesson runner (4-section flow) |
| Practice | Practice hub, card stack with 5 question types |
| Reader | Story list with filters, story viewer, tap-to-translate |
| Translator | AI translation tool (existing API) |
| Profile | User info, progress stats, settings, sign out |
| Auth | Sign in (email/password + Google), register, forgot password |

### Out of Scope (v1)

- IAP/subscriptions (free beta)
- Push notifications (defer to v1.1)
- Deep links (defer to v1.1)
- Apple Sign-in (add when iOS ships)
- Audio features (deferred Phase 58)
- Background sync (manual refresh for v1)
- Analyzer tool (use web)

## Milestones

### Milestone 1: Foundation
**Goal**: Buildable app shell with auth

**Acceptance Criteria:**
- [ ] `apps/mobile/` directory created with Expo managed workflow
- [ ] `app.config.ts` with `com.mklanguage.app` package ID
- [ ] EAS build profiles (dev, preview, production)
- [ ] Email/password auth working
- [ ] Google Sign-in working on Android
- [ ] Home screen with authenticated user name
- [ ] Tab navigation structure

### Milestone 2: Learn Flow
**Goal**: Complete lesson flow with progress

**Acceptance Criteria:**
- [ ] Level selector (A1/A2/B1)
- [ ] Lesson list with completion indicators
- [ ] Lesson runner with 4-section flow (Vocabulary, Grammar, Examples, Quiz)
- [ ] Progress API integration
- [ ] Local progress caching (offline resume)

### Milestone 3: Practice Flow
**Goal**: Practice session with 5 question types

**Acceptance Criteria:**
- [ ] Practice hub with mode selection
- [ ] Card stack UI with swipe/tap gestures
- [ ] Multiple choice, cloze, typing, tap-words, matching cards
- [ ] Session results with accuracy
- [ ] Offline answer queue

### Milestone 4: Reader Flow
**Goal**: Reader with tap-to-translate

**Acceptance Criteria:**
- [ ] Story list with level/topic filters
- [ ] Story viewer with selectable words
- [ ] Tap-to-translate popup with vocabulary data
- [ ] Reading progress (scroll position, completion)
- [ ] Save word to favorites

### Milestone 5: Translator
**Goal**: AI translation tool

**Acceptance Criteria:**
- [ ] Text input with Macedonian keyboard hints
- [ ] Translation API integration
- [ ] Translation history (local storage)
- [ ] Copy to clipboard

### Milestone 6: Profile & Polish
**Goal**: Profile, settings, store readiness

**Acceptance Criteria:**
- [ ] Profile screen with progress stats
- [ ] Settings screen (language toggle)
- [ ] Sign out flow
- [ ] App icon, splash screen, adaptive icon
- [ ] Store screenshots

### Milestone 7: QA & Ship Android
**Goal**: Android production release

**Acceptance Criteria:**
- [ ] E2E tests passing (Maestro)
- [ ] 0 crashes in manual testing
- [ ] Play Store listing updated
- [ ] Production build uploaded to Play Store
- [ ] Internal testers confirmed working
- [ ] TWA deprecation plan communicated

## File Structure

```
apps/mobile/
├── app/
│   ├── _layout.tsx           # Root layout, providers
│   ├── sign-in.tsx           # Sign in screen
│   ├── register.tsx          # Register screen
│   ├── forgot-password.tsx   # Password reset
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab navigator
│   │   ├── index.tsx         # Home
│   │   ├── learn.tsx         # Learn hub
│   │   ├── practice.tsx      # Practice hub
│   │   ├── reader.tsx        # Reader list
│   │   └── profile.tsx       # Profile
│   ├── lesson/[id].tsx       # Lesson detail
│   ├── practice/session.tsx  # Practice session
│   ├── reader/[id].tsx       # Story viewer
│   ├── translator.tsx        # Translator tool
│   └── settings.tsx          # Settings
├── components/
│   ├── LessonRunner.tsx
│   ├── StoryViewer.tsx
│   ├── WordPopup.tsx
│   └── cards/
│       ├── MultipleChoice.tsx
│       ├── Cloze.tsx
│       ├── Typing.tsx
│       ├── TapWords.tsx
│       └── Matching.tsx
├── lib/
│   ├── auth.ts               # Auth helpers (SecureStore tokens)
│   ├── api.ts                # API client wrapper
│   ├── progress.ts           # Progress state
│   ├── practice-session.ts   # Session logic
│   └── storage.ts            # AsyncStorage helpers
├── store/
│   └── index.ts              # Zustand stores
├── app.config.ts
├── eas.json
└── package.json
```

## API Contracts

### Existing APIs (mobile consumes)

```
GET  /api/lessons?level=A1        # Lesson list
GET  /api/lessons/[id]            # Lesson content
GET  /api/vocabulary?lessonId=    # Vocab for lesson
GET  /api/progress                # User progress
POST /api/progress                # Update progress
GET  /api/practice/session        # Generate practice cards
POST /api/practice/answer         # Record answer
GET  /api/reader/stories          # Story list
GET  /api/reader/stories/[id]     # Story content
POST /api/reader/progress         # Reading progress
GET  /api/vocabulary/favorites    # Saved words
POST /api/vocabulary/save         # Add to favorites
POST /api/translate               # AI translation
```

### Auth Strategy

Mobile will use the existing NextAuth API with token-based auth:
1. Sign in via `/api/auth/callback/credentials` or `/api/auth/callback/google`
2. Store session token in Expo SecureStore
3. Pass token in `Authorization: Bearer` header for API calls
4. Refresh using NextAuth session endpoint

## Dependencies

- [ ] Verify `android-twa/mklanguage.keystore` SHA-256 matches Play Console
- [ ] EAS account with build credits
- [ ] Google OAuth configured for `com.mklanguage.app` package

## Rollout Plan

1. **Internal Alpha**: Dev builds for testing
2. **Closed Beta**: 20 Play Store internal testers
3. **Open Beta**: Public beta track
4. **Production Android**: Full rollout
5. **TWA Sunset**: In-app notice, then unpublish TWA
6. **iOS**: After Apple Developer enrollment (separate milestone)

## Progress Log

- 2026-01-16: Found Expo removal commit in git history
- 2026-01-16: Audit complete, plan revised with locked decisions
