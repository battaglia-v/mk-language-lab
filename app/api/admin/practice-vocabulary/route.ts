import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating Practice Vocabulary
const createVocabularySchema = z.object({
  macedonian: z.string().min(1, 'Macedonian word is required').max(200, 'Macedonian word must be 200 characters or less'),
  english: z.string().min(1, 'English translation is required').max(200, 'English translation must be 200 characters or less'),
  category: z.string().nullable().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Difficulty must be one of: beginner, intermediate, advanced' }),
  }).default('beginner'),
  isActive: z.boolean().default(true),
  includeInWOTD: z.boolean().default(false),
  pronunciation: z.string().nullable().optional(),
  partOfSpeech: z.string().nullable().optional(),
  exampleMk: z.string().nullable().optional(),
  exampleEn: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

// GET - List all vocabulary words
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const words = await prisma.practiceVocabulary.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error('[API] Error fetching vocabulary:', error);
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 });
  }
}

// POST - Create new vocabulary word
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = createVocabularySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const word = await prisma.practiceVocabulary.create({
      data: {
        macedonian: data.macedonian,
        english: data.english,
        category: data.category || null,
        difficulty: data.difficulty,
        isActive: data.isActive,
        includeInWOTD: data.includeInWOTD,
        pronunciation: data.pronunciation || null,
        partOfSpeech: data.partOfSpeech || null,
        exampleMk: data.exampleMk || null,
        exampleEn: data.exampleEn || null,
        icon: data.icon || null,
      },
    });

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating vocabulary:', error);
    return NextResponse.json({ error: 'Failed to create vocabulary' }, { status: 500 });
  }
}
