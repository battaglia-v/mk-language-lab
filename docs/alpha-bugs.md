# Alpha Bug Fixes - Mobile UI Issues

This document tracks the root causes found and fixes applied for the alpha user-reported mobile issues.

## Summary of Fixes Applied

| Priority | Issue | Root Cause | Fix Applied | Status |
|----------|-------|------------|-------------|--------|
| P0-3 | Lesson Complete stuck | SUMMARY step required Check before Continue | Treat SUMMARY like INFO step | ✅ Fixed |
| P0-4 | Alphabet save errors | No retry logic, blocks on failure | Added retry + offline queue | ✅ Fixed |
| P0-5 | Oops crashes | Lack of debug info | Added debug mode (`?debug=1`) | ✅ Fixed |
| P0-6 | Layout/tap overlay | MobileTabNav z-50 over lesson | Hide nav during lessons | ✅ Fixed |
| P2-2 | MK flag visibility | Emoji rendering varies by OS | Added SVG flag component | ✅ Fixed |
| P1-4 | No pronunciation | Missing TTS integration | Added useTTS hook + TTSButton | ✅ Fixed |

## Detailed Root Causes & Fixes

### P0-3: Lesson Complete Screen Buttons Stuck

**Root Cause:**
The `useLessonRunner` hook only treated `INFO` steps as "non-validated" steps. `SUMMARY` step required users to press "Check" first (showing feedback), then "Continue" to proceed. This caused confusion on the completion screen.

**Files Modified:**
- `lib/lesson-runner/useLessonRunner.ts` - Line 72: Changed `isInfoStep` to include SUMMARY
- `components/lesson/LessonRunner.tsx` - Line 223: Updated handleSubmit to handle SUMMARY

**Fix:**
```typescript
// Before
const isInfoStep = currentStep?.type === 'INFO';

// After
const isInfoStep = currentStep?.type === 'INFO' || currentStep?.type === 'SUMMARY';
```

---

### P0-4: Alphabet Module Can't Save Progress

**Root Cause:**
Single fetch call with no retry logic. If the server failed once, users saw "Failed to save progress" and had to manually retry. No offline queue for later sync.

**Files Modified:**
- `app/[locale]/learn/lessons/alphabet/page.tsx`

**Fix:**
1. Added `fetchWithRetry()` function with exponential backoff (3 attempts: 1s, 2s, 4s)
2. Added `queuePendingSave()` to store failed saves in localStorage
3. Added `processPendingSaves()` to sync queued saves on page load
4. Changed error behavior: Mark locally complete + show info toast instead of blocking

---

### P0-5: Debug Mode for Alpha Testing

**Root Cause:**
No way to trace exercise state transitions, validation triggers, or save status in production/alpha.

**Files Created:**
- `lib/debug.ts` - Debug logging utilities

**Features:**
- Enable with `?debug=1` URL parameter
- Logs exercise state transitions
- Logs validation triggers (check_button, enter_key, auto_submit)
- Logs save progress status (pending, success, failed, queued)
- Color-coded console output

---

### P0-6: Header/Footer Overlay Tap Issues

**Root Cause:**
- MobileTabNav: `z-50`, always visible
- ExerciseLayout footer: `z-10`
- Lessons rendered within AppShell, so nav was always present
- Footer padding accounted for nav but z-index layering caused potential issues

**Files Modified:**
- `components/shell/MobileTabNav.tsx` - Added route-based hiding logic
- `components/lesson/LessonRunner.tsx` - Changed `bottomNavOffset={false}`
- `components/learn/ExerciseLayout.tsx` - Updated z-index to `z-30`, added safe area padding

**Fix:**
Hide MobileTabNav on these routes:
- `/lesson/*` - Lesson pages
- `/practice/session/*` - Practice sessions
- `/practice/grammar` - Grammar practice
- `/practice/fill-blanks` - Fill blanks practice

---

### P2-2: MK Flag Visibility

**Root Cause:**
Using emoji `🇲🇰` for the flag. Emoji rendering varies by:
- iOS/macOS: Full color flag
- Android: Full color flag
- Windows: Often shows "MK" text or simplified version
- Some devices: May show placeholder boxes

**Files Created:**
- `components/ui/MKFlag.tsx` - SVG-based flag component

**Files Modified:**
- `components/shell/ShellHeader.tsx` - Replaced emoji with SVG component

---

### P1-4: TTS Pronunciation Support

**Root Cause:**
TTS API existed (`/api/tts`) using Google Cloud TTS, but no reusable hook or component for easy integration in lesson steps.

**Files Created:**
- `hooks/use-tts.ts` - Reusable TTS hook with Web Speech API fallback
- `components/ui/TTSButton.tsx` - Ready-to-use TTS button component

**Features:**
- Uses Web Speech API (works offline, instant)
- Serbian (sr-RS) voices as fallback for Macedonian
- Optional Google Cloud TTS backend
- Loading/speaking states
- Graceful degradation if not supported

---

## Known Remaining Issues

1. **P0-1 (Keystroke validation)**: Architecture analysis shows validation only happens on Check button press. May be a content issue or edge case. Added E2E tests to verify.

2. **P0-2 (Multiple choice taps)**: Touch targets are 48px+. Added E2E tests. May be device-specific.

3. **P1-2 (Partial answers in correction)**: May be content data issue rather than code issue.

4. **P1-3 (Word bank mixed scripts)**: Translation labels look correct. May be content data issue.

---

## E2E Tests Added

Created `e2e/p0-mobile-exercises.spec.ts` with tests for:
- No keystroke validation (type without feedback until Check)
- Multiple choice tap targets (48px+ height)
- Summary Continue button immediately clickable
- Mobile nav hidden during lessons
- Check button visible without overlap

Run tests:
```bash
npx playwright test e2e/p0-mobile-exercises.spec.ts
```

---

## Debug Mode Usage

Add `?debug=1` to any URL to enable debug mode:
```
https://mklanguage.com/en/lesson/123?debug=1
```

This will log:
- `[EXERCISE]` - State transitions
- `[VALIDATION]` - Validation triggers and results
- `[SAVE]` - Progress save status

Check browser console for color-coded output.
