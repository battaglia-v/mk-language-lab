# News Images Decision

**Date:** December 17, 2024
**Decision:** Option A - Keep Time.mk with consistent placeholders

## Background

Time.mk aggregates Macedonian news and is valuable for reading practice. However, their image URLs often fail to load due to:
1. Hot-linking protection
2. CORS restrictions
3. Unpredictable CDN paths

## Options Evaluated

### Option A: Keep Time.mk, never attempt thumbnails (CHOSEN)
- **Pros:** Fastest to implement, consistent UX, no broken images
- **Cons:** No thumbnails for Time.mk articles
- **Implementation:** Add Time.mk to BLOCKED_THUMBNAIL_SOURCES in ProxiedNewsImage

### Option B: Real image proxy + og:image extraction
- **Pros:** Would get real thumbnails
- **Cons:** Complex, requires server-side HTML parsing, Time.mk may still block
- **Risk:** High maintenance burden for marginal benefit

### Option C: Remove Time.mk entirely
- **Pros:** Clean UX with working images from other sources
- **Cons:** Lose valuable Macedonian news content

## Decision Rationale

Option A chosen because:
1. Time.mk content is valuable for language learning
2. Consistent placeholders are better UX than broken images
3. Implementation is simple and reliable
4. Other sources (meta.mk, sdk.mk) can still show thumbnails

## Implementation

Already implemented in `components/news/ProxiedNewsImage.tsx`:

```typescript
const BLOCKED_THUMBNAIL_SOURCES = ['time.mk', 'time.news.mk'];
```

This ensures Time.mk articles always show a consistent placeholder immediately, without attempting (and failing) thumbnail loads.

## Acceptance Criteria

- [x] No broken image icons appear on News page
- [x] Time.mk articles show placeholder immediately (no loading spinner)
- [x] Other sources still attempt thumbnails with fallback
- [x] Placeholder is visually consistent (Newspaper icon + gradient)

## Future Considerations

If Time.mk becomes critical:
1. Consider server-side RSS parsing to extract image URLs at source
2. Build a dedicated image caching layer
3. Partner with Time.mk for API access
