# Roadmap: MKLanguage Learning System Overhaul

## Overview

Transform MKLanguage from a quiz-centric app into a structured, CEFR-aligned learning system. The journey starts with establishing a curriculum backbone from official UKIM materials, then layers progression tracking, practice integrity, vocabulary management, reader organization, and UX cleanup — culminating in validation that the core promise ("always resume in the right place, next step obvious") is delivered.

## Milestones

- ✅ [v1.0 Beta](milestones/v1.0-ROADMAP.md) (Phases 1-7) — SHIPPED 2026-01-07
- ✅ **v1.1 Curriculum Quality Fix** — Phases 8-16 (shipped 2026-01-09)
- 🚧 **v1.2 Infrastructure & CI Overhaul** — Phases 17-20 (in progress)

## Completed Milestones

<details>
<summary>v1.0 Beta (Phases 1-7) — SHIPPED 2026-01-07</summary>

- [x] Phase 1: Curriculum Backbone (4/4 plans) — completed 2026-01-07
- [x] Phase 2: Progress & Dashboard (3/3 plans) — completed 2026-01-07
- [x] Phase 3: Lesson Practice Integrity (3/3 plans) — completed 2026-01-07
- [x] Phase 4: Vocabulary System (3/3 plans) — completed 2026-01-07
- [x] Phase 5: Reader Reorganization (3/3 plans) — completed 2026-01-07
- [x] Phase 6: Clean Up Confusion (2/2 plans) — completed 2026-01-07
- [x] Phase 7: Validation (3/3 plans) — completed 2026-01-07

[Full details](milestones/v1.0-ROADMAP.md)

</details>

### ✅ v1.1 Curriculum Quality Fix (Shipped 2026-01-09)

**Milestone Goal:** Fix the existing UKIM curriculum content which is currently repetitive, inaccurate, and not usable. Re-extract and populate vocabulary, grammar notes, and lesson content across A1, A2, and B1 levels.

#### Phase 8: PDF Extraction Audit

**Goal**: Analyze current extraction output quality, document specific issues per level
**Depends on**: v1.0 complete
**Research**: Unlikely (internal codebase analysis)
**Plans**: 1

Plans:
- [x] 08-01: Create audit script and generate AUDIT.md report — completed 2026-01-07

#### Phase 9: Extraction Pipeline Fix

**Goal**: Improve PDF extraction scripts to produce cleaner, structured output
**Depends on**: Phase 8
**Research**: No (using existing extraction patterns, fixing regex logic)
**Plans**: 3

Plans:
- [x] 09-01: Fix vocabulary extraction regex patterns — completed 2026-01-07
- [x] 09-02: Fix grammar extraction and populate placeholders — completed 2026-01-07
- [x] 09-03: Extract B1 (Златоврв) PDF — completed 2026-01-07

#### Phase 10: A1 Vocabulary Extraction

**Goal**: Extract ~300-500 structured vocabulary items from Тешкото PDF
**Depends on**: Phase 9
**Research**: Unlikely (using improved extraction pipeline)
**Plans**: 1

Plans:
- [x] 10-01: A1 vocabulary quality fix with comprehensive stop word filtering — completed 2026-01-07

#### Phase 11: A1 Grammar Content

**Goal**: Populate A1 grammar note explanations with actual content and 3+ examples each
**Depends on**: Phase 10
**Research**: Unlikely (content extraction)
**Plans**: 1

Plans:
- [x] 11-01: A1 grammar content quality fix with template fallback system — completed 2026-01-07

#### Phase 12: A2 Content Population

**Goal**: Fill A2 vocabulary arrays and grammar notes from Лозје PDF
**Depends on**: Phase 11
**Research**: Unlikely (parallel to A1 work)
**Plans**: 1

Plans:
- [x] 12-01: A2 content quality fix with grammar templates and vocabulary filtering — completed 2026-01-07

#### Phase 12.1: UX Fixes (INSERTED)

**Goal**: Fix reset progress, remove reader audio, add English translations
**Depends on**: Phase 12
**Research**: No
**Plans**: 2

Plans:
- [x] 12.1-01: Reset progress API, remove reader audio, translate A1 vocabulary — completed 2026-01-08
- [x] 12.1-02: Translate A2 vocabulary and grammar examples — completed 2026-01-08

#### Phase 13: B1 Content Bootstrap

**Goal**: Create initial vocabulary and grammar structure for B1 from Златоврв PDF
**Depends on**: Phase 12
**Research**: Unlikely (same extraction approach)
**Plans**: 3

Plans:
- [x] 13-01: B1 vocabulary quality fix (stop word filtering) — completed 2026-01-08
- [x] 13-02: B1 grammar templates — completed 2026-01-08
- [x] 13-03: B1 translations (vocabulary + grammar) — completed 2026-01-08

#### Phase 14: Content Validation

**Goal**: Verify all content meets quality criteria (no garbled text, sufficient items per lesson)
**Depends on**: Phase 13
**Research**: Unlikely (testing and validation)
**Plans**: 1

Plans:
- [x] 14-01: Content validation and seed compatibility — completed 2026-01-08

#### Phase 15: Practice Integration

**Goal**: Seed curriculum content and verify practice mode connects to it
**Depends on**: Phase 14
**Research**: No
**Plans**: 1

Plans:
- [x] 15-01: Seed curriculum and run E2E tests — completed 2026-01-08 (content seeded, UX issues discovered)

#### Phase 16: Practice UX Redesign

**Goal**: Fix practice/lesson UX issues discovered during Phase 15 testing
**Depends on**: Phase 15
**Research**: No
**Plans**: 2

**Issues to address:**
1. Vocabulary practice shows curated deck instead of lesson-specific content
2. Lesson UI is "scrolling wall" - needs interactive step-by-step flow
3. Grammar notes render poorly on mobile

Plans:
- [x] 16-01: Expose lesson vocabulary in practice hub (add Lesson Review mode card) — completed 2026-01-08
- [x] 16-02: Redesign lesson content UI + fix grammar mobile (interactive vocabulary, collapsible sections, mobile spacing) — completed 2026-01-09

### 🚧 v1.2 Infrastructure & CI Overhaul (In Progress)

**Milestone Goal:** Improve CI pipeline reliability and evaluate Cloudflare as an alternative hosting platform to reduce costs and improve deploy process.

#### Phase 18.1: Lesson Quality Audit (INSERTED)

**Goal**: Address remaining audit findings: A2/B1 vocab translations, dark mode compliance, exercise variety, content completeness
**Depends on**: Phase 18
**Research**: No (following established patterns from prior work)
**Plans**: 4

**Audit Findings Being Addressed:**
1. A2/B1 vocabulary has same auto-generated translation errors as A1 (names as words, truncations)
2. Dark mode compliance only 40% - remaining hardcoded colors need fixing
3. Exercise variety 6.5/10 - only 3 types, need more interactive options
4. Content completeness - some lessons missing dialogues/exercises

Plans:
- [x] 18.1-01: A2/B1 vocabulary corrections (same approach as A1) — completed 2026-01-09
- [x] 18.1-02: Dark mode deep audit (comprehensive color scan and fix) — completed 2026-01-09
- [ ] 18.1-03: Exercise variety (add matching, word_order types)
- [ ] 18.1-04: Content completeness verification (audit and fill gaps)

#### Phase 17: CI Pipeline Audit

**Goal**: Review current GitHub Actions workflows, document gaps, benchmark build times
**Depends on**: v1.1 complete
**Research**: Unlikely (internal codebase analysis)
**Plans**: 1

Plans:
- [x] 17-01: Comprehensive CI audit report (7 workflows, gap analysis, benchmarks) — completed 2026-01-09

#### Phase 18: CI Pipeline Improvements

**Goal**: Add type-check, lint, test gates; optimize build speed
**Depends on**: Phase 17
**Research**: Unlikely (established CI patterns)
**Plans**: 1

Plans:
- [x] 18-01: CI pipeline caching optimizations (Next.js build cache, Playwright browser cache) — completed 2026-01-09

#### Phase 19: Cloudflare Research & PoC

**Goal**: Evaluate Cloudflare Pages/Workers, test migration feasibility with this Next.js app
**Depends on**: Phase 18
**Research**: Likely (external platform, new integration)
**Research topics**: Cloudflare Pages vs Workers, Next.js SSR support, API routes compatibility, edge functions, cost comparison
**Plans**: 1

Plans:
- [x] 19-01: Cloudflare evaluation (compatibility, cost, recommendation) — completed 2026-01-09 — **NO-GO**

#### Phase 20: Migration Decision

**Goal**: Document findings, make go/no-go decision, create migration plan if proceeding
**Depends on**: Phase 19
**Research**: Unlikely (decision based on Phase 19 findings)
**Plans**: 0 (skipped — NO-GO decision in Phase 19)

**Status:** SKIPPED — Cloudflare migration deferred per Phase 19 recommendation. Re-evaluate when:
- OpenNext adapter supports Next.js 16
- Traffic scales 10x (>5M requests/month)
- Vercel costs exceed $100/month

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → ... → 16 → 17 → 18 → 19 → 20

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Curriculum Backbone | v1.0 | 4/4 | Complete | 2026-01-07 |
| 2. Progress & Dashboard | v1.0 | 3/3 | Complete | 2026-01-07 |
| 3. Lesson Practice Integrity | v1.0 | 3/3 | Complete | 2026-01-07 |
| 4. Vocabulary System | v1.0 | 3/3 | Complete | 2026-01-07 |
| 5. Reader Reorganization | v1.0 | 3/3 | Complete | 2026-01-07 |
| 6. Clean Up Confusion | v1.0 | 2/2 | Complete | 2026-01-07 |
| 7. Validation | v1.0 | 3/3 | Complete | 2026-01-07 |
| 8. PDF Extraction Audit | v1.1 | 1/1 | Complete | 2026-01-07 |
| 9. Extraction Pipeline Fix | v1.1 | 3/3 | Complete | 2026-01-07 |
| 10. A1 Vocabulary Extraction | v1.1 | 1/1 | Complete | 2026-01-07 |
| 11. A1 Grammar Content | v1.1 | 1/1 | Complete | 2026-01-07 |
| 12. A2 Content Population | v1.1 | 1/1 | Complete | 2026-01-07 |
| 12.1 UX Fixes (INSERTED) | v1.1 | 2/2 | Complete | 2026-01-08 |
| 13. B1 Content Bootstrap | v1.1 | 3/3 | Complete | 2026-01-08 |
| 14. Content Validation | v1.1 | 1/1 | Complete | 2026-01-08 |
| 15. Practice Integration | v1.1 | 1/1 | Complete | 2026-01-08 |
| 16. Practice UX Redesign | v1.1 | 2/2 | Complete | 2026-01-09 |
| 17. CI Pipeline Audit | v1.2 | 1/1 | Complete | 2026-01-09 |
| 18. CI Pipeline Improvements | v1.2 | 1/1 | Complete | 2026-01-09 |
| 18.1 Lesson Quality Audit (INSERTED) | v1.2 | 2/4 | In progress | - |
| 19. Cloudflare Research & PoC | v1.2 | 1/1 | Complete | 2026-01-09 |
| 20. Migration Decision | v1.2 | 0/0 | Skipped | - |

## Domain Expertise

None

## Phase Numbering

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.
