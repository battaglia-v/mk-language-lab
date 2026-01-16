# Phase 65: Translator

AI translation tool for the mobile app.

## Plans

| Plan | Name | Tasks | Focus |
|------|------|-------|-------|
| 65-01 | Translator Screen | 3 | Translation input, API call, history |

## Key Files

**Mobile App:**
- `apps/mobile/app/(tabs)/translate.tsx` - Translator screen
- `apps/mobile/lib/translate.ts` - Types and functions
- `apps/mobile/lib/translation-history.ts` - History storage

## Dependencies

- Phase 64 complete (reader with tap-to-translate proves API works)
- Existing `/api/translate` endpoint

## Success Criteria

- Translation screen with bidirectional translation (EN→MK, MK→EN)
- Translation history persists locally
- Copy to clipboard functionality
- Clear input and swap direction buttons
