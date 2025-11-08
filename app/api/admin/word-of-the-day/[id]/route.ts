import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// Validation schema for updating Word of the Day
const updateWordOfTheDaySchema = z.object({
  macedonian: z.string().min(1, 'Macedonian word is required').max(200, 'Macedonian word must be 200 characters or less'),
  pronunciation: z.string().nullable().optional(),
  english: z.string().min(1, 'English translation is required').max(200, 'English translation must be 200 characters or less'),
  partOfSpeech: z.string().nullable().optional(),
  exampleMk: z.string().nullable().optional(),
  exampleEn: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  scheduledDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean(),
});

// GET - Get single word
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const word = await prisma.wordOfTheDay.findUnique({
      where: { id },
    });

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error('[API] Error fetching word:', error);
    return NextResponse.json({ error: 'Failed to fetch word' }, { status: 500 });
  }
}

// PUT - Update word
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validationResult = updateWordOfTheDaySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const word = await prisma.wordOfTheDay.update({
      where: { id },
      data: {
        macedonian: data.macedonian,
        pronunciation: data.pronunciation,
        english: data.english,
        partOfSpeech: data.partOfSpeech,
        exampleMk: data.exampleMk,
        exampleEn: data.exampleEn,
        icon: data.icon,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(word);
  } catch (error) {
    console.error('[API] Error updating word:', error);
    return NextResponse.json({ error: 'Failed to update word' }, { status: 500 });
  }
}

// DELETE - Delete word
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.wordOfTheDay.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting word:', error);
    return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
  }
}
