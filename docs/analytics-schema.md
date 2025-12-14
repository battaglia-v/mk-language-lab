# MK Language Lab — Analytics Event Schema & KPIs

## Overview

This document defines the complete analytics event taxonomy, JSON schema for event payloads, and Key Performance Indicators (KPIs) for measuring product success.

**Last Updated:** December 2024  
**Owner:** Product/Engineering  
**Review Cycle:** Quarterly

---

## Event Categories

| Category | Purpose | Priority |
|----------|---------|----------|
| Learning | Track lesson & practice engagement | P0 |
| Engagement | Measure streaks, goals, retention | P0 |
| Content | Reader, News, Translation usage | P1 |
| Gamification | XP, badges, leagues | P1 |
| Performance | App speed, errors | P1 |
| Experimentation | A/B tests | P2 |

---

## JSON Event Schema

### Base Event Structure

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MK Language Lab Analytics Event",
  "type": "object",
  "required": ["eventName", "eventData", "timestamp"],
  "properties": {
    "eventName": {
      "type": "string",
      "description": "Unique event identifier (snake_case)"
    },
    "eventData": {
      "type": "object",
      "description": "Event-specific payload"
    },
    "timestamp": {
      "type": "number",
      "description": "Unix timestamp in milliseconds"
    },
    "userId": {
      "type": ["string", "null"],
      "description": "Authenticated user ID or null"
    },
    "sessionId": {
      "type": "string",
      "description": "Unique session identifier"
    },
    "deviceType": {
      "type": "string",
      "enum": ["desktop", "mobile", "tablet"]
    },
    "locale": {
      "type": "string",
      "enum": ["en", "mk"]
    },
    "appVersion": {
      "type": "string",
      "description": "Semantic version of the app"
    }
  }
}
```

---

## Learning Events

### lesson_start

Fired when a user begins a lesson.

```json
{
  "eventName": "lesson_start",
  "eventData": {
    "lessonId": "vocab-greetings-01",
    "lessonType": "vocabulary",
    "level": "A1",
    "deckId": "starter-deck",
    "isReview": false,
    "cardCount": 8,
    "estimatedMinutes": 2
  },
  "timestamp": 1702500000000,
  "userId": "user_abc123",
  "sessionId": "sess_xyz789",
  "deviceType": "mobile",
  "locale": "en"
}
```

### lesson_complete

Fired when a user finishes a lesson.

```json
{
  "eventName": "lesson_complete",
  "eventData": {
    "lessonId": "vocab-greetings-01",
    "lessonType": "vocabulary",
    "durationSeconds": 95,
    "xpEarned": 25,
    "accuracy": 87.5,
    "cardsCompleted": 8,
    "mistakeCount": 1,
    "perfectSession": false,
    "wordsLearned": 5,
    "wordsMastered": 3
  },
  "timestamp": 1702500095000
}
```

### lesson_abandon

Fired when a user exits a lesson before completion.

```json
{
  "eventName": "lesson_abandon",
  "eventData": {
    "lessonId": "vocab-greetings-01",
    "lessonType": "vocabulary",
    "durationSeconds": 45,
    "progressPercent": 50,
    "lastQuestionIndex": 4,
    "abandonReason": "navigation"
  },
  "timestamp": 1702500045000
}
```

### question_answer

Fired for each question answered in a lesson.

```json
{
  "eventName": "question_answer",
  "eventData": {
    "lessonId": "vocab-greetings-01",
    "questionId": "q_zdravo_01",
    "questionType": "multiple_choice",
    "wordId": "word_zdravo",
    "isCorrect": true,
    "responseTimeMs": 2340,
    "attemptNumber": 1,
    "usedHint": false,
    "masteryBefore": 25,
    "masteryAfter": 40
  },
  "timestamp": 1702500020000
}
```

---

## Practice Events

### practice_session_start

```json
{
  "eventName": "practice_session_start",
  "eventData": {
    "practiceType": "flashcard",
    "deckId": "custom-deck-123",
    "deckName": "My Food Words",
    "category": "vocabulary",
    "difficulty": "casual",
    "targetQuestions": 10,
    "dueCards": 15
  },
  "timestamp": 1702500000000
}
```

### practice_session_complete

```json
{
  "eventName": "practice_session_complete",
  "eventData": {
    "practiceType": "flashcard",
    "deckId": "custom-deck-123",
    "durationSeconds": 180,
    "questionsAnswered": 10,
    "correctAnswers": 8,
    "accuracy": 80,
    "xpEarned": 30,
    "streakLength": 5,
    "bonusesEarned": ["speed_bonus", "accuracy_bonus"],
    "masteredCards": 3,
    "reviewScheduled": 7
  },
  "timestamp": 1702500180000
}
```

### flashcard_review

Individual card review for SRS tracking.

```json
{
  "eventName": "flashcard_review",
  "eventData": {
    "cardId": "card_zdravo",
    "deckId": "starter-deck",
    "wordId": "word_zdravo",
    "rating": 4,
    "responseTimeMs": 1800,
    "previousMastery": 50,
    "newMastery": 62,
    "previousInterval": 3,
    "newInterval": 7,
    "easeFactor": 2.1
  },
  "timestamp": 1702500030000
}
```

---

## Reader Events

### reader_open

```json
{
  "eventName": "reader_open",
  "eventData": {
    "textId": "story-family-01",
    "textTitle": "Моето семејство",
    "level": "A1",
    "category": "graded-reader",
    "wordCount": 150,
    "sentenceCount": 12,
    "isNewText": true,
    "source": "curated"
  },
  "timestamp": 1702500000000
}
```

### reader_sentence_view

```json
{
  "eventName": "reader_sentence_view",
  "eventData": {
    "textId": "story-family-01",
    "sentenceIndex": 3,
    "sentenceText": "Имам еден брат.",
    "timeOnSentenceMs": 4500,
    "showedTranslation": true,
    "playedAudio": true,
    "wordsClicked": ["брат"],
    "savedWords": ["брат"]
  },
  "timestamp": 1702500045000
}
```

### reader_word_tap

```json
{
  "eventName": "reader_word_tap",
  "eventData": {
    "textId": "story-family-01",
    "wordId": "word_brat",
    "word": "брат",
    "translation": "brother",
    "partOfSpeech": "noun",
    "addedToDeck": true,
    "playedAudio": true
  },
  "timestamp": 1702500050000
}
```

### reader_complete

```json
{
  "eventName": "reader_complete",
  "eventData": {
    "textId": "story-family-01",
    "level": "A1",
    "totalTimeSeconds": 300,
    "sentencesRead": 12,
    "wordsSaved": 5,
    "audioPlaysCount": 8,
    "translationsViewed": 10,
    "xpEarned": 20,
    "comprehensionScore": 90
  },
  "timestamp": 1702500300000
}
```

---

## News Events

### news_page_view

```json
{
  "eventName": "news_page_view",
  "eventData": {
    "source": "all",
    "articleCount": 24,
    "hasVideoFilter": false,
    "searchQuery": null
  },
  "timestamp": 1702500000000
}
```

### news_article_click

```json
{
  "eventName": "news_article_click",
  "eventData": {
    "articleId": "article_123",
    "source": "time-mk",
    "title": "Нов закон за образование",
    "hasVideo": false,
    "categories": ["politics", "education"],
    "position": 3
  },
  "timestamp": 1702500010000
}
```

### news_filter_change

```json
{
  "eventName": "news_filter_change",
  "eventData": {
    "filterType": "source",
    "previousValue": "all",
    "newValue": "time-mk"
  },
  "timestamp": 1702500005000
}
```

---

## Gamification Events

### streak_update

```json
{
  "eventName": "streak_update",
  "eventData": {
    "previousStreak": 6,
    "newStreak": 7,
    "action": "extended",
    "usedFreeze": false,
    "streakMilestone": 7,
    "longestStreak": 14
  },
  "timestamp": 1702500000000
}
```

### xp_earned

```json
{
  "eventName": "xp_earned",
  "eventData": {
    "amount": 25,
    "source": "lesson",
    "sourceId": "vocab-greetings-01",
    "bonusMultiplier": 1.5,
    "bonusReason": "streak_bonus",
    "totalXP": 1250,
    "dailyXP": 45,
    "dailyGoal": 50,
    "dailyGoalProgress": 90,
    "dailyGoalReached": false
  },
  "timestamp": 1702500095000
}
```

### daily_goal_complete

```json
{
  "eventName": "daily_goal_complete",
  "eventData": {
    "xpEarned": 50,
    "xpGoal": 50,
    "timeToCompleteMinutes": 12,
    "activitiesCount": 2,
    "activityTypes": ["lesson", "practice"],
    "streakLength": 7,
    "isFirstGoalEver": false
  },
  "timestamp": 1702500720000
}
```

### badge_earned

```json
{
  "eventName": "badge_earned",
  "eventData": {
    "badgeId": "streak_7_days",
    "badgeName": "Week Warrior",
    "badgeType": "streak",
    "badgeTier": "bronze",
    "triggeredBy": "streak_update",
    "totalBadges": 5
  },
  "timestamp": 1702500000000
}
```

---

## Translation Events

### translation_request

```json
{
  "eventName": "translation_request",
  "eventData": {
    "direction": "en_to_mk",
    "sourceLength": 45,
    "sourceWordCount": 8,
    "translationType": "text",
    "responseTimeMs": 850,
    "success": true
  },
  "timestamp": 1702500000000
}
```

### translation_save

```json
{
  "eventName": "translation_save",
  "eventData": {
    "direction": "en_to_mk",
    "wordCount": 1,
    "sourceText": "brother",
    "targetText": "брат",
    "category": "family",
    "deckId": "quick-save"
  },
  "timestamp": 1702500010000
}
```

---

## Key Performance Indicators (KPIs)

### Engagement KPIs (P0)

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| **DAU** | Daily Active Users (unique users with ≥1 lesson/practice) | +10% MoM | Daily |
| **WAU** | Weekly Active Users | +8% MoM | Weekly |
| **D1 Retention** | % users returning Day 1 after signup | ≥40% | Daily |
| **D7 Retention** | % users returning Day 7 | ≥25% | Weekly |
| **D30 Retention** | % users returning Day 30 | ≥15% | Monthly |
| **Streak Rate** | % DAU with active streak | ≥60% | Daily |
| **Avg Streak Length** | Mean streak days for active users | ≥7 days | Weekly |

### Learning KPIs (P0)

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| **Lessons/Day/User** | Average lessons completed per active user | ≥1.5 | Daily |
| **Daily Goal Completion** | % of users hitting XP goal | ≥70% | Daily |
| **Lesson Completion Rate** | % lessons started that are completed | ≥85% | Daily |
| **Accuracy Rate** | Average correct answers per lesson | ≥75% | Daily |
| **Words Mastered** | Words reaching ≥90% mastery score | +50/week avg | Weekly |
| **SRS Compliance** | % of due cards reviewed | ≥80% | Daily |

### Content Engagement KPIs (P1)

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| **Reader Opens** | Sessions starting Reader | +15% MoM | Weekly |
| **Reader Completion** | % texts read to completion | ≥60% | Weekly |
| **News Clicks** | Articles opened from News | Baseline | Weekly |
| **Words Saved** | Total vocabulary saves | +20% MoM | Weekly |
| **Translation Requests** | API calls to translate | Baseline | Weekly |

### Quality KPIs (P1)

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| **Error Rate** | % sessions with JS errors | <1% | Daily |
| **Page Load Time** | P95 initial page load | <2s | Daily |
| **API Latency** | P95 API response time | <500ms | Daily |
| **Audio Load Success** | % TTS requests successful | ≥98% | Daily |
| **Image Proxy Success** | % news images loaded | ≥95% | Daily |

---

## Dashboard Queries

### Daily Engagement Summary

```sql
SELECT
  DATE(timestamp) as date,
  COUNT(DISTINCT userId) as dau,
  COUNT(CASE WHEN eventName = 'lesson_complete' THEN 1 END) as lessons_completed,
  COUNT(CASE WHEN eventName = 'daily_goal_complete' THEN 1 END) as goals_achieved,
  AVG(CASE WHEN eventName = 'lesson_complete' 
      THEN eventData.accuracy END) as avg_accuracy,
  SUM(CASE WHEN eventName = 'xp_earned' 
      THEN eventData.amount END) as total_xp
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Streak Health Check

```sql
SELECT
  streakBucket,
  COUNT(*) as users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
  SELECT 
    userId,
    CASE 
      WHEN MAX(eventData.newStreak) = 0 THEN 'No streak'
      WHEN MAX(eventData.newStreak) BETWEEN 1 AND 6 THEN '1-6 days'
      WHEN MAX(eventData.newStreak) BETWEEN 7 AND 29 THEN '7-29 days'
      WHEN MAX(eventData.newStreak) >= 30 THEN '30+ days'
    END as streakBucket
  FROM analytics_events
  WHERE eventName = 'streak_update'
    AND timestamp >= NOW() - INTERVAL '1 day'
  GROUP BY userId
) streaks
GROUP BY streakBucket;
```

### Lesson Funnel

```sql
WITH funnel AS (
  SELECT
    COUNT(DISTINCT CASE WHEN eventName = 'lesson_start' THEN sessionId END) as started,
    COUNT(DISTINCT CASE WHEN eventName = 'lesson_complete' THEN sessionId END) as completed,
    COUNT(DISTINCT CASE WHEN eventName = 'lesson_abandon' THEN sessionId END) as abandoned
  FROM analytics_events
  WHERE timestamp >= NOW() - INTERVAL '7 days'
)
SELECT
  started,
  completed,
  abandoned,
  ROUND(100.0 * completed / NULLIF(started, 0), 2) as completion_rate,
  ROUND(100.0 * abandoned / NULLIF(started, 0), 2) as abandon_rate
FROM funnel;
```

---

## Implementation Notes

1. **Event Batching**: Client batches events and sends every 30s or on page unload
2. **Offline Support**: Events queue in IndexedDB, sync when online
3. **PII Handling**: Never log actual translations/text, only metadata
4. **Sampling**: High-volume events (question_answer) sample at 10% after MVP
5. **Validation**: All events validated against schema before ingestion

---

## Related Documents

- [types/analytics.ts](../types/analytics.ts) — TypeScript type definitions
- [lib/analytics.ts](../lib/analytics.ts) — Client-side tracking implementation
- [docs/architecture.md](./architecture.md) — System architecture
