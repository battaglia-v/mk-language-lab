import { NextRequest, NextResponse } from 'next/server';
import { createScopedLogger } from '@/lib/logger';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const log = createScopedLogger('api.mobile.reader');

// Response types for mobile reader API
type TextBlock = {
  type: string;
  value: string;
};

type VocabularyItem = {
  mk: string;
  en: string;
  pos?: string;
};

type ReaderStoryMeta = {
  id: string;
  title_mk: string;
  title_en: string;
  difficulty: 'A1' | 'A2' | 'B1';
  estimatedMinutes: number;
  tags: string[];
  wordCount: number;
};

type ReaderStoryDetail = ReaderStoryMeta & {
  text_blocks_mk: TextBlock[];
  vocabulary: VocabularyItem[];
};

type ReaderApiResponse = {
  stories: ReaderStoryMeta[];
  meta: { total: number };
};

type ReaderDetailResponse = {
  story: ReaderStoryDetail;
};

// Extended type for challenge stories
type ChallengeStoryDetail = ReaderStoryDetail & {
  day?: number;
  series?: string;
};

// Load all graded reader stories from disk
function loadGradedReaders(): ReaderStoryDetail[] {
  const gradedDir = join(process.cwd(), 'data/reader/graded');

  try {
    const files = readdirSync(gradedDir).filter((f) => f.endsWith('.json'));
    const stories: ReaderStoryDetail[] = [];

    for (const file of files) {
      const content = readFileSync(join(gradedDir, file), 'utf-8');
      const data = JSON.parse(content);

      // Calculate word count from text_blocks_mk
      const wordCount = data.text_blocks_mk?.reduce((acc: number, block: TextBlock) => {
        return acc + block.value.split(/\s+/).filter(Boolean).length;
      }, 0) ?? 0;

      stories.push({
        id: data.id,
        title_mk: data.title_mk,
        title_en: data.title_en,
        difficulty: data.difficulty,
        estimatedMinutes: data.estimatedMinutes,
        tags: data.tags ?? [],
        wordCount,
        text_blocks_mk: data.text_blocks_mk ?? [],
        vocabulary: data.vocabulary ?? [],
      });
    }

    // Sort by difficulty (A1 -> A2 -> B1) then by title
    const difficultyOrder = { A1: 1, A2: 2, B1: 3 };
    stories.sort((a, b) => {
      const diffA = difficultyOrder[a.difficulty] ?? 99;
      const diffB = difficultyOrder[b.difficulty] ?? 99;
      if (diffA !== diffB) return diffA - diffB;
      return a.title_mk.localeCompare(b.title_mk, 'mk');
    });

    return stories;
  } catch (error) {
    log.error('Failed to load graded readers', { error });
    return [];
  }
}

// Load 30-day challenge stories
function load30DayChallenge(): ChallengeStoryDetail[] {
  const challengeDir = join(process.cwd(), 'data/reader/challenges/30-day-little-prince');

  try {
    const files = readdirSync(challengeDir).filter((f) => f.endsWith('.json'));
    const stories: ChallengeStoryDetail[] = [];

    for (const file of files) {
      const content = readFileSync(join(challengeDir, file), 'utf-8');
      const data = JSON.parse(content);

      // Calculate word count from text_blocks_mk
      const wordCount = data.text_blocks_mk?.reduce((acc: number, block: TextBlock) => {
        return acc + block.value.split(/\s+/).filter(Boolean).length;
      }, 0) ?? 0;

      stories.push({
        id: data.id,
        title_mk: data.title_mk,
        title_en: data.title_en,
        difficulty: data.difficulty || 'B1',
        estimatedMinutes: data.estimatedMinutes || 8,
        tags: data.tags ?? ['30-day-challenge'],
        wordCount,
        text_blocks_mk: data.text_blocks_mk ?? [],
        vocabulary: data.vocabulary ?? [],
        day: data.day,
        series: data.series || '30-Day Reading Challenge',
      });
    }

    // Sort by day number
    stories.sort((a, b) => (a.day ?? 0) - (b.day ?? 0));

    return stories;
  } catch (error) {
    log.error('Failed to load 30-day challenge', { error });
    return [];
  }
}

// Extended response types
type ChallengeStoryMeta = ReaderStoryMeta & {
  day?: number;
  series?: string;
};

type ReaderApiResponseExtended = {
  stories: ReaderStoryMeta[];
  challenge?: {
    title: string;
    description: string;
    totalDays: number;
    stories: ChallengeStoryMeta[];
  };
  meta: { total: number; challengeTotal?: number };
};

/**
 * GET /api/mobile/reader
 *
 * Returns graded reader stories and 30-day challenge for mobile app.
 *
 * Query params:
 * - level: 'A1' | 'A2' | 'B1' - filter by difficulty level
 * - id: string - get single story with full content (text_blocks_mk, vocabulary)
 * - type: 'challenge' - get only 30-day challenge stories
 *
 * Response (list mode - no id):
 * {
 *   stories: Array<{ id, title_mk, title_en, difficulty, estimatedMinutes, tags, wordCount }>,
 *   challenge: { title, description, totalDays, stories },
 *   meta: { total, challengeTotal }
 * }
 *
 * Response (detail mode - with id):
 * {
 *   story: { ...metadata, text_blocks_mk, vocabulary }
 * }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  try {
    const allStories = loadGradedReaders();
    const challengeStories = load30DayChallenge();

    // Detail mode: return single story with full content
    if (id) {
      // Check graded readers first
      let story = allStories.find((s) => s.id === id);
      
      // Then check challenge stories
      if (!story) {
        story = challengeStories.find((s) => s.id === id);
      }

      if (!story) {
        return NextResponse.json({ error: 'Story not found' }, { status: 404 });
      }

      log.info('Returning story detail', { id, difficulty: story.difficulty });

      const response: ReaderDetailResponse = { story };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Challenge only mode
    if (type === 'challenge') {
      const challengeMetas: ChallengeStoryMeta[] = challengeStories.map(
        ({ id, title_mk, title_en, difficulty, estimatedMinutes, tags, wordCount, day, series }) => ({
          id,
          title_mk,
          title_en,
          difficulty,
          estimatedMinutes,
          tags,
          wordCount,
          day,
          series,
        })
      );

      return NextResponse.json({
        stories: challengeMetas,
        meta: { total: challengeStories.length },
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // List mode: return metadata only (without text_blocks_mk, vocabulary)
    let stories = allStories;

    // Filter by level if specified
    if (level && ['A1', 'A2', 'B1'].includes(level)) {
      stories = stories.filter((s) => s.difficulty === level);
    }

    // Strip full content for list response
    const storyMetas: ReaderStoryMeta[] = stories.map(
      ({ id, title_mk, title_en, difficulty, estimatedMinutes, tags, wordCount }) => ({
        id,
        title_mk,
        title_en,
        difficulty,
        estimatedMinutes,
        tags,
        wordCount,
      })
    );

    // Build challenge section
    const challengeMetas: ChallengeStoryMeta[] = challengeStories.map(
      ({ id, title_mk, title_en, difficulty, estimatedMinutes, tags, wordCount, day, series }) => ({
        id,
        title_mk,
        title_en,
        difficulty,
        estimatedMinutes,
        tags,
        wordCount,
        day,
        series,
      })
    );

    log.info('Returning story list', { 
      level: level ?? 'all', 
      storiesCount: storyMetas.length,
      challengeCount: challengeMetas.length,
    });

    const response: ReaderApiResponseExtended = {
      stories: storyMetas,
      challenge: {
        title: '30-Day Reading Challenge',
        description: 'Read "The Little Prince" in Macedonian, one chapter at a time.',
        totalDays: 30,
        stories: challengeMetas,
      },
      meta: { 
        total: allStories.length,
        challengeTotal: challengeStories.length,
      },
    };

    // Static data - cache for 5 minutes
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    log.error('Failed to fetch reader stories', { error, level, id });
    return NextResponse.json({ error: 'Failed to fetch reader stories' }, { status: 500 });
  }
}
