# Phase 64: Reader Flow

Mobile Reader with tap-to-translate and progress tracking.

## Plans

| Plan | Name | Tasks | Focus |
|------|------|-------|-------|
| 64-01 | Reader API & Story List | 3 | API endpoint, story list with level filters |
| 64-02 | Story Viewer & Tap-to-Translate | 3 | Reading screen, word popup, translation |
| 64-03 | Progress & Glossary | 3 | Progress persistence, save-to-glossary |

## Key Files

**API:**
- `app/api/mobile/reader/route.ts` - Reader API endpoint

**Mobile App:**
- `apps/mobile/lib/reader.ts` - Reader types and fetch
- `apps/mobile/lib/reading-progress.ts` - Progress storage
- `apps/mobile/lib/glossary.ts` - Saved words storage
- `apps/mobile/app/(tabs)/reader.tsx` - Story list screen
- `apps/mobile/app/reader/[id].tsx` - Story viewer
- `apps/mobile/components/reader/TappableText.tsx` - Tappable text
- `apps/mobile/components/reader/WordPopup.tsx` - Translation popup

## Dependencies

- Phase 63 complete (mobile app foundation)
- Graded reader data in `data/reader/graded/`
- Translate API at `/api/translate`

## Success Criteria

- Story list displays with level filtering
- Tap-to-translate works with vocabulary + API fallback
- Reading progress persists across sessions
- Words can be saved to glossary
