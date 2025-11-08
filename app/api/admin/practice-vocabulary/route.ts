import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const {
      macedonian,
      english,
      category,
      difficulty,
      isActive,
      includeInWOTD,
      pronunciation,
      partOfSpeech,
      exampleMk,
      exampleEn,
      icon,
    } = body;

    // Validate required fields
    if (!macedonian || !english) {
      return NextResponse.json({ error: 'Macedonian and English translations are required' }, { status: 400 });
    }

    const word = await prisma.practiceVocabulary.create({
      data: {
        macedonian,
        english,
        category: category || null,
        difficulty: difficulty || 'beginner',
        isActive: isActive ?? true,
        includeInWOTD: includeInWOTD ?? false,
        pronunciation: pronunciation || null,
        partOfSpeech: partOfSpeech || null,
        exampleMk: exampleMk || null,
        exampleEn: exampleEn || null,
        icon: icon || null,
      },
    });

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating vocabulary:', error);
    return NextResponse.json({ error: 'Failed to create vocabulary' }, { status: 500 });
  }
}
