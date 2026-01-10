# Project Issues Log

Enhancements discovered during execution. Not critical - address in future phases.

## Open Enhancements

[No open enhancements]

## Closed Enhancements

### ISS-001: Wire A2 graded readers to reader UI

- **Discovered:** Phase 26 Task 2 (2026-01-10)
- **Resolved:** Phase 36-01 (2026-01-10)
- **Type:** Content / UX
- **Description:** A2 level stories exist in `data/graded-readers.json` but aren't loaded into `lib/reader-samples.ts`. The reader UI only shows A1 (cafe conversation, day-in-skopje) and B1 (30-day challenge) content. Wiring up A2/B2 content from graded-readers.json would expand available reading material.
- **Resolution:** Created 12 graded reader JSON files (4 A1, 4 A2, 4 B1) in ReaderSample format and wired them into reader-samples.ts. Stories section now displays all levels with difficulty filtering.
