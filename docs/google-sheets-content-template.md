# Google Sheets Content Template for Macedonian Learning App

## Overview

This document describes how to structure content in Google Sheets that will be automatically synced to the app database.

## Setup Instructions

### 1. Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named: **"Macedonian Learning App - Content"**
3. **For POC:** Create 1 tab named exactly: `Family`
   - (Travel and Culture will be added in Phase 2)

### 2. Column Structure

Each tab should have the following columns in row 1 (header row):

| Column | Name | Description | Example |
|--------|------|-------------|---------|
| A | `moduleNum` | Module number (1, 2, 3...) | `1` |
| B | `moduleTitle` | Module name | `Greetings & Introductions` |
| C | `lessonNum` | Lesson number within module | `1` |
| D | `lessonTitle` | Lesson name | `Basic Greetings` |
| E | `lessonSummary` | Short description | `Learn how to greet people in Macedonian` |
| F | `estimatedMinutes` | Time to complete (minutes) | `15` |
| G | `difficultyLevel` | `beginner`, `intermediate`, or `advanced` | `beginner` |
| H | `vocabMK` | Macedonian words (pipe-separated) | `Здраво\|Добар ден\|Добро утро` |
| I | `vocabEN` | English translations (pipe-separated) | `Hello\|Good day\|Good morning` |
| J | `vocabPronunciation` | Pronunciation (pipe-separated) | `Zdravo\|Dobar den\|Dobro utro` |
| K | `exampleMK` | Example sentence in Macedonian | `Здраво, како си?` |
| L | `exampleEN` | Example sentence in English | `Hello, how are you?` |
| M | `grammarTitle` | Grammar topic (optional) | `Informal vs Formal Greetings` |
| N | `grammarExplanation` | Grammar explanation (optional) | `Use "Здраво" for friends, "Добар ден" for formal situations` |
| O | `exerciseType` | Exercise type | `multiple_choice` |
| P | `exerciseQuestion` | Exercise question | `How do you say "Hello" informally?` |
| Q | `exerciseOptions` | Answer options (pipe-separated) | `Здраво\|Добар ден\|Довидување\|Благодарам` |
| R | `correctAnswer` | Correct answer letter or text | `A` |
| S | `audioUrl` | Audio file URL (optional) | `https://storage.example.com/audio/zdravo.mp3` |
| T | `videoUrl` | Video URL (optional) | `https://youtube.com/watch?v=...` |

## Example Rows

### Family Tab - Example Content

**Row 2:**
```
1 | Greetings & Introductions | 1 | Basic Greetings | Learn how to greet people in Macedonian | 15 | beginner | Здраво|Добар ден|Добро утро | Hello|Good day|Good morning | Zdravo|Dobar den|Dobro utro | Здраво, како си? | Hello, how are you? | Informal vs Formal | Use "Здраво" for friends, "Добар ден" for formal | multiple_choice | How do you say "Hello" informally? | Здраво|Добар ден|Довидување|Благодарам | A | |
```

**Row 3:**
```
1 | Greetings & Introductions | 2 | Asking How Are You | Learn to ask about someone's well-being | 15 | beginner | Како си?|Добро сум|Лошо | How are you?|I'm good|Bad | Kako si?|Dobro sum|Losho | Како си денес? | How are you today? | | | fill_blank | Complete: Здраво, ____ си? | како | како | |
```

**Row 4:**
```
1 | Greetings & Introductions | 3 | Introducing Yourself | Learn to introduce yourself | 20 | beginner | Јас сум|Мене ме викаат|Име | I am|My name is|Name | Jas sum|Mene me vikaat|Ime | Јас сум Марко. | I am Marko. | Personal Pronouns | "Јас" means "I", use it at the start | translation | Translate: "My name is Ana" | Мене ме викаат Ана | Мене ме викаат Ана | |
```

### Travel Tab - Example Content

**Row 2:**
```
1 | Transport & Directions | 1 | At the Bus Station | Essential phrases for public transport | 20 | beginner | Автобус|Станица|Билет | Bus|Station|Ticket | Avtobus|Stanica|Bilet | Каде е станицата? | Where is the station? | Question Formation | Use "Каде" (where) + "е" (is) | multiple_choice | How do you say "bus"? | Автобус|Такси|Влак|Трамвај | A | |
```

## Exercise Types

| Type | Description | Example |
|------|-------------|---------|
| `multiple_choice` | Multiple choice question | "Which word means 'Hello'? A) Здраво B) Довидување" |
| `fill_blank` | Fill in the blank | "Complete: Здраво, ____ си?" (Answer: "како") |
| `translation` | Translate a sentence | "Translate: My name is Ana" (Answer: "Мене ме викаат Ана") |
| `matching` | Match words (future feature) | Match Macedonian words to English |

## Important Notes

### Vocabulary Rules
- Use pipe character `|` to separate multiple items
- Number of items must match across MK, EN, and Pronunciation columns
- Example: If you have 3 words in `vocabMK`, you must have 3 in `vocabEN` and 3 in `vocabPronunciation`

### Module Organization
- Each module can have multiple lessons
- Keep `moduleNum` the same for all lessons in the same module
- Lessons are ordered by `lessonNum` within each module
- Modules are ordered by `moduleNum` within each journey

### Difficulty Levels
- `beginner`: New learners, basic vocabulary
- `intermediate`: Can hold simple conversations
- `advanced`: Complex grammar and nuanced vocabulary

### Optional Fields
These fields can be left empty if not needed:
- `audioUrl`
- `videoUrl`
- `grammarTitle`
- `grammarExplanation`

## Syncing to App (Legacy)

> The Google Sheets automation was removed in Nov 2025. Keep this section for historical reference only. Today, update lesson data directly via Prisma seeds or admin tools, and document the process in `docs/projects/`.

## Content Creation Workflow

### For Andri:

1. **Plan Module Structure**
   - Decide on module topics for each journey
   - Aim for 3-5 modules per journey
   - 3-5 lessons per module

2. **Write Content**
   - Start with Family journey (most popular)
   - Fill out spreadsheet row by row
   - Include vocabulary, examples, and exercises for each lesson

3. **Review & Test**
   - Check that pipe separators are correct
   - Verify exercise answers are accurate
   - Test pronunciation guides

4. **Sync & Verify**
   - Content will sync automatically
   - Check app to ensure lessons appear correctly
   - Request fixes if needed

## Example Family Journey Structure

### Module 1: Greetings & Introductions (4 lessons)
1. Basic Greetings - 15 min
2. Asking How Are You - 15 min
3. Introducing Yourself - 20 min
4. Family Member Names - 20 min

### Module 2: Everyday Conversations (4 lessons)
1. Talking About Your Day - 20 min
2. Asking About Family Members - 20 min
3. Expressing Emotions - 15 min
4. Making Plans - 20 min

### Module 3: Phone Conversations (3 lessons)
1. Opening a Phone Call - 15 min
2. Asking About Health - 20 min
3. Saying Goodbye Warmly - 15 min

**Total: 3 modules, 11 lessons, ~200 minutes of content**

## Support

If you need help:
1. Check this documentation
2. Contact Vinny with questions
3. Test content in staging environment before publishing

---

**Last Updated:** November 7, 2025
**Version:** 1.0
