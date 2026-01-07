# PDF Extraction Audit Report

**Audit Date:** 2026-01-07
**Scope:** UKIM Macedonian textbooks (A1 Тешкото, A2 Лозје, B1 Златоврв)

---

## Executive Summary

### Current State
| Metric | Value |
|--------|-------|
| Total vocabulary items | **0** |
| Total grammar notes | 41 |
| Grammar with real explanations | 7 (17%) |
| Grammar with 3+ examples | 7 (17%) |
| Levels analyzed | 3 |

### Target State (v1.1 Success Criteria)
- A1 lessons: 20+ vocabulary items each
- A1 grammar notes: Real explanations + 3+ examples each
- A2 lessons: Vocabulary and grammar populated
- B1: Skeleton vocabulary per lesson
- No garbled OCR text in user-facing content
- Practice mode has sufficient content to function

### Gap Analysis
| Level | Current Vocab | Target Vocab | Gap |
|-------|--------------|--------------|-----|
| A1 (24 lessons) | 0 | 480+ (20×24) | **-480** |
| A2 (8 lessons) | 0 | 120+ (15×8) | **-120** |
| B1 (8 lessons) | 0 | 40+ (5×8) | **-40** |

**Total vocabulary gap: ~640 items**

---

## Issue Analysis by Level

### A1 (Тешкото) - 286 pages, 24 lessons

**Vocabulary Extraction**
- **Current:** 0 items found
- **Expected:** 480+ items (20 per lesson minimum)
- **Root cause:** Vocabulary regex expects "Macedonian - English" format:
  ```regex
  ([А-Яа-яЀ-ӿ]+)\s+[-–—]\s+([a-zA-Z]+)
  ```
  UKIM textbooks are Macedonian-only with no English translations. The pattern **never matches**.

**Evidence from raw text (vocabulary exists but not extracted):**
- 71 pages contain vocabulary markers (Зборови, зборови, Речник)
- Sample from page 17:
  > "зборови во горните описи и дополни ја табелата... еднина момче девојче татко мајка... множина..."
- Sample from page 12:
  > "Пополни ги празните места со горните зборови..."

**Grammar Extraction**
- **Current:** 7 notes (6 unique patterns)
- **Expected:** 24+ notes (1 per lesson minimum)
- **Root cause:** Only 2 hardcoded pattern detections:
  1. "Јас сум" + "Ти си" → Verb "сум" conjugation
  2. "мој" + "моја" + "мое" → Possessive pronouns

**Evidence from raw text (grammar exists but not extracted):**
- 27 pages contain grammar markers (Глагол, глагол, именка)
- Sample from page 55:
  > "Глаголот сум - Вежба 1. Пополни ги празните места со форми од глаголот сум..."
- Sample from page 75:
  > "именка. Вежба 1. Еднина и множина..."

---

### A2 (Лозје) - 178 pages, 8 lessons

**Vocabulary Extraction**
- **Current:** 0 items
- **Expected:** 120+ items (15 per lesson)
- **Root cause:** Same regex failure as A1

**Evidence from raw text:**
- 27 pages contain vocabulary markers
- Sample from page 23:
  > "зборови: татковина, земја, држава, живот, родољубие, љубов, почит, лојалност, сигурност..."

**Grammar Extraction**
- **Current:** 34 notes (all placeholders)
- **Expected:** 34 notes with real content and examples
- **Issue:** Grammar notes extracted from TOC but with generic content:
  ```json
  {
    "title": "Сегашно време (презент)",
    "content": "Grammar topic covered in Lesson 1",
    "examples": []
  }
  ```

**Evidence from raw text (grammar content exists):**
- 60 pages contain grammar markers
- Sample from page 8:
  > "глаголска л-форма, можен начин (потенцијал), модални зборови и изрази..."

---

### B1 (Златоврв) - 8 lessons

**Status:** Skeleton only - no content extraction attempted

**Current state:**
```json
{
  "chapterNumber": 1,
  "title": "Chapter 1: Дали се разбираме?",
  "note": "Content pending - B1 skeleton only"
}
```

**No raw extraction file exists** (`data/curriculum/extracted/b1-raw.json` missing)

---

## Pattern Failure Analysis

### Vocabulary Extraction Failure

**Current pattern (parse-a1-structure.ts:152):**
```typescript
const dashPattern = /([А-Яа-яЀ-ӿ]+(?:\s+[А-Яа-яЀ-ӿ]+)*)\s+[-–—]\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/g;
```

**Why it fails:**
1. Pattern requires `[a-zA-Z]+` (Latin characters) after the dash
2. UKIM textbooks are entirely in Macedonian
3. Vocabulary is presented as:
   - Word lists without translations
   - Exercise fill-in-the-blanks
   - Grouped thematic vocabulary (family, food, places)

**Example of actual vocabulary format (page 17):**
```
еднина   множина
момче    момчиња
девојче  девојчиња
татко    татковци
мајка    мајки
```

### Grammar Extraction Failure

**Current pattern (parse-a1-structure.ts:171-192):**
```typescript
// Hardcoded pattern 1: Verb "сум"
if (lessonText.includes('Јас сум') && lessonText.includes('Ти си')) {
  notes.push({
    title: 'Глаголот "сум" (To be)',
    content: 'Present tense conjugation of "to be"',
    examples: ['Јас сум', 'Ти си', ...],
  });
}

// Hardcoded pattern 2: Possessive pronouns
if (lessonText.includes('мој') && lessonText.includes('моја') && lessonText.includes('мое')) {
  // ...
}
```

**Why it fails:**
1. Only 2 hardcoded patterns - misses all other grammar
2. A2 parser uses TOC-based extraction but creates empty placeholders
3. No parsing of actual grammar explanation text or examples
4. Grammar markers ("Граматика", "Глагол") exist but aren't used

---

## Text Quality Assessment

### Encoding: OK
- Macedonian-specific characters detected:
  - A1: 1,611 occurrences (ѓ, ќ, љ, њ, џ)
  - A2: 2,524 occurrences
- NFC normalization applied during extraction

### OCR Quality: Minor Issues
- Some broken words visible in samples
- Exercise blanks rendered as `______` (expected)
- Position data preserved (x, y, fontSize) for future tabular extraction

### Structural Markers: Partially Preserved
- "Вежба" (Exercise) markers found: Consistent
- "Тема" (Theme) markers found: Consistent
- "Речник" markers: Rare (1 in A1, 0 in A2)
- "Граматика" section headers: Not consistently formatted

---

## Recommended Fixes (for Phase 9)

### Priority 1: Vocabulary Extraction

1. **Extract from word lists (no translation needed)**
   - Look for columns of Cyrillic words
   - Use position data to identify tabular layouts
   - Pattern: Noun singular → plural pairs

2. **Extract from "зборови" sections**
   - 87 pages (A1) + 27 pages (A2) contain vocabulary markers
   - Parse text following "зборови" markers

3. **Extract from exercise word boxes**
   - Pattern: Lists of words in exercises
   - Often formatted with bullets or commas

### Priority 2: Grammar Content Population

1. **Parse "Глагол" sections**
   - 31 pages (A1) + 62 pages (A2) contain grammar markers
   - Extract explanation paragraphs

2. **Extract numbered examples**
   - Pattern: а. б. в. г. or 1. 2. 3.
   - Capture sentences as grammar examples

3. **Fill A2 placeholders with actual content**
   - Grammar titles exist (from TOC)
   - Need to extract corresponding explanations and examples

### Priority 3: B1 Bootstrap

1. **Run PDF extraction on Златоврв**
   - Create `b1-raw.json`
   - Apply vocabulary/grammar patterns from A1/A2 fixes

---

## Files Analyzed

| File | Purpose | Size |
|------|---------|------|
| `data/curriculum/structured/a1-teskoto.json` | A1 structured output | 115 KB |
| `data/curriculum/structured/a2-lozje.json` | A2 structured output | 23 KB |
| `data/curriculum/structured/b1-zlatovrv.json` | B1 skeleton | 2 KB |
| `data/curriculum/extracted/a1-raw.json` | A1 raw text | 6.2 MB |
| `data/curriculum/extracted/a2-raw.json` | A2 raw text | 3.8 MB |
| `scripts/curriculum/parse-a1-structure.ts` | A1 parser | 8 KB |
| `scripts/curriculum/parse-a2-structure.ts` | A2 parser | 10 KB |

---

## Summary

The extraction pipeline successfully extracts raw text with good encoding, but the parsing logic fails because:

1. **Vocabulary regex assumes English translations that don't exist**
2. **Grammar detection uses only 2 hardcoded patterns**
3. **B1 hasn't been extracted at all**

The raw text contains extractable content (vocabulary markers on 98+ pages, grammar markers on 87+ pages) that can be captured with improved parsing patterns.

**Next step:** Phase 9 - Fix extraction pipeline with new vocabulary/grammar patterns
