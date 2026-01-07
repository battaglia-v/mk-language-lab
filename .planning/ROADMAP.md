# Roadmap: MKLanguage Learning System Overhaul

## Overview

Transform MKLanguage from a quiz-centric app into a structured, CEFR-aligned learning system. The journey starts with establishing a curriculum backbone from official UKIM materials, then layers progression tracking, practice integrity, vocabulary management, reader organization, and UX cleanup — culminating in validation that the core promise ("always resume in the right place, next step obvious") is delivered.

## Milestones

- ✅ [v1.0 Beta](milestones/v1.0-ROADMAP.md) (Phases 1-7) — SHIPPED 2026-01-07
- 🚧 **v1.1 Curriculum Quality Fix** — Phases 8-15 (in progress)

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

### 🚧 v1.1 Curriculum Quality Fix (In Progress)

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
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

#### Phase 11: A1 Grammar Content

**Goal**: Populate A1 grammar note explanations with actual content and 3+ examples each
**Depends on**: Phase 10
**Research**: Unlikely (content extraction)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

#### Phase 12: A2 Content Population

**Goal**: Fill A2 vocabulary arrays and grammar notes from Лозје PDF
**Depends on**: Phase 11
**Research**: Unlikely (parallel to A1 work)
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

#### Phase 13: B1 Content Bootstrap

**Goal**: Create initial vocabulary and grammar structure for B1 from Златоврв PDF
**Depends on**: Phase 12
**Research**: Unlikely (same extraction approach)
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

#### Phase 14: Content Validation

**Goal**: Verify all content meets quality criteria (no garbled text, sufficient items per lesson)
**Depends on**: Phase 13
**Research**: Unlikely (testing and validation)
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

#### Phase 15: Practice Integration

**Goal**: Ensure practice mode functions correctly with populated content
**Depends on**: Phase 14
**Research**: Unlikely (internal testing)
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15

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
| 10. A1 Vocabulary Extraction | v1.1 | 0/? | Not started | - |
| 11. A1 Grammar Content | v1.1 | 0/? | Not started | - |
| 12. A2 Content Population | v1.1 | 0/? | Not started | - |
| 13. B1 Content Bootstrap | v1.1 | 0/? | Not started | - |
| 14. Content Validation | v1.1 | 0/? | Not started | - |
| 15. Practice Integration | v1.1 | 0/? | Not started | - |

## Domain Expertise

None

## Phase Numbering

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.
