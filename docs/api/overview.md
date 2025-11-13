# API Overview

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Македонски • MK Language Lab exposes a small set of Next.js App Router handlers under `app/api/`. These routes power translation utilities, tutor chat, content news feeds, and persistent task boards. All endpoints return JSON and are scoped to internal clients.

| Route | Method(s) | Purpose |
| --- | --- | --- |
| `/api/news` | `GET` | Aggregate Macedonian news articles and normalize media for the library experience. |
| `/api/tasks` | `GET`, `POST` | Persist learner task boards for authenticated users; offer localStorage fallback guidance for guests. |
| `/api/translate` | `POST` | Translate text between English and Macedonian using Google Translate with HTTP fallback. |
| `/api/translate/detect` | `POST` | Detect incoming text language leveraging Google Translate or a heuristic fallback. |
| `/api/tutor` | `POST` | Generate Macedonian tutor responses via OpenAI, enriched with journey context. |

## Common Conventions

- Responses follow `application/json` and wrap errors as `{ error: string, details?: string }`.
- Environment variables drive third-party integrations (`GOOGLE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `OPENAI_API_KEY`).
- Each route should log operational failures to the server console; production monitoring will aggregate these logs.
- Rate limiting is currently handled at the platform level (Vercel). Future work should add per-route guards as usage grows.

Refer to individual route documentation for schemas, examples, and error handling details.
