# Execution Steps – 2025-12 Mobile Beta Audit

> Status Legend: ✅ Done, 🔄 In Progress, ⏳ Pending

## Step 1: Fix Stage 4 critical failures (core mobile journeys)
**Status**: ✅ Done
**Objective**: Resolve Learn level toggle, A2 start session, Word Sprint start, and Reader word tap failures.

**Files to Modify**:
- `components/learn/LearnPageClient.tsx` – level selection flow
- `components/practice/PracticeSession.tsx` – deck loading / empty state
- `components/practice/word-sprint/*` – start flow / picker
- `components/reader/*` – word tap + sheet behavior

**Changes Required**:
- Ensure A2 selection is durable and navigable.
- Prevent practice sessions from stalling on skeletons.
- Guarantee Word Sprint can start + exit on mobile.
- Make Reader word taps reliably open the word sheet.

**Success Criteria**:
- Learn level switch reveals A2 path reliably.
- A2 Start Here opens a practice session exit control.
- Word Sprint start transitions into session UI.
- Word tap opens the word sheet on mobile.

**Verification Steps**:
1. Run `npx playwright test --project=mobile-audit tests/mobile-audit/13-stage4-critical.spec.ts` against prod or local.

**Dependencies**: Stage 4 audit results
**Risk Level**: Medium

## Step 2: Stage 5 mobile polish (tap targets, spacing, empty states)
**Status**: ✅ Done
**Objective**: Improve mobile affordances, spacing, and empty states across Reader and Practice.

**Files to Modify**:
- `components/reader/*`
- `components/practice/*`

**Changes Required**:
- Raise tap targets to ≥44px where applicable.
- Add helpful empty states with clear next steps.
- Tighten spacing and CTA clarity on core screens.

**Success Criteria**:
- Key buttons meet tap target guidelines.
- Empty states explain what to do next.
- Reader + Practice screens feel lighter and more consistent.

**Verification Steps**:
1. Manual spot check on iPhone 12 viewport.

**Dependencies**: Step 1
**Risk Level**: Low

## Step 3: Re-run limited Stage 4 audit suite
**Status**: ⏳ Pending
**Objective**: Validate critical journeys after fixes/polish.

**Files to Modify**: None

**Changes Required**:
- Execute the Stage 4 critical Playwright spec.

**Success Criteria**:
- All Stage 4 critical tests pass.

**Verification Steps**:
1. Run `npx playwright test --project=mobile-audit tests/mobile-audit/13-stage4-critical.spec.ts`.

**Dependencies**: Steps 1–2
**Risk Level**: Medium

## Lessons Learned and Step Improvements
(Add entries here if any process changes emerge.)
