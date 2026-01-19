/**
 * Tag Grammar Exercises with grammarTopic and difficulty
 * 
 * This script adds grammarTopic and difficulty metadata to exercises
 * in grammar-lessons.json for use with:
 * - Grammar performance tracking
 * - Adaptive difficulty
 * - Focus Areas recommendations
 * 
 * Usage: npx tsx scripts/tag-grammar-exercises.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Grammar topic mappings based on lesson ID patterns
const LESSON_TOPIC_MAP: Record<string, string> = {
  'alphabet-basics': 'alphabet-cyrillic',
  'greetings-basics': 'greetings-basic',
  'present-tense-sum': 'verbs-present-sum',
  'present-tense-regular': 'verbs-present-regular',
  'nouns-gender': 'nouns-gender',
  'nouns-plural': 'nouns-plural',
  'adjectives-basics': 'adjectives-agreement',
  'adjectives-agreement': 'adjectives-agreement',
  'definite-article': 'definite-article',
  'numbers-1-10': 'numbers-1-20',
  'numbers-11-20': 'numbers-1-20',
  'numbers-21-100': 'numbers-21-100',
  'pronouns-personal': 'pronouns-personal',
  'pronouns-object': 'pronouns-object',
  'past-tense': 'verbs-past-simple',
  'past-tense-l-form': 'verbs-past-simple',
  'future-tense': 'verbs-future',
  'prepositions': 'prepositions-basic',
  'questions': 'questions-formation',
  'negation': 'negation',
  'comparison': 'adjectives-comparison',
  'adverbs': 'adverbs-basic',
  'time-expressions': 'time-expressions',
  'aspect-imperfective': 'verbs-aspect-imperfective',
  'aspect-perfective': 'verbs-aspect-perfective',
  'conditional': 'conditional-mood',
  'relative-clauses': 'relative-clauses',
  'indirect-speech': 'indirect-speech',
  'passive': 'passive-voice',
  'modal-verbs': 'modal-verbs',
  'formal-informal': 'formal-vs-informal',
};

// Difficulty mapping based on exercise type and level
function getDifficulty(
  exerciseType: string,
  lessonLevel: string,
  exerciseIndex: number
): 'easy' | 'medium' | 'hard' {
  const levelDifficulty: Record<string, 'easy' | 'medium' | 'hard'> = {
    'beginner': 'easy',
    'A1': 'easy',
    'elementary': 'medium',
    'A2': 'medium',
    'intermediate': 'hard',
    'B1': 'hard',
    'B2': 'hard',
  };

  // Start easier, get harder within a lesson
  const baseLevel = levelDifficulty[lessonLevel] || 'medium';
  
  // Type-based adjustments
  const typeAdjustments: Record<string, number> = {
    'multiple-choice': -1,
    'fill-blank': 0,
    'matching': 0,
    'fill-in': 0,
    'error-correction': 1,
    'translation': 1,
    'sentence-building': 1,
  };

  const adjustment = typeAdjustments[exerciseType] || 0;
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  const baseIndex = difficulties.indexOf(baseLevel);
  
  // Progress through exercises increases difficulty slightly
  const progressAdjust = exerciseIndex > 3 ? 1 : 0;
  
  const finalIndex = Math.max(0, Math.min(2, baseIndex + adjustment + progressAdjust));
  return difficulties[finalIndex];
}

// Find matching grammar topic for a lesson
function findGrammarTopic(lessonId: string, lessonTitle: string): string | null {
  // Direct ID match
  if (LESSON_TOPIC_MAP[lessonId]) {
    return LESSON_TOPIC_MAP[lessonId];
  }

  // Partial ID match
  for (const [key, topic] of Object.entries(LESSON_TOPIC_MAP)) {
    if (lessonId.includes(key) || key.includes(lessonId.split('-')[0])) {
      return topic;
    }
  }

  // Title-based matching (lowercase)
  const titleLower = lessonTitle.toLowerCase();
  const titlePatterns: Record<string, string> = {
    'alphabet': 'alphabet-cyrillic',
    'greeting': 'greetings-basic',
    'present': 'verbs-present-regular',
    'past': 'verbs-past-simple',
    'future': 'verbs-future',
    'noun': 'nouns-gender',
    'plural': 'nouns-plural',
    'adjective': 'adjectives-agreement',
    'pronoun': 'pronouns-personal',
    'number': 'numbers-1-20',
    'definite': 'definite-article',
    'article': 'definite-article',
    'preposition': 'prepositions-basic',
    'question': 'questions-formation',
    'negat': 'negation',
    'compar': 'adjectives-comparison',
    'adverb': 'adverbs-basic',
    'time': 'time-expressions',
    'aspect': 'verbs-aspect-imperfective',
    'condition': 'conditional-mood',
    'relative': 'relative-clauses',
    'indirect': 'indirect-speech',
    'passive': 'passive-voice',
    'modal': 'modal-verbs',
    'formal': 'formal-vs-informal',
  };

  for (const [pattern, topic] of Object.entries(titlePatterns)) {
    if (titleLower.includes(pattern)) {
      return topic;
    }
  }

  return null;
}

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'grammar-lessons.json');
  
  console.log('Reading grammar lessons...');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lessons = JSON.parse(content);

  let totalExercises = 0;
  let taggedExercises = 0;

  for (const lesson of lessons) {
    const grammarTopic = findGrammarTopic(lesson.id, lesson.title || '');
    const lessonLevel = lesson.difficulty_level || lesson.difficulty || 'A1';

    if (!lesson.exercises) continue;

    for (let i = 0; i < lesson.exercises.length; i++) {
      const exercise = lesson.exercises[i];
      totalExercises++;

      // Add grammarTopic if found
      if (grammarTopic) {
        exercise.grammarTopic = grammarTopic;
        taggedExercises++;
      }

      // Add difficulty
      exercise.difficulty = getDifficulty(
        exercise.type || 'multiple-choice',
        lessonLevel,
        i
      );
    }

    console.log(`  ${lesson.id}: ${lesson.exercises.length} exercises, topic: ${grammarTopic || 'none'}`);
  }

  // Write updated data
  fs.writeFileSync(filePath, JSON.stringify(lessons, null, 2));

  console.log('\n✅ Tagging complete!');
  console.log(`   Total exercises: ${totalExercises}`);
  console.log(`   Tagged with grammarTopic: ${taggedExercises}`);
  console.log(`   All exercises now have difficulty levels`);
}

main().catch(console.error);
