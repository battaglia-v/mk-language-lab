import { NextRequest, NextResponse } from 'next/server';
import { v2 } from '@google-cloud/translate';
import {
  ValidationError,
  ExternalServiceError,
  createErrorResponse,
} from '@/lib/errors';
import { translateRateLimit, checkRateLimit } from '@/lib/rate-limit';

const SUPPORTED_LANGUAGES = new Set(['mk', 'en']);
const MAX_CHARACTERS = 5000;

let translator: v2.Translate | null | undefined;

const parseCredentials = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf-8');
      const cleaned = decoded.replace(/^['"]|['"]$/g, '');
      return JSON.parse(cleaned);
    } catch {
      throw error;
    }
  }
};

const getTranslator = () => {
  if (translator !== undefined) {
    return translator;
  }

  const projectId = process.env.GOOGLE_PROJECT_ID;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const jsonCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!projectId) {
    translator = null;
    return translator;
  }

  try {
    if (jsonCredentials) {
      const credentials = parseCredentials(jsonCredentials);
      translator = new v2.Translate({ projectId, credentials });
      return translator;
    }

    if (keyPath) {
      translator = new v2.Translate({ projectId, keyFilename: keyPath });
      return translator;
    }
  } catch (error) {
    console.error('Failed to configure Google Translate client:', error);
  }

  translator = null;
  return translator;
};

// Dictionary of common Macedonian words with POS
const MACEDONIAN_POS_DICT: Record<string, 'noun' | 'verb' | 'adjective' | 'adverb' | 'other'> = {
  // Common particles and conjunctions (truly "other")
  'и': 'other', 'на': 'other', 'во': 'other', 'од': 'other', 'за': 'other',
  'со': 'other', 'по': 'other', 'до': 'other', 'над': 'other', 'под': 'other',
  'да': 'other', 'не': 'other', 'ли': 'other', 'ќе': 'other', 'би': 'other',
  'се': 'other', 'си': 'other', 'го': 'other', 'ја': 'other', 'ги': 'other',
  'ми': 'other', 'ти': 'other', 'му': 'other', 'ѝ': 'other', 'им': 'other',

  // Common verbs (excluding се and си which are more commonly pronouns)
  'сум': 'verb', 'е': 'verb', 'сме': 'verb', 'сте': 'verb',
  'бев': 'verb', 'беше': 'verb', 'бевме': 'verb', 'бевте': 'verb', 'беа': 'verb',
  'има': 'verb', 'имам': 'verb', 'имаш': 'verb', 'имаме': 'verb', 'имате': 'verb', 'имаат': 'verb',
  'сакам': 'verb', 'сакаш': 'verb', 'сака': 'verb', 'сакаме': 'verb', 'сакате': 'verb', 'сакаат': 'verb',
  'можам': 'verb', 'можеш': 'verb', 'може': 'verb', 'можеме': 'verb', 'можете': 'verb', 'можат': 'verb',
  'знам': 'verb', 'знаеш': 'verb', 'знае': 'verb', 'знаеме': 'verb', 'знаете': 'verb', 'знаат': 'verb',
  'дојдам': 'verb', 'дојдеш': 'verb', 'дојде': 'verb', 'дојдеме': 'verb', 'дојдете': 'verb', 'дојдат': 'verb',
  'одам': 'verb', 'одиш': 'verb', 'оди': 'verb', 'одиме': 'verb', 'одите': 'verb', 'одат': 'verb',

  // Common adjectives
  'добар': 'adjective', 'добра': 'adjective', 'добро': 'adjective', 'добри': 'adjective',
  'голем': 'adjective', 'голема': 'adjective', 'големо': 'adjective', 'големи': 'adjective',
  'мал': 'adjective', 'мала': 'adjective', 'мало': 'adjective', 'мали': 'adjective',
  'убав': 'adjective', 'убава': 'adjective', 'убаво': 'adjective', 'убави': 'adjective',
  'нов': 'adjective', 'нова': 'adjective', 'ново': 'adjective', 'нови': 'adjective',
  'стар': 'adjective', 'стара': 'adjective', 'старо': 'adjective', 'стари': 'adjective',

  // Common adverbs
  'многу': 'adverb', 'малку': 'adverb', 'брзо': 'adverb', 'бавно': 'adverb',
  'лошо': 'adverb', 'сега': 'adverb', 'потоа': 'adverb',
  'тука': 'adverb', 'таму': 'adverb', 'овде': 'adverb', 'каде': 'adverb',
  'кога': 'adverb', 'како': 'adverb', 'зошто': 'adverb', 'секогаш': 'adverb',

  // Common greetings and nouns
  'здраво': 'noun', 'денот': 'noun', 'ноќта': 'noun', 'утрото': 'noun',
  'човек': 'noun', 'жена': 'noun', 'дете': 'noun', 'куќа': 'noun',
  'град': 'noun', 'село': 'noun', 'работа': 'noun', 'време': 'noun',
};

// Simple POS tagging based on word patterns and dictionary
function detectPartOfSpeech(word: string, lang: 'mk' | 'en'): 'noun' | 'verb' | 'adjective' | 'adverb' | 'other' {
  const lowerWord = word.toLowerCase();

  if (lang === 'en') {
    // English patterns
    if (lowerWord.endsWith('ly')) return 'adverb';
    if (lowerWord.endsWith('ing') || lowerWord.endsWith('ed')) return 'verb';
    if (lowerWord.endsWith('ive') || lowerWord.endsWith('ous') || lowerWord.endsWith('ful')) return 'adjective';
    // Common verbs
    if (['is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
         'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must'].includes(lowerWord)) return 'verb';
    // Common particles
    if (['the', 'a', 'an', 'and', 'or', 'but', 'if', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with'].includes(lowerWord)) return 'other';
    // Default to noun for English content words
    return 'noun';
  } else if (lang === 'mk') {
    // Check dictionary first
    if (MACEDONIAN_POS_DICT[lowerWord]) {
      return MACEDONIAN_POS_DICT[lowerWord];
    }

    // Macedonian verb patterns (more comprehensive)
    if (lowerWord.match(/(ува|ира|ам|аш|а|аме|ате|аат|им|иш|и|име|ите|ат|ев|еше|евме|евте|еја)$/)) {
      return 'verb';
    }

    // Macedonian adjective patterns
    if (lowerWord.match(/(ен|на|но|ни|ски|ска|ско|ски|лив|лива|ливо|ливи)$/)) {
      return 'adjective';
    }

    // Macedonian adverb patterns (often end in -о or -ски)
    if (lowerWord.match(/(ски|ишки|ешки)$/)) {
      return 'adverb';
    }

    // Default to noun for Macedonian content words (most unmarked words are nouns)
    return 'noun';
  }

  return 'other';
}

// Calculate word difficulty
function calculateDifficulty(word: string): 'basic' | 'intermediate' | 'advanced' {
  const length = word.length;

  // Basic heuristic based on word length
  if (length <= 4) return 'basic';
  if (length <= 7) return 'intermediate';
  return 'advanced';
}

// Tokenize text into words, preserving punctuation separately
function tokenizeText(text: string): Array<{ token: string; isWord: boolean; index: number }> {
  const tokens: Array<{ token: string; isWord: boolean; index: number }> = [];
  let currentIndex = 0;

  // Split by spaces and punctuation, keeping both
  const regex = /([^\s\p{P}]+)|([\s\p{P}]+)/gu;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const token = match[0];
    const isWord = /[^\s\p{P}]+/u.test(token);

    tokens.push({
      token,
      isWord,
      index: currentIndex++,
    });
  }

  return tokens;
}

// Common words with multiple meanings based on context
const MULTI_MEANING_WORDS: Record<string, { primary: string; alternatives: string[] }> = {
  // Macedonian words
  'да': { primary: 'yes', alternatives: ['to', 'that', 'so that'] },
  'не': { primary: 'no', alternatives: ['not', 'don\'t'] },
  'се': { primary: 'oneself', alternatives: ['is', 'are', 'themselves'] },
  'си': { primary: 'yourself', alternatives: ['are', 'you are'] },
  'го': { primary: 'him', alternatives: ['it', 'the'] },
  'ја': { primary: 'her', alternatives: ['it', 'the'] },
  'ги': { primary: 'them', alternatives: ['the'] },
  'и': { primary: 'and', alternatives: ['to her', 'also'] },
  'на': { primary: 'on', alternatives: ['to', 'of', 'at'] },
  'во': { primary: 'in', alternatives: ['into', 'at'] },
  'од': { primary: 'from', alternatives: ['of', 'off'] },
  'за': { primary: 'for', alternatives: ['about', 'to'] },
  'со': { primary: 'with', alternatives: ['by'] },
  'по': { primary: 'after', alternatives: ['by', 'along', 'on'] },
  'до': { primary: 'to', alternatives: ['until', 'by', 'next to'] },

  // English words
  'to': { primary: 'да', alternatives: ['кон', 'до'] },
  'the': { primary: '', alternatives: ['тој', 'таа', 'тоа'] },
  'for': { primary: 'за', alternatives: ['за време на'] },
  'of': { primary: 'од', alternatives: ['на'] },
  'in': { primary: 'во', alternatives: ['внатре'] },
  'on': { primary: 'на', alternatives: ['врз'] },
  'at': { primary: 'на', alternatives: ['во', 'кај'] },
  'by': { primary: 'од', alternatives: ['со', 'покрај', 'до'] },
};

// Get alternative translations for a word
function getAlternativeTranslations(word: string): string[] | undefined {
  const normalized = word.toLowerCase();
  return MULTI_MEANING_WORDS[normalized]?.alternatives;
}

// Calculate text difficulty metrics
function calculateTextDifficulty(words: string[]): {
  level: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  factors: {
    avgWordLength: number;
    longWords: number;
    totalWords: number;
  };
} {
  const totalWords = words.length;
  const totalLength = words.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = totalWords > 0 ? totalLength / totalWords : 0;
  const longWords = words.filter(w => w.length > 7).length;

  // Score from 0-100
  const lengthScore = Math.min(avgWordLength * 10, 50);
  const complexityScore = (longWords / totalWords) * 50;
  const score = Math.min(lengthScore + complexityScore, 100);

  let level: 'beginner' | 'intermediate' | 'advanced';
  if (score < 30) level = 'beginner';
  else if (score < 60) level = 'intermediate';
  else level = 'advanced';

  return {
    level,
    score,
    factors: {
      avgWordLength,
      longWords,
      totalWords,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await checkRateLimit(translateRateLimit, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const sourceLangRaw = typeof body?.sourceLang === 'string' ? body.sourceLang.trim().toLowerCase() : '';
    const targetLangRaw = typeof body?.targetLang === 'string' ? body.targetLang.trim().toLowerCase() : '';

    if (!text) {
      throw new ValidationError('Missing text');
    }

    if (text.length > MAX_CHARACTERS) {
      throw new ValidationError(`Text exceeds maximum length of ${MAX_CHARACTERS} characters`);
    }

    if (!SUPPORTED_LANGUAGES.has(targetLangRaw)) {
      throw new ValidationError('Unsupported target language');
    }

    const targetLang = targetLangRaw as 'mk' | 'en';
    const sourceLang = SUPPORTED_LANGUAGES.has(sourceLangRaw) ? (sourceLangRaw as 'mk' | 'en') : undefined;

    if (sourceLang && sourceLang === targetLang) {
      throw new ValidationError('Source and target languages must differ');
    }

    // Tokenize the text
    const tokens = tokenizeText(text);
    const wordTokens = tokens.filter(t => t.isWord);
    const words = wordTokens.map(t => t.token);

    if (words.length === 0) {
      throw new ValidationError('No words found in text');
    }

    const translateClient = getTranslator();

    // Translate words individually (in batches for efficiency)
    const batchSize = 50;
    const translatedWords: string[] = [];

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);

      if (translateClient) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new ExternalServiceError('Google Translate timeout', 504)), 15000);
          });

          const translationPromise = translateClient.translate(batch, {
            from: sourceLang,
            to: targetLang,
          });

          const [translations] = await Promise.race([translationPromise, timeoutPromise]);
          translatedWords.push(...translations.map(t => typeof t === 'string' ? t : String(t)));
        } catch (error) {
          console.error('Google Cloud Translate error:', error);
          throw new ExternalServiceError('Google Cloud Translation failed');
        }
      } else {
        // Fallback: translate each word individually with public API
        for (const word of batch) {
          const params = new URLSearchParams({
            client: 'gtx',
            sl: sourceLang ?? 'auto',
            tl: targetLang,
            dt: 't',
            q: word,
          });

          const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
            {
              cache: 'no-store',
              signal: AbortSignal.timeout(5000),
            }
          );

          if (!response.ok) {
            throw new ExternalServiceError('Translation provider error', response.status);
          }

          const data = await response.json();
          const segments = Array.isArray(data?.[0]) ? data[0] : [];
          const translated = segments
            .map((segment: unknown) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
            .join('')
            .trim();

          translatedWords.push(translated || word);
        }
      }
    }

    // Build word analysis objects with alternative translations
    const wordAnalysis = wordTokens.map((token, idx) => {
      const word = token.token;
      const translation = translatedWords[idx] || word;
      const pos = detectPartOfSpeech(word, sourceLang || 'en');
      const difficulty = calculateDifficulty(word);
      const alternativeTranslations = getAlternativeTranslations(word);

      return {
        id: `word-${token.index}`,
        original: word,
        translation,
        ...(alternativeTranslations && { alternativeTranslations }),
        pos,
        difficulty,
        index: token.index,
      };
    });

    // Get full text translation for reference
    let fullTranslation = '';
    if (translateClient) {
      try {
        const [translation] = await translateClient.translate(text, {
          from: sourceLang,
          to: targetLang,
        });
        fullTranslation = typeof translation === 'string' ? translation : String(translation);
      } catch {
        fullTranslation = translatedWords.join(' ');
      }
    } else {
      fullTranslation = translatedWords.join(' ');
    }

    // Calculate difficulty metrics
    const difficultyMetrics = calculateTextDifficulty(words);

    // Count sentences (simple heuristic)
    const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;

    return NextResponse.json({
      words: wordAnalysis,
      tokens: tokens, // Include all tokens (words + punctuation)
      fullTranslation,
      difficulty: difficultyMetrics,
      metadata: {
        wordCount: words.length,
        sentenceCount,
        characterCount: text.length,
      },
    });
  } catch (error) {
    console.error('Text analysis error:', error);
    const { response, status } = createErrorResponse(error, 'Text analysis failed');
    return NextResponse.json(response, { status });
  }
}
