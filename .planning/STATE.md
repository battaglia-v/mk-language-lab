# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-06)

**Core value:** The app always resumes me in the right place and makes my next step obvious.
**Current focus:** Phase 7 planned — Ready to execute (3 plans)

## Current Position

Phase: 7 of 7 (Validation) — PLANNED
Plan: 0 of 3 in current phase
Status: Ready for execution
Last activity: 2026-01-07 — Created Phase 7 plans (07-01, 07-02, 07-03)

Progress: █████████░ 86%

## Performance Metrics

**Velocity:**
- Total plans completed: 18
- Average duration: 6 min
- Total execution time: 2.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4 | 43 min | 11 min |
| 2 | 3 | 16 min | 5 min |
| 3 | 3 | 14 min | 5 min |
| 4 | 3 | 14 min | 5 min |
| 5 | 3 | 15 min | 5 min |
| 6 | 2 | 9 min | 5 min |

**Recent Trend:**
- Last 5 plans: 5, 4, 6, 5, 4 min
- Trend: → (stable)

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
- [04-01]: Vocabulary API uses existing VocabularyWord model; SRS intervals match lib/srs.ts Leitner pattern
- [04-02]: useVocabulary hook integrated into usePracticeDecks; loadUserVocabDeck fetches 15 due + 5 new words
- [04-03]: Mode selector is UI-only; actual deck filtering deferred to practice session integration
- [05-02]: Inject category at runtime rather than adding to JSON files
- [05-03]: Featured 30-Day Challenge card within Reading Challenges section; search results remain flat
- [06-01]: Comment routes rather than delete for easy re-enabling when audio ready; keep pages with placeholders to avoid 404
- [06-02]: Skipped Task 2 (practice mode descriptions) because they already exist and are clear

### Deferred Issues

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-07
Stopped at: Created Phase 7 plans
Resume file: None
Next step: Execute 07-01-PLAN.md (Update Playwright tests)
