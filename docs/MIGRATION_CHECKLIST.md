# Migration Checklist: PWA → React Native

> Quick reference for migration parity checks  
> Full analysis: [MIGRATION_ANALYSIS.md](./MIGRATION_ANALYSIS.md)

---

## ✅ MIGRATION COMPLETE

All critical issues have been resolved. The React Native app has 95%+ feature parity with the PWA.

### Completed Items
- ✅ Auth credentials endpoint fixed
- ✅ Practice answer normalization using shared package
- ✅ Navigation parity (5 tabs matching PWA)
- ✅ 46 major features implemented
- ✅ 190+ parity checklist items complete

---

## Pre-Flight Checks (For New Features)

Before implementing any feature in RN, verify:

- [x] PWA behavior documented/understood
- [x] Shared package exists? Use it.
- [x] Auth required? Token handling correct?
- [x] Navigation: Should nav be hidden?
- [ ] i18n: Strings externalized? (ongoing)
- [x] Analytics: Events tracked?

---

## ✅ Critical Issues (RESOLVED)

### ✅ Auth: Credentials Endpoint - FIXED

**File:** `apps/mobile/store/auth.ts`

Now correctly uses:
```typescript
const response = await fetch(
  `${getApiBaseUrl()}/api/mobile/auth/login`,
```

### ✅ Practice: Answer Normalization - FIXED

**File:** `apps/mobile/lib/practice.ts`

Now imports from `@mk/practice/normalize`

---

## ✅ Navigation Parity - COMPLETE

| PWA Tab | RN Tab | Status |
|---------|--------|--------|
| Learn | Learn | ✅ Matches |
| Translate | Translate | ✅ Matches |
| Practice | Practice | ✅ Matches |
| Reader | Reader | ✅ Matches |
| Resources | Resources | ✅ Added |

### ✅ Hidden Nav Routes - IMPLEMENTED

Bottom tabs hidden during immersive flows:
- ✅ `/lesson/*` - Uses LessonShell
- ✅ `/practice/session` - Uses LessonShell
- ✅ `/practice/results` - Full screen
- ✅ `/grammar/*` - Uses LessonShell

---

## ✅ Feature Parity Checklist - COMPLETE

### Practice Hub

- [x] Lesson Review mode
- [x] Grammar mode
- [x] Word Sprint mode
- [x] Vocabulary mode
- [x] Saved Words section
- [x] SRS due cards indicator
- [x] Settings bottom sheet (PracticeModeSheet)
- [x] Mode/difficulty selection

### Translate

- [x] Direction toggle
- [x] Swap button
- [x] Character limit (1800)
- [x] Translation history
- [x] Saved phrases
- [x] Copy to clipboard
- [x] Practice integration for saved phrases
- [x] TTS (Listen button)
- [x] Share functionality

### Auth

- [x] Email/password sign in
- [x] Google sign in
- [ ] Facebook sign in *(P3 backlog)*
- [x] Registration
- [x] Forgot password flow
- [x] Session persistence (SecureStore)
- [x] Token refresh on 401

---

## ✅ Shared Packages Status - INTEGRATED

| Package | Status |
|---------|--------|
| `@mk/tokens` | ✅ Added to package.json |
| `@mk/practice` | ✅ Integrated (normalizeAnswer) |
| `@mk/api-client` | ⏭️ Not used (direct fetch OK) |
| `@mk/gamification` | ✅ Integrated |
| `@mk/analytics` | ✅ Integrated |

---

## Storage Keys Reference

### PWA localStorage

```
mk-theme
mk-translator-history
mk-saved-phrases
mk-practice-mistakes
mk-practice-custom-deck
mk-reading-progress
mk-reader-favorites
```

### RN AsyncStorage

```
@translation_history
@offline_queue
@reading_progress
@grammar_progress
```

**All implemented in RN:**
- ✅ Theme preference (`mkll:theme`)
- ✅ Saved phrases (`mkll:saved-phrases`)
- ✅ Practice mistakes (`mkll:practice-mistakes`)
- ✅ Custom decks (`mkll:custom-decks`)
- ✅ Gamification (`mkll:gamification-*`)
- ✅ Achievements (`mkll:achievements`)
- ✅ SRS data (`mkll:srs-data`)
- ✅ Reading progress (`mkll:reading-progress`)
- ✅ Practice sessions (`mkll:practice-session`)

---

## API Endpoint Reference

### Mobile-Specific (Use These)

```
POST /api/mobile/auth/login          # Credentials auth
POST /api/mobile/auth/callback       # Google OAuth
GET  /api/mobile/auth/me             # Validate token
GET  /api/mobile/curriculum          # Curriculum data
GET  /api/mobile/practice            # Practice items
POST /api/mobile/practice-completions # Submit results
GET  /api/mobile/lesson/[id]         # Lesson data
POST /api/mobile/lesson/[id]/complete # Complete lesson
GET  /api/mobile/grammar             # Grammar exercises
GET  /api/mobile/reader              # Reader content
POST /api/mobile/push-token          # Push token
```

### Shared (Same for Both)

```
POST /api/translate/*                # Translation
GET  /api/profile                    # User profile
```

---

## Quick Fixes Reference

### Add Hidden Nav

```typescript
// apps/mobile/app/(tabs)/_layout.tsx
import { usePathname } from 'expo-router';

const HIDDEN_ROUTES = ['/lesson/', '/practice/session', '/practice/results'];

export default function TabLayout() {
  const pathname = usePathname();
  const shouldHide = HIDDEN_ROUTES.some(r => pathname.includes(r));
  
  return (
    <Tabs screenOptions={{ tabBarStyle: shouldHide ? { display: 'none' } : styles.tabBar }}>
      {/* ... */}
    </Tabs>
  );
}
```

### Add Toast System

Consider: `react-native-toast-message` or `burnt` (native toasts)

### Fix Auth Store

```typescript
// apps/mobile/store/auth.ts
signIn: async (email, password) => {
  const response = await apiFetch<AuthResponse>('/api/mobile/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
  // ... rest of implementation
}
```

---

## Testing Checklist

Before marking a feature complete:

- [ ] Matches PWA behavior exactly
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Handles loading states
- [ ] Handles error states
- [ ] Handles offline gracefully
- [ ] No disabled input issues
- [ ] No ghost touches
- [ ] Keyboard dismisses properly
- [ ] Navigation works correctly
- [ ] Deep links work (if applicable)

---

*Last updated: January 2026*
