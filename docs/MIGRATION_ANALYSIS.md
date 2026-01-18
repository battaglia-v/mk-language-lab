# Migration Analysis: PWA → React Native (Expo)

> **Generated**: January 2026  
> **Status**: Discovery Phase  
> **Related**: [MIGRATION_CONTRACT.md](/MIGRATION_CONTRACT.md)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Entry Points & Layouts](#entry-points--layouts)
4. [Authentication](#authentication)
5. [Navigation](#navigation)
6. [Forms & Input Handling](#forms--input-handling)
7. [Core Features Comparison](#core-features-comparison)
8. [Shared Packages & Business Logic](#shared-packages--business-logic)
9. [API Endpoints](#api-endpoints)
10. [Storage & Persistence](#storage--persistence)
11. [Risk Assessment](#risk-assessment)
12. [Appendix: File Mappings](#appendix-file-mappings)

---

## Executive Summary

This document provides a comprehensive analysis of the PWA (Next.js) and React Native (Expo) codebases to identify gaps, mismatches, and risks before continuing the migration effort.

### Key Findings

| Area | Parity Status | Priority |
|------|---------------|----------|
| Authentication flow | ⚠️ Critical mismatch | P0 |
| Navigation structure | ⚠️ Misaligned | P1 |
| Practice feature | ⚠️ Logic diverged | P1 |
| i18n support | ❌ Missing in RN | P1 |
| Shared packages | ⚠️ Underutilized | P2 |
| Translate feature | ✅ Good parity | - |
| Theme support | ⚠️ Partial (dark only) | P3 |

### Immediate Actions Required

1. **Fix RN credentials auth** - Currently POSTs to wrong endpoint
2. **Align tab navigation** - Different count, order, and semantics
3. **Integrate shared packages** - `@mk/practice`, `@mk/api-client`
4. **Add i18n infrastructure** to React Native

---

## Architecture Overview

### PWA Stack (Next.js 15)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PWA Architecture                           │
├─────────────────────────────────────────────────────────────────────┤
│  Framework:    Next.js 15 (App Router)                              │
│  Auth:         NextAuth.js v5 (JWT sessions)                        │
│  Database:     Prisma + Neon (PostgreSQL)                           │
│  UI:           shadcn/ui + Tailwind CSS                             │
│  State:        React Query + localStorage                           │
│  i18n:         next-intl (en, mk locales)                           │
│  Analytics:    Vercel Analytics + custom events                     │
│  Deployment:   Vercel                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### React Native Stack (Expo)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     React Native Architecture                       │
├─────────────────────────────────────────────────────────────────────┤
│  Framework:    Expo SDK (Managed workflow)                          │
│  Router:       expo-router (file-based)                             │
│  Auth:         Zustand + SecureStore                                │
│  UI:           React Native core + custom components                │
│  State:        Zustand + AsyncStorage                               │
│  i18n:         ❌ Not implemented                                   │
│  Analytics:    ❌ Console logs only                                 │
│  Icons:        lucide-react-native                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy Comparison

**PWA:**
```
app/layout.tsx (root HTML, theme, metadata)
└── app/[locale]/layout.tsx
    ├── SessionProvider (NextAuth)
    ├── NextIntlClientProvider (i18n)
    ├── QueryProvider (React Query)
    ├── ToasterProvider
    ├── XPNotificationProvider
    ├── GoogleOneTapProvider
    └── AppShell
        ├── SidebarNav (desktop)
        ├── ShellHeader
        ├── {children} (page content)
        └── MobileTabNav (mobile)
```

**React Native:**
```
apps/mobile/app/_layout.tsx (root Stack)
├── Loading state (ActivityIndicator)
└── Stack.Navigator
    ├── index (auth redirect)
    ├── sign-in
    ├── register
    ├── forgot-password
    ├── (tabs)/_layout.tsx
    │   └── Tabs.Navigator
    │       ├── index (Home)
    │       ├── learn
    │       ├── practice
    │       ├── reader
    │       ├── translate
    │       └── profile
    ├── settings
    ├── lesson/[lessonId]
    ├── practice/session
    ├── practice/results
    └── grammar/*
```

---

## Entry Points & Layouts

### Root Layout

| Aspect | PWA | React Native |
|--------|-----|--------------|
| **File** | `app/layout.tsx` | `apps/mobile/app/_layout.tsx` |
| **Theme handling** | Blocking script prevents flash | Hardcoded dark theme |
| **Metadata** | Full SEO, OG tags, manifest | `app.config.ts` |
| **Fonts** | Google Fonts preconnect | System fonts |
| **Analytics** | Vercel Analytics | None |

**PWA Root Layout Features:**
- Theme detection script (localStorage → system preference → default)
- Safe area handling via CSS
- Google/OpenAI DNS prefetch
- PWA manifest link

**RN Root Layout Features:**
- Auth initialization on mount
- Offline queue processing
- Loading spinner during auth check
- StatusBar configuration

### Locale Layout (PWA Only)

```typescript
// app/[locale]/layout.tsx - PWA provider stack
<SessionProvider>
  <NextIntlClientProvider messages={messages}>
    <LocaleSyncProvider>
      <QueryProvider>
        <ToasterProvider>
          <OfflineStatusToast />
          <XPNotificationProvider>
            <GoogleOneTapProvider>
              <AlphaBanner />
              <SkipLink />
              <AppShell>{children}</AppShell>
            </GoogleOneTapProvider>
          </XPNotificationProvider>
        </ToasterProvider>
      </QueryProvider>
    </LocaleSyncProvider>
  </NextIntlClientProvider>
</SessionProvider>
```

**Missing in RN:**
- `QueryProvider` - No React Query
- `NextIntlClientProvider` - No i18n
- `ToasterProvider` - No toast system
- `XPNotificationProvider` - No XP animations
- `GoogleOneTapProvider` - N/A for mobile
- `OfflineStatusToast` - Has offline queue but no UI indicator

---

## Authentication

### Flow Comparison

**PWA Authentication Flow:**
```
1. User visits /auth/signin
2. Clicks "Continue with Google" OR enters credentials
3. Google OAuth: NextAuth handles redirect → callback → JWT issued
4. Credentials: POST to NextAuth → bcrypt verify → JWT issued
5. JWT stored in httpOnly cookie (30-day expiry)
6. useSession() hook provides session state
7. Redirect to /[locale]/learn
```

**React Native Authentication Flow:**
```
1. App starts → useAuthStore.initialize()
2. Check SecureStore for existing token
3. If token exists, validate via GET /api/profile
4. If valid, set isAuthenticated = true
5. User at /sign-in can:
   - Enter credentials → POST to ???
   - Google Sign-in → expo-auth-session → POST idToken to /api/auth/callback/google
6. Store token + user in SecureStore
7. router.replace('/(tabs)')
```

### Critical Issue: Credentials Endpoint Mismatch

**Current RN Implementation (BROKEN):**
```typescript
// apps/mobile/store/auth.ts - signIn method
const response = await fetch(
  `${getApiBaseUrl()}/api/auth/callback/credentials`,  // ❌ Wrong endpoint
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      csrfToken: '',  // NextAuth expects this
      callbackUrl: '/',
      json: true,
    }),
  }
);
```

**Problem:** NextAuth's `/api/auth/callback/credentials` is designed for browser redirects, not JSON API responses. It expects CSRF tokens and returns redirects, not `{token, user}`.

**Correct Endpoint:** `/api/mobile/auth/login`
```typescript
// app/api/mobile/auth/login/route.ts - Returns proper JSON
return NextResponse.json({
  token,      // JWT for mobile
  expiresAt,
  user: { id, name, email, image, role },
});
```

### Auth Storage Comparison

| Aspect | PWA | React Native |
|--------|-----|--------------|
| **Token storage** | httpOnly cookie | `expo-secure-store` |
| **Token type** | NextAuth JWT | Custom mobile JWT |
| **Expiry** | 30 days | Configured in `issueMobileAuthToken()` |
| **Refresh** | Automatic via NextAuth | Manual on 401 |
| **Logout** | `signOut()` clears cookie | `clearAll()` in SecureStore |

### Google OAuth Differences

| Aspect | PWA | React Native |
|--------|-----|--------------|
| **Library** | NextAuth Google provider | `expo-auth-session` |
| **Flow** | Server-side OAuth | Client-side with idToken |
| **Callback** | NextAuth handles | `/api/mobile/auth/callback` |
| **One-Tap** | `GoogleOneTapProvider` | Not available |

---

## Navigation

### Tab Structure Comparison

**PWA MobileTabNav (5 tabs):**
```typescript
// components/shell/navItems.ts
export const shellNavItems: ShellNavItem[] = [
  { id: "learn", path: "/learn", icon: Home },
  { id: "translate", path: "/translate", icon: Languages },
  { id: "practice", path: "/practice", icon: Sparkles },
  { id: "reader", path: "/reader", icon: BookOpen },
  { id: "resources", path: "/resources", icon: FolderOpen },
];
```

**React Native Tabs (6 tabs):**
```typescript
// apps/mobile/app/(tabs)/_layout.tsx
<Tabs.Screen name="index" options={{ title: 'Home', ... }} />
<Tabs.Screen name="learn" options={{ title: 'Learn', ... }} />
<Tabs.Screen name="practice" options={{ title: 'Practice', ... }} />
<Tabs.Screen name="reader" options={{ title: 'Reader', ... }} />
<Tabs.Screen name="translate" options={{ title: 'Translate', ... }} />
<Tabs.Screen name="profile" options={{ title: 'Profile', ... }} />
```

### Navigation Mismatch Summary

| PWA Tab | RN Tab | Issue |
|---------|--------|-------|
| Learn (Home icon) | Home + Learn | RN has two tabs for this |
| Translate | Translate | ✅ Same (different position) |
| Practice | Practice | ✅ Same |
| Reader | Reader | ✅ Same |
| Resources | ❌ Missing | No Resources tab in RN |
| ❌ Missing | Profile | RN has dedicated Profile tab |

### Hidden Navigation Pattern

**PWA Implementation:**
```typescript
// components/shell/MobileTabNav.tsx
const HIDDEN_NAV_PATTERNS = [
  /\/lesson\/[^/]+$/,        // Lesson screens
  /\/demo\/lesson-runner/,   // Demo lessons
  /\/demo\/grammar-lesson/,  // Demo grammar
  /\/practice\/session/,     // Practice sessions
  /\/practice\/grammar$/,    // Grammar practice
  /\/practice\/fill-blanks$/,// Fill blanks
];

if (shouldHideNav(pathname)) {
  return null;
}
```

**RN Implementation:** ❌ Not implemented - tabs always visible

### Route Structure

**PWA Routes (locale-prefixed):**
```
/en/learn
/en/practice
/en/practice/session?deck=curated&mode=multiple-choice
/en/lesson/lesson-001
/mk/translate
```

**RN Routes (no locale):**
```
/(tabs)
/(tabs)/learn
/(tabs)/practice
/practice/session?deck=curated&mode=multipleChoice
/lesson/[lessonId]
```

---

## Forms & Input Handling

### Component Mapping

| PWA Component | RN Component | Notes |
|---------------|--------------|-------|
| `<Input>` (shadcn) | `<TextInput>` | Different styling API |
| `<Textarea>` | `<TextInput multiline>` | Height handling differs |
| `<Button>` (shadcn) | `<TouchableOpacity>` | Different disable behavior |
| `<Label>` | `<Text>` | No htmlFor association |
| `<Alert>` | Custom `<View>` | Inline error display |

### Form Validation Patterns

**PWA Pattern (Translate page):**
```typescript
const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; general?: string }>({});

// Validation
const nextErrors: { email?: string; password?: string } = {};
if (!formData.email) {
  nextErrors.email = 'Email is required';
}
if (Object.keys(nextErrors).length) {
  setFieldErrors(nextErrors);
  return;
}

// In JSX
<Input
  aria-invalid={Boolean(fieldErrors.email)}
  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
/>
{fieldErrors.email && (
  <p id="email-error" className="text-xs text-red-500" role="alert">
    {fieldErrors.email}
  </p>
)}
```

**RN Pattern (Register screen):**
```typescript
const [error, setError] = useState('');

// Validation
if (!email || !password || !name) {
  setError('Please fill in all fields');
  return;
}

// In JSX
{error ? (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
  </View>
) : null}
```

### Keyboard Handling

**PWA:** Native browser behavior, no special handling needed.

**RN:**
```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.container}
>
```

**Potential Issues:**
- Android `height` behavior can be inconsistent
- No `keyboardShouldPersistTaps` in some forms
- Missing `returnKeyType` and `onSubmitEditing` for form flow

### Button Disabled States

**PWA:**
```typescript
<Button
  disabled={isLoading || !email || !password}
  className="..." // Tailwind handles disabled:opacity-50, cursor-not-allowed
>
```

**RN:**
```typescript
<TouchableOpacity
  disabled={isLoading || !email || !password}
  style={[styles.button, isLoading && styles.buttonDisabled]}
  // No visual cursor change (mobile), relies on opacity
>
```

---

## Core Features Comparison

### Practice Feature

| Aspect | PWA | RN | Parity |
|--------|-----|-----|--------|
| **Entry point** | `PracticeHub.tsx` | `(tabs)/practice.tsx` | ⚠️ Different |
| **Modes available** | Lesson Review, Grammar, Word Sprint, Vocabulary, Saved Words | Lesson Review, Word Sprint, All Vocabulary, Grammar | ⚠️ Different |
| **SRS integration** | Full (smart review, due cards) | None | ❌ Missing |
| **Saved words section** | Prominent with stats | "Coming soon" placeholder | ❌ Missing |
| **Settings sheet** | BottomSheet with mode/difficulty/deck | None | ❌ Missing |
| **Session logic** | Uses `packages/practice` | Own `lib/practice.ts` | ⚠️ Diverged |
| **Answer normalization** | Cyrillic-aware | Basic lowercase/trim | ⚠️ Diverged |
| **Completion tracking** | API + React Query | API + offline queue | ✅ RN has offline advantage |

### Translate Feature

| Aspect | PWA | RN | Parity |
|--------|-----|-----|--------|
| **Direction toggle** | SegmentedControl | Custom buttons | ✅ Functional |
| **Swap button** | ✅ | ✅ | ✅ Same |
| **Character limit** | 1800 | 1800 | ✅ Same |
| **History** | BottomSheet list | Modal FlatList | ✅ Similar |
| **Saved phrases** | BottomSheet + practice integration | ❌ Not implemented | ⚠️ Missing |
| **Copy to clipboard** | Navigator API | expo-clipboard | ✅ Platform-appropriate |
| **Error display** | Alert component | Inline styled View | ✅ Functional |

### Reader Feature

| Aspect | PWA | RN | Notes |
|--------|-----|-----|-------|
| **Component** | Complex with tap-to-translate | `TappableText` + `WordPopup` | Need to verify parity |
| **Reading progress** | Tracked via API | `lib/reading-progress.ts` | Appears similar |
| **Glossary** | Integrated | `lib/glossary.ts` | Appears similar |

### Lesson Feature

| Aspect | PWA | RN | Notes |
|--------|-----|-----|-------|
| **Route** | `/lesson/[lessonId]` | `/lesson/[lessonId].tsx` | ✅ Same structure |
| **Sections** | Dialogue, Vocabulary, Grammar, Practice | Same components exist | Need deep verification |
| **Completion** | API call | `/api/mobile/lesson/[id]/complete` | ✅ Mobile endpoint exists |

---

## Shared Packages & Business Logic

### Package Inventory

```
packages/
├── analytics/       # Event tracking types
├── api-client/      # Shared API fetch utilities
├── gamification/    # XP, streaks, hearts logic
├── practice/        # Session management, normalization
├── tokens/          # Design tokens (@mk/tokens)
└── ui/              # Cross-platform UI primitives
```

### Usage Matrix

| Package | PWA Usage | RN Usage | Should Share |
|---------|-----------|----------|--------------|
| `@mk/tokens` | ✅ Used in layout | ❌ Hardcoded values | Yes |
| `@mk/api-client` | ✅ Full usage | ❌ Own `lib/api.ts` | Yes |
| `@mk/practice` | ✅ Session, normalize | ❌ Own `lib/practice.ts` | Yes |
| `@mk/gamification` | ✅ XP calculations | ❓ Unclear | Yes |
| `@mk/analytics` | ✅ Event types | ❌ Console logs | Yes |
| `@mk/ui` | ⚠️ Partial | ❌ Not used | Evaluate |

### Critical Divergence: Practice Logic

**PWA (`packages/practice/src/normalize.ts`):**
```typescript
// Handles Cyrillic normalization, alternates, etc.
export function normalizeAnswer(answer: string): string {
  // Complex normalization logic
}
```

**RN (`apps/mobile/lib/practice.ts`):**
```typescript
export function evaluateAnswer(card: PracticeCard, userAnswer: string): AnswerResult {
  const normalizedExpected = card.answer.toLowerCase().trim();
  const normalizedUser = userAnswer.toLowerCase().trim();
  return {
    isCorrect: normalizedExpected === normalizedUser,
    expected: card.answer,
  };
}
```

**Risk:** Same user input may be evaluated differently between platforms.

---

## API Endpoints

### Shared Endpoints (Used by Both)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/translate/*` | POST | Translation service |
| `/api/profile` | GET | User profile data |
| `/api/user/*` | Various | User data operations |

### PWA-Specific Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/*` | NextAuth handlers |
| `/api/practice/*` | Practice data (non-mobile) |
| `/api/news/*` | News feed |
| `/api/discover/*` | Social features |

### Mobile-Specific Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/mobile/auth/login` | Credentials login (returns JWT) |
| `/api/mobile/auth/callback` | Google OAuth callback |
| `/api/mobile/auth/me` | Validate token |
| `/api/mobile/curriculum` | Curriculum data |
| `/api/mobile/practice` | Practice items |
| `/api/mobile/practice-completions` | Submit results |
| `/api/mobile/lesson/[id]` | Lesson data |
| `/api/mobile/lesson/[id]/complete` | Complete lesson |
| `/api/mobile/grammar` | Grammar exercises |
| `/api/mobile/reader` | Reader content |
| `/api/mobile/push-token` | Push notification token |

### Endpoint Parity Check

| Feature | PWA Endpoint | Mobile Endpoint | Parity |
|---------|--------------|-----------------|--------|
| Auth (credentials) | `/api/auth/callback/credentials` | `/api/mobile/auth/login` | ⚠️ Different |
| Auth (Google) | NextAuth internal | `/api/mobile/auth/callback` | ⚠️ Different |
| Practice items | `/api/practice/*` | `/api/mobile/practice` | ⚠️ Different |
| Profile | `/api/profile` | `/api/profile` | ✅ Same |
| Translate | `/api/translate/*` | `/api/translate/*` | ✅ Same |

---

## Storage & Persistence

### Storage Mechanisms

| Data Type | PWA Storage | RN Storage |
|-----------|-------------|------------|
| Auth token | httpOnly cookie | `expo-secure-store` |
| User data | Session (JWT claim) | `expo-secure-store` |
| Theme preference | `localStorage` (mk-theme) | ❌ Not implemented |
| Translation history | `localStorage` | `AsyncStorage` |
| Saved phrases | `localStorage` | ❌ Not implemented |
| Practice mistakes | `localStorage` | ❌ Not implemented |
| Reading progress | `localStorage` + API | `AsyncStorage` + API |
| Offline queue | N/A | `AsyncStorage` |

### LocalStorage Keys (PWA)

```typescript
// Theme
'mk-theme' // 'light' | 'dark' | 'system'

// Translation
'mk-translator-history' // TranslationHistoryItem[]
'mk-saved-phrases'      // SavedPhrase[]

// Practice
'mk-practice-mistakes'  // PracticeItem[]
'mk-practice-custom-deck' // PracticeItem[]

// Reading
'mk-reading-progress'   // { [storyId]: progress }
'mk-reader-favorites'   // string[] (word IDs)
```

### AsyncStorage Keys (RN)

```typescript
// Translation
'@translation_history' // HistoryItem[]

// Offline
'@offline_queue'       // QueuedItem[]

// Reading
'@reading_progress'    // { [storyId]: progress }

// Grammar
'@grammar_progress'    // { [lessonId]: completed }
```

---

## Risk Assessment

### 🔴 Critical (P0) - Must Fix Before Launch

#### 1. Credentials Auth Endpoint Mismatch

**Current State:** RN `signIn()` POSTs to NextAuth callback, expects JSON response.

**Expected Behavior:** Use `/api/mobile/auth/login` which returns `{token, user}`.

**Fix Required:**
```typescript
// apps/mobile/store/auth.ts
signIn: async (email, password) => {
  const response = await fetch(
    `${getApiBaseUrl()}/api/mobile/auth/login`,  // ✅ Correct endpoint
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );
  // Handle response...
}
```

#### 2. Practice Answer Normalization Divergence

**Risk:** User types correct answer, gets marked wrong on one platform.

**Fix Required:** RN should import and use `packages/practice` normalization.

### 🟠 High (P1) - Should Fix Soon

#### 3. Tab Navigation Misalignment

**Impact:** User confusion, different mental models.

**Decision Needed:** Which structure is canonical?

#### 4. Missing i18n in React Native

**Impact:** App is English-only, excludes Macedonian speakers.

**Fix Required:** Add i18n library (react-i18next or similar) + message files.

#### 5. No Hidden Nav During Lessons

**Impact:** Distraction, accidental navigation, UX degradation.

**Fix Required:** Implement route pattern matching in RN.

### 🟡 Medium (P2) - Plan to Address

#### 6. Saved Phrases Not Integrated in RN

**Impact:** Users can't save translations for practice.

#### 7. No Toast Notification System in RN

**Impact:** Inconsistent feedback patterns.

#### 8. Analytics Not Implemented in RN

**Impact:** No visibility into mobile user behavior.

#### 9. Shared Packages Not Used

**Impact:** Duplicate logic, divergence risk.

### 🟢 Low (P3) - Nice to Have

#### 10. Theme Toggle (RN is Dark Only)

#### 11. SRS/Smart Review Missing in RN

#### 12. Settings Sheet for Practice Missing in RN

---

## Appendix: File Mappings

### Route → Component Mapping

| Route | PWA File | RN File |
|-------|----------|---------|
| Home/Learn | `app/[locale]/learn/page.tsx` | `apps/mobile/app/(tabs)/index.tsx` + `learn.tsx` |
| Practice | `app/[locale]/practice/page.tsx` | `apps/mobile/app/(tabs)/practice.tsx` |
| Practice Session | `app/[locale]/practice/session/page.tsx` | `apps/mobile/app/practice/session.tsx` |
| Translate | `app/[locale]/translate/page.tsx` | `apps/mobile/app/(tabs)/translate.tsx` |
| Reader | `app/[locale]/reader/page.tsx` | `apps/mobile/app/(tabs)/reader.tsx` |
| Lesson | `app/[locale]/lesson/[lessonId]/page.tsx` | `apps/mobile/app/lesson/[lessonId].tsx` |
| Sign In | `app/auth/signin/page.tsx` | `apps/mobile/app/sign-in.tsx` |
| Register | `app/auth/signup/page.tsx` | `apps/mobile/app/register.tsx` |
| Profile | `app/[locale]/profile/page.tsx` | `apps/mobile/app/(tabs)/profile.tsx` |
| Settings | `app/[locale]/settings/page.tsx` | `apps/mobile/app/settings.tsx` |

### Component Mapping

| PWA Component | RN Equivalent | Notes |
|---------------|---------------|-------|
| `components/practice/PracticeHub.tsx` | `apps/mobile/app/(tabs)/practice.tsx` | Feature divergence |
| `components/shell/AppShell.tsx` | Implicit in layouts | Different approach |
| `components/shell/MobileTabNav.tsx` | `apps/mobile/app/(tabs)/_layout.tsx` | Tab config |
| `components/ui/Button.tsx` | `TouchableOpacity` | No shared component |
| `components/ui/BottomSheet.tsx` | `Modal` | Different implementation |
| `components/translate/useTranslatorWorkspace.ts` | Inline in translate.tsx | Could extract |

### Lib/Utility Mapping

| PWA Lib | RN Equivalent | Shared? |
|---------|---------------|---------|
| `lib/auth.ts` | `apps/mobile/store/auth.ts` | No |
| `lib/routes.ts` | N/A | Web-only |
| `lib/haptics.ts` | `expo-haptics` (direct) | Could share |
| `lib/analytics.ts` | ❌ Missing | Should share |
| `packages/practice/*` | `apps/mobile/lib/practice.ts` | Should share |
| `packages/api-client/*` | `apps/mobile/lib/api.ts` | Should share |

---

## Next Steps

1. **Immediate:** Fix credentials auth endpoint in RN
2. **Week 1:** Align navigation structure (decide on canonical tabs)
3. **Week 2:** Integrate `packages/practice` into RN
4. **Week 3:** Add i18n infrastructure to RN
5. **Week 4:** Implement hidden nav during immersive flows
6. **Ongoing:** Migrate to shared packages as features are touched

---

*Document maintained as part of the PWA → React Native migration effort.*
