import { NextRequest, NextResponse } from 'next/server';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import prisma from '@/lib/prisma';

interface LessonSection {
  type: 'dialogue' | 'vocabulary' | 'grammar' | 'practice';
  content: unknown;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  const mobileSession = await getMobileSessionFromRequest(request);
  if (!mobileSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch lesson from database
  const lesson = await prisma.curriculumLesson.findUnique({
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
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Parse lesson content (stored as JSON string)
  let content: {
    dialogue?: Array<{ speaker: string; text: string; translation?: string }>;
    vocabulary?: Array<{ word: string; translation: string; pos?: string; gender?: string }>;
    grammar?: Array<{ title: string; explanation: string; examples?: string[] }>;
    practice?: Array<{ type: string; question: string; options?: string[]; answer: string }>;
  } | null = null;

  try {
    content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;
  } catch {
    // Content might not be JSON structured
    content = null;
  }

  // Build sections array
  const sections: LessonSection[] = [];

  if (content?.dialogue?.length) {
    sections.push({ type: 'dialogue', content: content.dialogue });
  }
  if (content?.vocabulary?.length) {
    sections.push({ type: 'vocabulary', content: content.vocabulary });
  }
  if (content?.grammar?.length) {
    sections.push({ type: 'grammar', content: content.grammar });
  }
  if (content?.practice?.length) {
    sections.push({ type: 'practice', content: content.practice });
  }

  return NextResponse.json({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      moduleTitle: lesson.module.title,
      journeyId: lesson.module.journeyId,
      sections,
    },
  });
}
