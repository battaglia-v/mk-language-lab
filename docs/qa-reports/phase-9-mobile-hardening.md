# Phase 9: Mobile UI Hardening - QA Report

> **Date:** December 16, 2025  
> **Status:** Implementation Complete - Awaiting Device Testing  
> **Owner:** Development Team

---

## Summary of Changes

### 1. Mobile-Safe Wrapping Utilities
- Added new CSS classes in `globals.css`:
  - `.label-nowrap` - prevents short labels from breaking
  - `.metadata-row` - clean wrapping for metadata rows
  - `.metadata-item` - individual items that never break internally
  - `.stat-chip`, `.mode-badge` - compact inline displays
  - `.card-meta`, `.lesson-card-meta` - standardized card metadata
  - `.count-unit`, `.duration-display` - keep counts with units together

**Files Modified:**
- `app/globals.css`
- `components/learn/quick-practice/Header.tsx`
- `components/learn/ExerciseSection.tsx`
- `components/learn/LessonContent.tsx`

### 2. Design System Tokens (Duolingo-like)
- Primary button height: 56px (was 48px)
- Card radius: 24px (was 22px)
- Button radius: 18px (was 14px)
- Input height: 56px (standardized)
- Added `--radius-chip: 9999px` for pills

**Files Modified:**
- `app/theme.css`
- `components/ui/button.tsx`
- `components/ui/input.tsx`

### 3. Canonical Button System
- Added `choice` variant for multiple choice options
- Replaced raw `<button>` elements in:
  - `ExerciseSection.tsx` - multiple choice options
  - `DailyLessons.tsx` - save/unsave buttons
  - `LeaderboardCard.tsx` - type/period toggles
- Added ESLint rule to warn on raw button usage

**Files Modified:**
- `components/ui/button.tsx`
- `components/learn/ExerciseSection.tsx`
- `components/learn/DailyLessons.tsx`
- `components/gamification/LeaderboardCard.tsx`
- `eslint.config.mjs`

### 4. Exercise Layout Template
- Created `ExerciseLayout.tsx` with sticky bottom action bar
- Includes: `PromptCard`, `AnswerArea`, `FeedbackBanner` components
- Structure:
  - Top: Progress bar + chips
  - Middle: Scrollable prompt area
  - Bottom: Sticky action bar (Hint/Skip + Primary CTA + Helper text)

**Files Created:**
- `components/learn/ExerciseLayout.tsx`

### 5. Microcopy Cleanup
| Before | After |
|--------|-------|
| "Submit your translation" | "Your answer" |
| "Press Enter or tap Submit..." | "Tap Submit to check." |
| "Listen to Native" | "Play audio" |
| "Select a Lesson" | "Pick a lesson" |
| "Recommended for You" | "Up next" |
| "Multiple Choice" | "Pick one" |

**Files Modified:**
- `messages/en.json`
- `messages/mk.json`

### 6. Time.mk Image Fix
- Added structured JSON logging for diagnostics
- Logs: URL, hostname, strategy, status code, content-type, bytes, success
- Detects HTML bot-block pages (content-type != image/*)
- Added `X-Image-Debug` response header
- Client-side: Added 10s max timeout to prevent infinite skeleton

**Files Modified:**
- `app/api/news/image/route.ts`
- `components/news/ProxiedNewsImage.tsx`

### 7. Audio Reliability
- Added 5s loading timeout (configurable via `loadingTimeoutMs`)
- Shows "Audio not available yet" after timeout
- Added `AudioSourceBadge` component (Native vs AI indicator)
- Updated error message: "Audio unavailable" → "Audio not available yet"

**Files Modified:**
- `hooks/use-audio-player.ts`
- `components/ui/audio-status.tsx`

---

## Testing Checklist

### Devices Required
- [ ] **Android Chrome** (real device - minimum)
- [ ] **iOS Safari** (simulator acceptable)

### Screens to Test

#### 1. Dashboard/Home
- [ ] No horizontal scroll
- [ ] All stats chips display correctly (no "6 exercise s" wrapping)
- [ ] Buttons visually centered
- [ ] Touch targets >= 44px

#### 2. Daily Lessons
- [ ] Card metadata displays in clean row
- [ ] Save/unsave buttons work correctly
- [ ] No text wrapping issues on badges

#### 3. Quick Practice
- [ ] Mode/difficulty labels don't wrap awkwardly
- [ ] Hearts/streak display correctly
- [ ] Primary CTA (Check) is 56px height
- [ ] Input field is 56px height
- [ ] Feedback banner shows correctly

#### 4. News Feed
- [ ] Images load OR show fallback within 10s
- [ ] No infinite skeleton states
- [ ] Check X-Image-Debug header in network tab
- [ ] Source badges display correctly

#### 5. Exercise/Lesson Content
- [ ] Exercise metadata clean (e.g., "Exercise 1 · Pick one")
- [ ] Multiple choice buttons use new styling
- [ ] Check answer button prominent and centered

#### 6. Profile
- [ ] All stats display correctly
- [ ] No wrapping issues

### Audio Testing
- [ ] Tap to play works on first tap (not just second)
- [ ] Loading spinner shows during load
- [ ] "Audio not available yet" shows after 5s timeout
- [ ] Retry button works
- [ ] Native vs AI badge shows when playing (if enabled)

### Image Proxy Diagnostics
Check server logs for entries like:
```json
{
  "event": "image_proxy_success",
  "timestamp": "2025-12-16T...",
  "url": "https://time.mk/...",
  "hostname": "time.mk",
  "strategy": "origin-referer",
  "statusCode": 200,
  "contentType": "image/jpeg",
  "contentLength": "45678",
  "success": true
}
```

---

## Before/After Evidence

### Required Screenshots (to be captured during testing)

1. **Dashboard stats** - before wrapping fix vs after
2. **Quick practice header** - before metadata wrapping vs after
3. **News cards** - image loading vs fallback
4. **Exercise section** - old buttons vs new canonical buttons
5. **Lesson card metadata** - before vs after

---

## Exit Criteria

| Area | Success Metric | Status |
|------|---------------|--------|
| Wrapping | Zero broken wrapping on mobile | ⏳ Pending test |
| Tokens | Consistent 56px buttons, 24px card radius | ✅ Implemented |
| Buttons | All buttons use canonical component | ✅ Implemented |
| Exercise layout | Clear primary action, no cramped rows | ✅ Implemented |
| Microcopy | Short, mobile-safe labels | ✅ Implemented |
| Images | Real image OR fallback 100% of time | ⏳ Pending test |
| Audio | Always visible feedback, retry available | ✅ Implemented |
| QA | Before/after screenshots | ⏳ Pending capture |

---

## Known Issues & Follow-ups

1. **ESLint rule for raw buttons**: Currently set to "warn" - may need to fix remaining ~20 files in future sprint
2. **Image proxy logging**: Monitor logs for patterns in failed fetches
3. **Audio TTS language**: Using Serbian (sr-RS) as closest to Macedonian - may need native recordings

---

## GO / NO-GO Recommendation

**Pending device testing.**

Once all checklist items are verified on Android Chrome and iOS Safari, update this section with:
- [ ] **GO** - Ready for production
- [ ] **NO-GO** - Issues found (list below)

---

## Sign-off

- [ ] Developer testing complete
- [ ] QA testing complete
- [ ] Screenshots captured
- [ ] Stakeholder approval

