# MKLanguage Roadmap: From Dashboard to Duolingo Loop

## The Real Problem (Dec 31, 2024 Audit)

You built features, but not a Duolingo-style loop.

Duolingo/Clozemaster don't feel good because of gradients/cards — they feel good because the user always has:
- **One obvious primary CTA** ("Continue")
- **Clear success/failure feedback**
- **XP awarded immediately** with a celebration + next step
- **A short loop with momentum** (no dead ends)

The current app is a toolbox/dashboard. The next plan: turn everything into a **tight loop product**.

---

## Live Production Observations (Signed Out)

### Home Page — BROKEN
- Literally rendering translation keys: `home.guestSubtitle`, `home.guestCta`, etc.
- Makes signed-out experience feel unfinished + dashboardy/placeholder

### Learn Page — Partial
- Basics/Conversations switch + CTA exists
- "Start today's lesson" present BUT clicking causes runtime error (deck not found)

### Practice Hub — Functional but not Duolingo-like
- Clean "pick a quick session" list with XP ranges
- Structurally good, but "feel" is still dashboard list, not guided path + one obvious next action

### Reader — Dashboard-like
- Shows Library | Workspace tabs at top
- Server-rendered page is basically a list + "Start Reading"
- Primary impression is "catalog/dashboard", not "reading mode first"

### Translate — Minimal
- Direction toggles, character counter, "Translate" button
- "Analyze this text" flow still feels like big card stack (not mobile-first tool)

---

## Phase Priorities

# P0 — Fix Broken Signed-Out Home (i18n + Structure)
**Status:** MUST FIX

### Why
Home currently shows translation keys. This alone makes the signed-out experience feel unfinished.

### Deliverables
1. Fix i18n wiring so keys never leak to UI
2. Replace hero copy and layout (not long, not dashboard)

### Signed-Out Home Spec (Duolingo-ish)
- **Hero:** "Learn Macedonian, the fun way."
- **Subcopy:** "5 minutes a day. Real phrases. Daily speaking + word sprints."
- **Primary CTA:** "Start a quick lesson" (guest flow)
- **Secondary CTA:** "Sign in to save progress"
- **Below fold:** 3 tiny value chips (NOT cards):
  - "Daily XP + streaks"
  - "Speaking practice"
  - "Reader with word tap"
- **No stats. No dashboards. No long feature lists.**

### Acceptance Criteria
- [ ] Home shows real strings (no `home.guestSubtitle` keys)
- [ ] First screen fits on one phone viewport
- [ ] One primary CTA

---

# P1 — Fix "Start Today's Lesson" / Deck Not Found
**Status:** MUST FIX

### The Bug
Clicking "Start Today's Lesson" → deck not found error

### Spec
- App must have a single canonical "default deck/lesson" for guests AND signed-in
- If deck missing, fallback automatically: `curated → starter → any available deck`
- Add `/api/version` endpoint returning `{ commitHash, buildTime }` (show in Settings → "Build: …")

### Acceptance Criteria
- [ ] Signed-out: "Start Today's Lesson" always starts a session
- [ ] Signed-in: same
- [ ] No dead ends: every error has fallback + "Continue"

---

# P2 — Speaking MVP: Measurable Success + Remove "Skip-Only" Vibes
**Status:** HIGH PRIORITY

### The Problem
Speaking feels like "I said it… okay??" — unclear if user passed.

### Speaking Exercise Must Have

**Prompt:** Clear instruction every time
- "Repeat this out loud"
- "Answer in Macedonian (1 sentence)"

**Buttons:**
- Listen (native audio/TTS)
- Record (big mic)
- Play back my recording
- Check (or "Continue" if scoring unavailable)
- "Can't speak now" (silent fallback)

**Scoring Tiers (MVP without heavy infra):**
- **Tier A (best):** Browser SpeechRecognition → compare transcript similarity
- **Tier B:** If unavailable → require minimum record length (>1.2s) + playback + user self-confirm

**Result State:**
- ✅ "Nice!" + highlight 1–2 words you "heard" (if transcript)
- OR "Try again" with hint

**XP:**
- Award XP only on "Check/Continue", not on skip
- On completion: mini "XP toast" + "Next" CTA

### Acceptance Criteria
- [ ] User always knows what to do
- [ ] User always knows if they passed
- [ ] XP granted predictably
- [ ] No "only skip" situations

---

# P3 — Reader Overhaul: Library + Workspace Like a Real Mobile Tool
**Status:** HIGH PRIORITY

### The Problem
Reader is still perceived as a page with big blocks.

### Make Reader Two-Mode Experience

**1) Library (browse)**
- Search
- "Continue reading" at top
- Curated categories (A1, A2, B1…)
- Small cards, not huge panels

**2) Workspace (reading)**
- Full-screen reading (MyLangReader-like)
- Tap word → bottom sheet with:
  - translation
  - lemma
  - example sentence
  - "Save"
- Sticky top bar: back, title, audio, settings
- Progress indicator

**Move "Analyze text" OUT of main Reader landing:**
- Put under Workspace as: "Import text" / "Paste text" / "Open from Translate"

### Acceptance Criteria
- [ ] Reader landing is short + browseable
- [ ] Reading mode is immersive and usable one-handed
- [ ] No "giant dashboard card"

---

# P4 — Word Sprint: Expand Content + Upgrade Difficulty
**Status:** POLISH

### Rename Options
- "Gap Sprint" (short + accurate)
- "Fill the Gap"
- "Sentence Sprints" (closest to Clozemaster vibe)
- "Fast Gaps"

### Difficulty Model
- **Easy:** missing 1 obvious word
- **Medium:** 1–2 words, includes cases/articles
- **Hard:** phrases, word order, clitics, prepositions, conjugations

### Gameplay Polish (Clozemaster-y)
- Combos: +2 XP if correct streak
- Timer optional mode ("Sprint mode")
- Show "You missed: ___" + quick explanation
- "Save sentence" button

### Content Expansion
- Increase variety: dialogues, travel, emotions, opinions, work, family conflict, making plans, debating, storytelling
- Add "Advanced conversation" sentences that match expressing nuance and opinions

### Acceptance Criteria
- [ ] Hard mode is genuinely hard
- [ ] User can replay mistakes
- [ ] Feels like game loop, not a form

---

# P5 — About Page + Trust Cleanup
**Status:** POLISH

### Name Format
- Title: **Vincent Battaglia (Vinny)**
- Body: casual tone fine, keep credibility
- Remove Andri until real contributions exist

### Feature Claims
- Only list features that are truly live today
- Matters for Play Store trust

### Acceptance Criteria
- [ ] About matches reality
- [ ] No aspirational claims

---

## Global Rules (Always Follow)

### Never Ship
- i18n keys visible in UI
- Dead ends (every error must have fallback CTA)
- "Skip only" exercises without primary Continue/Check

### Token Budget Mode (Prevent Context Errors)
1. **"Input too long" fix:** Don't paste whole plan. Instead:
   > "Open docs/agent/ROADMAP.md and docs/agent/STATUS.md and continue from the next unchecked item."

2. **"Output exceeded 4096" fix:**
   - Do not paste diffs
   - Commit changes instead
   - Print only: changed file list, what you ran, result summary

### Resume Prompt (Safe for Tokens)
```
Open docs/agent/ROADMAP.md and docs/agent/STATUS.md. Continue from the next unchecked item.
Priorities now:
(1) Fix signed-out home i18n keys + redesign to single-CTA Duolingo-style landing.
(2) Fix "Start today's lesson → deck not found" with robust deck fallback + no-dead-ends UX.
(3) Speaking MVP: measurable success + XP award + Continue flow (no skip-only).
Token budget mode: do not paste large diffs; commit and summarize.
```

---

## Build Commands
```bash
npm run type-check    # Must pass before/after changes
npm run test          # Unit tests
npm run lint          # Linting
npm run build         # Production build
```
