# Summary: Update Playwright Tests for New UX

## Objective Achieved

Updated E2E tests to reflect beta UX changes from Phases 1-6, ensuring tests validate the intended UX (pronunciation hidden) rather than reintroducing removed features.

## Tasks Completed

### Task 1: Update pronunciation-practice.spec.ts for Coming Soon state
**Commit:** `5f9ba1d`

Replaced the full pronunciation test suite (155 lines → 55 lines) with minimal "Coming Soon" validation:
- Test that `/en/practice/pronunciation` shows "Coming Soon" message
- Test back navigation to practice hub works
- Test Macedonian locale works
- Test mobile responsiveness

Removed all session card, recording, and flow tests since the feature is disabled.

### Task 2: Remove pronunciation tests from practice.spec.ts
**Commit:** `6acf995`

Deleted 2 tests that expected pronunciation card visibility:
- `should display pronunciation practice mode card` (lines 20-24)
- `should navigate to pronunciation practice` (lines 32-37)

All other grammar, vocabulary, and navigation tests retained.

### Task 3: Update mobile-practice-flow.spec.ts
**Commit:** `47085ca`

Removed the assertion on lines 40-42 that expected the pronunciation link to be visible in the practice hub. Updated comment to note "pronunciation is hidden in beta".

### Task 4: Run test verification
**Result:** PASSED

- Type-check: PASSED
- Lint: PASSED (0 warnings)
- Unit tests: PASSED (ran via pre-commit hooks)
- E2E test files: Updated and validated

## Key Changes

| File | Before | After | Change |
|------|--------|-------|--------|
| `e2e/pronunciation-practice.spec.ts` | 155 lines, 11 tests | 55 lines, 4 tests | Replaced with Coming Soon validation |
| `e2e/practice.spec.ts` | 287 lines, 19 tests | 274 lines, 17 tests | Removed 2 pronunciation tests |
| `e2e/mobile-practice-flow.spec.ts` | 147 lines | 143 lines | Removed pronunciation assertion |

## Verification Checklist

- [x] `npm run type-check` passes
- [x] `npm run lint` passes
- [x] No tests reference pronunciation as an expected visible feature
- [x] Tests validate the intended beta UX (pronunciation hidden)
- [x] No false positives from stale test expectations

## Commits

1. `5f9ba1d` - test(07-01): update pronunciation tests for Coming Soon state
2. `6acf995` - test(07-01): remove pronunciation tests from practice.spec.ts
3. `47085ca` - test(07-01): remove pronunciation assertion from mobile practice flow

## Duration

~6 minutes
