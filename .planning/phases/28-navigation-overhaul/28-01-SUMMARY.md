---
phase: 28-navigation-overhaul
plan: 01
subsystem: navigation
tags: [shell, nav, menu, usermenu, resources]
---

# 28-01 Summary: Navigation Simplification

Replaced "More" catch-all menu with direct "Resources" tab and consolidated user account options into UserMenu dropdown.

## Performance

| Metric | Value |
|--------|-------|
| Duration | 12 min |
| Started | 2026-01-10T16:17:44Z |
| Completed | 2026-01-10T16:29:24Z |
| Tasks Completed | 3/3 |
| Files Modified | 12 |
| Deviations | 1 (test fix) |

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Create Resources page and update navItems.ts | `26982e3` |
| 2 | Consolidate UserMenu with Settings/Help/About | `e266d7a` |
| 3 | Delete More page and update test references | `7fd9a1f` |

## Files Created

- `app/[locale]/resources/page.tsx` (replaced complex page with simplified nav hub)

## Files Modified

- `components/shell/navItems.ts` - Changed "more" to "resources" with FolderOpen icon
- `components/shell/navItems.test.ts` - Updated test assertion for /en/resources
- `components/auth/UserMenu.tsx` - Added Settings/Help/About menu items with "More" section
- `messages/en.json` - Added userMenu.moreHeader, settings, help keys
- `messages/mk.json` - Added userMenu.moreHeader, settings, help keys
- `tests/mobile-audit/08-more-menu.spec.ts` - Renamed to test Resources page
- `tests/mobile-audit/10-navigation.spec.ts` - Updated nav route expectation
- `tests/mobile-audit/14-stage4-gate.spec.ts` - nav-more to nav-resources
- `tests/mobile-audit/_helpers.ts` - ALL_ROUTES.more to ALL_ROUTES.resources
- `tests/phase2/11-dead-click-scan.spec.ts` - Updated route reference
- `tests/release-gate/04-route-journeys.spec.ts` - Updated test IDs
- `e2e/mobile-tab-nav.spec.ts` - Updated for Resources tab

## Files Deleted

- `app/[locale]/more/page.tsx`

## Deviations

| Type | Description | Resolution |
|------|-------------|------------|
| Auto-fix | navItems.test.ts expected /en/more, failed pre-commit | Updated test to expect /en/resources in Task 1 commit |

## Verification

- [x] `npm run type-check` passes
- [x] `npm run lint` passes (pre-existing warnings only)
- [x] Bottom nav shows "Resources" instead of "More"
- [x] Resources page shows: My Saved Words, Language Lab, Macedonian News
- [x] UserMenu shows: Profile, Settings, Help, About under "More" section
- [x] No references to /more path remain in active code
