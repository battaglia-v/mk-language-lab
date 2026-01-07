# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-06)

**Core value:** The app always resumes me in the right place and makes my next step obvious.
**Current focus:** Phase 3 in progress — Practice integrity

## Current Position

Phase: 3 of 7 (Lesson Practice Integrity)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-01-07 — Completed 03-01-PLAN.md

Progress: ███░░░░░░░ 38%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 8 min
- Total execution time: 1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4 | 43 min | 11 min |
| 2 | 3 | 16 min | 5 min |
| 3 | 1 | 5 min | 5 min |

**Recent Trend:**
- Last 5 plans: 3, 8, 5, 5 min
- Trend: ↓ (faster)

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Phase 1]: UKIM curriculum source identified — three core textbooks (Тешкото/Лозје/Златоврв) map to A1/A2/B1
- [01-01]: Used pdfjs-dist legacy build for Node.js ESM compatibility
- [01-01]: Extract position data (x/y/fontSize) for structure detection
- [01-02]: Used TOC-based lesson boundaries; journeyId naming: ukim-{level}
- [01-03]: A2 has 8 comprehensive lessons vs A1's 24; grammar from TOC metadata
- [01-04]: B1 skeleton (chapter titles only); upsert seeding pattern; journeyIds ukim-a1/a2/b1
- [02-01]: Journey becomes active on first lesson completion; currentLessonId points to NEXT lesson
- [02-02]: Continue CTA shows only when isActive=true; uses optional props for backward compatibility
- [02-03]: Curriculum paths server-side from DB; lesson hrefs use database IDs
- [03-01]: Phase 3 is infrastructure focus; vocabulary seeding is future work (outside scope)

### Deferred Issues

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-07
Stopped at: Completed 03-01-PLAN.md (practice audit documentation)
Resume file: None
