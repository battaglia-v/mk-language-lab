import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
    const { macedonian, english, category, difficulty, isActive } = body;

    const word = await prisma.practiceVocabulary.update({
      where: { id },
      data: {
        macedonian,
        english,
        category,
        difficulty,
        isActive,
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
