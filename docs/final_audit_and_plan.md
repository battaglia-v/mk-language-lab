# Final Audit and Implementation Plan for MK Language Lab (Jan 1 2026)

## Overview

This document captures the results of a comprehensive mobile-first audit of MK Language Lab after recent updates. It identifies outstanding bugs, usability issues and gaps in the current implementation, suggests enhancements inspired by competitors (e.g., ClozeMaster and Duolingo), and outlines a monetization strategy and technical steps to implement a paywall. The goal is to polish the web and mobile experience ahead of the Google Play Store launch and ensure a sustainable revenue model.

## Implementation Status

| Task | Status | Notes |
|------|--------|-------|
| 1. Dynamic Reader route for 30-Day Challenge | ✅ Complete | Added all 30 day samples to `lib/reader-samples.ts` |
| 2. Fix A1 Foundations first lesson link | ✅ Complete | Created dedicated `/learn/lessons/alphabet` page |
| 3. Deck filtering for Topic Packs | ✅ Complete | Created `lib/topic-decks.ts` and updated PracticeSession |
| 4. Word tap overlay in Reader | ✅ Complete | Created `TappableText` component with WordDetailPopup |
| 5. Exit buttons in practice sessions | ✅ Complete | Already existed in PracticeSession header |
| 6. Expand Reader library content | ✅ Complete | Reader page now shows all samples + 30-Day Challenge section |
| 7. Authentication integration (NextAuth) | ✅ Complete | Already configured with Google, Facebook, Credentials |
| 8. Paywall middleware | ✅ Complete | Created `lib/subscription.ts`, upgrade page, and billing APIs |
| 9. Google Play Billing integration | 🔄 Partial | API routes ready, needs TWA implementation |
| 10. Stripe/PayPal web payments | ⏳ Pending | Schema ready, needs Stripe SDK integration |

---

## Remaining Bugs and Functional Gaps

### 1. Broken links in the 30-Day Reading Challenge

The 30-Day Reading Challenge path (`/en/learn/paths/30day`) lists all 30 days but clicking Day 1: The Drawing still leads to a 404: the route `/en/reader/samples/day01-maliot-princ` does not exist. The JSON files for the challenge have been created but there is no dynamic route to render them. This makes the entire 30-day path unusable.

### 2. Mis-routed first lesson in A1 Foundations

On the A1 Foundations path, the first lesson "The Alphabet" still links to the generic Pronunciation Practice page (`/en/practice/pronunciation`) instead of a dedicated lesson. There is no content for this unit; learners cannot progress beyond zero lessons.

### 3. Topic Packs start all 503 vocabulary cards

Selecting any Topic Pack (e.g., Home & Household) launches a vocabulary session with 503 questions and always begins with the word здраво (hello). This indicates the deck filter isn't applied; users face an overwhelming list instead of a focused set of ~20 items. There is also no quick way to quit the session.

### 4. Reader text interactions

While the Reader library and sample pages are mobile friendly, tapping a word in the text does not bring up a translation overlay or bottom sheet. The promise of "tap any word" is unfulfilled; users must switch tabs to see vocabulary. Additionally, the dialogue formatting still shows each utterance preceded by dashes rather than styling each speaker separately.

### 5. Limited content in Library

The Reader library currently exposes only one story ("At the Cafe"). The new samples extracted from "Малиот Принц" and topic packs are not surfaced here, leaving the library feeling empty. Users may assume there is little to read.

### 6. XP consistency and Profile

Without signing in it's impossible to verify that the XP totals now match between the Learn page and the Profile. Ensure the useUserStats hook introduced earlier synchronises XP across pages and reflects progress from practice sessions.

---

## Usability and Design Improvements

### Fix broken and mis-linked lessons

- Implement a dynamic Reader route at `/en/reader/samples/[sampleId]` to render the 30-day challenge JSON files. Ensure the day01-maliot-princ sample displays the reading text, grammar and vocabulary.
- Update the A1 path to link the "Alphabet" unit to a proper lesson (e.g., a Pronunciation or Writing mini-module). Mark subsequent lessons as locked until the user completes the prior one.

### Correct deck filtering for Topic Packs

- Modify the practice session handler to accept a deck id and return only the words from that deck. For household-v1, the session should include the ~30 vocabulary items from `data/decks/household-deck.json` instead of all 503 items.
- Add a clear "Quit" or "Back to paths" button in sessions so users can exit without losing progress.

### Enhance Reader interactivity

- Implement the word tap feature: when the user taps a word, show a bottom sheet with the translation, part of speech, audio and buttons to save to practice or add to vocabulary. This should work offline using the local JSON deck.
- Format dialogues like conversations, distinguishing speakers with names or colours rather than dashes. Consider a chat-style layout similar to Duolingo's story mode.

### Expand the Reader library

- Surface the new sample files (from `data/reader/samples`) in the Library with proper meta tags (length, level, topics). For non-paid users, show a subset (e.g., first 5 days) and indicate the rest are premium.
- Add search filters by level and topic, allowing learners to explore more texts.

### Improve session flows

- In Grammar and Word Sprint, provide an obvious way to exit or pause a session. For example, include a close icon in the top bar or a link back to Practice.
- For Vocabulary sessions, show progress out of the total number of cards and allow users to customise session length (e.g., 10, 20, All).

### Accessibility and clarity

- Ensure all buttons have clear labels and states. Some controls (e.g., Copy/Save/Listen under translation results) still blend into the background on dark mode.
- Add accessible ARIA labels for screen readers, especially on interactive elements like the segmented controls and XP progress bars.

---

## Inspired Enhancements (Duolingo & ClozeMaster)

**Gamified milestones** – Add daily streak rewards, achievements for completing entire paths, and league leaderboards to drive engagement. ClozeMaster's spaced repetition could inform a "Review" mode that prioritises difficult words.

**Contextual dialogues** – Introduce interactive dialogues (choose-your-own-response) similar to Duolingo's conversation lessons, using the vocab lists and reading content.

**Adaptive practice** – Track user accuracy across sessions and adapt the difficulty: if a learner struggles with nouns, surface more noun exercises. Use spaced repetition algorithms to schedule reviews.

---

## Monetization and Paywall Strategy

To monetise the mobile app while restricting free access on the web:

### Unified account system

Require users to create an account (email/Google sign-in). This allows you to track purchases and progress across web and mobile. Integrate NextAuth for authentication and store user roles (free, subscriber) in your database.

### Subscription tiers

- **Free tier**: basic translation, access to a few A1 lessons, limited practice sessions and 3–5 reader samples.
- **Paid tier**: unlock all learning paths (A1–C1), the full 30-Day Challenge, unlimited practice sessions, pronunciation features and topic packs.
- Consider a one-time lifetime purchase or monthly subscription; monthly is standard on Play Store.

### Google Play Billing integration

- When wrapping the PWA in a Trusted Web Activity, implement Google Play Billing to handle subscriptions. Use the Play Billing Library to trigger purchase flows and obtain a purchase token.
- On the backend, verify the purchase token via the Google Play Developer API and mark the user's account as subscriber. Cache the entitlement and periodically re-check expiry.
- Expose a `/api/verify-subscription` endpoint that the web app calls to gate premium content.

### Stripe/PayPal for the web

- For web users, offer the same subscription via Stripe or PayPal. Upon successful checkout, update the user's subscriber role.
- Ensure price parity with Google Play to comply with platform policies.

### Middleware gating

- In Next.js, implement a middleware that checks the user's session and subscription status before accessing premium routes (e.g., `/learn/paths/b1`, `/learn/paths/b2c1`, `/reader/samples/day*`).
- If the user is not subscribed, redirect to a paywall page explaining the benefits and offering upgrade options.

### Graceful degradation

- If a user's subscription expires (or they cancel), allow them to keep their progress but restrict new content until they renew.
- Provide a "sync purchases" button so users can restore purchases made on mobile when they log in on the web.

---

## Next Steps for the Agent

### Phase 1: Critical Bug Fixes

1. **Implement missing routes and fix links**: Create a dynamic sample page under `/app/[locale]/reader/samples/[sampleId]/page.tsx` to render the 30-day challenge files. Update the A1 path to point to appropriate lessons. Add conditional logic to show a "Coming Soon" badge on locked units.

2. **Deck filtering and session improvements**: Refactor the practice session API to accept a deck id and difficulty. Ensure vocabulary sessions load only the selected deck's items. Add options to customise session length and an exit button. Display deck size (n cards) below each topic pack card.

### Phase 2: User Experience

3. **Interactive reader**: Build a word tap component that opens a bottom sheet with translation, grammar info and save buttons. Use the vocabulary lists from the JSON files. Improve the dialogue layout by separating speakers.

4. **Content surfacing**: Populate the Reader library with the 30-day sample entries and topic dialogues. Implement filters (level, topic) and show content previews. For unlicensed content (e.g., excerpts of "Малиот Принц"), show placeholders and an "Import your own text" prompt.

5. **State management and caching**: Continue using a central store (useUserStats) for XP and progress. Cache user progress and vocabulary decks in IndexedDB for offline use. Implement optimistic updates for practice results.

### Phase 3: Monetization

6. **Paywall and subscription**: Integrate NextAuth for authentication. Add server-side logic to verify Google Play purchase tokens and Stripe payments. Implement middleware gating and a paywall page. Expose API endpoints for verifying membership and syncing purchases.

### Phase 4: Quality Assurance

7. **Testing and QA**: After implementing these changes, conduct another end-to-end audit on both web and mobile. Use Playwright or Cypress to automate regression tests for path navigation, practice sessions, and paywall behaviour. Validate that all 404s are resolved and that session flows can be started, paused and exited gracefully.

---

---

## Next Steps (Prioritized)

### Priority 1: Pre-Launch Critical (Do Before Play Store)

| Task | Effort | Description |
|------|--------|-------------|
| **Populate 30-Day Challenge Content** | High | Add actual reading passages to day01-day30 JSON files (currently placeholders) |
| **Test Premium Route Gating** | Medium | Add subscription checks to premium routes in page components |
| **TWA Wrapper Setup** | High | Create Trusted Web Activity wrapper for Google Play Store |
| **Google Play Console Setup** | Medium | Create app listing, configure billing products (pro_monthly, pro_yearly) |
| **Play Billing Library Integration** | High | Implement purchase flow in TWA, verify tokens with backend |
| **Privacy Policy & Terms** | Low | Required for Play Store submission |

### Priority 2: User Experience Polish

| Task | Effort | Description |
|------|--------|-------------|
| **Session Length Customization** | Medium | Allow users to choose 10/20/All cards per session |
| **Progress Bar in Topic Packs** | Low | Show "n of m cards" during sessions |
| **Dialogue Formatting** | Medium | Chat-style layout for conversation texts (speakers with colors) |
| **Offline Caching** | High | Cache vocabulary decks in IndexedDB for offline practice |
| **XP Sync Verification** | Medium | Ensure XP totals match between Learn page and Profile |

### Priority 3: Accessibility & i18n

| Task | Effort | Description |
|------|--------|-------------|
| **ARIA Labels** | Medium | Add screen reader labels to interactive elements |
| **Keyboard Navigation** | Medium | Ensure all practice modes work with keyboard only |
| **Missing i18n Keys** | Low | Add translations for new features (alphabet, upgrade page) |
| **Dark Mode Button Contrast** | Low | Fix Copy/Save/Listen buttons in dark mode |

### Priority 4: Post-Launch Enhancements

| Task | Effort | Description |
|------|--------|-------------|
| **Stripe Integration** | High | Web payment option for desktop users |
| **Spaced Repetition Algorithm** | High | Adaptive practice based on user accuracy |
| **Daily Streak Rewards** | Medium | Visual streak tracker with freeze protection |
| **Achievement Badges** | Medium | Unlock badges for milestones (100 words, 7-day streak, etc.) |
| **Leaderboard Weekly Reset** | Low | Reset weekly XP for league competition |
| **Import Your Own Text** | High | Allow users to paste and analyze custom Macedonian text |

### Priority 5: Content Expansion

| Task | Effort | Description |
|------|--------|-------------|
| **B1 Learning Path** | High | Create intermediate curriculum lessons |
| **Additional Topic Packs** | Medium | Travel, Food, Shopping, Transportation |
| **More Reader Samples** | Medium | Additional stories beyond "The Little Prince" |
| **Audio Recordings** | High | Native speaker audio for vocabulary items |

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Remove `as never` type casts | Low | Clean up type assertions in session page |
| Consolidate deck loading logic | Medium | Single source of truth for all deck types |
| Add E2E tests for new features | Medium | Playwright tests for alphabet lesson, topic packs |
| Error boundary for Reader | Low | Graceful handling of missing samples |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-01 | Initial document created | Claude |
| 2026-01-01 | Implemented 8 of 10 core fixes, added next steps | Claude |
