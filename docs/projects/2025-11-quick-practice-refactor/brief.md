# Project Brief – Quick Practice Widget Refactor (Nov 2025)

## Summary
- **Owner**: Vincent Battaglia / Agents
- **Kickoff Date**: 2025-11-12
- **Goals**:
  - Break the 1.5k-line `QuickPracticeWidget` into modular state + UI pieces.
  - Preserve existing UX/tests while making future iterations (hooks, subcomponents) easier.
  - Document follow-up work for deeper modularization (header/prompt/controls).
- **Non-Goals**:
  - No UX redesign or new features.
  - No changes to analytics/event payloads.

## Background
The Quick Practice component mixes logic, analytics, and presentation in a single file. This has caused frequent merge conflicts and slowed down new features (Issue #76 history). We began extracting shared pieces (confetti/modals) and now need a full state hook plus smaller UI components.

## Success Metrics
- Hook encapsulates all state/handlers with zero behavioral regressions (`npm run test -- QuickPracticeWidget` passes).
- Widget file size shrinks significantly and becomes mostly layout markup.
- Future TODOs captured for splitting header/prompt/controls.

## Constraints & Assumptions
- Must keep current translations/strings; no copy edits.
- Analytics events must fire as before.
- Next lint/test suite must remain green at each step.
- Follow the new `docs/agents/` structure for documenting shared changes.
