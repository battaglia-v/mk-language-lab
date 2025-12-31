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
- [ ] (none)

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
