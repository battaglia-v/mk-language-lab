import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { wordOfDayRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { cyrillicToLatin } from '@/lib/transliterate';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting - generous limits for lightweight endpoint
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await checkRateLimit(wordOfDayRateLimit, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // Get all words flagged for WOTD
    const words = await prisma.practiceVocabulary.findMany({
      where: {
        includeInWOTD: true,
        isActive: true,
      },
      select: {
        macedonian: true,
        english: true,
        pronunciation: true,
        partOfSpeech: true,
        exampleMk: true,
        exampleEn: true,
        icon: true,
      },
    });

    if (words.length === 0) {
      return NextResponse.json(
        { error: 'No words available for Word of the Day' },
        { status: 404 }
      );
    }

    // Get word based on day of year (so it rotates daily)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const index = dayOfYear % words.length;
    const word = words[index];

    // Return with sensible defaults for missing fields
    return NextResponse.json({
      macedonian: word.macedonian,
      pronunciation: word.pronunciation || cyrillicToLatin(word.macedonian),
      english: word.english,
      partOfSpeech: word.partOfSpeech || 'word',
      exampleMk: word.exampleMk || `${word.macedonian}.`,
      exampleEn: word.exampleEn || word.english,
      icon: word.icon || '📝',
    });
  } catch (error) {
    console.error('Error fetching Word of the Day:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Word of the Day' },
      { status: 500 }
    );
  }
}
