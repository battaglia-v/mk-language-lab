/**
 * Dialogue-Based Review System
 * 
 * Allows learners to practice weak vocabulary in the context
 * of real dialogues, reinforcing words through meaningful usage.
 * 
 * Features:
 * - Maps vocabulary to dialogues containing those words
 * - Generates cloze exercises from dialogue lines
 * - Supports multiple review modes (cloze, translate, listen)
 * 
 * Parity: Shared logic for both PWA and Android
 */

import type { Step } from '@/lib/lesson-runner/types';

/**
 * Dialogue line structure
 */
export interface DialogueLine {
  speaker: string;
  textMk: string;
  textEn: string;
  /** Vocabulary IDs present in this line */
  vocabularyIds?: string[];
}

/**
 * Dialogue structure
 */
export interface Dialogue {
  id: string;
  title_mk: string;
  title_en: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  topic: string;
  lines: DialogueLine[];
}

/**
 * Vocabulary item structure
 */
export interface VocabularyItem {
  id?: string;
  macedonian: string;
  english: string;
  category?: string;
}

/**
 * Review session configuration
 */
export interface DialogueReviewSession {
  dialogueId: string;
  dialogue: Dialogue;
  /** Vocabulary words to focus on */
  focusVocabulary: VocabularyItem[];
  /** Generated exercise steps */
  steps: Step[];
  /** Review mode */
  mode: 'cloze' | 'translate' | 'mixed';
}

/**
 * Vocabulary-Dialogue mapping entry
 */
export interface VocabDialogueMapping {
  vocabularyMk: string;
  dialogueIds: string[];
  lineIndices: Array<{ dialogueId: string; lineIndex: number }>;
}

/**
 * Build vocabulary-dialogue mapping from dialogues
 * 
 * Scans dialogue text for vocabulary matches and builds
 * a reverse index for quick lookup.
 */
export function buildVocabDialogueMap(
  dialogues: Dialogue[],
  vocabulary: VocabularyItem[]
): Map<string, VocabDialogueMapping> {
  const map = new Map<string, VocabDialogueMapping>();

  // Normalize vocabulary for matching
  const vocabLookup = new Map<string, VocabularyItem>();
  for (const v of vocabulary) {
    const normalized = v.macedonian.toLowerCase().trim();
    vocabLookup.set(normalized, v);
  }

  // Scan dialogues
  for (const dialogue of dialogues) {
    for (let lineIndex = 0; lineIndex < dialogue.lines.length; lineIndex++) {
      const line = dialogue.lines[lineIndex];
      const words = extractWords(line.textMk);

      for (const word of words) {
        const normalized = word.toLowerCase();
        if (vocabLookup.has(normalized)) {
          let mapping = map.get(normalized);
          if (!mapping) {
            mapping = {
              vocabularyMk: normalized,
              dialogueIds: [],
              lineIndices: [],
            };
            map.set(normalized, mapping);
          }

          if (!mapping.dialogueIds.includes(dialogue.id)) {
            mapping.dialogueIds.push(dialogue.id);
          }
          mapping.lineIndices.push({ dialogueId: dialogue.id, lineIndex });
        }
      }
    }
  }

  return map;
}

/**
 * Extract individual words from Macedonian text
 */
function extractWords(text: string): string[] {
  // Remove punctuation and split
  return text
    .replace(/[.,!?;:'"()—–-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

/**
 * Find dialogues containing specific vocabulary words
 */
export function findDialoguesForVocabulary(
  vocabulary: VocabularyItem[],
  dialogues: Dialogue[],
  vocabMap?: Map<string, VocabDialogueMapping>
): Dialogue[] {
  // Build map if not provided
  const map = vocabMap || buildVocabDialogueMap(dialogues, vocabulary);
  
  const dialogueIds = new Set<string>();
  
  for (const vocab of vocabulary) {
    const normalized = vocab.macedonian.toLowerCase().trim();
    const mapping = map.get(normalized);
    if (mapping) {
      mapping.dialogueIds.forEach(id => dialogueIds.add(id));
    }
  }

  return dialogues.filter(d => dialogueIds.has(d.id));
}

/**
 * Generate cloze exercise from a dialogue line
 */
export function generateClozeFromLine(
  line: DialogueLine,
  targetWord: string,
  dialogueContext: { title: string; speaker: string },
  stepId: string
): Step {
  const normalized = targetWord.toLowerCase();
  const words = line.textMk.split(/\s+/);
  
  // Find the target word in the line
  let blankIndex = -1;
  let originalWord = '';
  
  for (let i = 0; i < words.length; i++) {
    const cleaned = words[i].replace(/[.,!?;:'"()]/g, '').toLowerCase();
    if (cleaned === normalized || cleaned.startsWith(normalized)) {
      blankIndex = i;
      originalWord = words[i].replace(/[.,!?;:'"()]/g, '');
      break;
    }
  }

  if (blankIndex === -1) {
    // Word not found, return simple fill-blank
    return {
      id: stepId,
      type: 'FILL_BLANK',
      prompt: `Translate to Macedonian: "${line.textEn}"`,
      correctAnswer: targetWord,
      placeholder: 'Type the Macedonian word...',
      explanation: `Context: ${dialogueContext.title} - ${dialogueContext.speaker}`,
    };
  }

  // Create cloze sentence
  const clozeSentence = words
    .map((w, i) => i === blankIndex ? '______' : w)
    .join(' ');

  return {
    id: stepId,
    type: 'FILL_BLANK',
    prompt: clozeSentence,
    correctAnswer: originalWord,
    acceptableAnswers: [targetWord, originalWord.toLowerCase()],
    translationHint: line.textEn,
    explanation: `${dialogueContext.speaker} says this in "${dialogueContext.title}"`,
    placeholder: 'Fill in the blank...',
  };
}

/**
 * Generate a dialogue review session for weak vocabulary
 */
export function generateDialogueReviewSession(
  weakVocabulary: VocabularyItem[],
  dialogues: Dialogue[],
  options: {
    mode?: 'cloze' | 'translate' | 'mixed';
    maxSteps?: number;
    preferDialogueId?: string;
  } = {}
): DialogueReviewSession | null {
  const { mode = 'cloze', maxSteps = 10, preferDialogueId } = options;

  // Build mapping
  const vocabMap = buildVocabDialogueMap(dialogues, weakVocabulary);

  // Find dialogues containing weak vocabulary
  const matchingDialogues = findDialoguesForVocabulary(weakVocabulary, dialogues, vocabMap);

  if (matchingDialogues.length === 0) {
    return null;
  }

  // Select dialogue (prefer specified, or pick best match)
  let selectedDialogue: Dialogue;
  if (preferDialogueId) {
    selectedDialogue = matchingDialogues.find(d => d.id === preferDialogueId) || matchingDialogues[0];
  } else {
    // Pick dialogue with most vocabulary matches
    selectedDialogue = matchingDialogues.reduce((best, current) => {
      const bestCount = countVocabInDialogue(best, weakVocabulary);
      const currentCount = countVocabInDialogue(current, weakVocabulary);
      return currentCount > bestCount ? current : best;
    });
  }

  // Generate steps
  const steps: Step[] = [];
  const usedVocab = new Set<string>();

  // Add context info step
  steps.push({
    id: `${selectedDialogue.id}-intro`,
    type: 'INFO',
    title: `📖 ${selectedDialogue.title_en}`,
    subtitle: selectedDialogue.title_mk,
    body: `Let's practice vocabulary from this dialogue. Focus on the words you're learning!`,
    bullets: weakVocabulary.slice(0, 5).map(v => `${v.macedonian} — ${v.english}`),
  });

  // Generate exercise steps from dialogue lines
  for (const line of selectedDialogue.lines) {
    if (steps.length >= maxSteps) break;

    for (const vocab of weakVocabulary) {
      if (usedVocab.has(vocab.macedonian)) continue;
      
      const normalized = vocab.macedonian.toLowerCase();
      if (line.textMk.toLowerCase().includes(normalized)) {
        usedVocab.add(vocab.macedonian);

        const step = generateClozeFromLine(
          line,
          vocab.macedonian,
          { title: selectedDialogue.title_en, speaker: line.speaker },
          `${selectedDialogue.id}-${steps.length}`
        );
        steps.push(step);
        break;
      }
    }
  }

  // If we need more steps, add translation exercises
  if (steps.length < maxSteps && mode !== 'cloze') {
    for (const vocab of weakVocabulary) {
      if (steps.length >= maxSteps) break;
      if (usedVocab.has(vocab.macedonian)) continue;

      steps.push({
        id: `translate-${vocab.macedonian}-${steps.length}`,
        type: 'FILL_BLANK',
        prompt: `How do you say "${vocab.english}" in Macedonian?`,
        correctAnswer: vocab.macedonian,
        placeholder: 'Type in Macedonian...',
      });
      usedVocab.add(vocab.macedonian);
    }
  }

  return {
    dialogueId: selectedDialogue.id,
    dialogue: selectedDialogue,
    focusVocabulary: weakVocabulary.filter(v => usedVocab.has(v.macedonian)),
    steps,
    mode,
  };
}

/**
 * Count how many vocabulary words appear in a dialogue
 */
function countVocabInDialogue(dialogue: Dialogue, vocabulary: VocabularyItem[]): number {
  const dialogueText = dialogue.lines.map(l => l.textMk.toLowerCase()).join(' ');
  return vocabulary.filter(v => 
    dialogueText.includes(v.macedonian.toLowerCase())
  ).length;
}

/**
 * Get dialogue review recommendation for a user
 */
export function getDialogueReviewRecommendation(
  weakTopics: Array<{ topicId: string; vocabularyIds?: string[] }>,
  vocabulary: VocabularyItem[],
  dialogues: Dialogue[]
): { dialogue: Dialogue; focusWords: VocabularyItem[] } | null {
  // Collect weak vocabulary from topics
  const weakVocab: VocabularyItem[] = [];
  
  for (const topic of weakTopics) {
    if (topic.vocabularyIds) {
      for (const vocabId of topic.vocabularyIds) {
        const vocab = vocabulary.find(v => v.id === vocabId || v.macedonian === vocabId);
        if (vocab && !weakVocab.find(w => w.macedonian === vocab.macedonian)) {
          weakVocab.push(vocab);
        }
      }
    }
  }

  if (weakVocab.length === 0) {
    return null;
  }

  const session = generateDialogueReviewSession(weakVocab, dialogues, { maxSteps: 5 });
  
  if (!session) {
    return null;
  }

  return {
    dialogue: session.dialogue,
    focusWords: session.focusVocabulary,
  };
}
