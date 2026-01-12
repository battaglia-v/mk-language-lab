/**
 * Exercise Adapter
 *
 * Converts existing grammar exercise types to LessonRunner step format.
 * Enables gradual migration of existing lessons to the new LessonRunner system.
 */

import type { Step, InfoStep, MultipleChoiceStep, FillBlankStep } from '../types';
import type { GrammarExercise, GrammarLesson, SentenceBuilderExercise, ErrorCorrectionExercise } from '@/lib/grammar-engine';

function parseVocabularyEntry(entry: string): { base: string; gender?: string; en?: string } {
  const separators = [' - ', ' — ', ' – ', ' : '];
  let mkPart = entry;
  let enPart: string | undefined;

  for (const separator of separators) {
    const index = entry.indexOf(separator);
    if (index !== -1) {
      mkPart = entry.slice(0, index).trim();
      enPart = entry.slice(index + separator.length).trim();
      break;
    }
  }

  const genderMatch = mkPart.match(/\((m|f|n|masculine|feminine|neuter)\)/i);
  const gender = genderMatch ? genderMatch[1].toLowerCase() : undefined;
  const base = mkPart
    .replace(/\((m|f|n|masculine|feminine|neuter)\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { base, gender, en: enPart };
}

function buildExamples(lesson: GrammarLesson): Array<{ mk: string; en?: string }> {
  const examples: Array<{ mk: string; en?: string }> = [];
  const note = lesson.grammarNote;
  if (!note) return examples;

  const mkExamples = note.examplesMk || [];
  const enExamples = note.examplesEn || [];
  const maxLength = Math.max(mkExamples.length, enExamples.length);

  for (let i = 0; i < maxLength; i += 1) {
    const mk = mkExamples[i] || '';
    const en = enExamples[i];
    if (!mk && !en) continue;
    examples.push({
      mk: mk || en || '',
      en: mk ? en : undefined,
    });
  }

  return examples;
}

function buildInfoSteps(lesson: GrammarLesson, locale: 'en' | 'mk'): InfoStep[] {
  const steps: InfoStep[] = [];
  const note = lesson.grammarNote;
  const noteTitle = locale === 'mk' ? note?.titleMk : note?.titleEn;
  const lessonTitle = locale === 'mk' ? lesson.titleMk : lesson.titleEn;
  const title = noteTitle || lessonTitle || 'Grammar Focus';
  const body = (locale === 'mk' ? note?.contentMk : note?.contentEn) || lesson.grammar_notes;
  const examples = buildExamples(lesson);

  if (body || examples.length) {
    steps.push({
      id: `${lesson.id}-info`,
      type: 'INFO',
      title,
      subtitle: noteTitle && lessonTitle && noteTitle !== lessonTitle ? lessonTitle : undefined,
      body,
      examples: examples.length ? examples : undefined,
    });
  }

  if (lesson.vocabulary_list && lesson.vocabulary_list.length > 0) {
    const vocabulary = lesson.vocabulary_list.flatMap((entry) => {
      const { base, gender, en } = parseVocabularyEntry(entry);
      if (!base) return [];
      return [{ mk: base, gender, en }];
    });

    if (vocabulary.length > 0) {
      steps.push({
        id: `${lesson.id}-vocab`,
        type: 'INFO',
        title: 'Vocabulary',
        subtitle: 'Key words for this lesson.',
        vocabulary,
      });
    }
  }

  return steps;
}

/**
 * Convert a single grammar exercise to a LessonRunner step
 */
export function exerciseToStep(exercise: GrammarExercise, locale: 'en' | 'mk' = 'en'): Step {
  const instruction = locale === 'en' ? exercise.instructionEn : exercise.instructionMk;
  const explanation = locale === 'en' ? exercise.explanationEn : exercise.explanationMk;

  switch (exercise.type) {
    case 'multiple-choice': {
      const step: MultipleChoiceStep = {
        id: exercise.id,
        type: 'MULTIPLE_CHOICE',
        prompt: exercise.questionMk,
        choices: exercise.options,
        correctIndex: exercise.correctIndex,
        explanation,
        translationHint: exercise.questionEn || exercise.instructionEn,
      };
      return step;
    }

    case 'fill-blank': {
      const translationHint = exercise.translationEn ? ` (${exercise.translationEn})` : '';
      const step: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: `${exercise.sentenceMk}${translationHint}`,
        correctAnswer: exercise.correctAnswers[0],
        acceptableAnswers: exercise.correctAnswers.slice(1),
        explanation,
        caseSensitive: false,
        placeholder: 'Type your answer...',
        wordBank: exercise.wordBank,
      };
      return step;
    }

    case 'sentence-builder': {
      // TODO: Sentence builder requires custom step type
      // For now, convert to fill-blank as a fallback
      const sbExercise = exercise as SentenceBuilderExercise;
      const words = sbExercise.words?.length ? sbExercise.words : sbExercise.targetSentenceMk.split(' ');
      const wordList = words.length ? `Words: ${words.join(' / ')}` : undefined;
      const translation = sbExercise.translationEn ? `Translation: ${sbExercise.translationEn}` : undefined;
      const promptParts = [instruction, wordList, translation].filter(Boolean);
      const sbStep: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: promptParts.join(' '),
        correctAnswer: sbExercise.targetSentenceMk,
        acceptableAnswers: sbExercise.alternativeOrders?.map((alt) => alt.join(' ')),
        explanation,
        caseSensitive: false,
        placeholder: 'Type the full sentence...',
        wordBank: words.length ? words : undefined,
      };
      return sbStep;
    }

    case 'error-correction': {
      // TODO: Error correction requires custom step type
      // For now, convert to fill-blank as a fallback
      const ecExercise = exercise as ErrorCorrectionExercise;
      const translation = ecExercise.translationEn ? `Translation: ${ecExercise.translationEn}` : undefined;
      const promptParts = [
        instruction,
        `Sentence: ${ecExercise.sentenceWithErrorMk}`,
        translation,
      ].filter(Boolean);
      const ecStep: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: promptParts.join(' '),
        correctAnswer: ecExercise.correctedWord,
        explanation,
        caseSensitive: false,
        placeholder: 'Type the corrected word...',
      };
      return ecStep;
    }

    default: {
      // This should never happen if all exercise types are handled
      const _exhaustiveCheck: never = exercise;
      throw new Error(`Unknown exercise type: ${(_exhaustiveCheck as GrammarExercise).type}`);
    }
  }
}

/**
 * Convert a full grammar lesson to LessonRunner steps
 */
export function lessonToSteps(
  lesson: GrammarLesson,
  locale: 'en' | 'mk' = 'en'
): Step[] {
  return [
    ...buildInfoSteps(lesson, locale),
    ...lesson.exercises.map((exercise) => exerciseToStep(exercise, locale)),
  ];
}

/**
 * Create a difficulty mapping
 */
export function mapDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): 'beginner' | 'intermediate' | 'advanced' {
  return difficulty; // Direct mapping
}

/**
 * Calculate total XP for a lesson using the new XP system
 * This allows comparison with the old XP system
 */
export function calculateLessonXPFromExercises(
  exercises: GrammarExercise[]
): number {
  // New system: 10 XP per exercise
  const baseXP = exercises.length * 10;

  // Add perfect bonus if all exercises completed
  const perfectBonus = 10;

  return baseXP + perfectBonus;
}

/**
 * Map old Exercise type from Prisma to Step type
 * (For database-stored exercises)
 */
export function prismaExerciseToStep(exercise: {
  id: string;
  type: string;
  question: string;
  options: string; // JSON string
  correctAnswer: string;
  explanation?: string | null;
}): Step {
  switch (exercise.type) {
    case 'multiple_choice': {
      // Options are stored as pipe-separated strings in the database
      const options: string[] = (exercise.options ?? '').split('|').map(opt => opt.trim()).filter(Boolean);
      const correctIndex = options.indexOf(exercise.correctAnswer);

      const step: MultipleChoiceStep = {
        id: exercise.id,
        type: 'MULTIPLE_CHOICE',
        prompt: exercise.question,
        choices: options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: exercise.explanation || undefined,
      };
      return step;
    }

    case 'fill_blank': {
      const step: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: exercise.question,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation || undefined,
        caseSensitive: false,
      };
      return step;
    }

    case 'translation': {
      // Treat translation as fill-blank
      const step: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: exercise.question,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation || undefined,
        caseSensitive: false,
      };
      return step;
    }

    default:
      throw new Error(`Unknown Prisma exercise type: ${exercise.type}`);
  }
}

/**
 * Batch convert Prisma exercises to steps
 */
export function prismaExercisesToSteps(exercises: Array<{
  id: string;
  type: string;
  question: string;
  options: string;
  correctAnswer: string;
  explanation?: string | null;
}>): Step[] {
  return exercises.map(prismaExerciseToStep);
}
