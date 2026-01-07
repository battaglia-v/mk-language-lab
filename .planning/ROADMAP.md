# Roadmap: MKLanguage Learning System Overhaul

## Overview

Transform MKLanguage from a quiz-centric app into a structured, CEFR-aligned learning system. The journey starts with establishing a curriculum backbone from official UKIM materials, then layers progression tracking, practice integrity, vocabulary management, reader organization, and UX cleanup — culminating in validation that the core promise ("always resume in the right place, next step obvious") is delivered.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Curriculum Backbone** - Parse UKIM PDFs and structure A1/A2 curriculum
- [x] **Phase 2: Progress & Dashboard** - Implement progression tracking and "continue" UX
- [x] **Phase 3: Lesson Practice Integrity** - Practice pulls only from completed content
- [ ] **Phase 4: Vocabulary System** - Simple SRS with new/learning/mastered states
- [ ] **Phase 5: Reader Reorganization** - Folder structure for reading content types
- [ ] **Phase 6: Clean Up Confusion** - Hide audio, remove dead settings, add explainers
- [ ] **Phase 7: Validation** - Update tests and docs, agent feedback

## Phase Details

### Phase 1: Curriculum Backbone
**Goal**: Parse UKIM textbook PDFs into structured data; structure A1 (Тешкото) and A2 (Лозје) levels with concepts, vocabulary, grammar per lesson; create B1 skeleton (Златоврв); replace ad-hoc lesson ordering with UKIM curriculum order.
**Depends on**: Nothing (first phase)
**Research**: Likely (PDF parsing, textbook structure analysis)
**Research topics**: PDF parsing libraries (pdf-parse, pdfjs-dist), Тешкото/Лозје/Златоврв internal structure (chapters, vocab lists, grammar sections)
**Plans**: TBD

**Source**: https://archive.ukim.edu.mk/mk_content.php?glavno=34&meni=201
- Тешкото (A1) — Beginner
- Лозје (A2) — Intermediate
- Златоврв (B1) — Advanced (skeleton only)

Plans:
- [x] 01-01: Set up PDF parsing infrastructure and download textbooks
- [x] 01-02: Extract and structure A1 curriculum (Тешкото)
- [x] 01-03: Extract and structure A2 curriculum (Лозје)
- [x] 01-04: Create B1 skeleton (Златоврв) and integrate curriculum ordering

### Phase 2: Progress & Dashboard
**Goal**: Implement progress tracking (currentPath, currentLesson, lastActivity); update dashboard with "Continue where you left off"; remove static "Start here" after first use; prevent auto-redirect to alphabet.
**Depends on**: Phase 1
**Research**: Unlikely (internal patterns, existing Prisma/DB)
**Plans**: TBD

Plans:
- [x] 02-01: Implement user progress tracking schema and API
- [x] 02-02: Update dashboard with continuation UX
- [x] 02-03: Remove beginner loop redirect behavior

### Phase 3: Lesson Practice Integrity
**Goal**: Practice pulls ONLY from completed lessons or explicitly selected vocab sets; remove practice that quizzes unseen content; grammar drills reference source lesson.
**Depends on**: Phase 2
**Research**: Unlikely (internal data flow)
**Plans**: TBD

Plans:
- [x] 03-01: Audit current practice content sources
- [x] 03-02: Implement completed-content-only practice filtering
- [x] 03-03: Add lesson references to grammar drills

### Phase 4: Vocabulary System
**Goal**: Implement vocab states (new/learning/mastered); allow Save word and Mark "don't know"; add practice modes (Learn new, Review weak, Mixed).
**Depends on**: Phase 3
**Research**: Unlikely (simple SRS, established patterns)
**Plans**: TBD

Plans:
- [x] 04-01: Implement vocab state schema and transitions
- [x] 04-02: Add user vocab actions (save, mark unknown)
- [ ] 04-03: Build practice mode selection and filtering

### Phase 5: Reader Reorganization
**Goal**: Refactor Reader into folders (Reading Challenges, Short Conversations, Grammar-aligned); move 30-Day content into its own folder; separate challenge content from casual reading.
**Depends on**: Phase 4
**Research**: Unlikely (internal reorganization)
**Plans**: TBD

Plans:
- [ ] 05-01: Design reader folder taxonomy
- [ ] 05-02: Migrate content to new folder structure
- [ ] 05-03: Update reader UI navigation

### Phase 6: Clean Up Confusion
**Goal**: Hide/disable all audio & speaking references; remove dead or unclear settings; add lightweight explainers where ambiguity exists.
**Depends on**: Phase 5
**Research**: Unlikely (cleanup/removal work)
**Plans**: TBD

Plans:
- [ ] 06-01: Audit and hide audio/speaking features
- [ ] 06-02: Remove dead settings and add explainers

### Phase 7: Validation
**Goal**: Update Playwright tests to reflect intended beta UX (don't reintroduce removed features); update docs (intended-beta-ux.md, beta_learning_model.md); agent feedback on learning flow and UX risks.
**Depends on**: Phase 6
**Research**: Unlikely (testing existing flows)
**Plans**: TBD

Plans:
- [ ] 07-01: Update Playwright tests for new UX
- [ ] 07-02: Update documentation
- [ ] 07-03: Conduct agent feedback review

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Curriculum Backbone | 4/4 | Complete | 2026-01-07 |
| 2. Progress & Dashboard | 3/3 | Complete | 2026-01-07 |
| 3. Lesson Practice Integrity | 3/3 | Complete | 2026-01-07 |
| 4. Vocabulary System | 2/3 | In progress | - |
| 5. Reader Reorganization | 0/3 | Not started | - |
| 6. Clean Up Confusion | 0/2 | Not started | - |
| 7. Validation | 0/3 | Not started | - |
