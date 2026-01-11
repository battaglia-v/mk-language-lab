# Content Audit Summary

> **Last Updated:** 2026-01-10  > **Owner**: Vincent Battaglia

## Localization
- `messages/en.json` keys: 1841
- `messages/mk.json` keys: 1841
- Missing keys: 0 (parity confirmed)

## Practice Vocabulary
- Total entries: 503 (`data/practice-vocabulary.json`)
- Missing MK/EN pairs: 0
- Duplicate MK+EN pairs: 26 (e.g., `колега|colleague`, `риба|fish`)

## Topic Decks
- Deck item counts (all items have MK/EN):
  - `household-v1`: 30
  - `weather-seasons-v1`: 30
  - `body-health-v1`: 30
  - `activities-hobbies-v1`: 30
  - `clothing-appearance-v1`: 40
  - `technology-v1`: 30
  - `numbers-time-v1`: 50
  - `celebrations-v1`: 14

## Reader Content
- 30-Day Challenge: 30 samples (`data/reader/challenges/30-day-little-prince/`)
- Graded readers: A1 (4), A2 (4), B1 (4)
- All samples load via `lib/reader-samples.ts`

## Grammar Lessons
- Grammar lessons in `data/grammar-lessons.json`: 10
- Grammar lessons use `titleMk/titleEn` fields (not `title`)

## Notes / Follow-ups
- `data/curriculum/audit-results.json` shows zero vocab due to parser limitations; use `data/curriculum/validation-report.json` as the canonical coverage report.
- Consider deduplicating practice vocabulary pairs before launch.
