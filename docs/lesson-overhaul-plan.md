# MKLanguage Lesson System Overhaul Plan

## Executive Summary

This document outlines a comprehensive plan to transform the MKLanguage lesson system from its current accordion-based UI with poorly extracted content into a rich, interactive learning experience that mirrors the pedagogical quality of the official UKIM textbooks (Тешкото, Лозје, Златоврв).

## Current State Analysis

### What Exists
| Component | Status | Quality |
|-----------|--------|---------|
| Database Schema | ✅ Good | CurriculumLesson, VocabularyItem, GrammarNote, Exercise models |
| LessonRunner System | ✅ Good | Step-based flow with MULTIPLE_CHOICE, FILL_BLANK, TAP_WORDS, PRONOUNCE |
| Audio Infrastructure | ✅ Good | `useAudioPlayer` hook with TTS fallback |
| Curriculum Data | ⚠️ Poor | Messy extraction from PDFs with instructional text mixed with vocabulary |
| Lesson UI | ⚠️ Needs Redesign | Accordion-based, breaks learning flow |

### Key Problems Identified

1. **Content Quality Issues**
   - Extracted vocabulary contains instructional text ("вежба", "слушај")
   - Proper nouns treated as vocabulary ("Влатко" → "damp")
   - No structured dialogues from textbook
   - Missing audio references to official recordings

2. **UI/UX Issues**
   - Accordion layout doesn't guide learners through coherent sequence
   - Vocabulary cards hide translations requiring tedious clicks
   - No audio playback for vocabulary words
   - No dialogue-based contextual learning

3. **Missing Pedagogical Features**
   - Fill-in-the-blank dialogues
   - Listening comprehension tasks
   - Picture-matching exercises
   - Country identification drills
   - Full conjugation tables
   - Contextual grammar examples

---

## Implementation Architecture

### Multi-Agent Approach

The overhaul is organized into specialized "agents" (work streams) that can be developed in parallel:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LESSON OVERHAUL ORCHESTRATION                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  AGENT 1         │  │  AGENT 2         │  │  AGENT 3         │      │
│  │  Content Schema  │  │  UI Components   │  │  Content Pipeline │      │
│  │                  │  │                  │  │                  │      │
│  │  • DB migrations │  │  • DialogueView  │  │  • PDF parser    │      │
│  │  • Type defs     │  │  • VocabCard v2  │  │  • Audio linker  │      │
│  │  • API routes    │  │  • GrammarTable  │  │  • Validation    │      │
│  └────────┬─────────┘  │  • Exercises     │  │  • Curation UI   │      │
│           │            └────────┬─────────┘  └────────┬─────────┘      │
│           │                     │                     │                 │
│           └─────────────────────┼─────────────────────┘                 │
│                                 │                                        │
│                     ┌───────────▼───────────┐                           │
│                     │      AGENT 4          │                           │
│                     │   Lesson Experience   │                           │
│                     │                       │                           │
│                     │  • Guided flow        │                           │
│                     │  • Progress tracking  │                           │
│                     │  • XP integration     │                           │
│                     └───────────────────────┘                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agent 1: Content Schema Enhancement

### New Database Models

```prisma
// Dialogue - conversational content with blanks and audio
model Dialogue {
  id            String   @id @default(cuid())
  lessonId      String
  title         String?
  orderIndex    Int
  audioUrl      String?  // Reference to official audio file
  audioTrackId  String?  // e.g., "1.1", "1.2" for textbook references
  
  lesson        CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  lines         DialogueLine[]
  
  createdAt     DateTime @default(now())
  
  @@index([lessonId, orderIndex])
}

// DialogueLine - individual line in a dialogue
model DialogueLine {
  id            String   @id @default(cuid())
  dialogueId    String
  speaker       String?  // Character name (e.g., "Влатко", "Ема")
  textMk        String   @db.Text
  textEn        String   @db.Text
  transliteration String?
  audioUrl      String?
  audioStartMs  Int?     // Start time in audio file
  audioEndMs    Int?     // End time in audio file
  hasBlanks     Boolean  @default(false)
  blanksData    String?  @db.Text // JSON: [{ position: 3, answer: "сум", hint: "verb 'to be'" }]
  orderIndex    Int
  
  dialogue      Dialogue @relation(fields: [dialogueId], references: [id], onDelete: Cascade)
  
  @@index([dialogueId, orderIndex])
}

// ConjugationTable - verb/adjective conjugation tables
model ConjugationTable {
  id            String   @id @default(cuid())
  grammarNoteId String
  verb          String
  tense         String   // "present", "past", "future"
  type          String   // "affirmative", "negative", "interrogative"
  
  grammarNote   GrammarNote @relation(fields: [grammarNoteId], references: [id], onDelete: Cascade)
  rows          ConjugationRow[]
  
  @@index([grammarNoteId])
}

model ConjugationRow {
  id              String   @id @default(cuid())
  tableId         String
  person          String   // "1sg", "2sg", "3sg", "1pl", "2pl", "3pl"
  pronoun         String   // "јас", "ти", "тој/таа/тоа", etc.
  conjugation     String
  transliteration String?
  audioUrl        String?
  orderIndex      Int
  
  table           ConjugationTable @relation(fields: [tableId], references: [id], onDelete: Cascade)
  
  @@index([tableId, orderIndex])
}

// PictureExercise - picture-matching exercises
model PictureExercise {
  id            String   @id @default(cuid())
  lessonId      String
  instructions  String
  orderIndex    Int
  
  lesson        CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  items         PictureExerciseItem[]
  
  @@index([lessonId, orderIndex])
}

model PictureExerciseItem {
  id            String   @id @default(cuid())
  exerciseId    String
  imageUrl      String
  imageAlt      String
  textMk        String
  textEn        String
  orderIndex    Int
  
  exercise      PictureExercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  
  @@index([exerciseId, orderIndex])
}

// ListeningExercise - audio comprehension tasks
model ListeningExercise {
  id              String   @id @default(cuid())
  lessonId        String
  title           String
  instructions    String
  audioUrl        String
  audioTrackId    String?  // Reference to textbook audio
  transcriptMk    String?  @db.Text
  transcriptEn    String?  @db.Text
  orderIndex      Int
  
  lesson          CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions       ListeningQuestion[]
  
  @@index([lessonId, orderIndex])
}

model ListeningQuestion {
  id              String   @id @default(cuid())
  exerciseId      String
  question        String
  type            String   // "multiple_choice", "fill_blank", "true_false"
  options         String?  @db.Text // JSON array for MC
  correctAnswer   String
  explanation     String?
  orderIndex      Int
  
  exercise        ListeningExercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  
  @@index([exerciseId, orderIndex])
}
```

### Enhanced VocabularyItem Schema

```prisma
model VocabularyItem {
  id                String   @id @default(cuid())
  lessonId          String
  macedonianText    String
  englishText       String
  transliteration   String?  // Latin script pronunciation
  pronunciation     String?  // IPA or phonetic guide
  partOfSpeech      String?  // "noun", "verb", "adjective", etc.
  gender            String?  // "masculine", "feminine", "neuter"
  category          String?  // "greetings", "pronouns", "countries", etc.
  audioUrl          String?
  exampleSentenceMk String?  @db.Text
  exampleSentenceEn String?  @db.Text
  exampleAudioUrl   String?
  imageUrl          String?  // Optional illustration
  orderIndex        Int
  isCore            Boolean  @default(true)  // Core vs supplementary vocab
  
  lesson            CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  
  @@index([lessonId, orderIndex])
  @@index([category])
}
```

### API Routes to Add

```
POST   /api/lessons/[id]/dialogues          - Create dialogue
GET    /api/lessons/[id]/dialogues          - Get lesson dialogues
PATCH  /api/dialogues/[id]                  - Update dialogue
DELETE /api/dialogues/[id]                  - Delete dialogue

POST   /api/lessons/[id]/listening          - Create listening exercise
GET    /api/lessons/[id]/listening          - Get listening exercises

POST   /api/lessons/[id]/pictures           - Create picture exercise
GET    /api/lessons/[id]/pictures           - Get picture exercises

GET    /api/grammar/[id]/conjugation        - Get conjugation table
POST   /api/grammar/[id]/conjugation        - Create/update conjugation
```

---

## Agent 2: UI Components

### 2.1 DialogueViewer Component

A component for displaying dialogues with optional blanks, audio playback, and translation toggling.

```tsx
// components/learn/DialogueViewer.tsx
interface DialogueViewerProps {
  dialogue: {
    id: string;
    title?: string;
    audioUrl?: string;
    lines: {
      id: string;
      speaker?: string;
      textMk: string;
      textEn: string;
      transliteration?: string;
      hasBlanks: boolean;
      blanksData?: BlankData[];
    }[];
  };
  mode: 'view' | 'fill-blanks' | 'listen';
  showTranslation?: boolean;
  showTransliteration?: boolean;
  onBlanksFilled?: (answers: Record<string, string>) => void;
}
```

**Features:**
- Play full dialogue audio or line-by-line
- Toggle translation/transliteration
- Fill-in-the-blank mode with validation
- Speaker avatars with character names
- Sentence highlighting during audio playback

### 2.2 EnhancedVocabularyCard Component

```tsx
// components/learn/EnhancedVocabularyCard.tsx
interface EnhancedVocabularyCardProps {
  item: {
    id: string;
    macedonianText: string;
    englishText: string;
    transliteration?: string;
    pronunciation?: string;
    partOfSpeech?: string;
    gender?: string;
    category?: string;
    audioUrl?: string;
    exampleSentenceMk?: string;
    exampleSentenceEn?: string;
    imageUrl?: string;
  };
  showTranslation?: boolean;
  showTransliteration?: boolean;
  onPlayAudio?: () => void;
  onAddToReview?: () => void;
}
```

**Features:**
- Both sides visible by default (configurable)
- Audio play button with TTS fallback
- Part of speech and gender badges
- Example sentence with audio
- Optional illustration
- "Add to review deck" button
- Swipe gestures for mobile

### 2.3 ConjugationTable Component

```tsx
// components/learn/ConjugationTable.tsx
interface ConjugationTableProps {
  verb: string;
  tense: string;
  rows: {
    person: string;
    pronoun: string;
    conjugation: string;
    transliteration?: string;
    audioUrl?: string;
  }[];
  highlightPerson?: string; // For interactive highlighting
  onRowClick?: (person: string) => void;
}
```

**Features:**
- Clean table layout with proper alignment
- Click row to hear pronunciation
- Highlight current person being studied
- Quiz mode toggle (hide conjugations)

### 2.4 PictureMatchExercise Component

```tsx
// components/learn/exercises/PictureMatchExercise.tsx
interface PictureMatchExerciseProps {
  items: {
    id: string;
    imageUrl: string;
    imageAlt: string;
    textMk: string;
    textEn: string;
  }[];
  mode: 'drag-drop' | 'click-match';
  onComplete?: (correct: number, total: number) => void;
}
```

**Features:**
- Drag sentences to pictures
- Click sentence then click matching picture
- Visual feedback for correct/incorrect
- Shuffled order
- Accessible keyboard navigation

### 2.5 CountryDragDrop Component

```tsx
// components/learn/exercises/CountryDragDrop.tsx
interface CountryDragDropProps {
  sentences: {
    id: string;
    template: string; // "Тој е од ___"
    answer: string;   // "Македонија"
    personName?: string;
    flagEmoji?: string;
  }[];
  countries: string[];
  onComplete?: (results: ExerciseResults) => void;
}
```

**Features:**
- Drag country names into blanks
- Flag emojis for visual cues
- Audio pronunciation of country names
- Map visualization (optional)

### 2.6 ListeningComprehension Component

```tsx
// components/learn/exercises/ListeningComprehension.tsx
interface ListeningComprehensionProps {
  audioUrl: string;
  transcript?: {
    textMk: string;
    textEn: string;
    showTranscript: boolean;
  };
  questions: {
    id: string;
    question: string;
    type: 'multiple_choice' | 'fill_blank' | 'true_false';
    options?: string[];
    correctAnswer: string;
  }[];
  onComplete?: (results: ExerciseResults) => void;
}
```

**Features:**
- Audio player with playback controls
- Speed adjustment (0.75x, 1x, 1.25x)
- Optional transcript reveal
- Question-by-question progression
- Replay specific segments

---

## Agent 3: Content Ingestion Pipeline

### 3.1 Improved PDF Parser

```typescript
// scripts/curriculum/enhanced-extract.ts

interface ExtractedLesson {
  number: number;
  title: { mk: string; en: string };
  objectives: string[];
  dialogues: ExtractedDialogue[];
  vocabulary: ExtractedVocabulary[];
  grammar: ExtractedGrammar[];
  exercises: ExtractedExercise[];
  audioReferences: string[];
}

interface ExtractedDialogue {
  trackId: string;  // e.g., "1.1"
  title?: string;
  lines: {
    speaker?: string;
    text: string;
    blanks?: { position: number; answer: string }[];
  }[];
}

interface ExtractedVocabulary {
  word: string;
  translation: string;
  partOfSpeech: string;
  category: string;
  isCore: boolean;
  context?: string;
}
```

**Improvements:**
- Detect dialogue structure (speaker labels, quotation marks)
- Extract audio track references ("слушање 1.1")
- Separate instructional text from content
- Categorize vocabulary by theme
- Extract blank positions from dialogues

### 3.2 Audio Integration Script

```typescript
// scripts/curriculum/link-audio.ts

interface AudioMapping {
  trackId: string;          // "1.1", "1.2"
  textbookLevel: 'a1' | 'a2' | 'b1';
  lessonNumber: number;
  sourceUrl: string;        // Original UKIM URL
  localPath: string;        // CDN/local path
  segments?: {
    startMs: number;
    endMs: number;
    lineIndex: number;
  }[];
}

// Downloads and processes АУДИОТЕШКОТО files
async function downloadAudioFiles(level: string): Promise<AudioMapping[]>;

// Splits audio into segments per dialogue line
async function segmentAudio(mapping: AudioMapping): Promise<void>;
```

### 3.3 Content Curation Admin UI

Add admin interface for content editors to:
- Review and fix extracted vocabulary
- Mark vocabulary as core/supplementary
- Add missing translations
- Link audio files to content
- Add example sentences
- Create/edit dialogues manually

```
/admin/content/lessons/[id]     - Lesson editor
/admin/content/vocabulary       - Vocabulary management
/admin/content/dialogues/[id]   - Dialogue editor
/admin/content/audio            - Audio file manager
```

### 3.4 Validation Pipeline

```typescript
// scripts/curriculum/validate-content.ts

interface ValidationResult {
  lessonId: string;
  issues: ValidationIssue[];
  score: number; // 0-100
  isPublishable: boolean;
}

interface ValidationIssue {
  type: 'missing_translation' | 'no_audio' | 'bad_vocabulary' | 'no_exercises';
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  autoFixable: boolean;
}

// Checks:
// - All vocabulary has valid translations
// - Audio URLs are accessible
// - No instructional text in vocabulary
// - Grammar has examples
// - Exercises have correct answers
// - Dialogues have translations
```

---

## Agent 4: Lesson Experience Redesign

### 4.1 New Lesson Flow

Replace accordion with guided step-by-step progression:

```
┌─────────────────────────────────────────────────────────────────┐
│                      LESSON FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ① Introduction                                                 │
│  ├── Lesson objectives                                          │
│  ├── Theme preview with key phrases                             │
│  └── Audio preview of main dialogue                             │
│                           ↓                                      │
│  ② Dialogue (if available)                                      │
│  ├── Listen to full dialogue                                    │
│  ├── Read along with translation toggle                         │
│  ├── Fill-in-the-blank practice                                 │
│  └── Line-by-line repetition                                    │
│                           ↓                                      │
│  ③ Vocabulary                                                   │
│  ├── Categorized word groups                                    │
│  ├── Audio for each word                                        │
│  ├── Example sentences                                          │
│  └── Quick flashcard review                                     │
│                           ↓                                      │
│  ④ Grammar                                                      │
│  ├── Explanation with examples                                  │
│  ├── Conjugation tables (if applicable)                         │
│  ├── Interactive mini-quiz                                      │
│  └── Pattern practice                                           │
│                           ↓                                      │
│  ⑤ Practice Exercises                                           │
│  ├── Fill-in-the-blank                                          │
│  ├── Multiple choice                                            │
│  ├── Picture matching                                           │
│  ├── Listening comprehension                                    │
│  └── Translation practice                                       │
│                           ↓                                      │
│  ⑥ Assessment                                                   │
│  ├── Mixed exercise quiz                                        │
│  ├── Score and XP award                                         │
│  └── Spaced repetition scheduling                               │
│                           ↓                                      │
│  ⑦ Summary                                                      │
│  ├── Completion celebration                                     │
│  ├── Key takeaways                                              │
│  ├── Next lesson preview                                        │
│  └── Practice vocabulary CTA                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 New LessonPageContent Component

```tsx
// components/learn/LessonPageContentV2.tsx

interface LessonSection {
  id: string;
  type: 'intro' | 'dialogue' | 'vocabulary' | 'grammar' | 'exercises' | 'assessment' | 'summary';
  title: string;
  isOptional?: boolean;
  estimatedMinutes?: number;
}

interface LessonPageContentV2Props {
  lesson: EnhancedLesson;
  sections: LessonSection[];
  userProgress: UserProgress;
  onSectionComplete: (sectionId: string) => void;
  onLessonComplete: () => void;
}
```

**Features:**
- Step indicator at top (like Duolingo)
- Can navigate between completed sections
- Auto-advance after section completion
- Floating "Continue" button on mobile
- Progress persists across sessions

### 4.3 LessonRunner Integration

Extend existing `LessonRunner` to support new step types:

```typescript
// lib/lesson-runner/types.ts - additions

export type StepType =
  | 'MULTIPLE_CHOICE'
  | 'FILL_BLANK'
  | 'TAP_WORDS'
  | 'PRONOUNCE'
  | 'SUMMARY'
  // New types
  | 'DIALOGUE_LISTEN'      // Listen to dialogue
  | 'DIALOGUE_FILL_BLANK'  // Fill blanks in dialogue
  | 'PICTURE_MATCH'        // Match pictures to sentences
  | 'DRAG_DROP'            // Drag items to targets
  | 'LISTENING_COMP'       // Listening comprehension
  | 'CONJUGATION_DRILL';   // Conjugation practice

export interface DialogueListenStep extends BaseStep {
  type: 'DIALOGUE_LISTEN';
  dialogue: DialogueData;
  showTranslation: boolean;
  showTransliteration: boolean;
  requiresReplay?: number; // Times to play before continuing
}

export interface PictureMatchStep extends BaseStep {
  type: 'PICTURE_MATCH';
  items: PictureMatchItem[];
  instructions: string;
}
```

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2) ✅ COMPLETE
- [x] Create Prisma migrations for new models
- [x] Build DialogueViewer component (without audio)
- [x] Build EnhancedVocabularyCard component (without audio)

### Phase 2: Core Components (Week 3-4) ✅ COMPLETE
- [x] ConjugationTable component (without audio)
- [x] PictureMatchExercise component
- [x] CountryDragDrop component
- [ ] ListeningComprehension component (deferred - requires audio)

### Phase 3: Lesson Experience ✅ COMPLETE
- [x] LessonPageContentV2 with guided flow
- [x] Replace accordion with step-by-step progression
- [x] Progress tracking updates
- [ ] XP and gamification integration (future)

### Phase 4: Content Pipeline (Next)
- [ ] Enhanced PDF parser with dialogue extraction
- [ ] Content validation pipeline
- [ ] Admin curation UI for content editors

### Phase 5: Content Migration
- [ ] Re-extract A1 Тешкото content with new parser
- [ ] Manual curation of Lesson 1 as pilot
- [ ] QA and testing

### Phase 6: Rollout
- [ ] A/B testing with users
- [ ] Performance optimization
- [ ] Documentation
- [ ] Full A1 content migration

---

## Technical Specifications

### Accessibility Requirements
- All audio has transcripts
- Keyboard navigation for all exercises
- Screen reader support (ARIA labels)
- Color contrast compliance
- Focus management for step transitions

### Performance Targets
- Lesson page load < 2s
- Audio preloading for smooth playback
- Optimistic UI for exercise responses
- Offline support for downloaded lessons (future)

### Mobile Considerations
- Touch-friendly tap targets (44px minimum)
- Swipe gestures for vocabulary cards
- Bottom sheet for exercise options
- Responsive layouts for all components

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Lesson completion rate | ~40% | >70% |
| Time per lesson | 5 min | 15-20 min |
| User satisfaction score | N/A | >4.2/5 |
| Daily active users | - | +50% |
| Vocabulary retention (7-day) | N/A | >60% |

---

## Deferred to Future Release

### Audio Integration (Phase 2)
Audio playback features have been deferred to a future release:
- Dialogue audio playback (full and line-by-line)
- Vocabulary pronunciation audio
- TTS fallback for missing audio files
- Listening comprehension exercises with audio
- Audio file download and segmentation scripts

This allows the initial release to focus on the core pedagogical improvements without the complexity of audio licensing and infrastructure.

---

## Open Questions

1. **Image Assets**: Where will we source images for picture-matching exercises?
2. **Content Review Workflow**: Who will curate/approve content before publishing?
3. **Localization**: Should lesson UI support languages beyond English/Macedonian?

---

## Next Steps

1. ✅ Review and approve this plan
2. Create GitHub issues for each agent/phase
3. Set up feature branches
4. Begin Phase 1 implementation
5. Schedule weekly progress reviews

---

*Document created: January 8, 2026*
*Last updated: January 8, 2026*

