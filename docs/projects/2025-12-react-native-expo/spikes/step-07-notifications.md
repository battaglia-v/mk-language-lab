# Step 07 Spike – Notifications & Mission Reminders

**Goal:** Define the notification architecture (permissions, push token plumbing, reminder scheduling) so we can implement Step 7 immediately after the Tamagui + gesture work lands.

## 1. Library Stack

| Concern | Decision | Notes |
| --- | --- | --- |
| Push registration | `expo-notifications` + `expo-device` | Already supported in managed workflow. Requires native credentials once we move past Expo Go. |
| Background tasks | `expo-task-manager` + `expo-background-fetch` (optional) | For refreshing streak deadlines or syncing pending reminders after reconnect. |
| Server storage | Reuse existing Next.js API (`/api/mobile/push-tokens` TBD) backed by Prisma; store `{ userId, pushToken, platform }`. | Need to update backend schema (documented below). |

## 2. Client Flow

1. **Permissions screen** – when the user finishes onboarding or visits mission settings:
   - Check `await Notifications.getPermissionsAsync()`.
   - If not granted, call `Notifications.requestPermissionsAsync()` and explain benefits (streak rescue, mission reminders).
2. **Token registration**:
   - Use `Notifications.getExpoPushTokenAsync({ projectId })`.
   - POST to backend with auth token. Include app version + locale for troubleshooting.
3. **Local reminders**:
   - Allow user to choose preferred reminder windows (e.g., 11:00 + 20:00 local time).
   - Schedule via `Notifications.scheduleNotificationAsync` with `trigger` = time + repeats daily.
   - Persist chosen windows in `AsyncStorage` + user profile for multi-device parity later.
4. **Remote (server-driven) reminders**:
   - Backend cron evaluates mission status and sends targeted Expo push messages (payload contains mission summary + deep link, e.g., `mkll://practice/quick`).
   - Document required payload contract (`type`, `title`, `body`, `deeplink`).

## 3. Backend Touchpoints

Add doc (`mission-api.md`) updates:
- `POST /api/mobile/push-token`
  - Body: `{ expoPushToken, platform, appVersion, reminderWindows }`.
  - Returns success + next reminder timestamp.
- Cron job (worker) queries tokens where streak risk or mission incomplete; publishes to Expo Push API.

Future enhancement: store notification delivery receipts to prune invalid tokens.

## 4. Testing Strategy

- **Local:** Run `expo run:ios --device` / `expo run:android` with sandbox credentials to ensure push tokens generate correctly.
- **Automation:** Minimal automated coverage (permissions + scheduling) via Jest mock for `expo-notifications`.
- **Manual checklist (to log in notes):**
  1. Request permissions.
  2. Toggle reminder window in settings; verify scheduled notifications appear via `Notifications.getAllScheduledNotificationsAsync()`.
  3. Simulate server push by calling backend endpoint with Expo token; confirm deeplink opens Practice tab.

## 5. Outstanding Questions

- Do we need localization for reminder copy? (Likely yes; rely on `messages/*.json`.)
- Should reminder windows sync across devices immediately? (For MVP we can keep device-local, but include field in POST payload for future use.)
- Will we throttle push notifications during Do Not Disturb hours? (Add TODO for future feature flag.)

## 6. Implementation Checklist

1. Create `apps/mobile/lib/notifications/`:
   - `permissions.ts` (`requestNotificationPermission` helper).
   - `useNotificationSettings.ts` (React hook storing reminder windows).
   - `registerPushToken.ts` (POST helper with retries).
2. Update `apps/mobile/app/_layout.tsx`:
   - Add `NotificationProvider` to expose settings/context app-wide.
3. UI entry points:
   - Mission settings modal (Step 3) gets toggles for reminders + call to `scheduleReminder`.
   - Onboarding step offering optional opt-in.
4. Backend contract doc + change log updates.

With this spike, Step 7 work can start immediately once UI polish is ready. The only blocking dependency left is backend endpoint scaffolding, which we’ve documented for the platform team.
