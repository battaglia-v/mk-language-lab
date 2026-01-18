# Content Architecture: Database vs Runtime

This document explains where content is stored and how it's loaded in the PWA.

## Content Sources Overview

| Content Type | Storage | Location | Seeded to DB? |
|-------------|---------|----------|---------------|
| **Curriculum Lessons** | Database | `CurriculumLesson` table | ✅ Yes (60 lessons) |
| **Vocabulary Items** | Database | `VocabularyItem` table | ✅ Yes (2,178 items) |
| **Grammar Notes** | Database | `GrammarNote` table | ✅ Yes (156 notes) |
| **Exercises** | Database | `Exercise` table | ✅ Yes (123 exercises) |
| **Dialogues** | Database | `Dialogue` + `DialogueLine` tables | ✅ Yes (60 dialogues, 302 lines) |
| **Vocabulary Decks** | JSON (runtime) | `data/decks/*.json` | ❌ By design |
| **Reader Stories** | JSON (runtime) | `data/reader/**/*.json` | ❌ By design |
| **Grammar Lessons** | JSON (runtime) | `data/grammar-lessons.json` | Exercises seeded |

---

## 1. Database Content (Seeded)

### Curriculum Lessons
- **Source**: `data/curriculum/structured/*.json` (UKIM textbook data)
- **Seeded by**: `prisma/seeds/seed-curriculum-ukim.ts`
- **Count**: 60 lessons across A1 (24), A2 (8), B1 (8), Grammar (20)

### Vocabulary Items
- **Source**: `data/curriculum/ukim-vocab/*.json`
- **Seeded by**: `prisma/seeds/seed-curriculum-ukim.ts`
- **Count**: 2,178 items with translations, pronunciation, examples

### Grammar Notes
- **Source**: `data/curriculum/ukim-vocab/*.json` (grammar sections)
- **Seeded by**: `prisma/seeds/seed-curriculum-ukim.ts`
- **Count**: 156 notes with explanations and examples

### Exercises
- **Source**: `data/grammar-lessons.json`
- **Seeded by**: `prisma/seeds/seed-grammar-exercises.ts`
- **Count**: 123 exercises (multiple-choice, fill-blank, etc.)

---

## 2. Runtime Content (JSON Files)

### Vocabulary Decks (Practice)
- **Location**: `data/decks/*.json`
- **Files**: 
  - `curated-deck.json` (324 cards)
  - `topic-decks/` (food, travel, etc.)
- **Loaded by**: `lib/topic-decks.ts`, `components/practice/usePracticeDecks.ts`
- **Why not seeded**: Decks are curated collections that may change frequently; loading from JSON allows easy updates without migrations

### Reader Stories
- **Location**: `data/reader/`
- **Subdirectories**:
  - `graded/` - 12 graded readers (A1-B1)
  - `stories/` - 1 story
  - `conversations/` - 1 dialogue conversation
  - `challenges/30-day-little-prince/` - 30 daily readings
- **Loaded by**: `lib/reader-content.ts`
- **Why not seeded**: Static content that doesn't need user tracking at DB level

### Grammar Lessons (Full)
- **Location**: `data/grammar-lessons.json`
- **Count**: 20 lessons with exercises
- **Loaded by**: `lib/grammar-engine.ts`
- **Note**: Exercises ARE seeded to DB for tracking; full lesson content loaded from JSON

---

## 3. Dialogues - NOW SEEDED ✅

### Parser Created
The UKIM textbook data contains dialogues embedded in theme titles as raw text:
```
"– Здраво. Јас сум Влатко. – Еј, здраво. ______ ______ Ема..."
```

We created a parser (`scripts/parse-ukim-dialogues.ts`) that:
1. Extracts speaker/line pairs from raw text
2. Handles fill-in-the-blank markers (`______`)
3. Assigns alternating speakers (A, B) where not specified
4. Groups dialogues by section labels (А, Б, В, Г)

### Seeding Script
`prisma/seeds/seed-dialogues.ts` seeds the parsed dialogues to the database.

### Current Status
- **60 dialogues** with **302 lines** seeded
- Dialogues linked to lessons (1 per lesson)
- Fill-in-the-blank exercises preserved
- `DialogueViewer` component now displays content

### Limitations
- English translations not in source data (textEn is empty)
- Some lines may have noise from source formatting
- Speaker names are approximate (A/B alternating)

---

## 4. Content Loading Flow

### Lesson Page (`/lesson/[id]`)
```
1. Fetch from DB: CurriculumLesson + VocabularyItems + GrammarNotes + Exercises + Dialogues
2. Render: LessonPageContentV2 component
3. Sections: Vocabulary → Grammar → Exercises → Dialogue (if exists)
```

### Practice Page (`/practice`)
```
1. Load decks from JSON: usePracticeDecks hook
2. Merge with user data: saved phrases, favorites, SRS
3. Start session with selected deck
```

### Reader Page (`/reader`)
```
1. Load story from JSON: lib/reader-content.ts
2. Parse text blocks into sentences/words
3. Enable tap-to-translate, save words
```

---

## 5. Parity Checklist

| Feature | PWA | Mobile | Status |
|---------|-----|--------|--------|
| Curriculum lessons | ✅ DB | ✅ API | ✅ Parity |
| Vocabulary items | ✅ DB | ✅ API | ✅ Parity |
| Grammar notes | ✅ DB | ✅ API | ✅ Parity |
| Exercises | ✅ DB | ✅ API | ✅ Parity |
| Dialogues | ✅ DB (60) | ✅ API | ✅ Parity |
| Practice decks | ✅ JSON | ✅ JSON | ✅ Parity |
| Reader stories | ✅ JSON | ✅ JSON | ✅ Parity |
| Grammar lessons | ✅ JSON | ✅ JSON | ✅ Parity |

---

## 6. Recommendations

### Completed ✅
1. ✅ All curriculum lessons seeded (60)
2. ✅ All vocabulary items seeded (2,178)
3. ✅ All grammar notes seeded (156)
4. ✅ All exercises seeded (123)
5. ✅ Dialogues parsed and seeded (60 dialogues, 302 lines)
6. ✅ Practice decks load from JSON
7. ✅ Reader stories load from JSON

### Future Improvements
1. Add English translations to dialogues (currently empty)
2. Refine dialogue speaker detection from source text
3. Create more structured dialogue content for new lessons
4. Add audio clips to dialogue lines
