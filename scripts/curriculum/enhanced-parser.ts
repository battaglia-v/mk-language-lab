/**
 * Enhanced Curriculum Parser
 * 
 * Improved PDF content extraction for Macedonian language textbooks.
 * This parser is designed to properly extract:
 * - Dialogues with speaker identification and blanks
 * - Vocabulary categorized by theme (not instructional text)
 * - Grammar points with conjugation tables
 * - Exercises with proper type identification
 */

// ============================================================================
// Types
// ============================================================================

export interface ExtractedDialogue {
  id: string;
  title?: string;
  trackId?: string; // e.g., "1.1" for audio reference
  lines: ExtractedDialogueLine[];
}

export interface ExtractedDialogueLine {
  speaker?: string;
  textMk: string;
  textEn?: string;
  transliteration?: string;
  hasBlanks: boolean;
  blanks?: Array<{
    position: number;
    answer: string;
    hint?: string;
  }>;
}

export interface ExtractedVocabulary {
  word: string;
  translation: string;
  partOfSpeech?: string;
  gender?: string;
  category?: string;
  transliteration?: string;
  exampleMk?: string;
  exampleEn?: string;
  isCore: boolean;
}

export interface ExtractedGrammarPoint {
  title: string;
  explanation: string;
  examples: string[];
  category?: string;
  conjugationTable?: {
    verb: string;
    verbEn?: string;
    tense: string;
    rows: Array<{
      person: string;
      pronoun: string;
      conjugation: string;
      transliteration?: string;
    }>;
  };
}

export interface ExtractedExercise {
  type: 'fill_blank' | 'multiple_choice' | 'matching' | 'translation' | 'picture_match' | 'country_identification';
  instructions: string;
  items: unknown[];
}

export interface ExtractedLesson {
  lessonNumber: number;
  title: string;
  titleMk: string;
  objectives: string[];
  dialogues: ExtractedDialogue[];
  vocabulary: ExtractedVocabulary[];
  grammar: ExtractedGrammarPoint[];
  exercises: ExtractedExercise[];
}

// ============================================================================
// Constants - Words to filter out
// ============================================================================

// Instructional/meta words from textbook that aren't vocabulary
const INSTRUCTIONAL_WORDS = new Set([
  'вежба', 'лекција', 'тема', 'состави', 'реченици', 'прочитај',
  'напиши', 'одговори', 'пример', 'примери', 'слушај', 'говори',
  'слушање', 'запомни', 'поврзи', 'додади', 'употреби', 'внимавај',
  'кажи', 'дополни', 'пополни', 'избери', 'означи', 'подвлечи',
]);

// Common country names (often mixed in as vocabulary but should be separate)
const COUNTRY_NAMES = new Set([
  'македонија', 'германија', 'франција', 'италија', 'шпанија',
  'англија', 'русија', 'кина', 'јапонија', 'америка', 'австралија',
  'бразил', 'мексико', 'канада', 'ирска', 'грција', 'турција',
  'србија', 'хрватска', 'бугарија', 'албанија', 'словенија',
  'швајцарија', 'холандија', 'белгија', 'австрија', 'полска',
]);

// Common proper names from textbook dialogues
const PROPER_NAMES = new Set([
  'влатко', 'ема', 'андреј', 'весна', 'томислав', 'ивана', 'ѓорѓи',
  'маја', 'марко', 'ана', 'петар', 'моника', 'белучи', 'новак',
  'ѓоковиќ', 'колдплеј', 'скопје', 'битола', 'охрид', 'струга',
]);

// ============================================================================
// Vocabulary Filtering
// ============================================================================

/**
 * Determines if a word should be excluded from vocabulary
 */
export function shouldExcludeWord(word: string, translation: string): boolean {
  const wordLower = word.toLowerCase().trim();
  const translationLower = translation.toLowerCase().trim();

  // Skip empty
  if (!wordLower || !translationLower) return true;

  // Skip very short words (likely noise)
  if (wordLower.length <= 2) return true;

  // Skip if translation equals word (not actually translated)
  if (wordLower === translationLower) return true;

  // Skip instructional words
  if (INSTRUCTIONAL_WORDS.has(wordLower)) return true;

  // Skip country names (handled separately)
  if (COUNTRY_NAMES.has(wordLower)) return true;

  // Skip proper names
  if (PROPER_NAMES.has(wordLower)) return true;

  // Skip if looks like transliteration (similar length, only Latin chars)
  if (translationLower.match(/^[a-z]+$/) && Math.abs(word.length - translation.length) <= 2) {
    return true;
  }

  return false;
}

/**
 * Categorize vocabulary based on context and word characteristics
 */
export function categorizeWord(word: string, context?: string): string | undefined {
  const wordLower = word.toLowerCase();

  // Pronouns
  if (['јас', 'ти', 'тој', 'таа', 'тоа', 'ние', 'вие', 'тие', 'мој', 'мојот', 'мојата', 'твој', 'негов', 'нејзин'].includes(wordLower)) {
    return 'pronouns';
  }

  // Greetings
  if (['здраво', 'добар', 'добра', 'добро', 'ден', 'утро', 'вечер', 'благодарам', 'молам', 'пријатно', 'довидување'].includes(wordLower)) {
    return 'greetings';
  }

  // Question words
  if (['што', 'кој', 'која', 'кое', 'каде', 'како', 'зошто', 'кога', 'колку', 'чиј'].includes(wordLower)) {
    return 'question words';
  }

  // Numbers
  if (['еден', 'два', 'три', 'четири', 'пет', 'шест', 'седум', 'осум', 'девет', 'десет'].includes(wordLower)) {
    return 'numbers';
  }

  // Family
  if (['мајка', 'татко', 'брат', 'сестра', 'баба', 'дедо', 'син', 'ќерка', 'сопруг', 'сопруга', 'дете', 'семејство'].includes(wordLower)) {
    return 'family';
  }

  // Professions
  if (['студент', 'студентка', 'професор', 'асистент', 'доктор', 'инженер', 'учител', 'наставник'].includes(wordLower)) {
    return 'professions';
  }

  // Use context if provided
  if (context) {
    if (context.includes('запознавање') || context.includes('поздрав')) return 'greetings';
    if (context.includes('семејство') || context.includes('роднини')) return 'family';
    if (context.includes('професија') || context.includes('работа')) return 'professions';
  }

  return undefined;
}

/**
 * Determine part of speech from context or word ending
 */
export function inferPartOfSpeech(word: string): string | undefined {
  const wordLower = word.toLowerCase();

  // Common verb endings
  if (wordLower.endsWith('ам') || wordLower.endsWith('ем') || wordLower.endsWith('им')) {
    return 'verb';
  }
  if (wordLower.endsWith('аш') || wordLower.endsWith('еш') || wordLower.endsWith('иш')) {
    return 'verb';
  }

  // Common adjective endings (definite forms)
  if (wordLower.endsWith('от') || wordLower.endsWith('та') || wordLower.endsWith('то')) {
    return 'adjective';
  }
  if (wordLower.endsWith('ата') || wordLower.endsWith('ото') || wordLower.endsWith('ите')) {
    return 'adjective';
  }

  // Common adverb endings
  if (wordLower.endsWith('но') || wordLower.endsWith('о')) {
    // Could be adverb or neuter adjective, need more context
  }

  return undefined;
}

/**
 * Infer gender from word ending (for nouns)
 */
export function inferGender(word: string): string | undefined {
  const wordLower = word.toLowerCase();

  // Feminine endings
  if (wordLower.endsWith('а') || wordLower.endsWith('ка') || wordLower.endsWith('ица')) {
    return 'feminine';
  }

  // Neuter endings
  if (wordLower.endsWith('е') || wordLower.endsWith('о')) {
    return 'neuter';
  }

  // Most consonant endings are masculine
  const lastChar = wordLower[wordLower.length - 1];
  if (!'аеиоу'.includes(lastChar)) {
    return 'masculine';
  }

  return undefined;
}

// ============================================================================
// Dialogue Parsing
// ============================================================================

/**
 * Extract dialogues from raw text content
 */
export function parseDialogues(rawText: string): ExtractedDialogue[] {
  const dialogues: ExtractedDialogue[] = [];
  
  // Pattern for dialogue sections (marked by speaker labels like "А", "Б", etc. or names)
  const dialoguePattern = /([А-Я]|Влатко|Ема|Андреј|Весна)\s*[–-]\s*(.+?)(?=\n[А-Я]\s*[–-]|\n\n|$)/g;
  
  let currentDialogue: ExtractedDialogue | null = null;
  let lineIndex = 0;
  
  // Find dialogue markers
  const lines = rawText.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check for speaker pattern
    const speakerMatch = trimmedLine.match(/^([А-Я]|Влатко|Ема|Андреј|Весна|Томислав)\s*[–-]\s*(.+)$/);
    
    if (speakerMatch) {
      if (!currentDialogue) {
        currentDialogue = {
          id: `dialogue-${dialogues.length + 1}`,
          lines: [],
        };
      }
      
      const speaker = speakerMatch[1];
      const text = speakerMatch[2].trim();
      
      // Check for blanks (underscores)
      const hasBlanks = text.includes('______') || text.includes('___');
      const blanks: ExtractedDialogueLine['blanks'] = [];
      
      if (hasBlanks) {
        // Find blank positions
        const words = text.split(/\s+/);
        words.forEach((word, idx) => {
          if (word.includes('___')) {
            blanks.push({
              position: idx,
              answer: '', // Will need manual fill-in
              hint: undefined,
            });
          }
        });
      }
      
      currentDialogue.lines.push({
        speaker: speaker.length === 1 ? undefined : speaker, // Single letter speakers are anonymous
        textMk: text.replace(/_{3,}/g, '___'),
        hasBlanks,
        blanks: blanks.length > 0 ? blanks : undefined,
      });
      
      lineIndex++;
    } else if (currentDialogue && currentDialogue.lines.length > 0) {
      // End of dialogue section
      if (currentDialogue.lines.length >= 2) {
        dialogues.push(currentDialogue);
      }
      currentDialogue = null;
    }
  }
  
  // Don't forget the last dialogue
  if (currentDialogue && currentDialogue.lines.length >= 2) {
    dialogues.push(currentDialogue);
  }
  
  return dialogues;
}

// ============================================================================
// Grammar Parsing
// ============================================================================

/**
 * Parse conjugation table from structured text
 */
export function parseConjugationTable(text: string, verb: string): ExtractedGrammarPoint['conjugationTable'] | undefined {
  // Pattern for conjugation rows: pronoun + conjugation
  const pronounPatterns = [
    { person: '1sg', pattern: /јас\s+(\w+)/i },
    { person: '2sg', pattern: /ти\s+(\w+)/i },
    { person: '3sg', pattern: /тој\/таа\/тоа\s+(\w+)|тој\s+(\w+)/i },
    { person: '1pl', pattern: /ние\s+(\w+)/i },
    { person: '2pl', pattern: /вие\s+(\w+)/i },
    { person: '3pl', pattern: /тие\s+(\w+)/i },
  ];
  
  const rows: Array<{
    person: string;
    pronoun: string;
    conjugation: string;
    transliteration?: string;
  }> = [];
  
  const pronounMap: Record<string, string> = {
    '1sg': 'јас',
    '2sg': 'ти',
    '3sg': 'тој/таа/тоа',
    '1pl': 'ние',
    '2pl': 'вие',
    '3pl': 'тие',
  };
  
  for (const { person, pattern } of pronounPatterns) {
    const match = text.match(pattern);
    if (match) {
      const conjugation = match[1] || match[2];
      rows.push({
        person,
        pronoun: pronounMap[person],
        conjugation,
      });
    }
  }
  
  if (rows.length >= 4) {
    return {
      verb,
      tense: 'present',
      rows,
    };
  }
  
  return undefined;
}

// ============================================================================
// Main Parser
// ============================================================================

/**
 * Parse a full lesson from extracted PDF content
 */
export function parseLesson(
  rawContent: {
    lessonNumber: number;
    title: string;
    titleMk: string;
    themes: Array<{ title: string; content: string }>;
    vocabularyItems: Array<{ word: string; translation: string; context?: string }>;
  }
): ExtractedLesson {
  const dialogues: ExtractedDialogue[] = [];
  const vocabulary: ExtractedVocabulary[] = [];
  const grammar: ExtractedGrammarPoint[] = [];
  const exercises: ExtractedExercise[] = [];
  
  // Parse dialogues from theme content
  for (const theme of rawContent.themes) {
    const themeDialogues = parseDialogues(theme.content);
    dialogues.push(...themeDialogues);
  }
  
  // Filter and categorize vocabulary
  for (const item of rawContent.vocabularyItems) {
    if (shouldExcludeWord(item.word, item.translation)) {
      continue;
    }
    
    const category = categorizeWord(item.word, item.context);
    const partOfSpeech = inferPartOfSpeech(item.word);
    const gender = partOfSpeech === 'noun' ? inferGender(item.word) : undefined;
    
    vocabulary.push({
      word: item.word,
      translation: item.translation,
      partOfSpeech,
      gender,
      category,
      isCore: true,
    });
  }
  
  // Extract objectives from lesson intro
  const objectives: string[] = [];
  if (dialogues.length > 0) {
    objectives.push('Practice real conversations in context');
  }
  if (vocabulary.length > 0) {
    objectives.push(`Learn ${vocabulary.length} essential vocabulary words`);
  }
  
  return {
    lessonNumber: rawContent.lessonNumber,
    title: rawContent.title,
    titleMk: rawContent.titleMk,
    objectives,
    dialogues,
    vocabulary,
    grammar,
    exercises,
  };
}

// ============================================================================
// Exports for CLI usage
// ============================================================================

const enhancedParser = {
  parseLesson,
  parseDialogues,
  parseConjugationTable,
  shouldExcludeWord,
  categorizeWord,
  inferPartOfSpeech,
  inferGender,
};

export default enhancedParser;
