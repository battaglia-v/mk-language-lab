# Project Milestones: MKLanguage Learning System

## v1.6 Reader Overhaul (Shipped: 2026-01-11)

**Delivered:** Mobile-first reading experience with tap-to-translate word lookup, unified vocabulary saving, reading progress tracking, and discovery/navigation improvements for 12 graded reader stories.

**Phases completed:** 36-41 (7 plans total)

**Key accomplishments:**

- 12 graded reader stories wired (4 A1, 4 A2, 4 B1) with pre-analyzed vocabulary data (1,123 words)
- Tap-to-translate with instant word lookups, shadow depth visual feedback
- Unified vocabulary save — reader words integrate with favorites system
- Reading progress tracking — scroll position, time spent, completion status with resume
- Discovery & navigation — topic filtering, sort options, Continue Reading card
- 56 E2E tests validating all reader features across 4 viewports

**Stats:**

- 76 files modified
- +29,620 / -1,197 lines changed
- 6 phases, 7 plans, 29 commits
- 2 days (2026-01-10 → 2026-01-11)

**Git range:** `docs(36-01)` → `fix: saved words practice`

**What's next:** TBD (user to decide next focus)

---

## v1.5 Audio Cleanup & Final Polish (Shipped: 2026-01-10)

**Delivered:** Complete audio/listening feature removal (-4,064 lines), About page credits, quiz retake button, section stepper navigation for completed lessons, curriculum source explanation, and Practice Hub improvements with lesson progress indicator.

**Phases completed:** 33-35 (6 plans total)

**Key accomplishments:**

- Removed all audio infrastructure (87 files, 5 database models) — codebase reduced by 4,064 lines
- Added About page credits section (MLC and Andri acknowledgment)
- Quiz retake button with score display after completing all exercises
- Section stepper allows free navigation when revisiting completed lessons
- Curriculum source explanation (UKIM textbooks: Teshkoto/Lozje/Zlatovrv)
- Practice Hub lesson progress indicator with "Go to Learn" CTA
- Actionable empty state for Lesson Review mode

**Stats:**

- 59 files modified
- +1,782 / -5,846 lines changed (net -4,064 lines)
- 3 phases, 6 plans, 27 commits
- Same day (2026-01-10)

**Git range:** `docs(33)` → `docs(35-01)`

**What's next:** TBD (user to decide next focus)

---

## v1.4 Power User Feedback (Shipped: 2026-01-10)

**Delivered:** Systematic response to real user feedback — bug fixes (light mode, expandable examples, keyboard hints), navigation overhaul (More → Resources, UserMenu consolidation), lesson enhancements (save-to-glossary, sort toggle, section stepper), vocabulary display improvements (gender colors, definite articles), session persistence for practice, and content polish (alphabet at A1 start, missing pronouns).

**Phases completed:** 27-32 (13 plans total)

**Key accomplishments:**

- Light mode color fixes with semantic design tokens across 15+ components
- Navigation overhaul: More → Resources page, UserMenu consolidation with Settings/Help/About
- Tools merge: Translate + Analyzer unified into single page with toggle
- Save-to-glossary on vocabulary cards with 3-mode sort toggle (Category/A-Ш/Type)
- Gender annotations with color coding (sky=m, rose=f, amber=n) and definite articles
- Session persistence for practice (localStorage with 24-hour staleness, debounced save)
- Alphabet lesson integrated as first A1 curriculum node with localStorage completion tracking
- Missing pronouns added (наш/нивни exercises for possessive forms)
- MLC badge attribution restored in Reader workspace

**Stats:**

- 89 files created/modified
- +5,514 / -1,193 lines changed
- 6 phases, 13 plans, 67 commits
- 1 day (2026-01-10)

**Git range:** `docs(27)` → `docs(32-02)`

**What's next:** v1.5 (audio removal, remaining polish, practice improvements)

---

## v1.3 Content Quality & User Journey (Shipped: 2026-01-10)

**Delivered:** User journey CTAs connecting Learn → Practice → Reader sections, 9 new graded reader stories, and comprehensive E2E validation of the core promise "always resume in the right place, next step obvious."

**Phases completed:** 21-26 (9 plans total)

**Key accomplishments:**

- User journey CTAs: Practice results → Reader, Reader → Practice (conditional), Reader → Learn
- 9 new graded reader stories (A1: 3, A2: 3, B1: 3) covering daily life, workplace, cultural topics
- Full i18n for My Saved Words section and post-lesson practice flow
- 240 translation issues fixed (100% curriculum validation)
- Dark mode compliance across 6 learn components with semantic design tokens
- 72 E2E tests validating user journey flows across 4 viewports

**Stats:**

- 46 files created/modified
- +7,910 / -3,456 lines changed
- 6 phases, 9 plans
- 2 days (2026-01-09 → 2026-01-10)

**Git range:** `feat(21-01)` → `docs(26-02)`

**What's next:** TBD (user to decide next focus)

---

## v1.2 Infrastructure & CI Overhaul (Shipped: 2026-01-09)

**Delivered:** CI pipeline audit and optimization with Cloudflare migration evaluation. Improved dark mode compliance, exercise variety, and content completeness.

**Phases completed:** 17-20 (7 plans total, 1 phase skipped)

**Key accomplishments:**

- Comprehensive CI audit of 7 GitHub Actions workflows with gap analysis and benchmarks
- CI optimizations: Next.js build cache + Playwright browser cache (~2-3 min faster builds)
- Cloudflare migration evaluation with NO-GO recommendation (Next.js 16 not supported)
- A2/B1 vocabulary corrections: 476 fixes (proper names, author names)
- Dark mode compliance improved from ~40% to ~95% across 15 components
- Two new exercise types: matching (tap-to-pair) and word_order (tap-to-arrange)
- Content completeness audit: all 40 lessons verified with minimum requirements met

**Stats:**

- 44 files created/modified
- ~118,700 lines of TypeScript (total project)
- 4 phases (+1 skipped), 7 plans, 25 commits
- 1 day (2026-01-09)

**Git range:** `docs(17-01)` → `feat(18.1-04)`

**What's next:** Planning v1.3 (user feedback integration, audio features, or content expansion)

---

## v1.1 Curriculum Quality Fix (Shipped: 2026-01-09)

**Delivered:** Fixed UKIM curriculum content quality across A1, A2, and B1 levels. Re-extracted vocabulary with proper translations, added grammar templates, and redesigned lesson UX.

**Phases completed:** 8-16 (18 plans total)

**Key accomplishments:**

- PDF extraction audit and pipeline fixes for cleaner structured output
- A1/A2/B1 vocabulary quality fixes with comprehensive stop word filtering
- Grammar content templates with fallback system
- English translations for all vocabulary and grammar examples
- Reset progress API and reader audio cleanup
- Practice UX redesign: Lesson Review mode, interactive vocabulary sections

**Stats:**

- 9 phases (including 12.1 inserted)
- 18 plans total
- Completed 2026-01-07 to 2026-01-09

**Git range:** `feat(08-01)` → `feat(16-02)`

**What's next:** v1.2 Infrastructure & CI Overhaul

---

## v1.0 Beta (Shipped: 2026-01-07)

**Delivered:** Complete learning system overhaul transforming quiz-centric app into CEFR-aligned curriculum with progression tracking, practice integrity, and vocabulary management.

**Phases completed:** 1-7 (21 plans total)

**Key accomplishments:**

- UKIM curriculum backbone: Parsed 3 textbooks (Teshkoto/Lozje/Zlatovrv), seeded 40 lessons + 41 grammar notes
- "Continue where you left off" UX: Journey progress tracking with dynamic dashboard Continue CTA
- Lesson-first practice integrity: API filters practice content to completed lessons only
- Vocabulary SRS system: New/learning/mastered states with Leitner-style spaced repetition
- Reader folder organization: Content categorized into Reading Challenges, Conversations, Stories
- Audio/speaking disabled cleanly: Hidden routes with "Coming Soon" placeholders, no broken features

**Stats:**

- 102 files created/modified
- ~24,400 lines of TypeScript
- 7 phases, 21 plans, 57 commits
- 1 day from start to ship (2026-01-06 -> 2026-01-07)

**Git range:** `feat(01-04)` -> `docs(07-03)`

**What's next:** Planning v1.1 (content seeding, audio features, or user feedback integration)

---
