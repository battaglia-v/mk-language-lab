# MK Language Lab Launch Readiness Report

> Last Updated: 2026-01-10
> Owner: Vincent Battaglia

## Executive Summary
This report consolidates the content audit, UX review, and Play Store launch plan into a single source. Core content, localization parity, and store metadata are ready with a few remaining blockers and deferred mobile smoke testing.

## Audit Scope
- Content consistency across lessons, vocabulary, grammar, and reader samples
- Localization parity (English and Macedonian)
- Core user flows (learn, practice, translate, reader, profile)
- Store readiness (listing copy, assets, TWA build, asset links)

## Key Findings
- Content coverage is complete for A1/A2/B1 paths and the 30-day reader challenge.
- Localization parity is confirmed (en/mk keys match).
- Practice vocabulary has 26 duplicate MK/EN pairs to dedupe post-launch.
- Curriculum audit reports disagree on vocab counts; use `data/curriculum/validation-report.json`.
- Manual mobile smoke testing was deferred per request and remains a launch blocker.
- TWA build succeeded; artifacts are available in `android-twa/`.

## Content Consistency Snapshot
- Practice vocabulary: 503 entries, no missing MK/EN pairs, 26 duplicates.
- Topic decks: household (30), weather-seasons (30), body-health (30), activities-hobbies (30),
  clothing-appearance (40), technology (30), numbers-time (50), celebrations (14).
- Grammar lessons: 10 entries using `titleMk/titleEn`.
- Reader content: A1 (4), A2 (4), B1 (4), plus 30-day challenge (30 samples).

## Localization Parity
- `messages/en.json`: 1841 keys
- `messages/mk.json`: 1841 keys
- Missing keys: 0

## UX Update
- Learn page CTA redesigned to a compact action row with a small button, reducing the oversized
  "Continue learning / Start learning" block while keeping the primary action clear.
  Implemented in `components/learn/LearnPageClient.tsx`.

## Content Scope Recommendation
- Launch with full content available (A1, A2, B1, and 30-day challenge).
- Optional refinement: keep advanced paths visible but add "Recommended after A2" messaging
  to reduce cognitive load without hard locking.

## Play Store Listing (English)
App title: MK Language Lab  
Short description (80 chars max):  
Learn Macedonian with lessons, practice, translation, and real stories

Full description (4000 chars max):
Master Macedonian with MK Language Lab, a modern mobile-first learning companion with real-world
content.

STRUCTURED LESSONS AND PRACTICE
- Guided learning paths (A1, A2, B1)
- Vocabulary drills and Word Sprint sessions
- Grammar lessons with clear explanations
- Instant feedback and progress tracking

INSTANT TRANSLATION
- Macedonian to English and English to Macedonian translation
- Translation history for quick review
- Save phrases for later

READER MODE AND REAL CONTENT
- Graded stories with tap-to-translate words
- Live news headlines from Macedonian sources
- Curated content for language learners

PROGRESS AND MOTIVATION
- XP, streaks, and daily goals
- Achievement badges and progress stats

PRONUNCIATION SUPPORT
- Text-to-speech audio on supported items

Whether you are traveling, reconnecting with your roots, or exploring Slavic languages, MK
Language Lab makes learning Macedonian engaging and efficient. Download now and start learning
today.

Category: Education (secondary: Language)  
Content rating: Everyone (IARC - educational content only)  
Privacy policy: https://mklanguage.com/en/privacy  
Support email: contact@mklanguage.com

Release notes (Whats New):
- Initial release with learning paths, practice drills, translation, reader, and progress tracking.

## Screenshot Plan (Phone 1080x1920)
1. Learn Home - Daily Goals
   - Show daily goal ring, streak chip, and compact Continue CTA.
   - Caption: Start today with a focused learning goal.
2. Learning Path
   - Show A1 path nodes and progress.
   - Caption: Follow guided paths from alphabet to fluency.
3. Practice
   - Show active Word Sprint card with feedback.
   - Caption: Interactive practice with instant feedback.
4. Translator
   - Show translation input, result, and history.
   - Caption: Instant Macedonian and English translation with history.
5. Reader
   - Show reader list or story view with tap-to-translate.
   - Caption: Read real Macedonian with context.
6. Profile
   - Show XP, streaks, and badges.
   - Caption: Track progress and milestones.
7. News
   - Show headlines with images.
   - Caption: Stay connected with Macedonian news.
8. Settings (optional)
   - Show practice settings or goals.
   - Caption: Customize goals and reminders.

## Play Console Submission Steps
1. Verify production site: https://mklanguage.com/en and `/.well-known/assetlinks.json`.
2. Confirm app identity in `android-twa/twa-manifest.json`.
3. Build artifacts (AAB + APK) in `android-twa/`.
4. Upload listing assets (icon, feature graphic, screenshots) and listing copy.
5. Complete data safety and content rating forms (IARC).
6. Upload AAB to internal testing track and validate TWA behavior.
7. Promote to production and submit for review.

## Remaining Blockers
- Confirm production DB seeded with UKIM curriculum.
- Capture final English screenshots and review UI for accuracy.
- Complete Play Console data safety and IARC questionnaires.
- Manual device smoke test (deferred per request).

## Build Artifacts
- `android-twa/app-release-bundle.aab`
- `android-twa/app-release-signed.apk`
