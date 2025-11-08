import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
    const { macedonian, pronunciation, english, partOfSpeech, exampleMk, exampleEn, icon, scheduledDate, isActive } = body;

    const word = await prisma.wordOfTheDay.update({
      where: { id },
      data: {
        macedonian,
        pronunciation,
        english,
        partOfSpeech,
        exampleMk,
        exampleEn,
        icon,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        isActive,
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
