# Cloze Sentences Roadmap

## Goal
Introduce a "Fill the blank" mode inside Quick Practice that shows a full Macedonian (or English) sentence with one word missing, forcing learners to recall vocabulary in context.

## Why
- Delivers the Clozemaster-style experience requested in the initial audit.
- Reuses the existing practice vocabulary data (`practice-vocabulary.json`) but augments each entry with an optional `contextSentence` (with a `{{blank}}` token) and translation.
- Encourages deeper comprehension than isolated word drills.

## Implementation Steps
1. **Data model**
   - Extend `PracticeItem` with `contextMk` / `contextEn` fields where the missing word is wrapped in `{{ }}`.
   - Update the Google Sheet sync script so editors can provide sentences for new entries.
2. **UI**
   - Add a `mode: 'flashcard' | 'cloze'` toggle that appears inside the settings drawer (desktop) and the dropdown menu (mobile).
   - When `mode === 'cloze'`, render the context sentence with the blank replaced by an underline, show the translation beneath, and keep the same input/check controls.
3. **Scoring**
   - Store incorrect responses per sentence so we can build a "Practice mistakes" queue later.
   - Analytics: track `cloze_answer_correct/incorrect` to compare accuracy vs. flashcards.
4. **Testing**
   - Seed at least one deterministic cloze prompt for Playwright so we can submit the known answer.
   - Unit test the renderer that swaps `{{blank}}` with the learner input placeholder.

## Future Enhancements
- Add audio playback tied to context sentences (reuse the existing TTS hook).
- Generate "hints" by revealing the first letter of the blank after two failed attempts.
- Surface cloze-only XP badges to encourage switching between drill types.
