# Project Issues Log

Enhancements discovered during execution. Not critical - address in future phases.

## Open Enhancements

### ISS-001: Wire A2 graded readers to reader UI

- **Discovered:** Phase 26 Task 2 (2026-01-10)
- **Type:** Content / UX
- **Description:** A2 level stories exist in `data/graded-readers.json` but aren't loaded into `lib/reader-samples.ts`. The reader UI only shows A1 (cafe conversation, day-in-skopje) and B1 (30-day challenge) content. Wiring up A2/B2 content from graded-readers.json would expand available reading material.
- **Impact:** Low (works correctly with current A1/B1 content, this would enhance variety)
- **Effort:** Medium (need to integrate graded-readers.json loading into reader-samples.ts)
- **Suggested phase:** Future content expansion

## Closed Enhancements

[Moved here when addressed]
