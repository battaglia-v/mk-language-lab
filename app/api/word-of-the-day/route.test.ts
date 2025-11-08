import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: {
    practiceVocabulary: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  wordOfDayRateLimit: {},
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/transliterate', () => ({
  cyrillicToLatin: vi.fn((text: string) => `transliterated_${text}`),
}));

describe('/api/word-of-the-day GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a word of the day successfully', async () => {
    const { default: prisma } = await import('@/lib/prisma');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    const mockWords = [
      {
        macedonian: 'здраво',
        english: 'hello',
        pronunciation: 'zdravo',
        partOfSpeech: 'noun',
        exampleMk: 'Здраво, како си?',
        exampleEn: 'Hello, how are you?',
        icon: '👋',
      },
      {
        macedonian: 'книга',
        english: 'book',
        pronunciation: 'kniga',
        partOfSpeech: 'noun',
        exampleMk: 'Јас читам книга.',
        exampleEn: 'I am reading a book.',
        icon: '📚',
      },
    ];

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 10000,
    });

    vi.mocked(prisma.practiceVocabulary.findMany).mockResolvedValueOnce(mockWords as any);

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('macedonian');
    expect(data).toHaveProperty('english');
    expect(data).toHaveProperty('pronunciation');
    expect(data).toHaveProperty('partOfSpeech');
    expect(data).toHaveProperty('exampleMk');
    expect(data).toHaveProperty('exampleEn');
    expect(data).toHaveProperty('icon');
  });

  it('returns 429 when rate limit is exceeded', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 30,
      remaining: 0,
      reset: Date.now() + 10000,
    });

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day');
    const response = await GET(request);

    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toBe('Rate limit exceeded. Please try again later.');

    // Check rate limit headers
    expect(response.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.has('X-RateLimit-Reset')).toBe(true);
    expect(response.headers.has('Retry-After')).toBe(true);
  });

  it('returns 404 when no words are available', async () => {
    const { default: prisma } = await import('@/lib/prisma');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 10000,
    });

    vi.mocked(prisma.practiceVocabulary.findMany).mockResolvedValueOnce([]);

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day');
    const response = await GET(request);

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('No words available for Word of the Day');
  });

  it('returns word based on day of year (deterministic rotation)', async () => {
    const { default: prisma } = await import('@/lib/prisma');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    const mockWords = [
      {
        macedonian: 'прво',
        english: 'first',
        pronunciation: 'prvo',
        partOfSpeech: 'adjective',
        exampleMk: 'Прво место.',
        exampleEn: 'First place.',
        icon: '1️⃣',
      },
      {
        macedonian: 'второ',
        english: 'second',
        pronunciation: 'vtoro',
        partOfSpeech: 'adjective',
        exampleMk: 'Второ место.',
        exampleEn: 'Second place.',
        icon: '2️⃣',
      },
    ];

    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 10000,
    });

    vi.mocked(prisma.practiceVocabulary.findMany).mockResolvedValue(mockWords as any);

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day');

    // Call multiple times - should return the same word on the same day
    const response1 = await GET(request);
    const data1 = await response1.json();

    const response2 = await GET(request);
    const data2 = await response2.json();

    expect(data1.macedonian).toBe(data2.macedonian);
  });

  it('provides default values for missing optional fields', async () => {
    const { default: prisma } = await import('@/lib/prisma');
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const { cyrillicToLatin } = await import('@/lib/transliterate');

    const mockWords = [
      {
        macedonian: 'тест',
        english: 'test',
        pronunciation: null,
        partOfSpeech: null,
        exampleMk: null,
        exampleEn: null,
        icon: null,
      },
    ];

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 10000,
    });

    vi.mocked(prisma.practiceVocabulary.findMany).mockResolvedValueOnce(mockWords as any);
    vi.mocked(cyrillicToLatin).mockReturnValueOnce('transliterated_тест');

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day');
    const response = await GET(request);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.pronunciation).toBe('transliterated_тест');
    expect(data.partOfSpeech).toBe('word');
    expect(data.exampleMk).toBe('тест.');
    expect(data.exampleEn).toBe('test');
    expect(data.icon).toBe('📝');
  });

  it('handles database errors gracefully', async () => {
    const { default: prisma } = await import('@/lib/prisma');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 10000,
    });

    vi.mocked(prisma.practiceVocabulary.findMany).mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day');
    const response = await GET(request);

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('Failed to fetch Word of the Day');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching Word of the Day:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('filters words by includeInWOTD and isActive flags', async () => {
    const { default: prisma } = await import('@/lib/prisma');
    const { checkRateLimit } = await import('@/lib/rate-limit');

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 10000,
    });

    const mockWords = [
      {
        macedonian: 'активна',
        english: 'active',
        pronunciation: 'aktivna',
        partOfSpeech: 'adjective',
        exampleMk: 'Активна реч.',
        exampleEn: 'Active word.',
        icon: '✅',
      },
    ];

    vi.mocked(prisma.practiceVocabulary.findMany).mockResolvedValueOnce(mockWords as any);

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day');
    await GET(request);

    expect(prisma.practiceVocabulary.findMany).toHaveBeenCalledWith({
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
  });

  it('extracts IP from request headers for rate limiting', async () => {
    const { checkRateLimit, wordOfDayRateLimit } = await import('@/lib/rate-limit');
    const { default: prisma } = await import('@/lib/prisma');

    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 10000,
    });

    vi.mocked(prisma.practiceVocabulary.findMany).mockResolvedValueOnce([
      {
        macedonian: 'тест',
        english: 'test',
        pronunciation: 'test',
        partOfSpeech: 'noun',
        exampleMk: 'Тест.',
        exampleEn: 'Test.',
        icon: '📝',
      },
    ] as any);

    const request = new NextRequest('http://localhost:3000/api/word-of-the-day', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    });

    await GET(request);

    expect(checkRateLimit).toHaveBeenCalledWith(wordOfDayRateLimit, '192.168.1.1');
  });
});
