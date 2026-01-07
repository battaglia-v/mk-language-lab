---
phase: 06-clean-up-confusion
plan: 02
type: summary
---

# Summary: Remove Dead Settings and Add Explainers

## Overview

**Objective:** Remove dead settings and add lightweight explainers where ambiguity exists.

**Outcome:** All tasks completed successfully.

**Duration:** ~4 minutes

## Tasks Completed

### Task 1: Add Daily Goal explainer to settings
**Status:** Completed
**Commit:** `a0ec0f7`

Updated `dailyGoalDesc` translation in both language files to explain the setting's effect:
- **en.json**: "Set your daily XP target. Progress bar on the Learn page tracks your goal."
- **mk.json**: "Поставете дневна XP цел. Лентата за напредок на страницата Учи го следи вашиот напредок."

This connects the setting to the visible UI element it affects.

### Task 2: Add practice mode descriptions to PracticeHub
**Status:** Skipped (already done)

Practice mode descriptions already exist and are clear in `practiceHub.modes` namespace:
- grammar: "Master Macedonian patterns"
- wordSprint: "Fill gaps at 3 difficulty levels"
- vocabulary: "Build your word bank with flashcards"
- saved: "Practice phrases you saved from translator"

No changes needed per plan instruction: "If descriptions already exist and are clear, skip this task."

### Task 3: Verify no dead UI elements remain
**Status:** Completed (audit only)

Final audit confirmed:
- Pronunciation page shows "Coming Soon" message (from 06-01)
- ModeTileGrid defaults include only: grammar, word-sprint, vocabulary (no pronunciation)
- No other dead UI elements or orphaned "Coming Soon" badges found
- Navigation routes correctly exclude disabled features

## Files Modified

| File | Change |
|------|--------|
| messages/en.json | Updated dailyGoalDesc with Learn page reference |
| messages/mk.json | Updated dailyGoalDesc with Macedonian translation |

## Verification

- [x] `npm run type-check` passes
- [x] `npm run lint` passes
- [x] Settings page has clear descriptions for each option
- [x] Practice modes have helpful descriptions (pre-existing)
- [x] No dead/confusing UI elements visible to users

## Decisions

- **[06-02]:** Skipped Task 2 because practice mode descriptions already exist and are clear

## Phase 6 Complete

Phase 6 (Clean Up Confusion) is now complete with both plans executed:
- 06-01: Audited and hid audio/speaking features
- 06-02: Added explainers and verified no dead UI

Ready for Phase 7 (Validation).
