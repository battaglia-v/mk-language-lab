---
phase: 34-remaining-polish
plan: 01
type: summary
---

# 34-01 Summary: About Credits & UserMenu Cleanup

## Objective
Add content credits to About page and simplify UserMenu by removing redundant MLC social links.

## Tasks Completed

### Task 1: Add credits section to About page
- Added new Credits section after creator section with glass-card styling
- Displays two cards side-by-side: MLC acknowledgment and Andri acknowledgment
- Added `about.andriCredit` i18n key to both en.json and mk.json
- Utilized existing (previously unused) `about.creditsTitle` and `about.creditsContent` keys
- **Commit:** `26f66ba` feat(34-01): add credits section to About page

### Task 2: Remove MLC social links from UserMenu
- Removed social links section (Instagram, YouTube, Linktree)
- Removed separator and label for social section
- Cleaned up unused lucide-react imports
- Preserved i18n keys for potential future use
- **Commit:** `248f51a` chore(34-01): remove MLC social links from UserMenu

## Files Modified
- `app/[locale]/about/page.tsx` - Added Credits section with two cards
- `messages/en.json` - Added `about.andriCredit` key
- `messages/mk.json` - Added `about.andriCredit` key (Macedonian)
- `components/auth/UserMenu.tsx` - Removed social links section and unused imports

## Verification
- [x] `npm run type-check` passes
- [x] About page shows new Credits section with MLC and Andri acknowledgments
- [x] UserMenu no longer shows social links section
- [x] No unused imports remain

## Deviations
None.

## Issues Discovered
None.
