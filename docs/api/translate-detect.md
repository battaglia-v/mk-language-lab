# `/api/translate/detect`

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Detects the language of submitted text for translator UX flows. Uses Google Cloud Translate when credentials are available and falls back to a heuristic Cyrillic detector otherwise.

## Endpoint

- **Method**: `POST`
- **Authentication**: None (internal use only)

## Request Body

```json
{
  "text": "Добро утро"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Non-empty string. |

## Success Responses

### Google Translate Configured
```json
{
  "language": "mk",
  "confidence": 0.92
}
```

### Heuristic Fallback
```json
{
  "language": "mk",
  "mock": true,
  "message": "Using mock language detection. Configure GOOGLE_APPLICATION_CREDENTIALS for accurate detection."
}
```

## Error Responses

| Status | Condition |
| --- | --- |
| `400` | Missing `text` field. |
| `500` | SDK or heuristic failure. |

## Dependencies

- **Primary**: `@google-cloud/translate` v2 client (`GOOGLE_PROJECT_ID` + credentials).
- **Fallback**: Unicode range check for Cyrillic characters.

## Operational Notes

- Instantiate the Translate client only when credentials are present to keep edge deployments lean.
- Consider enhancing the fallback with a more nuanced language model if the mock path remains long-term.
