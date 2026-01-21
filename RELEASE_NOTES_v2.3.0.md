# Macedonian Language Lab v2.3.0 Release Notes

## What's New

### Learning Milestones & Achievements 🏆
Celebrate your progress with **30+ new milestones** across multiple categories:
- **XP Milestones**: First Steps (100 XP) → XP Immortal (10,000 XP)
- **Streak Milestones**: Week Warrior (7 days) → Year of Dedication (365 days)
- **Vocabulary Milestones**: Word Collector (10 words) → Vocabulary Master (1,000 words)
- **Lesson Milestones**: First Lesson → Lesson Legend (100 lessons)
- **Grammar Milestones**: Track mastery across grammar topics
- **Special Achievements**: Perfect lessons, comeback rewards, and more

Each milestone features animated celebrations with confetti effects and XP rewards!

### Weekly Progress Tracking 📊
- New **Weekly Progress Card** on your dashboard
- Visual daily activity grid showing your learning consistency
- Weekly XP goals to keep you motivated
- See your streak and days active at a glance

### Streak Protection & Recovery 🛡️
- **Streak Freeze**: Automatically protects your streak if you miss 1-2 days
- One free streak freeze per week
- Supportive messaging when you return after missing days
- Clear status indicators: protected, at-risk, or healthy streak

### Adaptive Learning (Phase 2) 🧠
- **Weak Grammar Topics**: The app now identifies areas you struggle with
- **Focus Areas Card**: See your top 3 grammar topics to review
- **Adaptive Difficulty**: Exercises adjust based on your performance
- **Dialogue-Based Review**: Practice vocabulary in conversation context

### Enhanced Exercise Feedback 💡
- "Why This Is Wrong" explanations for incorrect answers
- Grammar tips appear contextually when you make mistakes
- Culture tips throughout lessons highlight Macedonian customs
- Formal/Informal speech tags on vocabulary and dialogues

### Retention Features 🔥
- **Session Summary**: See words learned, mastered, and to review
- **Daily Focus**: "Today You'll Learn" shows your learning goal
- Improved streak messaging with encouraging copy

---

## Google Play Store Release Notes (Short Version)

**Version 2.3.0**

🏆 **Milestones & Achievements**
Celebrate your progress with 30+ achievements! Earn XP rewards for streaks, vocabulary, lessons, and more.

📊 **Weekly Progress**
New dashboard card tracks your weekly learning with daily activity visualization.

🛡️ **Streak Protection**
Automatic streak freeze protects your progress if you miss a day. One free freeze per week!

🧠 **Smarter Learning**
- Identifies your weak grammar areas
- Adaptive difficulty adjusts to your level
- "Why This Is Wrong" feedback explains mistakes

💡 **Better Feedback**
- Culture tips highlight Macedonian customs
- Formal/Informal speech tags
- Session summaries show your progress

---

## Technical Details

- **Version**: 2.3.0
- **Version Code**: 230
- **Min SDK**: Android 6.0 (API 23)
- **Target SDK**: Android 14 (API 34)

## Files Changed

### New Features
- `lib/gamification/milestones.ts` - Milestones system
- `components/gamification/WeeklyProgressCard.tsx` - Weekly progress UI
- `components/gamification/MilestoneCelebration.tsx` - Achievement modal
- `components/gamification/StreakRecoveryCard.tsx` - Streak messaging
- `hooks/useMilestones.ts` - Milestone tracking hook
- `lib/learn/adaptive-difficulty.ts` - Adaptive learning
- `lib/learn/grammar-performance.ts` - Grammar tracking
- `lib/learn/dialogue-review.ts` - Dialogue practice

### Database
- Added `GrammarPerformance` table for tracking user performance

### Parity
- Full Android ↔ PWA feature parity maintained
