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

/**
 * GET /api/mobile/reader
 *
 * Returns graded reader stories for mobile app.
 *
 * Query params:
 * - level: 'A1' | 'A2' | 'B1' - filter by difficulty level
 * - id: string - get single story with full content (text_blocks_mk, vocabulary)
 *
 * Response (list mode - no id):
 * {
 *   stories: Array<{ id, title_mk, title_en, difficulty, estimatedMinutes, tags, wordCount }>,
 *   meta: { total }
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

  try {
    const allStories = loadGradedReaders();

    // Detail mode: return single story with full content
    if (id) {
      const story = allStories.find((s) => s.id === id);

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

    log.info('Returning story list', { level: level ?? 'all', count: storyMetas.length });

    const response: ReaderApiResponse = {
      stories: storyMetas,
      meta: { total: allStories.length },
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
