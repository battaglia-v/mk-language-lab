import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import practiceVocabulary from '../../../data/practice-vocabulary.json';

export type ClozeContext = {
  sentence: string;
  translation: string;
};

export type PracticeItem = {
  id?: string;
  macedonian: string;
  english: string;
  englishAlternates?: string[];
  macedonianAlternates?: string[];
  category?: string;
  contextMk?: ClozeContext;
  contextEn?: ClozeContext;
  audioClipUrl?: string;
};

export type PracticeDirection = 'mkToEn' | 'enToMk';
export type PracticeDrillMode = 'flashcard' | 'cloze';

export type PracticeSessionMeta = {
  sessionLength: number;
  deckSize: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  generatedAt: string;
};

export type PracticeSessionSnapshot = {
  prompts: PracticeItem[];
  meta: PracticeSessionMeta;
};

type PracticeApiConfig = {
  baseUrl?: string;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

const FALLBACK_PROMPTS: PracticeItem[] = (practiceVocabulary as PracticeItem[]).map((item, index) => ({
  ...item,
  id: item.id ?? `prompt-${index + 1}`,
}));

export function getLocalPracticePrompts(limit?: number) {
  if (!limit) return FALLBACK_PROMPTS;
  return FALLBACK_PROMPTS.slice(0, limit);
}

export async function fetchPracticePrompts(config: PracticeApiConfig = {}): Promise<PracticeItem[]> {
  const { baseUrl, fetcher = fetch, signal } = config;
  if (!baseUrl) {
    return FALLBACK_PROMPTS;
  }
  const url = `${baseUrl.replace(/\/$/, '')}/api/practice/prompts`;
  const response = await fetcher(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch practice prompts (${response.status})`);
  }
  const data = (await response.json()) as PracticeItem[];
  return data.length ? data : FALLBACK_PROMPTS;
}

export function createPracticeSessionSnapshot(prompts: PracticeItem[], meta?: Partial<PracticeSessionMeta>): PracticeSessionSnapshot {
  return {
    prompts,
    meta: {
      sessionLength: meta?.sessionLength ?? 10,
      deckSize: prompts.length,
      difficulty: meta?.difficulty ?? 'beginner',
      generatedAt: meta?.generatedAt ?? new Date().toISOString(),
    },
  };
}

export function summarizeSessionProgress(responses: Array<{ correct: boolean }>) {
  const totalAnswered = responses.length;
  const correct = responses.filter((item) => item.correct).length;
  const accuracy = totalAnswered === 0 ? 0 : Math.round((correct / totalAnswered) * 100);
  return {
    totalAnswered,
    correct,
    accuracy,
  };
}

export const practicePromptsQueryKey = ['practice-prompts'] as const;

export type PracticePromptsQueryOptions<TData = PracticeItem[]> = {
  baseUrl?: string;
  staleTime?: number;
  select?: UseQueryOptions<PracticeItem[], Error, TData>['select'];
};

export function usePracticePromptsQuery<TData = PracticeItem[]>({
  baseUrl,
  staleTime = 1000 * 60,
  select,
}: PracticePromptsQueryOptions<TData> = {}) {
  return useQuery<PracticeItem[], Error, TData>({
    queryKey: practicePromptsQueryKey,
    staleTime,
    queryFn: ({ signal }) => fetchPracticePrompts({ baseUrl, signal }),
    select,
  });
}
