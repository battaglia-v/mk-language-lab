# Mission Status API Contract (Draft – 2025-11-12)

Purpose: provide a single API that powers both the web dashboard and Expo Home mission hero components. This draft keeps parity with the UX brief in `2025-12-mobile-ui-overhaul.md` and the analytics events already recorded in Quick Practice.

## Endpoint
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

## Mobile Push Token Endpoint (Draft – 2025-11-13)
- `POST /api/mobile/push-token`
- Auth: learner session (same requirements as `/api/missions/current`).

### Request Body
```jsonc
{
  "expoPushToken": "ExponentPushToken[sample]",
  "platform": "ios",                  // ios | android
  "appVersion": "1.0.0",
  "reminderWindows": ["morning", "evening"],
  "locale": "en-US",
  "timezone": "America/Los_Angeles"
}
```

### Response
- `201` with `{ "ok": true, "nextReminderAt": "2025-11-14T07:30:00Z" }` when persisted.
- `400` for malformed payloads.
- `401` if the learner session is missing/invalid.

### Storage Notes
- Persist tokens in Prisma (new `MobilePushToken` table) with `{ userId, expoPushToken, platform, locale, timezone, reminderWindows, appVersion, updatedAt }`.
- When Expo responds with a DeviceNotRegistered error, mark the row as `revokedAt` to prevent future sends.
- Cron job enumerates rows where streak is at risk or reminder windows align with “now”, batches payloads, and calls the Expo Push API.

### Outstanding Work
- Add the Prisma model + API route implementation.
- Hook the cron job into the existing worker queue once backend bandwidth frees up.

---

## Mobile Push Token Endpoint (Draft)
- `POST /api/mobile/push-token`
- Auth: learner session header (same as mission API) once auth lands. For now the Expo client only calls this when `EXPO_PUBLIC_API_BASE_URL` is configured.

### Request Body
```jsonc
{
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxx]",
  "platform": "ios",               // ios | android
  "appVersion": "1.0.0",
  "reminderWindows": ["morning", "evening"]
}
```

### Response
- `200 OK` with `{ "nextReminderAt": "2025-11-14T20:00:00Z" }` (optional metadata for the client).
- Non-200 responses should include `{ "error": "..." }` and the client will log + retry later.

### Notes
- Backend stores `{ userId, expoPushToken, platform, reminderWindows, locale }`.
- Cron workers evaluate streak risk and send Expo push payloads shaped as `{ type: 'mission-reminder', title, body, deeplink }`.
- When reminder windows are empty, backend should treat it as an opt-out and delete the token.
