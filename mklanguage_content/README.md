# MKLanguage: Data & Feature Integration Instructions

This document accompanies the content files in the `content/` directory.  It describes how to integrate the provided materials into the MKLanguage app and outlines the remaining tasks and fixes required for the mobile‑first redesign.

## 1. Fix Remaining UI Issues

1. **Guest Home page i18n bug** – On the unauthenticated home page (`/en`), the tagline still displays raw i18n keys (`home.guestSubtitle` and `home.guestCta`).  Add these keys to your translation files (EN and MK) so the correct strings appear.  Validate on devices at 375px width.
2. **Final mobile QA** – Perform an on-device pass to ensure:
   * Buttons look tappable and have clear hover/active states.
   * Bottom navigation never overlaps primary call‑to‑action buttons.
   * All skeleton loaders display instead of “Loading…” text.
   * Learn and Profile pages display consistent XP values after practice sessions.

## 2. Add a “Learning Paths” Hub

Create a new screen under the Learn tab (`/learn/paths`) with cards for each learning path.  Each card should display:

* **Level** – A1 Foundations, A2 Momentum, B1 Independence, B2/C1 Mastery, 30‑Day Challenge, Topic Packs.
* **Description** – A short phrase describing the focus of the path (e.g., “Master the basics” or “Fluency with real texts”).
* **Estimated duration** – Number of weeks or sessions.
* **Start/Continue button** – Launches the next lesson for the user.

Include a small “Find my level” diagnostic button that runs a short placement quiz.  The quiz can be deferred to a later release if time is short.

## 3. Establish the Data Model

Adopt a unified content model stored as JSON files.  A suggested schema:

```json
{
  "id": "lesson-id",
  "path": "a1",             // which path this belongs to
  "unit": 1,                 // numeric unit index
  "title": "Greetings",    // lesson title
  "cefrLevel": "A1",        // CEFR level
  "topic": "Greetings",    // high-level topic
  "skillFocus": ["vocab", "listening"],
  "timeEstimateMin": 10,
  "xpReward": 20,
  "vocabDeckIds": ["a1-greetings-deck"],
  "readerTextId": "reader-a1-0001",     // optional: link to Reader text
  "audioId": "audio-lesson-0001",       // optional: link to audio file
  "grammarNotes": "...",               // optional: markdown or HTML for grammar explanation
  "steps": [ ... ]                      // sequence of micro-steps for the lesson
}
```

Store these JSON files under `content/paths/` and `content/lessons/`.  Provide a small internal route (`/dev/content`) that lists available paths, units and lessons to make it easy to check coverage.

## 4. Populate the CEFR Paths

Use the following outlines to create lessons and units.  Each lesson can reference vocabulary decks, reader texts, audio and grammar notes.  Many of these resources are provided in the accompanying content files.

### A1 Foundations

1. **Alphabet & Pronunciation** – Introduce the Cyrillic alphabet and common pronunciation patterns.
2. **Greetings & Introductions** – Use phrases from the *Body parts & health* and *Clothing & appearances* decks for simple exchanges.
3. **Numbers, Days & Months** – Base vocabulary and phrases on the provided *Броеви, денови, месеци* file.
4. **Food & Café Survival** – Provide ordering phrases and simple dialogues.
5. **Family & People** – Introduce basic kinship terms.
6. **Home & Objects** – Use the *Household items* list as vocabulary.
7. **Weather & Seasons** – Teach weather expressions using the *Weather & Seasons* deck.
8. **Health & Body** – Introduce common health phrases using the *Body parts & health* file.
9. **Short Dialogues** – Combine vocabulary from earlier lessons into short two‑person conversations.
10. **Checkpoint Assessment** – Evaluate recognition of vocabulary and simple sentence formation.

### A2 Momentum

* Introduce past and future tenses, directions, shopping and travel logistics.
* Build on vocabulary from the *Activities & hobbies*, *Technology & communication*, and *Celebrations & traditions* files.
* Include longer dialogues and short stories for reading practice.

### B1 Independence

* Focus on narration, giving opinions and making plans.
* Incorporate longer reading passages (300–600 words) and short writing tasks.
* Use sections from the 30‑Day Reading Challenge (see below) for comprehension.

### B2/C1 Mastery (Fluency Track)

* Design a 12‑week cycle with weekly themes (society, culture, work, news, history, humour/idioms, travel, relationships).
* Each week should include: two to three reading passages, one audio/video prompt, one writing assignment (150–300 words), one speaking task (2–4 minutes), and a short grammar/usage review.
* Use the 30‑Day Reading Challenge content as core reading material and audio resources.

## 5. Integrate the Provided Content Files

The files in the `content/` directory come from the user’s Google Drive.  They are plain‑text lists of phrases and vocabulary.  Use them as follows:

* **Vocabulary decks** – For each file, create a deck where each sentence becomes a card with front=MK phrase and back=English translation.  The deck ID should follow a pattern such as `a1-weather-deck` or `b1-celebrations-deck`.
* **Mini dialogues** – Group related phrases into short dialogues.  For example, group several *Body parts & health* sentences into a conversation about visiting a doctor.
* **Reader texts** – Use the lists as simple reading passages for A1/A2 learners.  For example, the *Household items* file can become a descriptive paragraph about a home.
* **Practice templates** – Use the vocabulary for Word Sprint (flashcards) and grammar fill‑in‑the‑blank exercises.  For speaking practice, prompt learners to describe their own home, family or hobbies using new words.

## 6. Integrate the 30‑Day Reading Challenge

The `30‑Day Reading Challenge` folder (not included in this archive due to size) contains 30 subfolders, each with a PDF and an M4A audio file.  The PDFs comprise 5‑page bilingual reading passages from *Малиот принц* (The Little Prince) with vocabulary lists, and the audio files contain narrated readings.

To incorporate this challenge:

1. **Create a dedicated “30‑Day Challenge” path** – Each day becomes a lesson.  Use the PDF text as the Reader passage.  Provide translation toggles and tap‑word functionality as in your redesigned Reader.
2. **Attach the audio** – Include a listening mode where the learner can play the M4A file and optionally read along.  Provide comprehension questions or summarization prompts.
3. **Vocabulary and grammar** – Extract the vocabulary lists from each PDF into decks.  Identify key grammar points (e.g., past tense, gender agreement) and create short drills.
4. **Assessments** – Every 5 days (Day 5, 10, 15, 20, 25, 30), include a review quiz that revisits earlier vocabulary and grammar.

Because these files are large (≈1–2 MB per PDF and ≈2–3 MB per audio), have your agent download them directly from Google Drive at build time or fetch them on demand from a secure storage bucket.  The ZIP download from Drive was taking too long to complete in our environment.

## 7. Implementation Notes

* **XP Consistency Hook** – Implement a shared `useUserStats()` hook that fetches total XP, weekly XP, streak and level progress from the API.  Both the Learn and Profile pages should subscribe to this hook and update when new XP is earned.
* **UI Kit** – Ensure all new screens reuse the mobile UI kit components (AppShell, buttons, segmented controls, bottom sheets, skeleton loaders, etc.).
* **Accessibility** – Make sure all tappable elements are at least 44 px tall and support keyboard focus states for accessibility.
* **Internal QA** – Build `/dev/content` to display lists of decks, lessons and paths, and `/dev/ui` to showcase components at typical mobile breakpoints.

## 8. Next Steps for the Agent

1. Copy the files from this archive (`content/`) into the project’s `content` directory.
2. Parse each file into vocabulary decks and store them as JSON (see examples above).
3. Build the Learning Paths hub and populate each path with units and lessons referencing the new decks and reader texts.
4. Download and integrate the 30‑Day Reading Challenge PDFs and audio files into the B2/C1 path.
5. Fix the remaining UI issues and perform a full mobile QA sweep.

This archive contains the raw content; your agent should process, structure and integrate it according to the guidelines above.
