import { apiFetch } from './api';

export type TranslationDirection = 'en-mk' | 'mk-en';

export type TranslationResult = {
  translatedText: string;
  detectedSourceLang?: string | null;
};

type TranslateApiResponse = {
  translatedText: string;
  detectedSourceLang?: string | null;
};

const MAX_CHARACTERS = 1800;

/**
 * Translate text between English and Macedonian
 *
 * @param text - Text to translate
 * @param direction - Translation direction ('en-mk' or 'mk-en')
 * @returns Translation result with translated text
 */
export async function translateText(
  text: string,
  direction: TranslationDirection
): Promise<TranslationResult> {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error('Text is required');
  }

  if (trimmed.length > MAX_CHARACTERS) {
    throw new Error(`Text exceeds maximum length of ${MAX_CHARACTERS} characters`);
  }

  const [sourceLang, targetLang] = direction.split('-') as ['en' | 'mk', 'mk' | 'en'];

  const response = await apiFetch<TranslateApiResponse>('/api/translate', {
    method: 'POST',
    body: {
      text: trimmed,
      sourceLang,
      targetLang,
    },
    skipAuth: true,
  });

  return {
    translatedText: response.translatedText,
    detectedSourceLang: response.detectedSourceLang,
  };
}

/**
 * Get the source and target language labels for a direction
 */
export function getDirectionLabels(direction: TranslationDirection): {
  sourceLabel: string;
  targetLabel: string;
  fullLabel: string;
  placeholder: string;
} {
  if (direction === 'en-mk') {
    return {
      sourceLabel: 'EN',
      targetLabel: 'MK',
      fullLabel: 'English → Macedonian',
      placeholder: 'Enter English text...',
    };
  }

  return {
    sourceLabel: 'MK',
    targetLabel: 'EN',
    fullLabel: 'Macedonian → English',
    placeholder: 'Внесете текст на македонски...',
  };
}

/**
 * Swap translation direction
 */
export function swapDirection(direction: TranslationDirection): TranslationDirection {
  return direction === 'en-mk' ? 'mk-en' : 'en-mk';
}
