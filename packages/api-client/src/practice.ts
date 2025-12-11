import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import practiceVocabulary from '../../../data/practice-vocabulary.json';

export type ClozeContext = {
  sentence: string;
  translation: string;
};

export type PracticeAudioClip = {
  url: string;
  slowUrl?: string | null;
  waveform?: number[] | null;
  duration?: number | null;
  autoplay?: boolean;
  speaker?: string | null;
  sourceType?: 'human' | 'tts' | 'unknown';
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
  audioClip?: PracticeAudioClip | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'mixed' | string;
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

const FALLBACK_AUDIO_MAP: Record<string, PracticeAudioClip> = {};

const FALLBACK_PROMPTS: PracticeItem[] = enrichWithAudio(
  (practiceVocabulary as PracticeItem[]).map((item, index) => ({
    ...item,
    id: item.id ?? `prompt-${index + 1}`,
  }))
);

function enrichWithAudio(items: PracticeItem[]): PracticeItem[] {
  return items.map((item) => {
    const id = item.id ?? item.macedonian ?? `prompt-${Math.random().toString(36).slice(2)}`;
    return {
      ...item,
      id,
      difficulty: item.difficulty ?? 'mixed',
      audioClip: item.audioClip ?? FALLBACK_AUDIO_MAP[id] ?? null,
    };
  });
}

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
  const enriched = data.length ? enrichWithAudio(data) : FALLBACK_PROMPTS;
  return enriched;
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
  fetcher?: typeof fetch;
  select?: UseQueryOptions<PracticeItem[], Error, TData>['select'];
};

export function usePracticePromptsQuery<TData = PracticeItem[]>({
  baseUrl,
  staleTime = 1000 * 60,
  fetcher,
  select,
}: PracticePromptsQueryOptions<TData> = {}) {
  return useQuery<PracticeItem[], Error, TData>({
    queryKey: practicePromptsQueryKey,
    staleTime,
    queryFn: ({ signal }) => fetchPracticePrompts({ baseUrl, signal, fetcher }),
    select,
  });
}

export type PracticeCompletionEventPayload = {
  id: string;
  deckId: string;
  category: string;
  mode: 'typing' | 'cloze' | 'listening' | 'multipleChoice';
  direction: PracticeDirection;
  difficulty?: 'casual' | 'focus' | 'blitz';
  correctCount: number;
  totalAttempts: number;
  accuracy: number;
  streakDelta: number;
  xpEarned: number;
  heartsRemaining: number;
  completedAt: string;
};

type SubmitPracticeCompletionsConfig = {
  baseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
  deviceId?: string | null;
};

export async function submitPracticeCompletions(
  events: PracticeCompletionEventPayload[],
  config: SubmitPracticeCompletionsConfig = {}
): Promise<{ accepted: number }> {
  if (!events.length) {
    return { accepted: 0 };
  }

  const { baseUrl, signal, fetcher = fetch, deviceId } = config;
  if (!baseUrl) {
    throw new Error('Missing API base URL for practice completion sync');
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/api/mobile/practice-completions`;
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      events,
      deviceId: deviceId ?? undefined,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to sync practice completions (${response.status})`);
  }

  const payload = (await response.json()) as { accepted?: number };
  return { accepted: payload.accepted ?? events.length };
}
