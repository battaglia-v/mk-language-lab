# MKLanguage Learning System Overhaul (Beta)

## What This Is

MKLanguage is a Macedonian language learning app being refactored from a quiz-centric experience into a structured, CEFR-aligned learning system. This overhaul fixes progression, practice, and vocabulary issues identified by advanced users who feel lost, tested on unseen content, and trapped in beginner loops.

## Core Value

**The app always resumes me in the right place and makes my next step obvious.**

If the app nails progression, users will forgive incomplete content; if it doesn't, even perfect content feels broken.

## Requirements

### Validated

<!-- Shipped and working. Inferred from existing codebase. -->

- ✓ User authentication (NextAuth, email/social login) — existing
- ✓ Practice exercises with multiple question types — existing
- ✓ Reader with text content and vocabulary highlighting — existing
- ✓ Translation tool with AI assistance — existing
- ✓ Gamification system (XP, streaks, hearts) — existing
- ✓ User profiles with settings — existing
- ✓ Internationalization (en/mk) — existing
- ✓ Lesson content (ad-hoc ordering) — existing

### Active

<!-- Current scope. Building toward these. -->

**Phase 1 — Curriculum Backbone**
- [ ] Parse UKIM public curriculum PDFs into structured data
- [ ] Structure A1 level with concepts, vocabulary, grammar per lesson
- [ ] Structure A2 level with concepts, vocabulary, grammar per lesson
- [ ] Create B1 skeleton (placeholder structure only)
- [ ] Replace ad-hoc lesson ordering with UKIM curriculum order

**Phase 2 — Progress & Dashboard**
- [ ] Implement progress tracking: currentPath, currentLesson, lastActivity
- [ ] Update dashboard: "Continue where you left off" when progress exists
- [ ] Remove static "Start here" after first use
- [ ] Never auto-redirect users back to alphabet

**Phase 3 — Lesson → Practice Integrity**
- [ ] Practice pulls ONLY from completed lessons or explicitly selected vocab sets
- [ ] Remove any practice that quizzes unseen content
- [ ] Grammar drills reference the lesson they come from

**Phase 4 — Vocabulary System (Simple SRS)**
- [ ] Implement vocab states: new / learning / mastered
- [ ] Allow: Save word, Mark "don't know"
- [ ] Practice modes: Learn new, Review weak, Mixed

**Phase 5 — Reader Reorganization**
- [ ] Refactor Reader into folders: Reading Challenges, Short Conversations, Grammar-aligned
- [ ] Move 30-Day content into its own folder
- [ ] Do not mix challenge content with casual reading

**Phase 6 — Clean Up Confusion**
- [ ] Hide/disable all audio & speaking references
- [ ] Remove dead or unclear settings (e.g., Saved Phrases if unused)
- [ ] Add lightweight explainers where ambiguity exists

**Phase 7 — Validation**
- [ ] Update Playwright tests to reflect intended beta UX
- [ ] Do NOT reintroduce removed features to satisfy tests
- [ ] Update docs: docs/intended-beta-ux.md, docs/beta_learning_model.md
- [ ] Agent feedback: critique learning flow, UX risks, PM improvement suggestion

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Audio/speaking features — not ready for beta; hide completely to avoid confusion
- B1+ content (beyond skeleton) — focus on A1/A2 quality first
- Gamification expansion — no new badges, streaks, or social features
- AI chat/conversational bots — adds complexity without solving core progression issues
- Native audio recording or TTS improvements — audio disabled for beta
- Social features (friends, leaderboards, sharing) — not part of learning system overhaul
- Monetization or subscriptions — separate initiative
- Partner content integrations (e.g., Andri content) — post-overhaul consideration

## Context

### The Problem

Advanced and returning users don't know where they are, what they've completed, or what to do next. The app doesn't communicate a clear learning model or progression state. Users get tested on words/grammar before being introduced via lessons, which breaks trust and makes practice feel random rather than reinforcing.

### Root Cause Chain

1. **No clear progression** → users don't know where they are
2. **Practice quizzes unseen content** → breaks trust, feels random
3. **Alphabet loop trap** → symptom of 1 & 2; users get redirected back to basics

### Design Principle

"A guided course you can move freely within — not a quiz engine that happens to have lessons."

### User Feedback (Direct Quote)

> "I started getting asked questions for words that I hadn't been introduced to yet on the site... That meant I'm either picking the right answer from that but not actually learning the word or shooting in the dark. Either way, it would also distort it knowing what I've mastered and what I need to still work on."

> "How do I systematically get walked through learning new words? And how can I go back to drilling them somehow?"

> "Seems like I'm getting asked questions in the 'start here' to then be able to practice but never really got the lesson to begin with to put context around the rest."

### Current State

- **Lessons**: Content exists but ordering is arbitrary (not curriculum-aligned)
- **Progress tracking**: Partial state exists but unreliable for resumption
- **Practice system**: Quiz mechanics work, but pulls from wrong content pool
- **Curriculum source**: UKIM PDFs need parsing and structuring

## Constraints

- **Tech stack**: Next.js 16 App Router, Prisma/PostgreSQL, NextAuth, Vercel — no major changes
- **Content source**: UKIM curriculum available as PDFs requiring extraction/parsing

## Curriculum Source

**UKIM Archive**: https://archive.ukim.edu.mk/mk_content.php?glavno=34&meni=201

| Textbook | Level | CEFR | Notes |
|----------|-------|------|-------|
| **Тешкото** (Teshkoto) | Beginner | A1 | 2022 edition has audio |
| **Лозје** (Lozje) | Intermediate | A2 | 2022 edition available |
| **Златоврв** (Zlatovrv) | Advanced | B1 | Skeleton only for beta |
| **Везилка** (Vezilka) | Culture/Literature | — | Supplementary, out of scope |

Additional materials available: "Macedonian for Foreigners" courses, "Macedonian so maka" (Tasevska)

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Progression clarity is the north star | If progression works, other issues resolve naturally; if it doesn't, even perfect content feels broken | — Pending |
| UKIM curriculum as backbone | Real Macedonian educational standard provides legitimacy and structure | — Pending |
| Lesson-first practice (strict) | Trust requires users never be tested on content they haven't been taught | — Pending |
| Hide audio/speaking entirely | Partially working features confuse users; better to hide than show broken | — Pending |
| Simple SRS over complex algorithm | Start with new/learning/mastered states; complexity can come later | — Pending |

## Success Criteria

- [ ] New user can land and immediately know where to start, what they're learning, and why
- [ ] Practice only reinforces content already introduced (no surprise words/grammar)
- [ ] Progress feels continuous: always a clear "Continue where you left off" state
- [ ] Advanced learner can jump in and never feel trapped in alphabet/beginner loop
- [ ] 2-3 named beta users say: "This finally makes sense — I always know what to do next"

---
*Last updated: 2026-01-06 after initialization*
