# Phase 1: Curriculum Backbone - Research

**Researched:** 2026-01-06
**Domain:** PDF text extraction + curriculum data modeling for Macedonian language textbooks
**Confidence:** HIGH

<research_summary>
## Summary

Researched the technical requirements for parsing UKIM Macedonian language textbooks (Тешкото A1, Лозје A2, Златоврв B1) and structuring them into the existing MKLanguage curriculum system. The primary challenge is PDF text extraction with proper Cyrillic encoding, followed by mapping textbook structure to the existing Prisma data models.

Key finding: The codebase already has sophisticated curriculum models (Module → CurriculumLesson → VocabularyItem/GrammarNote/Exercise) and CEFR levels (A1/A2/B1). The main work is extraction and mapping, not schema design.

**Primary recommendation:** Use `pdfjs-dist` (Mozilla PDF.js) for PDF parsing as it's actively maintained, handles Unicode/Cyrillic well, and provides both text extraction and position information for structural analysis. Structure output as JSON files that match existing data model shapes, then import via Prisma seed scripts.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pdfjs-dist | 5.4.x | PDF parsing & text extraction | Mozilla-backed, actively maintained, best Unicode support |
| prisma | (existing) | Database ORM | Already in codebase, handles curriculum models |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pdf2json | 4.0.1 | Alternative PDF parser | If pdfjs-dist struggles with specific PDF structure |
| node-fetch | (existing) | HTTP client | Downloading PDFs from UKIM archive |
| fs/promises | (built-in) | File operations | Reading/writing extracted content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pdfjs-dist | pdf-parse | pdf-parse is simpler but less maintained, uncertain Unicode handling |
| pdfjs-dist | pdf2json | pdf2json provides structured JSON but no text positioning |
| Manual parsing | AI extraction | AI could help interpret structure but adds cost/complexity |

**Installation:**
```bash
npm install pdfjs-dist@5.4.530
```
</standard_stack>

<source_analysis>
## UKIM Textbook Source Analysis

### Available Textbooks
Source: https://archive.ukim.edu.mk/mk_content.php?glavno=34&meni=201

| Textbook | Level | Author | PDF Path |
|----------|-------|--------|----------|
| Тешкото (The Difficult One) | A1/Beginner | Simon Sazdov | `/msmjlk/uchebnici/TESKOTO_Simon_Sazdov.pdf` |
| Лозје (Vineyard) | A2/Intermediate | Gordana Aleksova | `/msmjlk/uchebnici/LOZJE_Gordana_Aleksova.pdf` |
| Златоврв (Golden Peak) | B1/Advanced | Aneta Ducevska | `/msmjlk/uchebnici/ZLATOVRV_Aneta_Ducevska.pdf` |

### Expected Textbook Structure
Based on standard language textbook patterns:

```
Textbook
├── Chapter/Unit (Лекција)
│   ├── Dialogue/Text (Дијалог/Текст)
│   ├── Vocabulary List (Речник)
│   ├── Grammar Notes (Граматика)
│   ├── Exercises (Вежби)
│   └── Cultural Notes (optional)
└── Appendices
    ├── Complete Vocabulary
    ├── Grammar Tables
    └── Answer Key
```

### PDF Characteristics to Handle
- **Encoding**: UTF-8 Cyrillic (Macedonian alphabet)
- **Layout**: Multi-column possible, tables for vocabulary/grammar
- **Size**: Large files (>10MB based on fetch timeout)
- **Special characters**: Macedonian-specific: Ѓ, Ќ, Љ, Њ, Џ, Ж, Ч, Ш
</source_analysis>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── curriculum/
│   ├── download-pdfs.ts        # Download PDFs from UKIM
│   ├── extract-text.ts         # Extract raw text with positions
│   ├── parse-structure.ts      # Identify chapters, vocab, grammar
│   ├── map-to-schema.ts        # Convert to Prisma-compatible JSON
│   └── import-curriculum.ts    # Upsert into database
data/
├── curriculum/
│   ├── raw/                    # Downloaded PDFs (gitignored)
│   ├── extracted/              # Raw text JSON per book
│   └── structured/             # Final curriculum JSON
│       ├── a1-teskoto.json
│       ├── a2-lozje.json
│       └── b1-zlatovrv-skeleton.json
```

### Pattern 1: Text Extraction with Position Data
**What:** Extract text while preserving position information for structure analysis
**When to use:** Always - position data helps identify headers, columns, tables
**Example:**
```typescript
// Source: pdfjs-dist examples/node/getinfo.mjs
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractTextWithPositions(pdfPath: string) {
  const doc = await getDocument(pdfPath).promise;
  const pages = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();

    const items = textContent.items.map((item: any) => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      fontSize: Math.sqrt(item.transform[0] ** 2 + item.transform[1] ** 2),
      fontName: item.fontName,
    }));

    pages.push({ pageNum: i, items });
    page.cleanup();
  }

  return pages;
}
```

### Pattern 2: Structure Detection via Text Analysis
**What:** Use font size, position, and patterns to identify structural elements
**When to use:** After extraction, before mapping to schema
**Example:**
```typescript
interface DetectedElement {
  type: 'chapter_title' | 'section_header' | 'vocabulary_entry' | 'grammar_note' | 'exercise' | 'body_text';
  content: string;
  page: number;
  confidence: number;
}

function detectStructure(extractedPages: ExtractedPage[]): DetectedElement[] {
  const elements: DetectedElement[] = [];

  for (const page of extractedPages) {
    // Large font + short text = likely header
    const largeItems = page.items.filter(i => i.fontSize > 14);

    // Pattern matching for vocabulary: "word - translation" or "word (translation)"
    const vocabPattern = /^[\p{Cyrillic}]+\s*[-–—]\s*[\w\s]+$/u;

    // Pattern for exercise numbers: "1.", "2.", etc.
    const exercisePattern = /^\d+\./;

    // Build elements based on patterns...
  }

  return elements;
}
```

### Pattern 3: Incremental Extraction with Manual Review
**What:** Extract in stages, with human review between stages
**When to use:** Given textbook complexity, plan for iterative refinement
**Example workflow:**
```
1. Download PDF → scripts/curriculum/download-pdfs.ts
2. Extract raw text → data/curriculum/extracted/a1-raw.json
3. [HUMAN REVIEW] Verify encoding, identify structure patterns
4. Parse structure → data/curriculum/extracted/a1-structured.json
5. [HUMAN REVIEW] Verify chapter/vocab/grammar identification
6. Map to schema → data/curriculum/structured/a1-teskoto.json
7. [HUMAN REVIEW] Spot-check before import
8. Import to DB → prisma/seed-curriculum-ukim.ts
```

### Anti-Patterns to Avoid
- **Fully automated pipeline:** Textbook PDFs vary; expect manual intervention
- **Single-pass extraction:** Build incremental tools that can be re-run
- **Ignoring position data:** Font size and position are key structure signals
- **Over-engineering schema:** Use existing Prisma models, don't create new ones unless necessary
</architecture_patterns>

<existing_codebase_integration>
## Integration with Existing Codebase

### Current Data Models (from prisma/schema.prisma)

The codebase already has curriculum infrastructure:

```prisma
model Module {
  id          String   @id @default(cuid())
  journeyId   String   // 'family' | 'travel' | 'culture'
  title       String
  description String   @db.Text
  orderIndex  Int
  lessons     CurriculumLesson[]
}

model CurriculumLesson {
  id               String  @id @default(cuid())
  moduleId         String
  title            String
  summary          String? @db.Text
  content          String  @db.Text
  orderIndex       Int
  estimatedMinutes Int     @default(15)
  difficultyLevel  String  @default("beginner")

  vocabularyItems VocabularyItem[]
  grammarNotes    GrammarNote[]
  exercises       Exercise[]
}

model VocabularyItem {
  lessonId          String
  macedonianText    String
  englishText       String
  pronunciation     String?
  exampleSentenceMk String?
  exampleSentenceEn String?
  orderIndex        Int
}

model GrammarNote {
  lessonId    String
  title       String
  explanation String @db.Text
  examples    String @db.Text // JSON array
  orderIndex  Int
}

model Exercise {
  lessonId      String
  type          String  // 'multiple_choice' | 'fill_blank' | 'translation'
  question      String  @db.Text
  options       String  @db.Text // JSON array
  correctAnswer String  @db.Text
  orderIndex    Int
}
```

### CEFR Levels Already Defined
```prisma
enum ReaderLevel {
  A1
  A2
  B1
  B2
  C1
}
```

### Mapping Strategy

**Option A: New Journey IDs for UKIM curriculum**
```typescript
// Add new journeyIds: 'ukim-a1' | 'ukim-a2' | 'ukim-b1'
// Each textbook chapter becomes a Module
// Each section within chapter becomes a CurriculumLesson
```

**Option B: Extend existing Module with level field**
```typescript
// Add `level: ReaderLevel` to Module
// Filter by level instead of journeyId for UKIM content
```

**Recommendation:** Option A (new journey IDs) for cleaner separation. The existing family/travel/culture journeys serve different purposes (thematic learning). UKIM content is level-based, linear progression.
</existing_codebase_integration>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF text extraction | Custom binary parsing | pdfjs-dist | PDF format is complex, encoding issues, font mapping |
| Cyrillic normalization | Character-by-character | Built-in String.normalize('NFC') | Unicode handling has edge cases |
| Structure detection | Regex-only parsing | Position + font analysis | Headers vs body need visual signals |
| Data import | Raw SQL | Prisma upsert | Handles relations, type safety |
| Table extraction | Manual coordinate math | pdf2json if needed | Table cells are complex |

**Key insight:** PDF parsing has 30+ years of edge cases. pdfjs-dist handles font substitution, encoding detection, and layout reconstruction. Hand-rolling any of this leads to bugs with specific PDFs.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Cyrillic Encoding Issues
**What goes wrong:** Extracted text shows garbled characters or mojibake
**Why it happens:** PDF may have embedded fonts with custom encodings
**How to avoid:**
- Use pdfjs-dist (handles most encodings)
- Verify output contains expected Macedonian characters: А-Ш, а-ш, Ѓ, Ќ, Љ, Њ, Џ
- Normalize with `String.normalize('NFC')` after extraction
**Warning signs:** Characters like `□`, `?`, or Latin letters where Cyrillic expected

### Pitfall 2: Lost Structure in Plain Text
**What goes wrong:** Headers, vocabulary entries, and body text all look the same
**Why it happens:** Plain text extraction discards position and style information
**How to avoid:**
- Extract with position data (x, y coordinates)
- Extract font information (size, name)
- Build structure detection based on visual signals
**Warning signs:** Can't distinguish chapter titles from body paragraphs

### Pitfall 3: Table Content Scrambled
**What goes wrong:** Vocabulary tables come out as jumbled words
**Why it happens:** PDF tables are visual, not semantic - text flows by position
**How to avoid:**
- Sort extracted items by y-coordinate (top to bottom), then x-coordinate (left to right)
- Detect column boundaries by consistent x-coordinates
- Consider pdf2json for better table handling
**Warning signs:** Translations don't match their words

### Pitfall 4: Over-automation
**What goes wrong:** Automated pipeline produces garbage, needs manual fixing anyway
**Why it happens:** Each textbook is unique; patterns don't transfer perfectly
**How to avoid:**
- Build tools, not pipelines
- Include manual review checkpoints
- Start with one chapter, verify, then scale
**Warning signs:** Spending more time debugging automation than manual extraction would take

### Pitfall 5: Schema Changes Mid-Project
**What goes wrong:** New fields needed after partial import, migration pain
**Why it happens:** Discovering textbook structure during extraction reveals new requirements
**How to avoid:**
- Extract to JSON first, review structure completely
- Only add Prisma fields after understanding full data shape
- Use existing models where possible
**Warning signs:** Temptation to add fields early "just in case"
</common_pitfalls>

<code_examples>
## Code Examples

### Basic PDF Text Extraction (Node.js)
```typescript
// Source: pdfjs-dist examples/node/getinfo.mjs pattern
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Disable worker for Node.js
GlobalWorkerOptions.workerSrc = '';

interface PageText {
  pageNum: number;
  text: string;
  items: Array<{
    str: string;
    x: number;
    y: number;
    fontSize: number;
  }>;
}

export async function extractPdfText(pdfPath: string): Promise<PageText[]> {
  const doc = await getDocument(pdfPath).promise;
  const pages: PageText[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    const items = content.items.map((item: any) => ({
      str: item.str,
      x: Math.round(item.transform[4]),
      y: Math.round(item.transform[5]),
      fontSize: Math.round(Math.sqrt(item.transform[0] ** 2 + item.transform[1] ** 2)),
    }));

    const text = items.map(i => i.str).join(' ').normalize('NFC');

    pages.push({ pageNum: i, text, items });
    page.cleanup();
  }

  await doc.destroy();
  return pages;
}
```

### Cyrillic Text Validation
```typescript
// Validate Macedonian Cyrillic extraction
const MACEDONIAN_CHARS = /[\u0400-\u04FF]/; // Cyrillic range
const MACEDONIAN_SPECIAL = ['Ѓ', 'Ќ', 'Љ', 'Њ', 'Џ', 'Ж', 'Ч', 'Ш', 'Ј'];

export function validateMacedonianText(text: string): {
  valid: boolean;
  hasCyrillic: boolean;
  hasSpecialChars: string[];
  suspiciousChars: string[];
} {
  const hasCyrillic = MACEDONIAN_CHARS.test(text);
  const hasSpecialChars = MACEDONIAN_SPECIAL.filter(c => text.includes(c));

  // Detect potential encoding issues
  const suspiciousPattern = /[□\ufffd]/g;
  const suspiciousChars = [...text.matchAll(suspiciousPattern)].map(m => m[0]);

  return {
    valid: hasCyrillic && suspiciousChars.length === 0,
    hasCyrillic,
    hasSpecialChars,
    suspiciousChars,
  };
}
```

### Structure-Aware JSON Output
```typescript
// Target output format matching Prisma models
interface ExtractedLesson {
  title: string;
  titleMk?: string;
  summary?: string;
  content: string;
  orderIndex: number;
  estimatedMinutes: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';

  vocabularyItems: Array<{
    macedonianText: string;
    englishText: string;
    pronunciation?: string;
    exampleSentenceMk?: string;
    exampleSentenceEn?: string;
    orderIndex: number;
  }>;

  grammarNotes: Array<{
    title: string;
    explanation: string;
    examples: string[];
    orderIndex: number;
  }>;

  exercises: Array<{
    type: 'multiple_choice' | 'fill_blank' | 'translation';
    question: string;
    options?: string[];
    correctAnswer: string;
    orderIndex: number;
  }>;
}

interface ExtractedTextbook {
  id: string;           // 'ukim-a1' | 'ukim-a2' | 'ukim-b1'
  title: string;
  level: 'A1' | 'A2' | 'B1';
  source: string;       // PDF URL
  chapters: Array<{
    title: string;
    orderIndex: number;
    lessons: ExtractedLesson[];
  }>;
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pdf-parse | pdfjs-dist | 2023+ | Better maintenance, Unicode handling |
| Server-side only | pdfjs-dist works everywhere | Always | Same code for scripts and potential web preview |
| Full automation | AI-assisted + human review | 2024 | LLMs can help interpret structure but need verification |

**New tools/patterns to consider:**
- **LLM extraction:** Could use Claude to interpret difficult sections, but adds cost and should verify
- **pdf2json for tables:** Better table handling if vocabulary tables are complex
- **pdfjs-dist v5:** Latest version, improved text extraction

**Deprecated/outdated:**
- **pdf-parse:** Less maintained, unclear Cyrillic support
- **Pure regex parsing:** Position data is essential for structure detection
</sota_updates>

<open_questions>
## Open Questions

Things that couldn't be fully resolved without accessing the actual PDFs:

1. **Textbook internal structure**
   - What we know: Standard chapter → vocab → grammar → exercises pattern expected
   - What's unclear: Exact structure of Тешкото, Лозје, Златоврв
   - Recommendation: Download and manually review one chapter before building tools

2. **Exercise format**
   - What we know: Existing Exercise model supports multiple_choice, fill_blank, translation
   - What's unclear: What exercise types do UKIM textbooks use?
   - Recommendation: May need to add exercise types or adapt existing ones

3. **English translations availability**
   - What we know: Textbooks are for foreign learners, so likely have translations
   - What's unclear: Are translations inline or in appendix?
   - Recommendation: Verify during manual review; may need translation for some content

4. **Answer keys**
   - What we know: Textbooks likely have answer keys for exercises
   - What's unclear: Format and location
   - Recommendation: Essential for populating correctAnswer field
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- pdfjs-dist examples (GitHub mozilla/pdf.js) - Node.js text extraction patterns
- pdf2json v4.0.1 (GitHub modesty/pdf2json) - Alternative parser, zero dependencies
- MKLanguage codebase (prisma/schema.prisma) - Existing data models

### Secondary (MEDIUM confidence)
- UKIM archive page (archive.ukim.edu.mk) - Textbook list and PDF locations
- Mozilla PDF.js documentation - General capabilities

### Tertiary (LOW confidence - needs validation)
- Textbook internal structure - Inferred from standard patterns, needs PDF review
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: PDF parsing with pdfjs-dist
- Ecosystem: Existing Prisma models, JSON intermediate format
- Patterns: Position-aware extraction, incremental processing
- Pitfalls: Cyrillic encoding, structure detection, over-automation

**Confidence breakdown:**
- Standard stack: HIGH - pdfjs-dist is well-documented and maintained
- Architecture: HIGH - follows established extraction patterns
- Pitfalls: HIGH - common PDF extraction challenges well-documented
- Code examples: MEDIUM - need to verify with actual UKIM PDFs

**Research date:** 2026-01-06
**Valid until:** 2026-02-06 (30 days - PDF libraries stable)
</metadata>

---

*Phase: 01-curriculum-backbone*
*Research completed: 2026-01-06*
*Ready for planning: yes*
