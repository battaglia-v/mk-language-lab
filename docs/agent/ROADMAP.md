# MKLanguage Mobile UX Roadmap (Duolingo/Clozemaster-style)

## Product North Star
Open app → 1 tap to start → complete a short lesson → clear feedback → XP earned → "Continue" to next.
The app should feel like a learning game, not a dashboard of tools.

## Key Product Pillars
1) **Lesson Player** (core game loop)
2) **Learn Path** (clear progression)
3) **Practice Modes** (Word Sprint + speaking + grammar as workouts)
4) **Reader** (MyLangReader-like: Library → Reading)
5) **Advanced Conversations** (B1–C1 focus)
6) **Trust/Polish** (no i18n leaks, accurate copy, consistent XP/goal)

---

# P0 — Core stability + no dead ends (Launch blockers)
### Objective
Nothing crashes. No "deck not found." Every exercise has prompt, success criteria, and a Continue path.

### Checklist
- [x] Fix `deck not found` everywhere:
  - stale IDs migrate or fall back to default
  - signed-out uses guest lesson/deck
  - add a "Reset progress" option
- [ ] Guarantee lesson loop everywhere:
  - Prompt → Check → Feedback → Continue
  - Skip is secondary
- [ ] Exercise Contract validation:
  - required: prompt, type, choices/answer, instructions
  - invalid exercise gracefully skips (no dead-end)
- [ ] Remove i18n key leaks and placeholder copy (no raw keys visible)
- [ ] Replace "Loading…" with skeletons/spinners where needed
- [ ] Ensure `npm run type-check` is clean

### Acceptance Criteria
- Start Today's Lesson works signed-out and signed-in.
- No screen shows only "Skip" without a primary Continue/Check.
- No missing prompt screens (or they auto-skip with friendly message).
- Type-check passes.

---

# P1 — Signed-out Home + Learn Path becomes the product
### Objective
Home is short, motivating, and 1-tap into learning. No dashboard feel.

### Checklist
- [ ] Signed-out home redesign:
  - above-the-fold: "Learn Macedonian" + 1-line value prop
  - primary CTA: Start lesson
  - secondary CTA: Sign in
  - keep to ~1.5 screens height on mobile
- [ ] Signed-in Learn:
  - Path is central
  - "Continue" is dominant
  - goal ring/streak is secondary
- [ ] Copy cleanup:
  - remove marketing-y "curious learners" phrasing
  - keep microcopy short and game-like

### Acceptance Criteria
- Signed-out user can start a guest lesson in one tap.
- Home no longer reads like a dashboard/toolkit.
- Learn Path is prominent and actionable.

---

# P2 — Reader overhaul (MyLangReader-like but better)
### Objective
Reader becomes mobile-friendly and usable: minimal scrolling; Library → Reading Session.

### IA / UX Spec
- Reader has two top tabs: **Library** | **Workspace**
- Library:
  - search + difficulty filters
  - short curated texts (level tag, time estimate, topic)
  - saved texts section
- Workspace (Reading Session):
  - clean typography, focused reading
  - tap word → bottom sheet: translation + save word/phrase + listen
  - sentence translation reveal toggle (per sentence)
- Move "Analyze text / tools" into a secondary Tools menu, not the main screen.

### Checklist
- [ ] Split Reader into Library and Workspace
- [ ] Tap-to-lookup bottom sheet works reliably
- [ ] Save word/phrase pipeline exists and is reviewable
- [ ] Minimize scroll; remove giant card stacks

### Acceptance Criteria
- Reader feels like a reading app, not a long form/dashboard.
- Word lookup is 1 tap and fast.
- User can save words and access them later.

---

# P3 — Word Sprint (Clozemaster energy)
### Objective
Word Sprint feels addictive, fast, and scalable with content and difficulty.

### Word Sprint Definition
- "Fill the missing word in real sentences."
- Default session: 10 questions, ~3 minutes, +10 XP

### Checklist
- [ ] Difficulty tiers that change gameplay:
  - Easy: 2 choices (quick wins)
  - Medium: 4 choices (default)
  - Hard: typed answer (tolerant matching)
- [ ] Categories + progression (food, travel, emotions, work, opinions…)
- [ ] Smarter distractors (same category/part-of-speech-ish + length constraints)
- [ ] Combo/multiplier + end-of-sprint summary
- [ ] Mistakes queue + spaced resurfacing
- [ ] Expand content (target 300+ sentences for MVP)

### Acceptance Criteria
- Sprint has clear start → loop → finish with XP earned.
- Hard mode feels meaningfully harder.
- Content doesn't repeat constantly.

---

# P4 — Speaking / Pronunciation becomes complete
### Objective
Speaking mode clearly indicates success and never dead-ends; recording works or has a clear fallback.

### MVP Flow (works without fancy scoring)
Prompt → record → playback → try again OR "I said it" → Continue → XP.

### Checklist
- [ ] Mic permission + device support detection
- [ ] Clear recording state (timer, "recording…", stop)
- [ ] Playback of user recording
- [ ] "Listen to model" (TTS) if available; otherwise hide
- [ ] Clear success gating:
  - after recording >= N seconds OR silent practice confirm → Continue enabled
- [ ] XP and end-of-lesson summary

### Acceptance Criteria
- User always knows what to do and whether they completed the step.
- There is always a Continue path and XP reward.

---

# P5 — Advanced Conversations (B1–C1) polish + content fit for advanced learners
### Objective
Serve advanced learners who struggle with complex conversation and rich vocabulary.

### Content Principles
- topic-based units, real-life conversation drills
- connector phrases, nuance, storytelling, opinions
- rich vocab + usage patterns, not just basic phrases

### Units (example)
1) Opinions & nuance (however/although/it depends)
2) Storytelling & sequencing (past narration)
3) Work & professional conversations
4) Emotions & relationships
5) Health and appointments
6) News/culture discussion
7) Debate club (take a stance)
8) Paraphrasing / synonyms (say it another way)

### Checklist
- [ ] Each advanced lesson includes:
  - 6–10 vocab items
  - 3 sentence patterns
  - 1 short dialogue
  - 1 respond prompt (typed or speaking)
- [ ] Ensure progression + review integration (saved words feed into review)

### Acceptance Criteria
- Advanced track feels cohesive, not like random exercises.
- It helps users speak about complex topics.

---

# P6 — About / Trust / Branding cleanup
### Objective
Make About trustworthy and aligned with actual features.

### Checklist
- [ ] About name format: **Vincent ("Vinny") Battaglia**
- [ ] Remove Andri until contributions exist
- [ ] Feature list only includes features that work today
- [ ] Add "Sources & licenses" section if using any CC-BY content

### Acceptance Criteria
- About page matches reality and builds trust.
