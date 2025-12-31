# Working Agreement for Claude Code Agents

## Goal
Transform MKLanguage into a mobile-first, Duolingo/Clozemaster-like learning app:
- Lesson-first flow
- Clear success/failure
- XP + streak + daily goal consistency
- Minimal dashboard/tool vibes
- Reader like MyLangReader (Library → Reading), but better

## Non-negotiables (must always hold)
1) **Build must stay green**
   - Before starting new work: run `npm run type-check`
   - After each PR chunk: run `npm run type-check` and at least one relevant test command

2) **Token budget mode**
   - Do NOT paste full files or large diffs into the chat.
   - Only provide file paths + line ranges + summaries.
   - Quote <= 60 lines total across all snippets per message.
   - Max 3 files changed per step unless explicitly allowed.

3) **One task at a time**
   - Implement ONLY the next item in STATUS.md.
   - Do not "also fix" unrelated things in the same step.

4) **Mobile-first constraints**
   - Default target viewport: 390x844 and 412x915.
   - No horizontal scroll.
   - Tap targets >= 44px.
   - Avoid desktop max-width constraints on mobile.

5) **Lesson flow contract**
   Every session/lesson screen must follow:
   - Prompt → Check → Feedback → Continue
   - "Skip" is always secondary.
   - Lessons hide bottom nav (LessonShell). Bottom nav only on hub screens.

6) **Truthful UX**
   - About/feature descriptions must match what is currently implemented and working.
   - Remove placeholder claims (e.g., audio/news) unless fully functional.

7) **Do not claim features that aren't shipped**
   - Marketing copy, About page, and feature lists must reflect working features only.
   - If a feature is partially implemented, mark it "Coming soon" or remove it.
   - No aspirational descriptions that mislead users.

8) **No giant diffs in chat**
   - Never paste entire files or diffs exceeding 60 lines.
   - Summarize changes with file paths + line numbers + brief description.
   - This prevents "input too long" errors and keeps context manageable.

9) **LessonShell & AppShell rule**
   - **AppShell** = tabs/hubs (home, learn, practice hub, more). Bottom nav visible.
   - **LessonShell** = sessions, exercises, lessons. No bottom nav. Full-screen focus.
   - Never mix these: lessons should not show bottom tabs.

## How to resume work
At the start of every session:
1) Open `docs/agent/STATUS.md`
2) Identify the NEXT item
3) Implement ONLY that item (max 3 files)
4) Update `docs/agent/STATUS.md` with:
   - what changed
   - test commands run + result
   - next item queued

## Definition of Done (global)
- Signed-out and signed-in flows both work.
- Start Today's Lesson never errors (no "deck not found").
- No dead-end exercises; prompts always exist (or graceful skip).
- Speaking shows success path + Continue + XP.
- Reader is Library → Reading workspace (tap word → bottom sheet).
- Word Sprint has difficulty tiers and feels like a game.
- Home is short and not dashboardy.
- Type-check passes.
