# Intended Beta UX Contract

## Scope
- Mobile-first (iPhone 12 / 390x844).
- Desktop is out of scope unless it breaks mobile.
- No monetization (Stripe/paywall/subscriptions) in core flows.

## Routes

### Home (Guest) — `/en`
- Hero title + subtitle.
- Level selection with two primary CTAs:
  - Beginner (A1) -> `/en/learn?level=beginner`.
  - Intermediate (A2) -> `/en/learn?level=intermediate`.
- Sign-in link -> `/en/sign-in` or `/auth/signin`.

### Learn (Signed-in Home) — `/en/learn`
- Daily goal ring + streak chip.
- Primary CTA: "Continue" -> next lesson (shown only after first lesson completion).
- Secondary CTA: "Browse learning paths" -> `/en/learn/paths`.
- Level toggle (Beginner A1 / Intermediate A2) switches path content.
- Path preview cards list current path lessons with progress.
- **Curriculum Source:** UKIM textbooks (Тешкото A1, Лозје A2, Златоврв B1).
- **Progress Tracking:** `currentLessonId` points to next lesson; journey becomes `isActive` on first completion.

### Paths Hub — `/en/learn/paths`
- Only A1 Foundations and A2 Momentum paths are visible.
- Each path card has:
  - Title + description + progress.
  - “Start here” CTA -> next node.
  - “View full path” -> path detail.
- No Topic Packs or 30-Day cards on the hub.

### Path Detail — `/en/learn/paths/{a1|a2|30day}`
- A1/A2 path detail shows:
  - Back link to Paths hub.
  - Start here card + lesson node map.
- 30-Day Reading Challenge is accessible via Reader links (not hub).

### Practice Hub — `/en/practice`
- Practice modes shown:
  - Word Sprint (recommended)
  - Grammar
  - Vocabulary (SRS-based with new/learning/mastered states)
  - Saved
- Pronunciation/Speaking is hidden for beta (page shows "Coming Soon").
- Settings bottom sheet for mode/difficulty/deck.
- **Vocabulary SRS:** Spaced repetition with Leitner intervals; loads 15 due + 5 new words per session.

### Word Sprint — `/en/practice/word-sprint`
- Difficulty + session length selection.
- Start session -> active session view.
- Exit button returns to Practice hub.

### Reader Library — `/en/reader`
- Tabs: Library / Workspace.
- **Folder Organization:** Reading Challenges, Short Conversations, Grammar-aligned Readings.
- 30-Day Reading Challenge featured within Reading Challenges folder.
- Reading cards open sample pages.
- Search input + difficulty filters (search results remain flat).

### Reader Sample — `/en/reader/samples/{id}`
- Sticky top bar with Back, font size controls, focus mode.
- Tappable word opens translation sheet.
- Sections: Text (main), Vocabulary, Grammar (collapsed by default).
- Analyze and Mark Complete CTAs.

### More / Settings — `/en/more`, `/en/settings`
- More menu links: Language Lab, News, Resources, Profile, Settings, About, Help.
- Settings includes Theme, Language, Daily Goal; no Notifications in beta.

## Explicitly Not In Beta
- Pronunciation/Speaking practice mode (page shows "Coming Soon" placeholder).
- Notifications/reminders settings.
- Topic Packs path hub entry.
- Old "Start Learning" CTA and legacy 30-day/topic cards on Paths hub.
- B1 content (skeleton only — chapter titles exist but no lesson content).
