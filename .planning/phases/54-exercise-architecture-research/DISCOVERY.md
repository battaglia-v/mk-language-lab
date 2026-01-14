# Exercise Architecture Discovery Document

**Analysis Date:** 2026-01-14
**Purpose:** Inform implementation for Phases 55-58 (Exercise State Machine, Lesson Flow Progress, Answer Evaluation, Audio Language)

---

## Current Architecture

The codebase has two distinct exercise systems that have evolved independently. Understanding their boundaries and interaction points is critical for the planned unification work.

### System A: Grammar Engine + GrammarExerciseCard

**Location:** `lib/grammar-engine.ts`, `components/learn/GrammarExerciseCard.tsx`

**Exercise Types:**
1. **fill-blank** - Fill in the missing word(s) with optional word bank
2. **multiple-choice** - Select correct answer from options
3. **sentence-builder** - Arrange shuffled words into correct order
4. **error-correction** - Find and fix the mistake in a sentence

**Data Model:**
```typescript
interface BaseExercise {
  id: string;
  type: ExerciseType;
  instructionMk: string;
  instructionEn: string;
  xp: number;
  hintMk?: string;
  hintEn?: string;
  explanationMk?: string;
  explanationEn?: string;
}
```

**Validation:** `validateAnswerWithFeedback()` function provides:
- Unicode-normalized comparison (handles Cyrillic variations)
- Detailed analysis via `AnswerAnalysis` (mistake types: accent, case, typo)
- Feedback message generation

**State Management:** Local React state in GrammarExerciseCard
- `userAnswer: string | string[]`
- `attempts: number`
- `result: 'correct' | 'incorrect' | null`
- `feedbackAnalysis: AnswerAnalysis`

**XP Calculation:** `calculateXP(baseXP, attempts)`
- 100% on first attempt
- 70% on second attempt
- 50% on third attempt
- 25% on 4+ attempts

**Current Usage:** GrammarExerciseCard exists but is **not currently used** in production routes. It's exported in `lib/lazy-components.tsx` but no active imports. The component appears to be legacy from an earlier design iteration.

### System B: LessonRunner (Step-Based)

**Location:** `lib/lesson-runner/`, `components/lesson/LessonRunner.tsx`

**Step Types:**
1. **INFO** - Informational content (no answer required)
2. **MULTIPLE_CHOICE** - Select from choices
3. **FILL_BLANK** - Type answer to complete sentence
4. **TAP_WORDS** - Tap words in passage to see translations
5. **PRONOUNCE** - Audio pronunciation practice (placeholder - not implemented)
6. **SUMMARY** - Lesson completion display

**Data Model:**
```typescript
interface BaseStep {
  id: string;
  type: StepType;
}
// Each step type extends BaseStep with specific fields
```

**Validation:** Built into `useLessonRunner` hook
- Case-insensitive comparison (configurable)
- Acceptable alternatives via `acceptableAnswers` array
- Minimum tap threshold for TAP_WORDS

**State Management:** `useLessonRunner` hook manages:
- `currentIndex: number`
- `answers: Map<string, StepAnswer>`
- `feedback: Map<string, StepFeedback>`
- `isEvaluating: boolean`
- `showFeedback: boolean`
- `startTime` / `completedAt`

**XP Calculation:** `lib/xp/calculator.ts` → `calculateLessonXP()`
- 10 XP per correct answer
- +5 bonus for active streak
- +10 bonus for perfect score

**Current Usage:** Active system for Learn section lessons
- `LessonPageContent.tsx` → `LessonPageContentV2` (new flow) or `CurriculumLessonWrapper` (LessonRunner)
- `GrammarLessonWrapper.tsx` bridges grammar lessons to LessonRunner via adapter

### Adapter Layer

**Location:** `lib/lesson-runner/adapters/exercise-adapter.ts`

**Purpose:** Converts grammar-engine exercise types to LessonRunner steps

**Implementation Status:**
| Exercise Type | Adapter Implementation |
|--------------|----------------------|
| multiple-choice | ✅ Direct mapping to MULTIPLE_CHOICE |
| fill-blank | ✅ Direct mapping to FILL_BLANK |
| sentence-builder | ⚠️ **Fallback** to FILL_BLANK (TODO in code) |
| error-correction | ⚠️ **Fallback** to FILL_BLANK (TODO in code) |

**Code TODOs (lines 136, 159):**
```typescript
// TODO: Sentence builder requires custom step type
// For now, convert to fill-blank as a fallback

// TODO: Error correction requires custom step type
// For now, convert to fill-blank as a fallback
```

### Practice System (Third System)

**Location:** `components/practice/PracticeSession.tsx`, `components/practice/types.ts`

**Note:** Practice uses a **completely separate** flashcard-based system:
- Different data model (`Flashcard` type)
- Different XP calculation (1 XP per correct, +1 per 5-streak)
- Different state management (local React state)
- Different modes: typing vs multiple-choice (flashcard style)

This system is intentionally separate and is **not targeted for unification** in Phases 55-58.

---

## Gap Analysis

### Gap: Missing LessonRunner Step Types for Sentence-Builder and Error-Correction

#### Current State
The LessonRunner only has 6 step types. Sentence-builder and error-correction exercises from the grammar engine are converted to FILL_BLANK as a lossy fallback, which:
- Loses the interactive word-arrangement UI for sentence-builder
- Loses the click-to-identify-error interaction for error-correction
- Forces users to type full sentences instead of arranging words

#### Impact
- **User Experience:** Less engaging for sentence structure exercises
- **Learning Effectiveness:** Missing the kinesthetic learning benefit of word arrangement
- **Feature Parity:** GrammarExerciseCard has these fully implemented but unused

#### Recommendation
Create two new step types:
1. `SENTENCE_BUILDER` - Word arrangement with drag/tap UI
2. `ERROR_CORRECTION` - Clickable words with correction input

#### Target Phase
**Phase 55 (Exercise State Machine)** - Add step types
**Phase 57 (Answer Evaluation)** - Add validation logic

---

### Gap: Inconsistent Validation Systems

#### Current State
Two parallel validation implementations:
1. Grammar engine: `validateAnswerWithFeedback()` with Unicode normalization, detailed analysis
2. LessonRunner: `validateAnswer()` in useLessonRunner with simpler string comparison

#### Impact
- **Developer Confusion:** Two places to fix validation bugs
- **Inconsistent Feedback:** Grammar engine provides typo/accent hints; LessonRunner doesn't
- **Duplicated Logic:** Similar comparison logic in two places

#### Recommendation
Create unified validation layer:
```typescript
// lib/validation/unified-validator.ts
export function validateAnswer(config: {
  userAnswer: string | string[];
  expected: string | string[];
  options?: {
    caseSensitive?: boolean;
    unicodeNormalize?: boolean;
    acceptableAlternatives?: string[];
    analyzeErrors?: boolean;
  };
}): ValidationResult;
```

#### Target Phase
**Phase 57 (Answer Evaluation)** - Primary focus

---

### Gap: XP Calculation Divergence

#### Current State
Three different XP systems:
1. **Grammar Engine:** Attempt-based (100%/70%/50%/25%)
2. **LessonRunner:** 10 XP per correct + streak/perfect bonuses
3. **Practice:** 1 XP per correct + streak/5 bonus

#### Impact
- **User Confusion:** Different XP earned for same correct answer in different contexts
- **Fairness:** Multi-attempt exercises in grammar give less XP than LessonRunner
- **Maintenance:** Three formulas to update

#### Recommendation
Standardize on LessonRunner model (10 XP per correct) across all contexts. Consider attempt multiplier as enhancement:
- First attempt: 10 XP
- Second attempt: 7 XP
- Third attempt: 5 XP
- 4+ attempts: 3 XP

#### Target Phase
**Phase 57 (Answer Evaluation)** - Secondary concern, can be deferred

---

### Gap: PRONOUNCE Step Not Implemented

#### Current State
`PronounceStep` type exists in `types.ts` but:
- No step component in `components/lesson/steps/`
- `LessonRunner.tsx` case statement doesn't handle it (falls to "Unknown step type")
- `validation.ts` only checks `text` field exists

#### Impact
- Audio pronunciation exercises cannot be used in LessonRunner
- Audio-focused lessons blocked

#### Recommendation
Implement Pronounce step component:
1. Display text to pronounce
2. TTS playback (fallback when no audio URL)
3. Optional recording capability
4. Self-assessment continue flow (no right/wrong)

#### Target Phase
**Phase 58 (Audio Language)** - Primary focus

---

### Gap: Progress Tracking Differences

#### Current State
- **LessonRunner:** Auto-saves via `/api/lessons/progress` with debounce
- **GrammarExerciseCard:** No built-in persistence (was component-local)
- **Practice:** Session-level persistence via localStorage

#### Impact
- Resume functionality varies by context
- Progress lost on page refresh in some flows

#### Recommendation
LessonRunner's progress model is correct. Ensure all exercise flows:
1. Save progress on step completion
2. Support mid-lesson resume
3. Track time spent accurately

#### Target Phase
**Phase 56 (Lesson Flow Progress)** - Primary focus

---

### Gap: State Machine Not Formalized

#### Current State
`useLessonRunner` hook manages transitions implicitly:
- currentIndex + submitAnswer + continueToNext
- No explicit state machine (e.g., ANSWERING → FEEDBACK → NEXT)
- Race conditions possible if user rapid-clicks

#### Impact
- Hard to reason about all possible states
- Debugging complex interaction flows difficult
- Adding new step types requires careful hook modification

#### Recommendation
Consider formal state machine (xstate or useReducer):
```typescript
type LessonState =
  | { status: 'presenting'; stepId: string }
  | { status: 'answering'; stepId: string; partial?: unknown }
  | { status: 'feedback'; stepId: string; result: ValidationResult }
  | { status: 'completed'; results: LessonResults };
```

#### Target Phase
**Phase 55 (Exercise State Machine)** - Primary focus

---

## Recommendations by Phase

### Phase 55: Exercise State Machine

**Scope:** Formalize state transitions and add missing step types

**Tasks:**
1. Create explicit state machine for lesson flow (xstate or useReducer)
2. Add `SENTENCE_BUILDER` step type and component
3. Add `ERROR_CORRECTION` step type and component
4. Update adapter to properly convert grammar exercises to new types
5. Remove fallback conversion code

**Files to Create:**
- `lib/lesson-runner/state-machine.ts`
- `components/lesson/steps/SentenceBuilder.tsx`
- `components/lesson/steps/ErrorCorrection.tsx`

**Files to Modify:**
- `lib/lesson-runner/types.ts` (add new step types)
- `lib/lesson-runner/adapters/exercise-adapter.ts` (proper conversion)
- `components/lesson/LessonRunner.tsx` (handle new types)
- `lib/lesson-runner/validation.ts` (add validation for new types)

**Dependencies:** None (can start immediately)

---

### Phase 56: Lesson Flow Progress

**Scope:** Unified progress tracking and resume capability

**Tasks:**
1. Audit current progress persistence across all flows
2. Ensure LessonRunner progress saves correctly for all step types
3. Add visual progress indicator (steps completed, time spent)
4. Implement resume-from-checkpoint for interrupted lessons
5. Add progress sync between devices (if user logged in)

**Files to Create:**
- `lib/lesson-runner/progress-persistence.ts`

**Files to Modify:**
- `lib/lesson-runner/useLessonRunner.ts`
- `components/lesson/LessonRunner.tsx`

**Dependencies:** Phase 55 (state machine needed for clean resume)

---

### Phase 57: Answer Evaluation

**Scope:** Unified validation with rich feedback

**Tasks:**
1. Create unified validation layer
2. Migrate grammar-engine validation features to unified layer
3. Migrate LessonRunner validation to use unified layer
4. Add detailed feedback for incorrect answers (typo hints, etc.)
5. Optionally standardize XP calculation

**Files to Create:**
- `lib/validation/unified-validator.ts`
- `lib/validation/feedback-messages.ts`

**Files to Modify:**
- `lib/lesson-runner/useLessonRunner.ts` (use unified validator)
- `lib/grammar-engine.ts` (use unified validator)

**Dependencies:** None (can parallelize with 55-56)

---

### Phase 58: Audio Language

**Scope:** PRONOUNCE step implementation

**Tasks:**
1. Create Pronounce step component
2. Implement TTS fallback when no audio URL
3. Add optional recording capability (if browser supports)
4. Handle skip flow (pronunciation is self-assessed)
5. Integrate with lesson content that needs audio

**Files to Create:**
- `components/lesson/steps/Pronounce.tsx`
- `lib/tts/macedonian-tts.ts` (browser TTS wrapper)

**Files to Modify:**
- `lib/lesson-runner/types.ts` (ensure PRONOUNCE type complete)
- `lib/lesson-runner/validation.ts` (pronounce validation)
- `components/lesson/LessonRunner.tsx` (add case for PRONOUNCE)

**Dependencies:** None (can parallelize with 55-57)

---

## Dependency Diagram

```
Phase 54 (Research) ─── produces ───> DISCOVERY.md
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            Phase 55               Phase 56               Phase 57
        (State Machine)        (Lesson Flow)          (Evaluation)
         - Step types           - Progress              - Validation
         - State mgmt           - Resume                - Feedback
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                                           ▼
                                      Phase 58
                                   (Audio Language)
                                    - PRONOUNCE step
                                    - TTS integration
                                           │
                                           ▼
                                    Phases 59-60
                                 (Polish & Validation)
```

**Parallelization:** Phases 55, 56, 57, 58 can largely be parallelized:
- Phase 55 and 57 are independent (types vs validation)
- Phase 56 benefits from Phase 55's state machine but can start early
- Phase 58 is fully independent (new step type)

**Serial Dependency:** Phase 56 "resume" feature is cleaner after Phase 55's state machine

---

## Validation Checklist

- [x] All 4 grammar exercise types accounted for (fill-blank, multiple-choice, sentence-builder, error-correction)
- [x] All 6 lesson-runner step types reviewed (INFO, MULTIPLE_CHOICE, FILL_BLANK, TAP_WORDS, PRONOUNCE, SUMMARY)
- [x] exercise-adapter.ts TODOs addressed in recommendations (Phase 55)
- [x] Each phase 55-58 has clear scope from recommendations
- [x] No blocking dependencies between 55-57 (can parallelize if needed)

---

## Risk Assessment

**Low Risk:**
- Internal refactoring with no external dependencies
- No database migrations required
- All changes are additive (new step types)
- Existing E2E tests cover current behavior

**Test Coverage:**
- Grammar engine: Unit tests in `__tests__/`
- LessonRunner: E2E tests for lesson completion
- New step types: Will need new E2E tests

**Rollback Strategy:**
- Feature flag new step types initially
- Keep adapter fallbacks until fully validated
- No breaking changes to existing data models

---

*Discovery complete. Ready for Phase 55-58 planning.*
