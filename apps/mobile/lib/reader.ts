import { apiFetch } from './api';

// Types for graded reader stories

export type ReaderStory = {
  id: string;
  title_mk: string;
  title_en: string;
  difficulty: 'A1' | 'A2' | 'B1';
  estimatedMinutes: number;
  tags: string[];
  wordCount: number;
};

// Extended type for 30-day challenge stories
export type ChallengeStory = ReaderStory & {
  day?: number;
  series?: string;
  completed?: boolean; // Tracked locally via AsyncStorage
};

export type TextBlock = {
  type: string;
  value: string;
};

export type VocabularyItem = {
  mk: string;
  en: string;
  pos?: string;
};

export type ReaderStoryDetail = ReaderStory & {
  text_blocks_mk: TextBlock[];
  vocabulary: VocabularyItem[];
};

// 30-Day Challenge type
export type ReadingChallenge = {
  title: string;
  description: string;
  totalDays: number;
  stories: ChallengeStory[];
};

// API response types

type ReaderListResponse = {
  stories: ReaderStory[];
  challenge?: ReadingChallenge;
  meta: { total: number; challengeTotal?: number };
};

type ReaderDetailResponse = {
  story: ReaderStoryDetail;
};

// Translation cache for API fallback
const translationCache = new Map<string, string>();

/**
 * Fetch list of graded reader stories
 * @param level - Optional difficulty filter: 'A1' | 'A2' | 'B1'
 */
export async function fetchStories(level?: string): Promise<ReaderStory[]> {
  const params = level ? `?level=${level}` : '';
  const response = await apiFetch<ReaderListResponse>(
    `/api/mobile/reader${params}`,
    { skipAuth: true }
  );
  return response.stories;
}

/**
 * Fetch stories including the 30-day challenge
 * @param level - Optional difficulty filter: 'A1' | 'A2' | 'B1'
 * @returns Stories and challenge data
 */
export async function fetchStoriesWithChallenge(level?: string): Promise<{
  stories: ReaderStory[];
  challenge?: ReadingChallenge;
}> {
  const params = level ? `?level=${level}` : '';
  const response = await apiFetch<ReaderListResponse>(
    `/api/mobile/reader${params}`,
    { skipAuth: true }
  );
  return {
    stories: response.stories,
    challenge: response.challenge,
  };
}

/**
 * Fetch only 30-day challenge stories
 */
export async function fetchChallengeStories(): Promise<ChallengeStory[]> {
  const response = await apiFetch<{ stories: ChallengeStory[]; meta: { total: number } }>(
    '/api/mobile/reader?type=challenge',
    { skipAuth: true }
  );
  return response.stories;
}

/**
 * Fetch single story with full content (text blocks and vocabulary)
 * @param id - Story ID
 */
export async function fetchStoryDetail(id: string): Promise<ReaderStoryDetail> {
  const response = await apiFetch<ReaderDetailResponse>(
    `/api/mobile/reader?id=${encodeURIComponent(id)}`,
    { skipAuth: true }
  );
  return response.story;
}

/**
 * Translate a word using the translate API
 * Falls back to this when word is not in story vocabulary
 * @param word - Macedonian word to translate
 * @returns English translation or null on failure
 */
export async function translateWord(word: string): Promise<string | null> {
  const normalized = word.toLowerCase();

  // Check cache first
  if (translationCache.has(normalized)) {
    return translationCache.get(normalized)!;
  }

  try {
    const response = await apiFetch<{ translatedText: string }>(
      '/api/translate',
      {
        method: 'POST',
        body: {
          text: word,
          sourceLang: 'mk',
          targetLang: 'en',
        },
        skipAuth: true,
      }
    );

    const translation = response.translatedText;

    // Cache for session
    translationCache.set(normalized, translation);

    return translation;
  } catch (error) {
    console.warn('[Reader] Translation failed:', error);
    return null;
  }
}

/**
 * Look up word in story vocabulary
 * @param word - Word to look up (case-insensitive)
 * @param vocabulary - Story vocabulary array
 * @returns Vocabulary item or undefined
 */
export function lookupVocabulary(
  word: string,
  vocabulary: VocabularyItem[]
): VocabularyItem | undefined {
  const normalized = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
  return vocabulary.find((v) => v.mk.toLowerCase() === normalized);
}
