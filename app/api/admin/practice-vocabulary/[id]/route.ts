import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// Validation schema for updating Practice Vocabulary
const updateVocabularySchema = z.object({
  macedonian: z.string().min(1, 'Macedonian word is required').max(200, 'Macedonian word must be 200 characters or less'),
  english: z.string().min(1, 'English translation is required').max(200, 'English translation must be 200 characters or less'),
  category: z.string().nullable().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Difficulty must be one of: beginner, intermediate, advanced' }),
  }),
  isActive: z.boolean(),
  includeInWOTD: z.boolean().optional(),
  pronunciation: z.string().nullable().optional(),
  partOfSpeech: z.string().nullable().optional(),
  exampleMk: z.string().nullable().optional(),
  exampleEn: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

// GET - Get single vocabulary word
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const word = await prisma.practiceVocabulary.findUnique({
      where: { id },
    });

    if (!word) {
      return NextResponse.json({ error: 'Vocabulary not found' }, { status: 404 });
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error('[API] Error fetching vocabulary:', error);
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 });
  }
}

// PUT - Update vocabulary word
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validationResult = updateVocabularySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const word = await prisma.practiceVocabulary.update({
      where: { id },
      data: {
        macedonian: data.macedonian,
        english: data.english,
        category: data.category,
        difficulty: data.difficulty,
        isActive: data.isActive,
        includeInWOTD: data.includeInWOTD,
        pronunciation: data.pronunciation,
        partOfSpeech: data.partOfSpeech,
        exampleMk: data.exampleMk,
        exampleEn: data.exampleEn,
        icon: data.icon,
      },
    });

    return NextResponse.json(word);
  } catch (error) {
    console.error('[API] Error updating vocabulary:', error);
    return NextResponse.json({ error: 'Failed to update vocabulary' }, { status: 500 });
  }
}

// DELETE - Delete vocabulary word
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.practiceVocabulary.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting vocabulary:', error);
    return NextResponse.json({ error: 'Failed to delete vocabulary' }, { status: 500 });
  }
}
