# Mobile QA Punch List

**Date:** 2024-12-31
**Auditor:** Claude Code

---

## Summary

Overall mobile readiness is **good**. Most components use responsive patterns. Key issues found below.

---

## Issues Found

### 1. FIXED: PracticeHub pointing to wrong route
- **File:** `components/practice/PracticeHub.tsx:62-65`
- **Issue:** Was pointing to `/practice/fill-blanks` instead of `/practice/word-sprint`
- **Status:** FIXED

### 2. Duplicate fill-blank implementations
- **Files:**
  - `app/[locale]/practice/fill-blanks/page.tsx` (195 lines, standalone)
  - `app/[locale]/practice/word-sprint/page.tsx` (new consolidated)
- **Issue:** Two overlapping implementations exist
- **Recommendation:** Consider deprecating `/fill-blanks` or adding redirect

### 3. Loading states audit - PASS
- All loading states use `<Skeleton>` components
- No raw "Loading..." text found in user-facing components
- Files checked: `lib/lazy-components.tsx`, session components

### 4. Grid layouts - PASS
- No non-responsive `grid-cols-*` found without breakpoint prefixes
- Practice results uses responsive `grid-cols-2` appropriately

### 5. Max-width patterns - PASS
- `PageContainer` handles responsive sizing
- Session modals use `max-w-lg` with `w-full` (mobile-first)

### 6. Typography scale - NEEDS REVIEW
- **File:** `app/globals.css` defines CSS variables
- **Observation:** Typography is defined but scattered across components
- **Recommendation:** Consolidate to `theme.css` or design tokens file

### 7. Dashboard components placement - PASS
- `PracticeStreakCalendar` only used in Profile section
- No calendars/heatmaps in primary lesson flows

### 8. Lesson flow completeness - PASS
- **Word Sprint:** Has intro (DifficultyPicker) → questions → results (SessionComplete)
- **Fill Blanks:** Has intro → questions → results
- **Grammar:** Uses LessonRunner with Summary step
- All flows have XP display and next CTA

---

## Files Modified in This Session

| File | Change |
|------|--------|
| `components/practice/PracticeHub.tsx` | Changed fillBlanks → wordSprint |
| `messages/en.json` | Added `modes.wordSprint` |
| `messages/mk.json` | Added `modes.wordSprint` |

---

## Remaining Polish Items - ALL COMPLETE

1. ~~Typography consolidation~~ - **Already done** in `app/theme.css:4-12`
2. ~~Deprecate fill-blanks route~~ - **FIXED** - Redirects to word-sprint
3. ~~Add E2E test~~ - **ADDED** - `e2e/word-sprint.spec.ts`

---

## Test Checklist

- [x] Navigate to `/practice` → Word Sprint card visible
- [x] Tap Word Sprint → Difficulty picker appears
- [x] Select Easy → Multiple choice questions work
- [x] Complete session → Results show XP
- [x] "Try Harder" → Medium difficulty starts
- [x] Old routes `/cloze`, `/word-gaps`, `/fill-blanks` redirect correctly
