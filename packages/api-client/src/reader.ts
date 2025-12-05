export type TranslateLanguage = 'mk' | 'en';

export type WordAnalysis = {
  id: string;
  original: string;
  translation: string;
  alternativeTranslations?: string[];
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  index: number;
};

export type DifficultyMetrics = {
  level: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  factors: {
    avgWordLength: number;
    longWords: number;
    totalWords: number;
  };
};

export type AnalyzedTextData = {
  words: WordAnalysis[];
  fullTranslation: string;
  difficulty: DifficultyMetrics;
};

export type AnalyzeTextParams = {
  text: string;
  sourceLang: TranslateLanguage;
  targetLang: TranslateLanguage;
  baseUrl?: string;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export class AnalyzeTextError extends Error {
  status?: number;
  retryable?: boolean;

  constructor(message: string, options: { status?: number; retryable?: boolean } = {}) {
    super(message);
    this.name = 'AnalyzeTextError';
    this.status = options.status;
    this.retryable = options.retryable;
  }
}

export async function analyzeText(params: AnalyzeTextParams): Promise<AnalyzedTextData> {
  const { text, sourceLang, targetLang, baseUrl, signal, fetcher = fetch } = params;
  const sanitizedText = text.trim();

  if (!sanitizedText) {
    throw new AnalyzeTextError('Text is required for analysis');
  }

  if (sourceLang === targetLang) {
    throw new AnalyzeTextError('Source and target languages must differ');
  }

  if (!baseUrl) {
    throw new AnalyzeTextError('Reader API base URL is not configured', { retryable: false });
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/translate/analyze`;
  let response: Response;

  try {
    response = await fetcher(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sanitizedText,
        sourceLang,
        targetLang,
      }),
      signal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis request failed';
    throw new AnalyzeTextError(message, { retryable: true });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const data = (payload ?? {}) as { message?: string; error?: string; retryable?: boolean };
    const message = data.message || data.error || `Analysis failed with status ${response.status}`;
    const retryable = data.retryable ?? response.status >= 500;
    throw new AnalyzeTextError(message, { status: response.status, retryable });
  }

  const data = payload as {
    words?: WordAnalysis[];
    fullTranslation?: string;
    difficulty?: DifficultyMetrics;
  };

  if (!data.words || !data.fullTranslation || !data.difficulty) {
    throw new AnalyzeTextError('Invalid analysis response format');
  }

  return {
    words: data.words,
    fullTranslation: data.fullTranslation,
    difficulty: data.difficulty,
  };
}
