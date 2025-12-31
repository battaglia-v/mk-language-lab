# Mobile Redesign QA Checklist

**Date**: 2024-12-30
**Version**: Mobile Redesign v1.0
**Test Devices**: iPhone 14 (390x844), Pixel 5 (393x851), iPhone SE (320x568)

---

## Navigation (Bottom Tab Bar)

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| 5 nav tabs visible | Learn, Translate, Practice, Reader, More | ✅ |
| Touch targets ≥44px | All nav buttons meet WCAG minimum | ✅ |
| Practice button gradient | Gold gradient visible | ✅ |
| Safe area padding | Bottom padding on notched devices | ✅ |
| Active state indicator | Current page highlighted | ✅ |

## Practice Hub

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| Title visible | "Train your Macedonian skills" | ✅ |
| Start Practice CTA | Prominent gradient button | ✅ |
| Mode cards | Pronunciation, Grammar, Cloze visible | ✅ |
| Settings button | Opens bottom sheet | ✅ |
| Card count | Shows "X cards ready" | ✅ |

## Cloze Mode Session

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| Progress counter | Shows "1/10" format | ✅ |
| 4 answer choices | A, B, C, D buttons visible | ✅ |
| Touch targets ≥48px | Answer buttons meet minimum | ✅ |
| Correct feedback | Green highlight + animation | ✅ |
| Incorrect feedback | Amber highlight + correct answer shown | ✅ |
| Close button (X) | Exits to results page | ✅ |

## Practice Results Page

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| XP display | Shows "+X XP" | ✅ |
| Accuracy % | Shows percentage | ✅ |
| Navigation back | Links to practice hub | ✅ |

## Translate Page

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| Direction toggle | EN→MK / MK→EN buttons | ✅ |
| Sticky translate button | Fixed at bottom on mobile | ✅ |
| Character counter | Shows X/1800 | ✅ |
| History button | Opens bottom sheet | ✅ |
| Saved phrases button | Opens bottom sheet | ✅ |

## Reader Page

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| Sample cards visible | Reading samples load | ✅ |
| Card touch targets | ≥52px height | ✅ |

## Gamification

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| XP animation | Shows +XP on correct answer | ✅ |
| Goal celebration | Confetti when daily goal reached | ✅ |
| Local XP persistence | XP saved in localStorage | ✅ |

## Responsive Design

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| No horizontal overflow @320px | No horizontal scroll on practice | ✅ |
| No horizontal overflow @320px | No horizontal scroll on cloze | ✅ |
| Text readability @320px | No truncated text | ✅ |

## Accessibility

| Test Case | Expected | Pass/Fail |
|-----------|----------|-----------|
| Touch targets WCAG AA | All interactive elements ≥44px | ✅ |
| Color contrast | Text meets 4.5:1 ratio | ✅ |
| Aria labels | Navigation has proper labels | ✅ |

---

## E2E Test Coverage

| Test File | Tests | Status |
|-----------|-------|--------|
| mobile-tab-nav.spec.ts | 6 tests | ✅ All passing |
| mobile-practice-flow.spec.ts | 7 tests | ✅ All passing |

**Total: 13 E2E tests passing**

---

## Known Issues / Deferred Items

1. **Settings bottom sheet mode options** - i18n keys showing raw (`practiceHub.drills.selectDeck`) instead of translated text in some cases
2. **Coach mark tooltip** - "Start practicing here!" overlay may interfere with clicks on first visit
3. **Close button behavior** - May show confirmation dialog instead of direct navigation

---

## Sign-off

- [ ] QA Engineer Review
- [ ] Product Manager Review
- [ ] Ready for Production
