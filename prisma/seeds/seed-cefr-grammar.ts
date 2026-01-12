import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const GRAMMAR_ID_PREFIX = 'grammar-';
const ORDER_OFFSET = 1000;
const START_KEY = '__start__';

type GrammarNoteData = {
  titleMk?: string;
  titleEn?: string;
  contentMk?: string;
  contentEn?: string;
  examplesMk?: string[];
  examplesEn?: string[];
};

type GrammarExercise =
  | {
      id: string;
      type: 'multiple-choice';
      instructionEn?: string;
      instructionMk?: string;
      questionMk: string;
      questionEn?: string;
      options: string[];
      correctIndex: number;
      explanationEn?: string;
      explanationMk?: string;
    }
  | {
      id: string;
      type: 'fill-blank';
      sentenceMk: string;
      translationEn?: string;
      correctAnswers: string[];
      wordBank?: string[];
      instructionEn?: string;
      instructionMk?: string;
      explanationEn?: string;
      explanationMk?: string;
    }
  | {
      id: string;
      type: 'sentence-builder';
      instructionEn?: string;
      instructionMk?: string;
      targetSentenceMk: string;
      words: string[];
      translationEn?: string;
      explanationEn?: string;
      explanationMk?: string;
    }
  | {
      id: string;
      type: 'error-correction';
      instructionEn?: string;
      instructionMk?: string;
      sentenceWithErrorMk: string;
      correctedWord: string;
      explanationEn?: string;
      explanationMk?: string;
    };

type GrammarLessonData = {
  id: string;
  title?: string;
  titleMk?: string;
  titleEn?: string;
  descriptionMk?: string;
  descriptionEn?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  difficulty_level?: 'A1' | 'A2' | 'B1';
  grammar_notes?: string;
  grammarNote?: GrammarNoteData;
  vocabulary_list?: string[];
  exercises?: GrammarExercise[];
};

type LessonRunnerExample = {
  mk: string;
  en?: string;
};

type LessonRunnerVocabularyItem = {
  mk: string;
  en?: string;
  gender?: string | null;
};

type PracticeVocabEntry = {
  macedonian: string;
  english: string;
  category?: string;
};

type CurriculumRef = {
  journeyId: string;
  lessonNumber: number;
  lessonTitle?: string;
  relevance?: string;
};

type GrammarMapping = {
  grammarLessonId: string;
  curriculumRefs: CurriculumRef[];
};

type JourneyConfig = {
  journeyId: 'ukim-a1' | 'ukim-a2' | 'ukim-b1';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
};

const JOURNEY_CONFIG: JourneyConfig[] = [
  { journeyId: 'ukim-a1', difficultyLevel: 'beginner' },
  { journeyId: 'ukim-a2', difficultyLevel: 'intermediate' },
  { journeyId: 'ukim-b1', difficultyLevel: 'advanced' },
];

function loadJson<T>(relativePath: string): T {
  const fullPath = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as T;
}

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseVocabularyEntry(entry: string): { base: string; gender?: string | null; en?: string } {
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
  const gender = genderMatch ? genderMatch[1].toLowerCase() : null;
  const base = mkPart.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  return { base, gender, en: enPart };
}

function buildLessonTitle(lesson: GrammarLessonData): string {
  return lesson.titleEn || lesson.title || lesson.titleMk || lesson.id;
}

function buildLessonSummary(lesson: GrammarLessonData, ref?: CurriculumRef): string {
  return lesson.descriptionEn
    || lesson.descriptionMk
    || ref?.relevance
    || lesson.grammar_notes
    || '';
}

function buildLessonContent(lesson: GrammarLessonData): string {
  const note = lesson.grammarNote;
  const content = note?.contentEn || note?.contentMk || lesson.grammar_notes || '';
  const vocab = lesson.vocabulary_list?.length
    ? `Vocabulary: ${lesson.vocabulary_list.join(', ')}`
    : '';

  return [content, vocab].filter(Boolean).join('\n\n');
}

function normalizeTitleForMatch(title?: string): string {
  return normalizeTerm(title || '');
}

function isManagedGrammarLesson(lessonId: string): boolean {
  return lessonId.startsWith(GRAMMAR_ID_PREFIX);
}

function grammarLessonDbId(grammarLessonId: string): string {
  return `${GRAMMAR_ID_PREFIX}${grammarLessonId}`;
}

function mapExerciseToDb(exercise: GrammarExercise): {
  type: string;
  question: string;
  options: string;
  correctAnswer: string;
  explanation?: string | null;
} | null {
  const explanation = ('explanationEn' in exercise && exercise.explanationEn)
    || ('explanationMk' in exercise && exercise.explanationMk)
    || null;

  switch (exercise.type) {
    case 'multiple-choice': {
      const correctLetter = String.fromCharCode(65 + exercise.correctIndex);
      return {
        type: 'multiple_choice',
        question: exercise.questionMk,
        options: exercise.options.join('|'),
        correctAnswer: correctLetter,
        explanation,
      };
    }
    case 'fill-blank': {
      const translationHint = exercise.translationEn ? ` (${exercise.translationEn})` : '';
      return {
        type: 'fill_blank',
        question: `${exercise.sentenceMk}${translationHint}`,
        options: '',
        correctAnswer: exercise.correctAnswers?.[0] || '',
        explanation,
      };
    }
    case 'sentence-builder': {
      const instruction = exercise.instructionEn || exercise.instructionMk || 'Arrange the words';
      const words = exercise.words?.length ? exercise.words : exercise.targetSentenceMk.split(' ');
      return {
        type: 'word_order',
        question: instruction,
        options: words.join('|'),
        correctAnswer: exercise.targetSentenceMk,
        explanation,
      };
    }
    case 'error-correction': {
      const instruction = exercise.instructionEn || exercise.instructionMk || 'Fix the error';
      return {
        type: 'fill_blank',
        question: `${instruction}: ${exercise.sentenceWithErrorMk}`,
        options: '',
        correctAnswer: exercise.correctedWord,
        explanation,
      };
    }
    default:
      return null;
  }
}

function buildLessonRunnerExamples(note?: GrammarNoteData): LessonRunnerExample[] {
  if (!note) return [];
  const mkExamples = note.examplesMk || [];
  const enExamples = note.examplesEn || [];
  const maxLength = Math.max(mkExamples.length, enExamples.length);
  const examples: LessonRunnerExample[] = [];

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

function buildLessonRunnerInfoSteps(
  lesson: GrammarLessonData,
  vocabLookup: Map<string, PracticeVocabEntry>
): Array<Record<string, unknown>> {
  const steps: Array<Record<string, unknown>> = [];
  const note = lesson.grammarNote;
  const noteTitle = note?.titleEn || note?.titleMk;
  const lessonTitle = buildLessonTitle(lesson);
  const title = noteTitle || lessonTitle || 'Grammar Focus';
  const body = note?.contentEn || note?.contentMk || lesson.grammar_notes;
  const examples = buildLessonRunnerExamples(note);

  if (body || examples.length) {
    steps.push({
      id: `${lesson.id}-info`,
      type: 'INFO',
      title,
      subtitle: noteTitle && lessonTitle && noteTitle !== lessonTitle ? lessonTitle : undefined,
      body,
      examples: examples.length > 0 ? examples : undefined,
    });
  }

  if (lesson.vocabulary_list && lesson.vocabulary_list.length > 0) {
    const vocabulary = lesson.vocabulary_list
      .map((entry) => {
        const { base, gender, en } = parseVocabularyEntry(entry);
        if (!base) return null;
        const lookup = vocabLookup.get(normalizeTerm(base));
        return {
          mk: base,
          en: lookup?.english || en,
          gender: gender ?? null,
        } as LessonRunnerVocabularyItem;
      })
      .filter((entry): entry is LessonRunnerVocabularyItem => Boolean(entry));

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

function mapExerciseToLessonRunnerStep(exercise: GrammarExercise): Record<string, unknown> | null {
  const explanation = ('explanationEn' in exercise && exercise.explanationEn)
    || ('explanationMk' in exercise && exercise.explanationMk)
    || undefined;

  switch (exercise.type) {
    case 'multiple-choice': {
      const prompt = exercise.questionMk || exercise.instructionMk || 'Choose the correct answer';
      const translationHint = exercise.questionEn || exercise.instructionEn;
      return {
        id: exercise.id,
        type: 'MULTIPLE_CHOICE',
        prompt,
        choices: exercise.options,
        correctIndex: exercise.correctIndex,
        explanation,
        translationHint,
      };
    }
    case 'fill-blank': {
      const translationHint = exercise.translationEn ? ` (${exercise.translationEn})` : '';
      return {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: `${exercise.sentenceMk}${translationHint}`,
        correctAnswer: exercise.correctAnswers?.[0] || '',
        acceptableAnswers: exercise.correctAnswers?.slice(1) || [],
        explanation,
        caseSensitive: false,
        placeholder: 'Type your answer...',
        wordBank: exercise.wordBank,
      };
    }
    case 'sentence-builder': {
      const instruction = exercise.instructionEn || exercise.instructionMk || 'Arrange the words';
      const words = exercise.words?.length ? exercise.words : exercise.targetSentenceMk.split(' ');
      const wordList = words.length ? `Words: ${words.join(' / ')}` : undefined;
      const translation = exercise.translationEn ? `Translation: ${exercise.translationEn}` : undefined;
      const promptParts = [instruction, wordList, translation].filter(Boolean);
      return {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: promptParts.join(' '),
        correctAnswer: exercise.targetSentenceMk,
        explanation,
        caseSensitive: false,
        placeholder: 'Type your answer...',
        wordBank: words.length ? words : undefined,
      };
    }
    case 'error-correction': {
      const instruction = exercise.instructionEn || exercise.instructionMk || 'Fix the error';
      return {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: `${instruction}: ${exercise.sentenceWithErrorMk}`,
        correctAnswer: exercise.correctedWord,
        explanation,
        caseSensitive: false,
        placeholder: 'Type your answer...',
      };
    }
    default:
      return null;
  }
}

function buildLessonRunnerSteps(
  lesson: GrammarLessonData,
  vocabLookup: Map<string, PracticeVocabEntry>
): Array<Record<string, unknown>> {
  const steps: Array<Record<string, unknown>> = [];
  steps.push(...buildLessonRunnerInfoSteps(lesson, vocabLookup));

  if (lesson.exercises && lesson.exercises.length > 0) {
    for (const exercise of lesson.exercises) {
      const step = mapExerciseToLessonRunnerStep(exercise);
      if (step) steps.push(step);
    }
  }

  return steps;
}

export async function seedCefrGrammarCurriculum() {
  console.log('📚 Seeding CEFR grammar into curriculum paths...');

  const grammarLessons = loadJson<GrammarLessonData[]>('data/grammar-lessons.json');
  const grammarMap = loadJson<{ mappings: GrammarMapping[] }>('data/grammar-curriculum-map.json');
  const practiceVocabulary = loadJson<PracticeVocabEntry[]>('data/practice-vocabulary.json');

  const vocabLookup = new Map<string, PracticeVocabEntry>();
  practiceVocabulary.forEach((entry) => {
    const key = normalizeTerm(entry.macedonian);
    if (key) vocabLookup.set(key, entry);
  });

  const grammarById = new Map<string, GrammarLessonData & { sourceIndex: number }>();
  grammarLessons.forEach((lesson, index) => {
    grammarById.set(lesson.id, { ...lesson, sourceIndex: index });
  });

  const grammarByJourney = new Map<string, Array<{ lesson: GrammarLessonData & { sourceIndex: number }; ref: CurriculumRef }>>();
  for (const mapping of grammarMap.mappings) {
    const lesson = grammarById.get(mapping.grammarLessonId);
    if (!lesson) {
      console.warn(`⚠️  Grammar lesson not found for mapping: ${mapping.grammarLessonId}`);
      continue;
    }
    for (const ref of mapping.curriculumRefs) {
      if (!grammarByJourney.has(ref.journeyId)) {
        grammarByJourney.set(ref.journeyId, []);
      }
      grammarByJourney.get(ref.journeyId)?.push({ lesson, ref });
    }
  }

  const managedGrammarIds = new Set(grammarLessons.map((lesson) => grammarLessonDbId(lesson.id)));

  for (const config of JOURNEY_CONFIG) {
    const { journeyId, difficultyLevel } = config;
    const modules = await prisma.module.findMany({
      where: { journeyId },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (modules.length === 0) {
      console.warn(`⚠️  No modules found for ${journeyId}. Skipping grammar insertion.`);
      continue;
    }

    const baseLessonsByModule = new Map<string, typeof modules[number]['lessons']>();
    const flattened: Array<{ moduleId: string; lessonId: string; orderIndex: number; title: string }> = [];
    for (const curriculumModule of modules) {
      const baseLessons = curriculumModule.lessons.filter((lesson) => !isManagedGrammarLesson(lesson.id));
      baseLessonsByModule.set(curriculumModule.id, baseLessons);
      for (const lesson of baseLessons) {
        flattened.push({
          moduleId: curriculumModule.id,
          lessonId: lesson.id,
          orderIndex: lesson.orderIndex,
          title: lesson.title,
        });
      }
    }

    const insertionsByModule = new Map<string, Array<{ lesson: GrammarLessonData & { sourceIndex: number }; ref: CurriculumRef; afterLessonId: string }>>();
    const journeyMappings = grammarByJourney.get(journeyId) ?? [];
    for (const mapping of journeyMappings) {
      const normalizedRefTitle = normalizeTitleForMatch(mapping.ref.lessonTitle);
      const targetByTitle = normalizedRefTitle
        ? flattened.find((lesson) => normalizeTitleForMatch(lesson.title).includes(normalizedRefTitle))
        : undefined;
      const target = targetByTitle || flattened[mapping.ref.lessonNumber - 1];
      if (!target) {
        if (normalizedRefTitle.includes('азбука')) {
          if (!insertionsByModule.has(modules[0].id)) {
            insertionsByModule.set(modules[0].id, []);
          }
          insertionsByModule.get(modules[0].id)?.push({
            lesson: mapping.lesson,
            ref: mapping.ref,
            afterLessonId: START_KEY,
          });
          continue;
        }
        console.warn(
          `⚠️  No target lesson ${mapping.ref.lessonNumber} in ${journeyId} for grammar ${mapping.lesson.id}`
        );
        continue;
      }
      if (!insertionsByModule.has(target.moduleId)) {
        insertionsByModule.set(target.moduleId, []);
      }
      insertionsByModule.get(target.moduleId)?.push({
        lesson: mapping.lesson,
        ref: mapping.ref,
        afterLessonId: target.lessonId,
      });
    }

    for (const curriculumModule of modules) {
      const baseLessons = baseLessonsByModule.get(curriculumModule.id) ?? [];
      const insertions = insertionsByModule.get(curriculumModule.id) ?? [];

      const insertionsByLesson = new Map<string, Array<{ lesson: GrammarLessonData & { sourceIndex: number }; ref: CurriculumRef }>>();
      insertions.forEach((entry) => {
        if (!insertionsByLesson.has(entry.afterLessonId)) {
          insertionsByLesson.set(entry.afterLessonId, []);
        }
        insertionsByLesson.get(entry.afterLessonId)?.push({ lesson: entry.lesson, ref: entry.ref });
      });

      const newOrder: Array<
        | { type: 'base'; lessonId: string }
        | { type: 'grammar'; lesson: GrammarLessonData & { sourceIndex: number }; ref: CurriculumRef }
      > = [];

      const startInsertions = insertionsByLesson.get(START_KEY) || [];
      startInsertions
        .sort((a, b) => a.lesson.sourceIndex - b.lesson.sourceIndex)
        .forEach((entry) => newOrder.push({ type: 'grammar', lesson: entry.lesson, ref: entry.ref }));

      for (const lesson of baseLessons) {
        newOrder.push({ type: 'base', lessonId: lesson.id });
        const extras = insertionsByLesson.get(lesson.id) || [];
        extras
          .sort((a, b) => a.lesson.sourceIndex - b.lesson.sourceIndex)
          .forEach((entry) => newOrder.push({ type: 'grammar', lesson: entry.lesson, ref: entry.ref }));
      }

      if (newOrder.length === 0) continue;

      await prisma.curriculumLesson.updateMany({
        where: { moduleId: curriculumModule.id },
        data: {
          orderIndex: { increment: ORDER_OFFSET },
        },
      });

      for (const [index, entry] of newOrder.entries()) {
        const orderIndex = index + 1;
        if (entry.type === 'base') {
          await prisma.curriculumLesson.update({
            where: { id: entry.lessonId },
            data: { orderIndex },
          });
          continue;
        }

        const grammarLesson = entry.lesson;
        const lessonId = grammarLessonDbId(grammarLesson.id);
        const title = buildLessonTitle(grammarLesson);
        const summary = buildLessonSummary(grammarLesson, entry.ref);
        const content = buildLessonContent(grammarLesson);
        const estimatedMinutes = Math.max(8, Math.min(20, (grammarLesson.exercises?.length ?? 6) * 2));
        const lessonRunnerSteps = buildLessonRunnerSteps(grammarLesson, vocabLookup);
        const lessonRunnerConfig = lessonRunnerSteps.length > 0 ? JSON.stringify(lessonRunnerSteps) : null;
        const useLessonRunner = Boolean(lessonRunnerConfig);

        const curriculumLesson = await prisma.curriculumLesson.upsert({
          where: { id: lessonId },
          update: {
            moduleId: curriculumModule.id,
            title,
            summary,
            content,
            orderIndex,
            difficultyLevel,
            estimatedMinutes,
            useLessonRunner,
            lessonRunnerConfig,
            contentStatus: 'published',
          },
          create: {
            id: lessonId,
            moduleId: curriculumModule.id,
            title,
            summary,
            content,
            orderIndex,
            difficultyLevel,
            estimatedMinutes,
            useLessonRunner,
            lessonRunnerConfig,
            contentStatus: 'published',
          },
        });

        await prisma.grammarNote.deleteMany({ where: { lessonId: curriculumLesson.id } });
        await prisma.vocabularyItem.deleteMany({ where: { lessonId: curriculumLesson.id } });
        await prisma.exercise.deleteMany({ where: { lessonId: curriculumLesson.id } });

        const note = grammarLesson.grammarNote;
        if (note) {
          const noteTitle = note.titleEn || note.titleMk || title;
          const explanation = note.contentEn || note.contentMk || grammarLesson.grammar_notes || '';
          const examples = JSON.stringify(note.examplesMk || note.examplesEn || []);

          await prisma.grammarNote.create({
            data: {
              lessonId: curriculumLesson.id,
              title: noteTitle,
              explanation,
              examples,
              category: 'grammar',
              orderIndex: 1,
            },
          });
        }

        if (grammarLesson.vocabulary_list && grammarLesson.vocabulary_list.length > 0) {
          let vocabIndex = 1;
          for (const entry of grammarLesson.vocabulary_list) {
            const { base, gender, en } = parseVocabularyEntry(entry);
            if (!base) continue;

            const lookup = vocabLookup.get(normalizeTerm(base));
            const englishText = lookup?.english || en || '';
            const category = lookup?.category ?? 'grammar';

            await prisma.vocabularyItem.create({
              data: {
                lessonId: curriculumLesson.id,
                macedonianText: base,
                englishText,
                gender,
                category,
                orderIndex: vocabIndex,
                isCore: true,
              },
            });
            vocabIndex += 1;
          }
        }

        if (grammarLesson.exercises && grammarLesson.exercises.length > 0) {
          let exerciseIndex = 1;
          for (const ex of grammarLesson.exercises) {
            const mapped = mapExerciseToDb(ex);
            if (!mapped || !mapped.correctAnswer) continue;

            await prisma.exercise.create({
              data: {
                lessonId: curriculumLesson.id,
                orderIndex: exerciseIndex,
                type: mapped.type,
                question: mapped.question,
                options: mapped.options,
                correctAnswer: mapped.correctAnswer,
                explanation: mapped.explanation ?? null,
              },
            });
            exerciseIndex += 1;
          }
        }
      }
    }

    await prisma.curriculumLesson.deleteMany({
      where: {
        module: { journeyId },
        id: {
          startsWith: GRAMMAR_ID_PREFIX,
          notIn: Array.from(managedGrammarIds),
        },
      },
    });

    console.log(`✅ Inserted grammar lessons into ${journeyId}`);
  }

  console.log('✅ CEFR grammar curriculum integration complete.');
}

if (require.main === module) {
  seedCefrGrammarCurriculum()
    .catch((error) => {
      console.error('Error seeding CEFR grammar curriculum:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
