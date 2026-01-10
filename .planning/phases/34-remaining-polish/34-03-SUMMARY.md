---
phase: 34-remaining-polish
plan: 03
status: complete
started: 2026-01-10T22:21:05Z
completed: 2026-01-10T22:35:00Z
---

# Summary: Polish Content Messaging

## What Was Done

### Task 1: Soften Vocabulary Section Messaging
**Commit:** `b24b55c`

Updated VocabularySection.tsx to use friendlier, more welcoming language:
- Changed "X words to learn" → "New words for this lesson (X words)"
- Changed "Tap to reveal" → "Tap to see translation"
- Added i18n keys: `sectionTitle`, `wordCount`, `tapToReveal`, `noItems`
- Updated both en.json and mk.json with translations
- Added `useTranslations` hook for proper internationalization

### Task 2: Add Curriculum Source Explanation
**Commit:** `931aeee`

Added collapsible info section to Learn page explaining UKIM textbook sources:
- A1 curriculum based on Тешкото (Teshkoto)
- A2 curriculum based on Лозје (Lozje)
- B1 curriculum based on Златоврв (Zlatovrv)
- Styled as subtle collapsible section with Info icon
- Added i18n keys for `curriculumSource` section in both languages

## Files Changed

| File | Changes |
|------|---------|
| `components/learn/VocabularySection.tsx` | Added i18n hook, replaced hardcoded strings |
| `components/learn/LearnPageClient.tsx` | Added curriculum source collapsible section |
| `messages/en.json` | Added vocabulary and curriculumSource keys |
| `messages/mk.json` | Added corresponding Macedonian translations |

## Verification

- [x] `npm run type-check` passes
- [x] Vocabulary section shows friendlier messaging
- [x] Learn page shows curriculum source explanation
- [x] Both en.json and mk.json have all new i18n keys

## Outcome

The learning experience now feels more welcoming:
- Vocabulary section uses encouraging tone ("New words for this lesson") instead of task-oriented language ("words to learn")
- Users can learn about the UKIM textbook curriculum source, building trust in the content quality
- All text is properly internationalized for both English and Macedonian users
