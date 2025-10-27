# Tutor Chat Roadmap

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

## Objectives
- Restore a conversational tutor that adapts to each learner's active journey while the backend matures.
- Ensure every exchange is grounded in practice data so replies stay actionable.
- Capture enough telemetry to reinforce streaks, surface recommended drills, and iterate on prompt engineering.

## Context Inputs For Responses
- **Active journey**: `useActiveJourney()` for journey id, slug, and recommended practice cards.
- **Progress signals**: `useJourneyProgress()` for `stepsThisWeek`, `lastSessionIso`, `totalSessions`.
- **Practice inventory**: `JOURNEY_PRACTICE_CONTENT` for phrases, drills, and translator snippets keyed by journey and modality.
- **Tasks board**: lean read-only view of `Board.columns` to suggest existing to-dos (future enhancement once task saving returns).
- **Resource library**: latest spotlight items and saved resources (post-MVP).

## Data Model Additions (Prisma)
```prisma
model TutorSession {
  id             String        @id @default(cuid())
  userId         String?
  journeyId      String?
  starterPrompt  String?
  summary        String?
  intentCounts   Json?
  startedAt      DateTime      @default(now())
  endedAt        DateTime?
  messageCount   Int           @default(0)
  contextSnapshot Json?        // cached journey + progress data used in first response
  messages       TutorMessage[]
  user           User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model TutorMessage {
  id          String   @id @default(cuid())
  sessionId   String
  role        String
  content     String
  intent      String?
  createdAt   DateTime @default(now())
  latencyMs   Int?
  session     TutorSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

Store `intentCounts` as a map (`{"plan":2,"grammar":1}`) so analytics remains flexible. `contextSnapshot` caches the journey/practice inputs that seeded the conversation for debugging.

## API Contract (`POST /api/tutor`)
**Request payload**
```jsonc
{
  "sessionId": "optional-existing-session",
  "messages": [
    { "role": "user", "content": "" },
    { "role": "assistant", "content": "" }
  ],
  "activeJourney": "family",
  "journeyProgress": {
    "stepsThisWeek": 3,
    "totalSessions": 7,
    "lastSessionIso": "2025-10-18T15:04:05.000Z"
  }
}
```
- When `sessionId` is omitted, the server creates a new session, stores the first user message, and returns the new id.
- While accounts are optional, `userId` can be null – we stitch sessions to a hashed device fingerprint later if needed.

**Response payload**
```jsonc
{
  "sessionId": "new-or-existing",
  "message": "assistant reply",
  "starterPrompts": [
    { "id": "family-warmup", "label": "Warm up for a family chat", "prompt": "..." }
  ],
  "context": {
    "journeyId": "family",
    "stepsThisWeek": 3,
    "recommendedCard": "phrases-warmup"
  }
}
```
- Mirror `starterPrompts` so the client can refresh suggestions at the top of the log.
- Include `context` primarily for debugging/logging in development aka what the server actually used.

## Logging Flow
1. Normalize payload → drop invalid messages.
2. Fetch/prime journey context (`buildJourneyTutorPrompt`).
3. Call OpenAI (or mock) with system + chat history.
4. Persist:
   - `TutorMessage` for the user prompt (if new) and assistant reply.
   - Upsert `TutorSession` statistics (`messageCount += 2`, `intentCounts`, potential `endedAt` flag if `end` intent).
5. Return reply plus updated metadata.

Latency is recorded by measuring the round-trip to OpenAI. Once streaming arrives, we will convert `latencyMs` into per-chunk metrics.

## Starter Prompt Strategy
- Start with three prompts:
  1. Journey-specific warm-up drawn from `JOURNEY_PRACTICE_CONTENT[journey].phrases`
  2. A grammar check-in referencing `journeyProgress.stepsThisWeek`
  3. A fallback “help me plan next steps” prompt (always available)
- If no active journey, swap warm-up for general Macedonian conversation practice.
- After each assistant reply, recompute prompts using recent intents to avoid repetition. Cache them per session to minimize churn when the user scrolls.

## Frontend Sketch
1. **Header card** (already live) continues to show coming-soon badge until chat toggled on.
2. **Conversation log** (new) wraps the existing design: sticky starter prompt tray, streaming replies, summary banner when session closes.
3. **Session tray** in the sidebar lists last three sessions (if/when account support returns) using the `summary` field.
4. UI should gracefully degrade to the static card when the API returns `mock: true` (no API key) – we reuse the existing “coming soon” copy.

## Phased Rollout
1. **Infra**: Add Prisma models, generate types, seed mock data for development.
2. **API update**: Implement logging + prompt generation without exposing UI.
3. **Client beta**: Hide behind feature flag (`NEXT_PUBLIC_ENABLE_TUTOR_CHAT`) while we QA interactions.
4. **General release**: Turn off placeholder card and restore chat UI with telemetry dashboards (Grafana/Logflare optional).

## Open Questions
- How do we identify users without auth? Proposal: browser-stored anonymous id tied to `TutorSession.anonymousId` (add later).
- Do we need rate limiting per session? Consider simple in-memory guard once streaming is live.
- Should summaries be generated lazily (cron) or inline after `endedAt`? Likely inline once we integrate GPT-4o mini summaries.

## Immediate Next Tasks
- [ ] Update Prisma schema + regenerate client.
- [ ] Extend `/api/tutor` to honor the contract and save sessions/messages.
- [ ] Build starter prompt generator (`lib/tutor-prompts.ts`).
- [ ] Reintroduce chat UI with feature flag and hook up logging payload.
- [ ] Write end-to-end smoke test ensuring a new session returns a prompt set and persists to SQLite.
