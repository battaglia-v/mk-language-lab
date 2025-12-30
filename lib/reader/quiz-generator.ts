/**
 * Reader Quiz Generator
 *
 * Generates quiz steps from reader samples for vocabulary practice.
 * Creates multiple-choice questions from vocabulary, expressions, and grammar content.
 */

import type { Step, MultipleChoiceStep } from '../lesson-runner/types';
import type { ReaderSample } from '../reader-samples';

/**
 * Generate quiz steps from a reader sample
 */
export function generateQuizFromSample(
  sample: ReaderSample,
  options: {
    savedWords?: string[]; // Optional: prioritize these words
    maxQuestions?: number; // Default: all vocabulary + expressions
    includeGrammar?: boolean; // Default: false
  } = {}
): Step[] {
  const { maxQuestions = 10, includeGrammar = false } = options;
  const steps: Step[] = [];

  // Defensive: ensure arrays exist and filter out undefined entries
  const vocabulary = (sample.vocabulary || []).filter((v) => v && v.mk && v.en);
  const expressions = (sample.expressions || []).filter((e) => e && e.mk && e.en);

  // 1. Vocabulary questions (MK → EN)
  const vocabSteps = vocabulary.map((vocab, index): MultipleChoiceStep => {
    const distractors = generateDistractors(
      vocab.en,
      vocabulary.map((v) => v.en),
      3
    );

    return {
      id: `vocab-mk-en-${index}`,
      type: 'MULTIPLE_CHOICE',
      prompt: `What does "${vocab.mk}" mean?`,
      choices: shuffleArray([vocab.en, ...distractors]),
      correctIndex: 0, // Will be updated after shuffle
      explanation: vocab.note,
    };
  });

  // Update correct index after shuffle
  vocabSteps.forEach((step) => {
    const idx = parseInt(step.id.split('-')[3]);
    const vocabItem = vocabulary[idx];
    if (vocabItem) {
      step.correctIndex = step.choices.indexOf(vocabItem.en);
    }
  });

  steps.push(...vocabSteps.slice(0, Math.min(5, vocabSteps.length)));

  // 2. Vocabulary questions (EN → MK) - reverse direction
  const reverseVocabSteps = vocabulary
    .slice(0, 3)
    .map((vocab, index): MultipleChoiceStep => {
      const distractors = generateDistractors(
        vocab.mk,
        vocabulary.map((v) => v.mk),
        3
      );

      const choices = shuffleArray([vocab.mk, ...distractors]);

      return {
        id: `vocab-en-mk-${index}`,
        type: 'MULTIPLE_CHOICE',
        prompt: `How do you say "${vocab.en}" in Macedonian?`,
        choices,
        correctIndex: choices.indexOf(vocab.mk),
      };
    });

  steps.push(...reverseVocabSteps);

  // 3. Expression questions
  const expressionSteps = expressions.map(
    (expr, index): MultipleChoiceStep => {
      const distractors = generateDistractors(
        expr.en,
        expressions.map((e) => e.en),
        3
      );

      const choices = shuffleArray([expr.en, ...distractors]);

      return {
        id: `expr-${index}`,
        type: 'MULTIPLE_CHOICE',
        prompt: `What does "${expr.mk}" mean?`,
        choices,
        correctIndex: choices.indexOf(expr.en),
        explanation: expr.usage,
      };
    }
  );

  steps.push(...expressionSteps);

  // 4. Grammar questions (if enabled)
  if (includeGrammar && sample.grammar_highlights.length > 0) {
    sample.grammar_highlights.forEach((grammar, grammarIndex) => {
      if (grammar.examples && grammar.examples.length > 0) {
        grammar.examples.slice(0, 2).forEach((example, exampleIndex) => {
          const distractors = generateGenericDistractors(example.en, 3);
          const choices = shuffleArray([example.en, ...distractors]);

          steps.push({
            id: `grammar-${grammarIndex}-${exampleIndex}`,
            type: 'MULTIPLE_CHOICE',
            prompt: `Translate: "${example.mk}"`,
            choices,
            correctIndex: choices.indexOf(example.en),
            explanation: example.note || grammar.description_en,
          });
        });
      }
    });
  }

  // Limit total questions
  const limitedSteps = steps.slice(0, maxQuestions);

  return limitedSteps;
}

/**
 * Generate distractor options from a pool
 */
function generateDistractors(
  correct: string,
  pool: string[],
  count: number
): string[] {
  // Filter out the correct answer and shuffle
  const candidates = pool.filter((item) => item !== correct);
  const shuffled = shuffleArray(candidates);
  return shuffled.slice(0, count);
}

/**
 * Generate generic plausible distractors
 * (Fallback when pool is too small)
 */
function generateGenericDistractors(correct: string, count: number): string[] {
  const genericDistractors = [
    'I don\'t know',
    'Maybe later',
    'Not sure',
    'It depends',
    'That\'s unclear',
    'I can\'t tell',
  ];

  return genericDistractors.filter((d) => d !== correct).slice(0, count);
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate quiz difficulty based on sample difficulty
 */
export function getQuizDifficulty(
  sampleDifficulty: ReaderSample['difficulty']
): 'beginner' | 'intermediate' | 'advanced' {
  switch (sampleDifficulty) {
    case 'A1':
    case 'A2':
      return 'beginner';
    case 'B1':
      return 'intermediate';
    case 'B2':
      return 'advanced';
    default:
      return 'intermediate';
  }
}
