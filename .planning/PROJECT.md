# MKLanguage Learning System Overhaul (Beta)

## What This Is

MKLanguage is a Macedonian language learning app with a CEFR-aligned learning system based on official UKIM curriculum (Teshkoto/Lozje/Zlatovrv textbooks). The v1.0 Beta delivers structured progression tracking, lesson-first practice integrity, and vocabulary SRS management — ensuring users always know where they are and what to do next.

## Core Value

**The app always resumes me in the right place and makes my next step obvious.**

If the app nails progression, users will forgive incomplete content; if it doesn't, even perfect content feels broken.

## Requirements

### Validated

<!-- Shipped and working in v1.0 Beta -->

- User authentication (NextAuth, email/social login) — existing
- Practice exercises with multiple question types — existing
- Reader with text content and vocabulary highlighting — existing
- Translation tool with AI assistance — existing
- Gamification system (XP, streaks, hearts) — existing
- User profiles with settings — existing
- Internationalization (en/mk) — existing
- Lesson content (ad-hoc ordering) — existing
- Parse UKIM public curriculum PDFs into structured data — v1.0
- Structure A1 level (Teshkoto) with concepts, vocabulary, grammar per lesson — v1.0
- Structure A2 level (Lozje) with concepts, vocabulary, grammar per lesson — v1.0
- Create B1 skeleton (Zlatovrv placeholder structure only) — v1.0
- Replace ad-hoc lesson ordering with UKIM curriculum order — v1.0
- Implement progress tracking: currentPath, currentLesson, lastActivity — v1.0
- Update dashboard: "Continue where you left off" when progress exists — v1.0
- Remove static "Start here" after first use — v1.0
- Never auto-redirect users back to alphabet — v1.0
- Practice pulls ONLY from completed lessons or explicitly selected vocab sets — v1.0
- Remove any practice that quizzes unseen content — v1.0
- Grammar drills reference the lesson they come from — v1.0
- Implement vocab states: new / learning / mastered — v1.0
- Allow: Save word, Mark "don't know" — v1.0
- Practice modes: Learn new, Review weak, Mixed — v1.0
- Refactor Reader into folders: Reading Challenges, Short Conversations, Grammar-aligned — v1.0
- Move 30-Day content into its own folder — v1.0
- Do not mix challenge content with casual reading — v1.0
- Hide/disable all audio & speaking references — v1.0
- Remove dead or unclear settings (e.g., Saved Phrases if unused) — v1.0
- Add lightweight explainers where ambiguity exists — v1.0
- Update Playwright tests to reflect intended beta UX — v1.0
- Update docs: intended-beta-ux.md, beta_readiness_assessment.md — v1.0
- Agent feedback: critique learning flow, UX risks, PM improvement suggestion — v1.0
- User journey CTAs connecting Learn → Practice → Reader sections — v1.3
- Practice results → Reader "Read Something" CTA — v1.3
- Reader workspace → Practice "Practice Now" CTA (conditional) — v1.3
- Reader library → Learn "Continue your lessons" link — v1.3
- A1 graded reader stories (My Morning, At the Store, My Best Friend) — v1.3
- A2 graded reader stories (My Job, Hobbies, The Holiday) — v1.3
- B1 graded reader stories (Macedonian Cuisine, City vs Village, Macedonian Legends) — v1.3
- Full i18n for My Saved Words section and post-lesson practice flow — v1.3
- 100% curriculum translation validation (240 issues fixed) — v1.3
- Dark mode compliance with semantic design tokens — v1.3
- E2E tests validating user journey flows — v1.3
- Light mode color fixes with semantic design tokens — v1.4
- Navigation overhaul: More → Resources page, UserMenu consolidation — v1.4
- Tools merge: Translate + Analyzer unified page with toggle — v1.4
- Save-to-glossary on vocabulary cards with sort toggle — v1.4
- Gender annotations with color coding and definite articles — v1.4
- Session persistence for practice with resume prompt — v1.4
- Alphabet lesson integrated as first A1 curriculum node — v1.4
- Missing pronouns (наш/нивни possessive forms) added — v1.4
- MLC badge attribution restored in Reader — v1.4
- Expandable grammar examples with "show more" functionality — v1.4
- Macedonian keyboard hints for text inputs — v1.4
- Learning Paths removed (simplified UX) — v1.4
- Remove all audio/listening feature code and UI references — v1.5
- About page credits (MLC and Andri acknowledgment) — v1.5
- Quiz retake button with score display — v1.5
- Section stepper free navigation for completed lessons — v1.5
- Curriculum source explanation (UKIM textbooks) — v1.5
- Practice Hub lesson progress indicator — v1.5
- Actionable Lesson Review empty state — v1.5

### Active

<!-- Next milestone scope -->

- (No active requirements — ready for next milestone planning)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Audio/speaking features — not ready for beta; hidden completely to avoid confusion
- B1+ content (beyond skeleton) — focus on A1/A2 quality first
- Gamification expansion — no new badges, streaks, or social features
- AI chat/conversational bots — adds complexity without solving core progression issues
- Native audio recording or TTS improvements — audio disabled for beta
- Social features (friends, leaderboards, sharing) — not part of learning system overhaul
- Monetization or subscriptions — separate initiative
- Partner content integrations (e.g., Andri content) — post-overhaul consideration

## Context

### Current State (v1.5)

- **Codebase:** ~26,000 lines of TypeScript (reduced from ~30,000 after audio removal)
- **Tech stack:** Next.js 16 App Router, Prisma/PostgreSQL, NextAuth, Vercel
- **Curriculum:** 40 lessons (24 A1 + 8 A2 + 8 B1), 41 grammar notes, 25,568 vocabulary items
- **Graded Readers:** 12 stories (4 A1, 4 A2, 4 B1) in data/graded-readers.json
- **Database:** UKIM curriculum seeded with 100% validated translations
- **CI Pipeline:** 7 workflows with Next.js and Playwright caching optimized
- **Dark mode:** ~98% compliance across all components
- **E2E Tests:** 72 user journey tests across 4 viewports
- **Navigation:** Resources page (replaced More), unified Tools (Translate + Analyzer)
- **Practice:** Session persistence, resume prompt, save-to-glossary, lesson progress indicator
- **Audio:** Fully removed (was unused, now -4,064 lines cleaner)

### The Problem (Solved)

Advanced and returning users didn't know where they were, what they'd completed, or what to do next. The app didn't communicate a clear learning model or progression state. Users got tested on words/grammar before being introduced via lessons, which broke trust.

### How v1.0 Solved It

1. **Clear progression** — Journey progress tracking with "Continue where you left off" dashboard
2. **Lesson-first practice** — Practice API filters to completed content only
3. **Curriculum backbone** — UKIM textbooks provide real educational structure
4. **Vocabulary management** — SRS system tracks new/learning/mastered states

### User Feedback (Addressed)

> "I started getting asked questions for words that I hadn't been introduced to yet on the site..."
**Fixed:** Lesson-first practice integrity (Phase 3)

> "How do I systematically get walked through learning new words? And how can I go back to drilling them somehow?"
**Fixed:** UKIM curriculum backbone (Phase 1) + Vocabulary SRS (Phase 4)

> "Seems like I'm getting asked questions in the 'start here' to then be able to practice but never really got the lesson to begin with..."
**Fixed:** Progress tracking and dashboard continuation UX (Phase 2)

## Constraints

- **Tech stack:** Next.js 16 App Router, Prisma/PostgreSQL, NextAuth, Vercel — no major changes
- **Content source:** UKIM curriculum available as PDFs (parsed and seeded in v1.0)

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Progression clarity is the north star | If progression works, other issues resolve naturally | Good |
| UKIM curriculum as backbone | Real Macedonian educational standard provides legitimacy | Good |
| Lesson-first practice (strict) | Trust requires users never be tested on unseen content | Good |
| Hide audio/speaking entirely | Partially working features confuse users; better to hide | Good |
| Simple SRS over complex algorithm | Start with new/learning/mastered; complexity can come later | Good |
| pdfjs-dist legacy build | Standard build has worker issues in Node.js ESM | Good |
| Upsert pattern for curriculum seeding | Idempotent, safe to re-run | Good |
| Comment audio routes vs delete | Easy to re-enable when audio ready | Good |
| Mode selector UI-only | Deck filtering deferred to practice session integration | Pending |
| Cloudflare NO-GO | Next.js 16 not supported by OpenNext adapter; ~$19/mo savings insufficient | Good |
| Tap-to-select UX | Better mobile compatibility than drag-drop for exercises | Good |
| Dynamic lesson lookup | Query by module/orderIndex more maintainable than hardcoded IDs | Good |

## Success Criteria

- [x] New user can land and immediately know where to start, what they're learning, and why
- [x] Practice only reinforces content already introduced (no surprise words/grammar)
- [x] Progress feels continuous: always a clear "Continue where you left off" state
- [x] Advanced learner can jump in and never feel trapped in alphabet/beginner loop
- [ ] 2-3 named beta users say: "This finally makes sense — I always know what to do next"

---
*Last updated: 2026-01-10 after v1.5 Audio Cleanup & Final Polish milestone*
