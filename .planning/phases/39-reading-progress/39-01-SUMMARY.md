# Plan Summary: 39-01 Reading Progress

---
phase: 39
plan: 39-01
subsystem: reader
tags: [reading-progress, localStorage, resume]
---

## Objective

Track story completion, reading position, and time spent per story. Enable users to resume reading where they left off and see their reading progress across all stories.

## Performance Metrics

| Metric | Value |
|--------|-------|
| Tasks completed | 3/3 |
| Files created | 1 |
| Files modified | 4 |
| Type check | PASS |
| Lint | PASS (0 new warnings) |

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `fd51d3e` | Create reading progress storage utility |
| 2 | `432985a` | Integrate progress tracking in ReaderV2Client |
| 3 | `ddd8675` | Display reading progress on library cards |

## Files Created

- `lib/reading-progress.ts` - localStorage-based reading progress tracking utility

## Files Modified

- `app/[locale]/reader/samples/[sampleId]/v2/ReaderV2Client.tsx` - Scroll position tracking, time tracking, auto-save with 2s debounce
- `components/reader/ReaderV2Layout.tsx` - Added scrollContainerRef prop for scroll position restoration
- `components/reader/ReadingSampleCard.tsx` - Added isCompleted and progressPercent props with visual indicators
- `app/[locale]/reader/page.tsx` - Wired progress props to all ReadingSampleCard components

## Key Implementations

### Reading Progress Storage (`lib/reading-progress.ts`)

- Interface: `ReadingProgress` with storyId, scrollPercent, timeSpentSeconds, isCompleted, completedAt, lastReadAt
- Storage key: `mkll:reading-progress`
- Functions: `readProgress`, `readAllProgress`, `saveProgress`, `markCompleted`, `clearProgress`, `getCompletedStoryIds`
- Migration support for legacy `mkll:reader-v2-complete:*` keys

### ReaderV2Client Integration

- Scroll position tracking via native scroll event on main container
- Time tracking via useRef (sessionStart + previousTimeSpent)
- Debounced auto-save (2s debounce) on scroll
- Scroll position restoration on mount via requestAnimationFrame
- Progress save on unmount
- Backward compatibility with legacy completion keys

### Library Card Progress Display

- Checkmark badge for completed stories (emerald color)
- Dynamic CTA labels:
  - "Start Reading" for new stories
  - "Continue Reading" for in-progress
  - "Read again" for completed

## Verification

- [x] `npm run type-check` passes
- [x] `npm run lint` passes (0 new warnings)
- [x] Reading progress persists via localStorage
- [x] Library cards show completion status
