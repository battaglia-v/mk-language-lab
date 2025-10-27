# `/api/tutor`

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Generates Macedonian tutoring responses via OpenAI, optionally enriched with active journey progress data. Returns mock guidance when OpenAI credentials are unavailable to keep the UI functional in development.

## Endpoint

- **Method**: `POST`
- **Authentication**: None (front-end only)

## Request Body

```json
{
  "messages": [
    { "role": "user", "content": "Помогни ми со родови" }
  ],
  "activeJourney": "family",
  "journeyProgress": {
    "stepsThisWeek": 3,
    "totalSessions": 12,
    "lastSessionIso": "2025-10-20T18:41:09.000Z"
  }
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `messages` | Array<{ role: `"user" \| "assistant"`, content: string }> | Yes | Filtered server-side to valid roles with non-empty content. |
| `activeJourney` | `string` | No | Must match a journey id defined in `data/journeys.ts` to inject context. |
| `journeyProgress` | `object` | No | Numeric fields coerced to non-negative integers; `lastSessionIso` validated when string. |

## Success Responses

### OpenAI Enabled
```json
{
  "message": "Секако! Ајде да зборуваме за граматичките родови...",
  "usage": {
    "prompt_tokens": 421,
    "completion_tokens": 187,
    "total_tokens": 608
  }
}
```

### Mock Mode
```json
{
  "message": "Mock Tutor Response: OpenAI is not configured...",
  "mock": true
}
```

## Error Responses

| Status | Condition |
| --- | --- |
| `400` | Missing or invalid `messages`. |
| `500` | OpenAI API failure or unexpected error. |

## Dependencies

- **OpenAI**: Requires `OPENAI_API_KEY`. Uses `gpt-4o-mini` with temperature 0.7 and 2k max tokens.
- **Journey Context**: `buildJourneyTutorPrompt`, `getJourneyDefinition`, and `use-active-journey` hooks rely on definitions from `data/journeys.ts` and `data/journey-practice-content.ts`.

## Operational Notes

- Add persistence to Prisma (`TutorSession`, `TutorMessage`) before GA launch to unlock analytics and history.
- Consider streaming responses for improved UX once API usage patterns stabilize.
- Log errors with sufficient detail to debug prompt issues without exposing sensitive learner data.
