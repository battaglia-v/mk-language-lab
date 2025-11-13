# Mission Status & Mobile Push API Contracts

Purpose: provide a single API that powers both the web dashboard and Expo Home mission hero components. This draft keeps parity with the UX brief in `2025-12-mobile-ui-overhaul.md` and the analytics events already recorded in Quick Practice.

## Mission Status Endpoint
- `GET /api/missions/current`
- Auth: requires authenticated learner session (NextAuth). Anonymous requests return `401`.

## Response Shape
```jsonc
{
  "missionId": "streak-saver-q4",
  "name": "Streak Saver",
  "cycle": {
    "type": "daily",             // daily | weekly | quest
    "endsAt": "2025-11-13T05:00:00Z"
  },
  "xp": {
    "earned": 320,
    "target": 450
  },
  "streakDays": 7,
  "heartsRemaining": 4,
  "translatorDirection": "Mk → En",
  "checklist": [
    {
      "id": "quick-practice",
      "label": "Finish Quick Practice",
      "status": "completed"      // pending | in_progress | completed
    },
    {
      "id": "translator-review",
      "label": "Review translator inbox",
      "status": "pending"
    }
  ],
  "coachTips": [
    {
      "id": "coach-voice",
      "title": "Coach Jana",
      "body": "Record yourself saying today’s phrases and compare with the native clip.",
      "tag": "Speaking"
    }
  ],
  "reviewClusters": [
    {
      "id": "market",
      "label": "Market phrases",
      "accuracy": 0.62
    }
  ],
  "communityHighlights": [
    {
      "id": "streak",
      "title": "Ana kept a 21-day streak!",
      "detail": "Send congrats",
      "accent": "gold"
    }
  ],
  "links": {
    "practice": "/practice?focus=quick",
    "translatorInbox": "/translator/history",
    "settings": "/practice/settings"
  }
}
```

### Notes
- `accuracy` values are normalized (0–1) to keep future gauges easy; UI can multiply by 100.
- `links` are optional, but including them allows deep-linking from mobile/web.
- `coachTips`, `reviewClusters`, and `communityHighlights` are capped at 3 items each in the UI; backend can send fewer/more.

### Implementation (2025-11-14)
- `/api/missions/current` now aggregates Prisma `GameProgress`, `JourneyProgress`, `UserLessonProgress`, and recent `ExerciseAttempt` rows to build the payload above. The route requires an authenticated session and responds with `x-mission-source=prisma` (or `fallback`) so QA can confirm whether the JSON fixture was used.
- `/api/profile/summary` pulls the same Prisma sources to hydrate XP/streak/quest/badge stats, while `/api/discover/feed` is backed by saved modules/lessons and the upcoming Word Lab schedule until the CMS feed lands.
- The mission and profile responses inherit learner-specific IDs and timestamps directly from Prisma so reminder analytics can trust the data. JSON fixtures remain for offline/dev mode only.

## Error Responses
| Status | Payload example | Notes |
| --- | --- | --- |
| 401 | `{ "error": "unauthorized" }` | User not signed in / token invalid. |
| 429 | `{ "error": "rate_limited", "retryAfter": 30 }` | Propagate Upstash limiter data. |
| 500 | `{ "error": "unavailable" }` | Surface generic fallback; client should show cached mission if available. |

## Caching & Revalidation
- Short-term cache (60s) is fine; missions change slowly.
- Clients should store the last payload and surface it if fetch fails (showing `links` as disabled if they require network).

## Analytics
- When the API returns `missionId`, the Home hero should include it in existing analytics events (e.g., `MISSION_CONTINUE`, `MISSION_SETTINGS_OPENED`) to keep dashboards consistent. New events will be defined once the client wiring lands.

## Mobile Push Token Endpoint (Live – 2025-11-13)
- `POST /api/mobile/push-token`
- Auth: learner session header (same as `/api/missions/current`). (Expo clients will call this once auth lands; local dev can still hit it by running the Next app in the same session.)

### Request Body
```jsonc
{
  "expoPushToken": "ExponentPushToken[sample]",
  "platform": "ios",                  // ios | android
  "appVersion": "1.0.0",
  "reminderWindows": ["midday", "evening"],
  "locale": "en-US",
  "timezone": "America/Los_Angeles"
}
```

### Response
- `200 OK` with `{ "success": true, "reminderWindows": ["midday"], "nextReminderAt": "2025-11-15T19:00:00.000Z" }`.
- `400` for malformed payloads.
- `200 OK` with `{ "ok": true, "reminderWindows": [], "nextReminderAt": null }` when the learner clears all windows (effectively an opt-out).

### Storage Notes
- Persist tokens in Prisma (`MobilePushToken` model) with `{ userId?, expoPushToken, platform, locale, timezone, reminderWindows, appVersion, lastSuccessfulSync, lastReminderSentAt, lastReminderWindowId, revokedAt }`.
- When Expo responds with a `DeviceNotRegistered` error, mark the row as `revokedAt` to prevent future sends.
- Cron job enumerates rows where streak is at risk or reminder windows align with “now”, batches payloads, and calls the Expo Push API (`deeplink = mkll://practice/quick`).

### Implementation Notes
- Prisma model lives at `prisma/schema.prisma` (added `timezone` + reminders metadata) with helpers/tests under `lib/mobile-reminders.{ts,test.ts}`.
- API handler is `app/api/mobile/push-token/route.ts` (zod validation + Prisma upsert + reminder window dedupe + `nextReminderAt` computation). Requests accept anonymous calls today and automatically associate a `userId` when a session exists.
- Cron/device smoke testing remain TODOs once Expo auth lands (see `execution_steps.md` Step 8 follow-ups).

## Reminder Cron Endpoint
- `GET /api/cron/reminders`
- Auth: `Authorization: Bearer $CRON_SECRET` (mirrors the existing Google Sheets sync job).
- Schedule: run every 5 minutes via Vercel Cron or preferred scheduler.

### Behavior
1. Fetches all `MobilePushToken` rows where `revokedAt IS NULL` and `reminderWindows` is non-empty.
2. For each token, `getDueReminderWindow()` determines whether any window is within tolerance (default: 1 min early, 5 min late, 45 min minimum interval per window).
3. Batches due tokens into Expo push payloads (max 100 per request) and POSTs to `https://exp.host/--/api/v2/push/send`.
4. Updates `lastReminderWindowId` + `lastReminderSentAt` so subsequent cron runs skip duplicates.

### Env Vars
- `CRON_SECRET` – shared bearer token for cron invocations.
- `REMINDER_PAST_TOLERANCE_MINUTES` – optional override (default `5`).
- `REMINDER_FUTURE_TOLERANCE_MINUTES` – optional override (default `1`).
- `REMINDER_MIN_INTERVAL_MINUTES` – optional override (default `45`).

### TODO
- Hook the route to prod cron (Vercel or alternative) once Expo auth + device smoke tests pass.
- Extend logging/analytics + delivery receipts after initial rollout.
