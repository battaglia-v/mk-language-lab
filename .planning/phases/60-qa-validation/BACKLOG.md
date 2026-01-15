# v1.9.1 QA Fix Backlog

**Created:** 2026-01-14
**Status:** Pending implementation
**Goal:** Fix all outstanding issues from user feedback and TWA verification

---

## P0: Critical (Must fix immediately)

### TWABUG-001: Red Chrome banner showing - TWA verification failing
**Owner:** Claude Agent
**Priority:** P0 - Critical
**Type:** Bug

**Problem:**
TWA verification fails, causing Chrome to show red status bar instead of native app experience.

**Root Cause:**
1. `android-twa/twa-manifest.json` has wrong values:
   - `themeColor: "#D32F2F"` (RED - should be `#080B12`)
   - `themeColorDark: "#D32F2F"` (RED - should be `#080B12`)
   - `orientation: "portrait-primary"` (should be `default`)
   - `fingerprints: []` (EMPTY - should have signing fingerprints)

2. `build.gradle` was manually fixed but `twa-manifest.json` (source of truth for bubblewrap) was not.

**Files to modify:**
- `android-twa/twa-manifest.json`

**Changes:**
```json
{
  "themeColor": "#080B12",
  "themeColorDark": "#080B12",
  "orientation": "default",
  "fingerprints": [
    "4C:6D:EA:CF:77:55:3A:40:09:D8:94:5E:97:D1:9A:FC:8C:7D:B8:28:03:1F:A8:EC:6B:9F:73:FC:44:F7:D2:02",
    "4F:BB:96:B7:2A:3A:56:8D:5D:71:6F:07:2F:B4:21:91:3A:44:80:05:8B:D8:8E:33:41:83:F5:75:1D:F4:61:58"
  ]
}
```

**Acceptance Criteria:**
- [ ] `twa-manifest.json` themeColor is `#080B12`
- [ ] `twa-manifest.json` themeColorDark is `#080B12`
- [ ] `twa-manifest.json` orientation is `default`
- [ ] `twa-manifest.json` fingerprints array contains both signing keys
- [ ] Rebuild AAB with `cd android-twa && bubblewrap build`
- [ ] Upload new AAB to Play Store

---

### TWABUG-002: Mission API error banner appearing
**Owner:** Claude Agent
**Priority:** P0 - Critical
**Type:** Bug

**Problem:**
Red error banner "Using cached mission data. Retry to refresh" appears when `/api/missions/current` fails.

**Root Cause:**
The `useMissionStatus` hook shows an error state when the API fails. For unauthenticated users or when database is unavailable, this creates a poor UX.

**Files to modify:**
- `hooks/useMissionStatus.ts`
- `components/layout/TopNav.tsx`

**Solution:**
1. For unauthenticated users: Don't show mission banner at all (use `state: 'hidden'`)
2. For authenticated users with API failure: Show graceful degraded state, not error

**UI Copy (error state - if needed):**
- Remove error banner entirely for unauthenticated users
- For authenticated: Silent fallback to cached/default data without red styling

**Acceptance Criteria:**
- [ ] Unauthenticated users never see red mission error banner
- [ ] Authenticated users see graceful degraded state on API failure
- [ ] No red-styled error banners visible in normal app usage
- [ ] E2E test: Visit `/en/learn` as guest - no error banner visible

---

## P1: High (Important for quality)

### UXFB-001: Add loading states to CTA buttons
**Owner:** Claude Agent
**Priority:** P1 - High
**Type:** Enhancement

**Problem:**
"Continue" and "Start" buttons have no loading state, allowing double-taps on slow connections.

**Files to modify:**
- `components/learn/ContinueLearningCTA.tsx`
- `components/learn/StartLearningCTA.tsx`
- Any other primary CTA buttons

**Solution:**
Add loading spinner and disabled state when button is clicked, until navigation completes.

**UI Copy:**
- Button shows spinner icon (Loader2 from lucide-react)
- Button text stays the same
- Button is disabled during loading
- Use `aria-busy="true"` for accessibility

**Acceptance Criteria:**
- [ ] Continue Learning button shows spinner when clicked
- [ ] Start Learning button shows spinner when clicked
- [ ] Buttons are disabled during navigation
- [ ] Double-tap does not trigger double navigation
- [ ] Accessible: `aria-busy="true"` during loading

---

### UXFB-002: Enhance empty vocabulary CTA
**Owner:** Claude Agent
**Priority:** P1 - High
**Type:** Enhancement

**Problem:**
Authenticated users with no saved vocabulary see bland message without clear next action.

**Files to modify:**
- `components/vocabulary/EmptyVocabulary.tsx` (or equivalent)
- `app/[locale]/practice/page.tsx` (if inline)

**Current UI:**
```
"Save words while reading..."
```

**New UI Copy:**
```
No saved words yet

Start by reading a story — tap any word to save it.

[Read a Story →] (button linking to /reader)
```

**Acceptance Criteria:**
- [ ] Empty vocabulary state shows clear heading
- [ ] Shows explanation of how to save words
- [ ] Primary CTA button links to Reader
- [ ] Button text: "Read a Story"
- [ ] Button has arrow icon (→)

---

### UXFB-003: Add onboarding welcome modal for new users
**Owner:** Claude Agent
**Priority:** P1 - High
**Type:** Enhancement

**Problem:**
First-time users have no introduction to the app's key features.

**Files to create:**
- `components/onboarding/WelcomeModal.tsx`
- `hooks/useOnboardingState.ts` (localStorage-based)

**Files to modify:**
- `app/[locale]/layout.tsx` or `app/[locale]/learn/page.tsx`

**UI Copy:**
```
Welcome to MK Language Lab!

Learn Macedonian your way:

📚 Learn — Follow structured lessons from UKIM curriculum
🎯 Practice — Quiz yourself on vocabulary and grammar
📖 Reader — Read stories and tap words to translate

[Let's Go!]
```

**Acceptance Criteria:**
- [ ] Modal shows once on first visit (check localStorage `onboarding_seen`)
- [ ] Modal has welcoming headline
- [ ] Three features explained with emoji icons
- [ ] Single CTA button "Let's Go!" dismisses modal
- [ ] Modal does not show again after dismissed
- [ ] Mobile-responsive (full-screen on mobile)
- [ ] Accessible: focus trap, ESC to close, proper ARIA

---

### UXFB-004: Add "B1 Coming Soon" badge
**Owner:** Claude Agent
**Priority:** P1 - High
**Type:** Enhancement

**Problem:**
B1 path exists but is skeleton-only. Users may click expecting content.

**Files to modify:**
- `components/learn/LevelSelector.tsx` (or equivalent level cards)

**UI Copy:**
```
Advanced B1
Coming Soon
```

**Acceptance Criteria:**
- [ ] B1 level card shows "Coming Soon" badge/label
- [ ] Badge uses muted styling (not prominent)
- [ ] Card is still clickable but shows expectations
- [ ] Badge text: "Coming Soon"

---

## P2: Medium (Nice to have)

### UXFB-005: Persist practice mode settings
**Owner:** Claude Agent
**Priority:** P2 - Medium
**Type:** Enhancement

**Problem:**
Switching between practice modes loses deck selection.

**Files to modify:**
- `hooks/usePracticeSettings.ts` (or create)
- Practice page components

**Solution:**
Store practice settings (mode, deck selection) in localStorage.

**Acceptance Criteria:**
- [ ] Selected practice mode persists across page refreshes
- [ ] Selected deck persists when switching modes
- [ ] Settings stored in localStorage under `practice_settings`

---

### UXFB-006: Fix mobile nav overlap with translate button
**Owner:** Claude Agent
**Priority:** P2 - Medium
**Type:** Bug

**Problem:**
Sticky translate button may overlap with mobile bottom nav.

**Files to modify:**
- `components/translate/TranslateButton.tsx` (or equivalent)

**Solution:**
Ensure sufficient bottom padding (pb-24 or more) on translate pages with sticky button.

**Acceptance Criteria:**
- [ ] Translate button does not overlap bottom nav on mobile
- [ ] Button has at least 96px (pb-24) bottom offset
- [ ] Test on iPhone SE (375px) viewport

---

## Implementation Order

1. **TWABUG-001** - Fix twa-manifest.json (RED BANNER - most visible issue)
2. **TWABUG-002** - Fix mission API error banner
3. **UXFB-001** - Loading states on CTAs
4. **UXFB-002** - Empty vocabulary CTA
5. **UXFB-003** - Onboarding welcome modal
6. **UXFB-004** - B1 Coming Soon badge
7. **UXFB-005** - Persist practice settings
8. **UXFB-006** - Mobile nav overlap fix

---

## Out of Scope (Deferred to v2.0)

- Native speaker audio for alphabet/vocabulary
- Audio pronunciation features
- Social features (streaks, leaderboards)
- B1/B2 content expansion
- Progress sync across devices

---

## Definition of Done

- [ ] All P0 items fixed and verified
- [ ] All P1 items implemented
- [ ] E2E tests pass
- [ ] Production build succeeds
- [ ] New AAB uploaded to Play Store
- [ ] Visual verification: no red banners on app
