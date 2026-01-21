import { NextRequest, NextResponse } from 'next/server';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import prisma from '@/lib/prisma';
import { createScopedLogger } from '@/lib/logger';
import alphabetData from '@/data/alphabet-deck.json';

const log = createScopedLogger('api.mobile.lesson');

interface LessonSection {
  type: 'dialogue' | 'vocabulary' | 'grammar' | 'practice';
  content: unknown;
}

/**
 * GET /api/mobile/lesson/[lessonId]
 *
 * Returns full lesson content from database.
 * Works for both authenticated and unauthenticated users.
 * Lesson content is public for browsing; progress tracking requires auth.
 *
 * Fetches:
 * - Lesson metadata from CurriculumLesson
 * - Vocabulary from VocabularyItem table
 * - Grammar notes from GrammarNote table
 * - Dialogues from Dialogue + DialogueLine tables
 * - Exercises from Exercise table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  // Auth is optional - lesson content is viewable without login
  const mobileSession = await getMobileSessionFromRequest(request);

  // Special case: Alphabet lesson uses static JSON data
  if (lessonId === 'alphabet') {
    return NextResponse.json({
      lesson: {
        id: 'alphabet',
        title: alphabetData.meta.title,
        titleMk: alphabetData.meta.titleMk,
        summary: alphabetData.meta.description,
        moduleTitle: 'A1 Beginner',
        journeyId: 'ukim-a1',
        isSpecialLesson: true,
        sections: [
          {
            type: 'alphabet',
            content: {
              items: alphabetData.items,
              uniqueLetters: alphabetData.uniqueLetters,
              softLetters: alphabetData.softLetters,
            },
          },
        ],
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  }

  try {
    // Fetch lesson with all related content
    const [lesson, vocabulary, grammarNotes, dialogues, exercises] = await Promise.all([
      // Lesson metadata
      prisma.curriculumLesson.findUnique({
        where: { id: lessonId },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              journeyId: true,
            },
          },
        },
      }),

      // Vocabulary items
      prisma.vocabularyItem.findMany({
        where: { lessonId },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          macedonianText: true,
          englishText: true,
          transliteration: true,
          partOfSpeech: true,
          gender: true,
          exampleSentenceMk: true,
          exampleSentenceEn: true,
        },
      }),

      // Grammar notes
      prisma.grammarNote.findMany({
        where: { lessonId },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          explanation: true,
          examples: true,
        },
      }),

      // Dialogues with lines
      prisma.dialogue.findMany({
        where: { lessonId },
        include: {
          lines: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              speaker: true,
              textMk: true,
              textEn: true,
              orderIndex: true,
            },
          },
        },
      }),

      // Exercises
      prisma.exercise.findMany({
        where: { lessonId },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          correctAnswer: true,
          explanation: true,
        },
      }),
    ]);

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Build sections array with actual DB content
    const sections: LessonSection[] = [];

    // Add dialogue section
    if (dialogues.length > 0) {
      const dialogueContent = dialogues.flatMap((d) =>
        d.lines.map((line) => ({
          speaker: line.speaker,
          text: line.textMk,
          translation: line.textEn || undefined,
        }))
      );
      if (dialogueContent.length > 0) {
        sections.push({ type: 'dialogue', content: dialogueContent });
      }
    }

    // Add vocabulary section
    if (vocabulary.length > 0) {
      const vocabContent = vocabulary.map((v) => ({
        word: v.macedonianText,
        translation: v.englishText,
        transliteration: v.transliteration || undefined,
        pos: v.partOfSpeech || undefined,
        gender: v.gender || undefined,
        exampleMk: v.exampleSentenceMk || undefined,
        exampleEn: v.exampleSentenceEn || undefined,
      }));
      sections.push({ type: 'vocabulary', content: vocabContent });
    }

    // Add grammar section
    if (grammarNotes.length > 0) {
      const grammarContent = grammarNotes.map((g) => {
        // Parse examples from JSON string
        let examples: string[] = [];
        if (g.examples) {
          try {
            examples = JSON.parse(g.examples);
          } catch {
            // If parsing fails, try to use as-is or default to empty
            examples = Array.isArray(g.examples) ? g.examples : [];
          }
        }
        return {
          title: g.title,
          explanation: g.explanation,
          examples,
        };
      });
      sections.push({ type: 'grammar', content: grammarContent });
    }

    // Add practice/exercises section
    if (exercises.length > 0) {
      const practiceContent = exercises.map((e) => {
        // Parse options from JSON string
        let options: string[] = [];
        try {
          options = JSON.parse(e.options);
        } catch {
          options = [];
        }
        
        return {
          id: e.id,
          type: e.type,
          question: e.question,
          options,
          answer: e.correctAnswer,
          explanation: e.explanation || undefined,
        };
      });
      sections.push({ type: 'practice', content: practiceContent });
    }

    log.info('Lesson fetched', {
      lessonId,
      sections: sections.map((s) => s.type),
      vocabCount: vocabulary.length,
      grammarCount: grammarNotes.length,
      dialogueCount: dialogues.length,
      exerciseCount: exercises.length,
      authenticated: !!mobileSession,
    });

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        moduleTitle: lesson.module.title,
        journeyId: lesson.module.journeyId,
        sections,
      },
    }, {
      headers: {
        // Cache public content
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    log.error('Failed to fetch lesson', { error, lessonId });
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}
