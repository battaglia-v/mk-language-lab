# Reader Content Taxonomy

## Folder Structure

```
data/reader/
├── challenges/                    # Structured reading challenges with progression
│   └── 30-day-little-prince/      # The Little Prince 30-day challenge
├── conversations/                 # Short dialogues for practical situations
├── stories/                       # General reading content (narratives, articles)
└── samples/                       # DEPRECATED - remove after migration
```

## Category Definitions

### challenges/
Structured reading series with progression tracking. Content is meant to be completed in order.

**Characteristics:**
- Has `series` field in JSON
- Has `day` or sequential numbering
- Tagged with challenge identifier (e.g., `30-day-challenge`)
- Part of a learning path

**Current content:**
- 30-Day Little Prince (day01-day30-maliot-princ.json)

### conversations/
Short dialogues demonstrating practical language use in real situations.

**Characteristics:**
- Tagged with `dialogue` or `conversation`
- A1-A2 difficulty typical
- Focuses on practical vocabulary
- Short (< 5 min read)

**Current content:**
- cafe-conversation.json

### stories/
General reading content - narratives, articles, cultural content.

**Characteristics:**
- Standalone content (not part of a series)
- Various difficulty levels
- No specific progression requirements

**Current content:**
- day-in-skopje.json

## File Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| challenges | `{series-slug}/{dayNN}-{title-slug}.json` | `30-day-little-prince/day01-maliot-princ.json` |
| conversations | `{context-slug}.json` | `cafe-conversation.json` |
| stories | `{title-slug}.json` | `day-in-skopje.json` |

## Tag to Category Mapping

| Tag | Category |
|-----|----------|
| `30-day-challenge` | challenges/30-day-little-prince/ |
| `dialogue`, `conversation` | conversations/ |
| `narrative`, `story`, `article` | stories/ |

## Migration Checklist

- [ ] Create folder structure (05-01)
- [ ] Move 30 Little Prince files to challenges/30-day-little-prince/
- [ ] Move cafe-conversation.json to conversations/
- [ ] Move day-in-skopje.json to stories/
- [ ] Update lib/reader-samples.ts imports
- [ ] Add category field to ReaderSample interface
- [ ] Remove deprecated samples/ directory
- [ ] Update reader UI to show categories

---
*Created: 2026-01-07*
