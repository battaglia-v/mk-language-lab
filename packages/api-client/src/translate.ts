export type TranslateLanguage = 'mk' | 'en';

export type TranslateTextParams = {
  text: string;
  sourceLang: TranslateLanguage;
  targetLang: TranslateLanguage;
  baseUrl?: string;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export type TranslateTextResult = {
  translatedText: string;
  detectedSourceLang: TranslateLanguage | null;
};

export class TranslateTextError extends Error {
  status?: number;
  retryable?: boolean;

  constructor(message: string, options: { status?: number; retryable?: boolean } = {}) {
    super(message);
    this.name = 'TranslateTextError';
    this.status = options.status;
    this.retryable = options.retryable;
  }
}

const SUPPORTED_LANGUAGES: TranslateLanguage[] = ['mk', 'en'];

export async function translateText(params: TranslateTextParams): Promise<TranslateTextResult> {
  const { text, sourceLang, targetLang, baseUrl, signal, fetcher = fetch } = params;
  const sanitizedText = text.trim();

  if (!sanitizedText) {
    throw new TranslateTextError('Translation text is required');
  }

  if (sourceLang === targetLang) {
    throw new TranslateTextError('Source and target languages must differ');
  }

  if (!baseUrl) {
    throw new TranslateTextError('Translator API base URL is not configured', { retryable: false });
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/translate`;
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
    const message = error instanceof Error ? error.message : 'Translation request failed';
    throw new TranslateTextError(message, { retryable: true });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const data = (payload ?? {}) as {
    translatedText?: string;
    detectedSourceLang?: string | null;
    message?: string;
    error?: string;
    retryable?: boolean;
  };

  if (!response.ok || typeof data.translatedText !== 'string') {
    const message = data.message ?? data.error ?? `Translation failed (${response.status})`;
    const retryable =
      typeof data.retryable === 'boolean'
        ? data.retryable
        : response.status >= 500 || response.status === 429;
    throw new TranslateTextError(message, {
      status: response.status,
      retryable,
    });
  }

  const detected =
    typeof data.detectedSourceLang === 'string' &&
    SUPPORTED_LANGUAGES.includes(data.detectedSourceLang as TranslateLanguage)
      ? (data.detectedSourceLang as TranslateLanguage)
      : null;

  return {
    translatedText: data.translatedText.trim(),
    detectedSourceLang: detected,
  };
}
