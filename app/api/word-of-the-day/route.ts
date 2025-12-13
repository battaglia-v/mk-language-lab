import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { wordOfDayRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { cyrillicToLatin, ensureCyrillic } from '@/lib/transliterate';
import fallbackWords from '@/data/word-of-the-day.json';

type WOTDWord = {
  macedonian: string;
  english: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  exampleMk?: string | null;
  exampleEn?: string | null;
  icon?: string | null;
};

function getWordForToday(words: WOTDWord[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % words.length;
  return words[index];
}

function formatWordResponse(word: WOTDWord) {
  // Ensure Macedonian text is in Cyrillic script (convert if Latin was imported)
  const macedonianCyrillic = ensureCyrillic(word.macedonian);
  const exampleMkCyrillic = word.exampleMk ? ensureCyrillic(word.exampleMk) : `${macedonianCyrillic}.`;
  
  return {
    macedonian: macedonianCyrillic,
    pronunciation: word.pronunciation || cyrillicToLatin(macedonianCyrillic),
    english: word.english,
    partOfSpeech: word.partOfSpeech || 'word',
    exampleMk: exampleMkCyrillic,
    exampleEn: word.exampleEn || word.english,
    icon: word.icon || '📝',
  };
}

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

    // Try to get words from database first
    let words: WOTDWord[] = [];
    try {
      words = await prisma.practiceVocabulary.findMany({
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
    } catch (dbError) {
      console.warn('[WOTD] Database query failed, using fallback:', dbError);
    }

    // Fall back to static JSON if no database words
    if (words.length === 0) {
      console.log('[WOTD] No DB words found, using fallback JSON');
      words = fallbackWords as WOTDWord[];
    }

    if (words.length === 0) {
      return NextResponse.json(
        { error: 'No words available for Word of the Day' },
        { status: 404 }
      );
    }

    const word = getWordForToday(words);
    return NextResponse.json(formatWordResponse(word));
  } catch (error) {
    console.error('Error fetching Word of the Day:', error);
    
    // Final fallback: return a word from static JSON even on error
    if (fallbackWords.length > 0) {
      const word = getWordForToday(fallbackWords as WOTDWord[]);
      return NextResponse.json(formatWordResponse(word));
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Word of the Day' },
      { status: 500 }
    );
  }
}
