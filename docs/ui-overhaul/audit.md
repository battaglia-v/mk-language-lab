# Mobile UI Overhaul Audit

## Summary

This audit documents the current mobile pain points and root causes in the MK Language Lab application, along with planned fixes for the mobile-first UI overhaul.

---

## 1. Current Mobile Pain Points

### 1.1 Layout Constraints (Root Cause: max-width containers)

**Problem**: Multiple pages use narrow `max-w-3xl`, `max-w-4xl`, or `max-w-5xl` containers that don't utilize full mobile width.

**Affected Files**:
- `app/[locale]/translate/page.tsx` - uses `max-w-3xl` (cramped on 360-430px)
- `app/[locale]/practice/page.tsx` - uses `max-w-4xl`
- `app/[locale]/learn/page.tsx` - uses `max-w-5xl`

**Root Cause**: Desktop-first max-width constraints applied universally instead of mobile-first fluid widths.

**Fix**:
- Remove restrictive max-width on mobile (< 768px)
- Use CSS variables for consistent page gutters: `--page-gutter-mobile: 1rem`
- Apply max-width only on tablet/desktop breakpoints

### 1.2 Bottom Sheet Alignment Issues

**Problem**: History/Saved bottom sheets in Translate page may overflow on small screens.

**Affected Files**:
- `components/ui/BottomSheet.tsx`
- `app/[locale]/translate/page.tsx`

**Current State**: The BottomSheet component is well-implemented with:
- Safe area padding (`env(safe-area-inset-bottom)`)
- Height variants (default: 85vh, auto: 90vh, full: 100%)
- Proper focus trap and keyboard handling

**Potential Issues**:
- Button alignment in header could overflow on very narrow screens
- List items need minimum touch target size enforcement

**Fix**:
- Add overflow handling to sheet content
- Ensure buttons use `flex-wrap` for very narrow viewports
- Enforce 44px minimum touch targets

### 1.3 Button Inconsistency

**Problem**: While a unified Button component exists, some pages use inline button styles.

**Affected Files**:
- Various pages with custom button styling

**Current State**:
- `components/ui/button.tsx` has good variants: default, destructive, outline, secondary, ghost, link, choice
- Sizes: default (56px), sm (44px), lg (56px), icon variants

**Fix**:
- Audit all pages for custom button styles
- Replace with Button component variants
- Ensure consistent use of size="sm" for secondary actions

### 1.4 Pronunciation Practice Recording

**Problem**: User mentioned "Record" promise without functionality.

**Current State**: ALREADY IMPLEMENTED
- `hooks/use-audio-recorder.ts` - Full MediaRecorder implementation
- `components/practice/PronunciationCard.tsx` - Complete recording UX with:
  - States: listen → record → scoring → compare
  - Permission handling
  - TTS fallback when audio unavailable
  - "Using synthesized audio" messaging (not "Audio unavailable")
  - Browser support detection with clean fallback UI

**Status**: Recording functionality IS implemented. No changes needed unless specific bugs are reported.

### 1.5 News Image Failures (Time.mk)

**Problem**: Time.mk thumbnails fail to load, showing broken images.

**Affected Files**:
- `components/news/ProxiedNewsImage.tsx`
- `app/api/news/image/route.ts` (proxy endpoint)

**Current State**: ProxiedNewsImage has:
- Server-side proxy via `/api/news/image`
- Automatic retry with exponential backoff (up to 3 retries)
- 10-second max timeout to prevent infinite skeleton
- Beautiful fallback placeholder with Newspaper icon

**Remaining Issue**: Time.mk may block proxy requests. Need per-source policy.

**Fix**:
- Add source-specific thumbnail policy
- Disable thumbnail attempts for known-blocked sources (Time.mk)
- Always show placeholder for blocked sources

### 1.6 Learn Lesson Card Metadata

**Problem**: Metadata like "6 exercises / ~12 min" breaks awkwardly on narrow screens.

**Affected Files**:
- Instagram posts in `components/learn/DailyLessons.tsx` (not traditional lesson cards)
- Practice mode cards in practice pages

**Current State**:
- `globals.css` has `.metadata-row`, `.metadata-item`, `.count-unit`, `.duration-display` utilities for preventing awkward breaks
- These utilities use `white-space: nowrap` and `flex-wrap` patterns

**Fix**:
- Apply `.lesson-card-meta` class consistently
- Ensure count+unit pairs use `.count-unit` wrapper
- Use `•` separator between metadata items

---

## 2. Design System Assessment

### 2.1 Design Tokens (GOOD)

Located in `app/theme.css`:
- Spacing scale: `--space-1` through `--space-16`
- Typography: `--font-size-xs` through `--font-size-xl`
- Radii: `--radius`, `--radius-control`, `--radius-card`, `--radius-panel`, `--radius-chip`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-focus`
- Surfaces: `--surface-1`, `--surface-2`, `--surface-3`, `--surface-utility`
- Button heights: `--button-height-sm` (44px), `--button-height-md` (56px)

### 2.2 Component Library Status

| Component | Status | Location |
|-----------|--------|----------|
| Button | ✅ Good | `components/ui/button.tsx` |
| Card | ✅ Good | `components/ui/card.tsx` |
| BottomSheet | ✅ Good | `components/ui/BottomSheet.tsx` |
| Badge | ✅ Good | `components/ui/badge.tsx` |
| Input | ✅ Good | `components/ui/input.tsx` |
| Empty States | ✅ Good | `components/ui/empty-states.tsx` |
| Loading Skeletons | ✅ Good | `components/ui/loading-skeletons.tsx` |

### 2.3 Missing: Dev UI Kit Page

Need a `/dev/ui-kit` page (gated behind `ENABLE_DEV_PAGES`) to:
- Display all component variants
- Test responsive behavior
- Verify design tokens
- Document usage patterns

---

## 3. Mobile CSS Analysis

### 3.1 Safe Area Handling (GOOD)

In `globals.css`:
```css
--safe-area-top: env(safe-area-inset-top, 0px);
--safe-area-bottom: env(safe-area-inset-bottom, 0px);
```

### 3.2 Touch Target Sizes (GOOD)

```css
--touch-target-size: 44px;
--min-touch-target: 44px;
```

### 3.3 Mobile Breakpoints

Current breakpoints in use:
- `max-width: 360px` - Ultra-narrow (iPhone 5/SE)
- `max-width: 400px` - Small mobile
- `max-width: 480px` - Mobile
- `max-width: 768px` - Tablet
- `min-width: 960px` - Desktop

---

## 4. Playwright Test Coverage

### 4.1 Existing Mobile Tests

Located in `e2e/`:
- `mobile-audit-comprehensive.spec.ts` - Comprehensive viewport audit
- `mobile-viewport-audit.spec.ts` - Viewport-specific tests
- `mobile-tab-nav.spec.ts` - Navigation tests

### 4.2 Test Viewports Covered

- iPhone 5/SE (320x568) - Smallest supported
- Small Android (360x800)
- iPhone 13 (390x844)
- Pixel 7 (412x915)

### 4.3 Tests Needed

New journey-based tests to add:
1. **Translate Journey**: Open History sheet → Open Saved sheet → Toggle languages → Verify no overflow
2. **Learn Dashboard**: Verify quick actions grid fits on mobile
3. **Pronunciation**: Enter session → Verify Record UI exists OR fallback shown
4. **News**: Verify images load or show placeholder (never broken)

---

## 5. Action Items by Phase

### Phase 1: Design System + UI Kit
- [ ] Create `/app/[locale]/dev/ui-kit/page.tsx`
- [ ] Gate behind `ENABLE_DEV_PAGES` env var
- [ ] Display all Button variants
- [ ] Display Card variants
- [ ] Display BottomSheet demo
- [ ] Display empty/loading/error states
- [ ] Show spacing/typography demos

### Phase 2: Layout Foundations
- [ ] Update page containers to be mobile-first
- [ ] Remove/relax max-width on mobile
- [ ] Standardize page wrapper component
- [ ] Ensure consistent `px-4` padding on mobile

### Phase 3: Page Fixes
- [ ] Translate: Verify bottom sheets work on 320px viewport
- [ ] Learn: Ensure quick actions wrap properly
- [ ] Practice: Verify card metadata uses utility classes
- [ ] Pronunciation: Already working - add tests

### Phase 4: News Images
- [ ] Add source-specific policy to ProxiedNewsImage
- [ ] Disable thumbnails for Time.mk
- [ ] Verify placeholder always shows on failure

### Phase 5: QA
- [ ] Add journey tests to Playwright
- [ ] Run tests on all mobile viewports
- [ ] Capture before/after screenshots
- [ ] Document changes

---

## 6. Files to Modify

### High Priority
1. `app/globals.css` - Add mobile-first container utilities
2. `app/[locale]/translate/page.tsx` - Remove max-w-3xl constraint
3. `app/[locale]/learn/page.tsx` - Remove max-w-5xl constraint
4. `app/[locale]/practice/page.tsx` - Remove max-w-4xl constraint

### Medium Priority
5. `components/news/ProxiedNewsImage.tsx` - Add per-source policy
6. `app/[locale]/dev/ui-kit/page.tsx` - NEW: Create UI Kit page

### Low Priority (Polish)
7. Various component files for consistent Button usage

---

## 7. Environment Variables Needed

```env
# Enable dev pages (UI Kit, etc.)
ENABLE_DEV_PAGES=true
```

---

*Audit completed: December 17, 2024*
*Agent: Claude Code*
