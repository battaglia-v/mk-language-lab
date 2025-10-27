# `/api/translate`

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Translates text between Macedonian (`mk`) and English (`en`). Prefers the Google Cloud Translate SDK when credentials are configured, otherwise falls back to the public Google Translate HTTP endpoint.

## Endpoint

- **Method**: `POST`
- **Authentication**: None (internal use only)

## Request Body

```json
{
  "text": "Како си?",
  "sourceLang": "mk",
  "targetLang": "en"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Trimmed; max length 1,800 characters. |
| `sourceLang` | `"mk" \| "en"` | No | When omitted or unsupported, Google auto-detection is used. |
| `targetLang` | `"mk" \| "en"` | Yes | Must differ from `sourceLang`. |

## Success Response

```json
{
  "translatedText": "How are you?",
  "detectedSourceLang": "mk"
}
```

- `detectedSourceLang` is `null` when detection is unavailable (e.g., fallback path without explicit source).

## Error Responses

| Status | Condition |
| --- | --- |
| `400` | Missing text, unsupported target language, or identical source/target. |
| `413` | Text exceeds `MAX_CHARACTERS` (1,800). |
| `502` | Third-party translation failure (HTTP fallback). |
| `500` | Unexpected runtime error. |

## Dependencies

- **Primary**: `@google-cloud/translate` v2 client. Requires `GOOGLE_PROJECT_ID` and either `GOOGLE_APPLICATION_CREDENTIALS` (file path) or `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON/base64).
- **Fallback**: `https://translate.googleapis.com/translate_a/single` public endpoint.

## Operational Notes

- Translator client is memoized per runtime to avoid re-instantiation.
- Fallback path logs provider failures for easier debugging.
- Consider adding rate limiting if exposed beyond internal clients.
