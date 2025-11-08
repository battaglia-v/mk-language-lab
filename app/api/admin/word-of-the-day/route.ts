import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - List all words
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const words = await prisma.wordOfTheDay.findMany({
      orderBy: { scheduledDate: 'desc' },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error('[API] Error fetching words:', error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

// POST - Create new word
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { macedonian, pronunciation, english, partOfSpeech, exampleMk, exampleEn, icon, scheduledDate, isActive } = body;

    // Validate required fields
    if (!macedonian || !pronunciation || !english || !partOfSpeech || !exampleMk || !exampleEn || !icon || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const word = await prisma.wordOfTheDay.create({
      data: {
        macedonian,
        pronunciation,
        english,
        partOfSpeech,
        exampleMk,
        exampleEn,
        icon,
        scheduledDate: new Date(scheduledDate),
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating word:', error);
    return NextResponse.json({ error: 'Failed to create word' }, { status: 500 });
  }
}
