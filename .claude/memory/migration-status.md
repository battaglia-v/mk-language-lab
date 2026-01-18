# Migration Status: PWA → React Native

> Last Updated: January 18, 2026

## Current Phase: ✅ FEATURE PARITY COMPLETE

### Summary
- **190+ parity items completed**
- **46 major features implemented**
- **95%+ functional parity with PWA**

### Documents Created
- `/MIGRATION_CONTRACT.md` - Ground rules for migration
- `/docs/MIGRATION_ANALYSIS.md` - Full technical analysis
- `/docs/MIGRATION_CHECKLIST.md` - Quick reference checklist

---

## Critical Issues Identified

### 🟢 P0: Fixed ✅

1. **Auth Credentials Endpoint** ✅ FIXED
   - File: `apps/mobile/store/auth.ts`
   - Now uses `/api/mobile/auth/login` (correct endpoint)

2. **Practice Answer Normalization** ✅ FIXED
   - Added `@mk/practice` to RN dependencies
   - `TypingCard.tsx`, `ClozeCard.tsx`, `lib/practice.ts` now use shared normalizeAnswer

### 🟢 Additional Fixes Applied

3. **Google OAuth Validation** ✅ FIXED
   - `lib/google-auth.ts` now validates credentials and returns `isConfigured` flag
   - Sign-in screen shows "unavailable" when not configured

4. **KeyboardAvoidingView Standardized** ✅ FIXED
   - Created `components/ui/KeyboardSafeView.tsx` wrapper
   - Updated `sign-in.tsx`, `register.tsx`, `forgot-password.tsx`
   - Consistent iOS/Android behavior with keyboard dismiss

### 🟢 P1: Fixed ✅

5. **Tab navigation mismatch** ✅ FIXED
   - Tab order now matches PWA: Learn, Translate, Practice, Reader, Resources
   - Profile moved to settings (not a tab)

6. **i18n infrastructure** ✅ FIXED
   - Added `lib/i18n.ts` with en/mk translations
   - Tab labels now use `useTranslations` hook

7. **Nav hidden during immersive flows** ✅ FIXED
   - Created `LessonShell` component
   - Practice session and lesson screens now use immersive layout

8. **Saved phrases** ✅ FIXED
   - Added `lib/saved-phrases.ts` (AsyncStorage-based)
   - Translate screen has save button

---

## Shared Package Integration Status

| Package | Status |
|---------|--------|
| `@mk/tokens` | ✅ Added to package.json |
| `@mk/practice` | ✅ Added and integrated |
| `@mk/api-client` | ❌ Not used in RN |
| `@mk/gamification` | ✅ Added and integrated |
| `@mk/analytics` | ✅ Added and integrated |

---

## Next Actions

1. ~~Fix auth endpoint in `apps/mobile/store/auth.ts`~~ ✅ Done
2. ~~Decide canonical tab structure~~ ✅ Done (matches PWA)
3. ~~Add `packages/practice` to RN dependencies~~ ✅ Done
4. ~~Add i18n infrastructure to RN~~ ✅ Done
5. ~~Run `npm install` in apps/mobile to install workspace packages~~ ✅ Done
6. Test auth flow on iOS and Android (Dev Client)
7. ~~Add token refresh on 401~~ ✅ Done
8. ~~Add theme toggle~~ ✅ Done
9. ~~Add saved words practice deck~~ ✅ Done
10. ~~Grammar screen → LessonShell~~ ✅ Done
11. ~~Practice mode selection sheet~~ ✅ Done
12. ~~Practice mistakes tracking~~ ✅ Done
13. ~~Reader favorites storage~~ ✅ Done
14. ~~Deep linking for auth~~ ✅ Done
15. ~~Gamification (XP, streaks, levels)~~ ✅ Done
16. ~~Analytics event tracking~~ ✅ Done
17. ~~Auth route guards~~ ✅ Done
18. ~~Custom decks storage~~ ✅ Done
19. ~~Toast/notification system~~ ✅ Done
20. ~~Offline mode with queue~~ ✅ Done
21. ~~Word Sprint practice mode~~ ✅ Done
22. ~~SRS due cards indicator~~ ✅ Done
23. ~~Offline status toast~~ ✅ Done
24. ~~XP notification animations~~ ✅ Done
25. ~~Reading progress tracking~~ ✅ Done
26. ~~Haptic feedback~~ ✅ Done
27. ~~Loading skeletons~~ ✅ Done
28. ~~Share functionality~~ ✅ Done
29. ~~Error boundary~~ ✅ Done
30. ~~Pull-to-refresh standardization~~ ✅ Done
31. ~~TTS hook for translations/reader~~ ✅ Done
32. ~~Word-of-Day widget~~ ✅ Done
33. ~~Reader word lookup bottom sheet~~ ✅ Done
34. ~~Lesson progress persistence~~ ✅ Done
35. ~~Resources tab screen~~ ✅ Done
36. ~~Saved Words screen~~ ✅ Done
37. ~~Daily Goal widget~~ ✅ Done
38. ~~Practice session persistence~~ ✅ Done
39. ~~Onboarding wizard~~ ✅ Done
40. ~~Welcome banner~~ ✅ Done
41. ~~Resume practice banner~~ ✅ Done
42. ~~Achievements system~~ ✅ Done
43. ~~Achievement unlock toast~~ ✅ Done
44. ~~Achievements gallery screen~~ ✅ Done
45. ~~Level up celebration~~ ✅ Done
46. ~~Practice stats card~~ ✅ Done

---

## Remaining Low-Priority Items

### P3 - Backlog
1. **Facebook Sign-In** - PWA has it, RN doesn't (low usage)
2. **Notifications Screen** - Requires push notification setup (Dev Client)
3. **i18n String Externalization** - Infrastructure done, strings ongoing

### Acceptable Differences
- **Auth Guards**: RN uses hard redirects vs PWA soft prompts (stricter is OK)
- **@mk/api-client**: Not used in RN (direct fetch works fine)

---

## Key File Locations

### PWA Entry Points
- `app/layout.tsx` - Root layout
- `app/[locale]/layout.tsx` - Provider stack
- `components/shell/AppShell.tsx` - Shell wrapper

### RN Entry Points
- `apps/mobile/app/_layout.tsx` - Root layout
- `apps/mobile/app/(tabs)/_layout.tsx` - Tab navigator
- `apps/mobile/store/auth.ts` - Auth state

### Mobile API Endpoints
- `/api/mobile/auth/login` - Credentials login (correct)
- `/api/mobile/auth/callback` - Google OAuth
- `/api/mobile/practice` - Practice items
- `/api/mobile/lesson/[id]` - Lesson data
