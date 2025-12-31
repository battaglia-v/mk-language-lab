# Current Status (Agent Queue)

## Completed ✅
- [x] **P0 COMPLETE** - Core stability achieved
- [x] **P1 COMPLETE** - Signed-out home redesign (1-tap to lesson)
- [x] **P2 COMPLETE** - Reader Library | Workspace tabs
- [x] **P3 COMPLETE** - Word Sprint difficulty tiers (already implemented)
- [x] **P4 COMPLETE** - Speaking MVP polish (TTS fallback added)
- [x] **P5 COMPLETE** - Advanced Conversations structure (code done)
- [x] **P6 COMPLETE** - About/Trust cleanup (name format, features verified)
- [x] **Content Expansion COMPLETE** - Word Sprint 305 sentences, Advanced vocab/patterns

## 🎉 ALL PHASES + CONTENT EXPANSION COMPLETE

## In Progress ▶️
- [x] P0 Live Regression Audit (Dec 31, 2024) ✅ **COMPLETE**

### P0 Audit Steps
1. [x] Fix signed-out Home i18n keys (`home.guestSubtitle`, `home.guestCta`, `home.guestSignIn`, `home.guestSignInLink`)
   - Added to `messages/en.json` and `messages/mk.json`
2. [x] Fix Start Today's Lesson -> /practice/decks/starter (guest fallback + stale id)
   - **VERIFIED**: Already fixed - route is `/practice/session?deck=curated&difficulty=beginner`
   - `PracticeSession.tsx` has fallback for custom deck failures (lines 57-68)
   - No broken `/practice/decks/starter` references found
3. [x] Make XP consistent (Word Sprint card vs mode screen)
   - Updated `DifficultyPicker.tsx` to show per-difficulty XP: `+{BASE_XP_PER_QUESTION[d]} XP/q`
   - Updated i18n `modes.wordSprint.xp` from "+8-20 XP" to "+2-5 XP/q" (en + mk)
4. [x] Replace "Word Gaps" copy with "Word Sprint" everywhere
   - Updated `about.feature1` in en.json and mk.json
5. [x] Playwright test for Start Today's Lesson signed-out flow
   - Added test suite `Homepage - Signed-Out Guest Flow` to `e2e/homepage.spec.ts`
   - Tests: guest CTA navigation, sign-in link visibility

## Next (optional improvements) ⏭️
- [ ] Add more reader samples
- [ ] Audio recordings from native speakers
- [ ] Additional idioms and colloquial expressions

## Content Expansion Summary (Dec 31, 2024)

### Word Sprint
- **Before:** 131 sentences
- **After:** 305 sentences (+174)
- **New categories:** weather, transport, shopping, emotions, colors, body, clothing, work, health, home, directions

### Advanced Conversations
- **File:** `data/advanced-content.json`
- **Lessons:** 15 content blocks
- **Vocabulary:** 90 items (6 per lesson)
- **Patterns:** 45 phrases (3 per lesson)
- **Topics:** opinions, connectors, storytelling, work, formal/informal, travel problems, complaints, health, idioms, colloquial

### Documentation
- **Output cap rule** added to `docs/AGENT_INSTRUCTIONS.md` (section 3.4)
- **Content sources** documented in `docs/content-sources.md`

## Notes / Context
- Always run `npm run type-check` before and after each change.
- Keep changes small: max 3 files per step.
- Follow WORKING_AGREEMENT.md rules at all times.
- **Output cap rule:** Do not print large datasets in chat; write to files, report counts only.

## Test Commands Run 🧪
- `npm run type-check` → PASS
- `npm run test` → PASS
- `npm run lint` → PASS

## Summary of All Phases

| Phase | Description | Status |
|-------|-------------|--------|
| P0 | Core stability, no dead ends | ✅ |
| P1 | Signed-out home, 1-tap to lesson | ✅ |
| P2 | Reader Library \| Workspace tabs | ✅ |
| P3 | Word Sprint difficulty tiers | ✅ |
| P4 | Speaking MVP, TTS fallback | ✅ |
| P5 | Advanced Conversations structure | ✅ |
| P6 | About/Trust cleanup | ✅ |
| Content | Word Sprint 305, Advanced vocab | ✅ |

## Recent Commits
- `bd0539d` - docs: add content sources and attribution documentation
- `9272328` - feat: content expansion - Word Sprint 305 sentences + Advanced Conversations
- `98e7e95` - P0-P6 phases complete
