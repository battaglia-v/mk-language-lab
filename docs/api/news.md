# `/api/news`

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Aggregates RSS feeds from Macedonian news sources (currently Time.mk and Meta.mk), normalizes article metadata, resolves redirects, and enriches previews for use in the localized library experience.

## Endpoint

- **Method**: `GET`
- **Path**: `/api/news`
- **Authentication**: None (internal use only)
- **Revalidation**: 180 seconds (ISR hint)

## Query Parameters

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `source` | `string` | `all` | Limit to a specific source id (`time-mk`, `meta-mk`). |
| `limit` | `number` | `30` | Maximum number of items to return (1-50). |
| `q` | `string` | — | Filter items whose title or description matches (case-insensitive). |
| `videosOnly` | `boolean` | `false` | When `true`, return only items containing recognised video links. |

## Sample Request

```
GET /api/news?source=time-mk&limit=10
```

## Sample Response

```json
{
  "items": [
    {
      "id": "c9d8b6...",
      "title": "Најнови вести",
      "link": "https://example.com/article",
      "description": "Краток преглед на статијата...",
      "publishedAt": "2025-10-25T11:30:00.000Z",
      "sourceId": "time-mk",
      "sourceName": "Time.mk",
      "categories": ["политика"],
      "videos": [],
      "image": "https://example.com/cover.jpg"
    }
  ],
  "meta": {
    "count": 10,
    "total": 24,
    "fetchedAt": "2025-10-27T10:05:13.912Z",
    "errors": []
  },
  "sources": [
    {
      "id": "time-mk",
      "name": "Time.mk",
      "feedUrl": "https://time.mk/rss/all",
      "homepage": "https://time.mk"
    }
  ]
}
```

## Error Responses

- `400` — Invalid `source` parameter.
- `502` — Upstream feed failure (fallback items may still be returned).
- `500` — Unexpected parsing or network failure.

## Dependencies

- **External**: Time.mk RSS, Meta.mk RSS, open web pages (for preview enrichment).
- **Environment**: None required; requests use a custom user agent.

## Operational Notes

- Link resolution and preview fetching use in-memory caches (5-minute TTL) with concurrency controls.
- Requests abort after 8 seconds to protect the runtime.
- Fallback articles ensure the UI renders even when both feeds fail.
