# Project Brief – 2025-12 Mobile Beta Audit

## Summary
- **Owner**: VB / Codex
- **Kickoff Date**: 2025-12
- **Goals**: Mobile-first audit + fixes for beta launch, close critical UX gaps, and harden core journeys.
- **Non-Goals**: Desktop UX changes, monetization/paywall work, or unbounded test suites.

## Background
We are preparing www.mklanguage.com for a mobile-first beta. The work follows a staged audit flow (manual audit, fixes, path clarity, limited Playwright coverage, UI polish) with iPhone 12 emulation and strict constraints.

## Success Metrics
- Core mobile journeys complete without dead clicks or missing navigation.
- Reader word tap opens the word sheet consistently.
- Practice sessions start and exit reliably.
- No raw i18n keys or missing loading/empty states on critical paths.

## Constraints & Assumptions
- Mobile-only scope (iPhone 12 viewport).
- No monetization or paywall work.
- Stage-gated execution with explicit stop points.
- Tests limited to critical flows only.
