import { apiFetch } from './api';
import { queuePracticeCompletion } from './offline-queue';
import { normalizeAnswer } from '@mk/practice';

// Practice item from the API
export type PracticeItem = {
  id: string;
  macedonian: string;
  english: string;
  category?: string;
  lessonId?: string;
};

// Deck types available for practice
export type PracticeDeck = 'lesson-review' | 'curated';

// Practice modes (exercise types)
export type PracticeMode = 'multipleChoice' | 'typing' | 'cloze' | 'tapWords' | 'matching';

// Card for presenting to the user
export type PracticeCard = {
  id: string;
  type: PracticeMode;
  prompt: string;
  answer: string;
  options?: string[]; // for multipleChoice
  item: PracticeItem;
};

// API response structure
type PracticeApiResponse = {
  items: PracticeItem[];
  meta: {
    deckType: string;
    total: number;
  };
};

// Answer evaluation result
export type AnswerResult = {
  isCorrect: boolean;
  expected: string;
};

/**
 * Fetch practice items from the mobile API
 */
export async function fetchPracticeItems(
  deck: PracticeDeck,
  limit: number = 20
): Promise<PracticeItem[]> {
  const response = await apiFetch<PracticeApiResponse>(
    `/api/mobile/practice?deck=${deck}&limit=${limit}`
  );
  return response.items;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Create a practice card from a vocabulary item
 *
 * For multipleChoice, generates 4 options including the correct answer
 * by picking distractors from other items in the deck
 */
export function createPracticeCard(
  item: PracticeItem,
  type: PracticeMode,
  allItems: PracticeItem[]
): PracticeCard {
  const baseCard: PracticeCard = {
    id: item.id,
    type,
    prompt: item.macedonian,
    answer: item.english,
    item,
  };

  if (type === 'multipleChoice') {
    const options = new Set<string>();
    options.add(item.english);

    // Add distractors from other items
    const otherItems = shuffleArray(allItems.filter((other) => other.id !== item.id));
    for (const other of otherItems) {
      if (options.size >= 4) break;
      if (other.english && other.english.trim()) {
        options.add(other.english);
      }
    }

    // Shuffle the options
    baseCard.options = shuffleArray(Array.from(options));
  }

  return baseCard;
}

/**
 * Evaluate a user's answer against the expected answer
 *
 * Uses @mk/practice normalizeAnswer for Unicode-aware comparison
 * (same normalization as PWA for parity)
 */
export function evaluateAnswer(card: PracticeCard, userAnswer: string): AnswerResult {
  const normalizedExpected = normalizeAnswer(card.answer);
  const normalizedUser = normalizeAnswer(userAnswer);

  return {
    isCorrect: normalizedExpected === normalizedUser,
    expected: card.answer,
  };
}

/**
 * Build a full practice deck from items
 */
export function buildPracticeDeck(
  items: PracticeItem[],
  type: PracticeMode = 'multipleChoice'
): PracticeCard[] {
  return shuffleArray(items).map((item) => createPracticeCard(item, type, items));
}

// Practice completion data for API submission
export type PracticeCompletionData = {
  deckType: string;
  mode: string;
  correct: number;
  total: number;
  accuracy: number;
  xpEarned: number;
  durationMs: number;
};

/**
 * Submit practice completion to backend API
 *
 * Tries API first; on failure, queues for later retry.
 * Returns immediately to avoid blocking UI.
 */
export async function submitPracticeCompletion(
  data: PracticeCompletionData
): Promise<void> {
  try {
    await apiFetch('/api/mobile/practice-completions', {
      method: 'POST',
      body: {
        ...data,
        completedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    // Queue for later retry when back online
    console.warn('[Practice] API failed, queueing for retry:', err);
    await queuePracticeCompletion(data);
  }
}
