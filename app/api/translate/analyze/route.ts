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
// Each entry has all possible meanings - context determines which is primary
const MULTI_MEANING_WORDS: Record<string, { meanings: string[]; contextHint?: string }> = {
  // Macedonian particles and function words (high ambiguity)
  'да': { 
    meanings: ['yes', 'to', 'that', 'so that', 'let'],
    contextHint: '"Да" before verbs means "to"; alone means "yes"'
  },
  'не': { 
    meanings: ['no', 'not', "don't", "doesn't"],
    contextHint: '"Не" before verbs means "not"; alone means "no"'
  },
  'се': { 
    meanings: ['oneself', 'each other', 'is', 'are', '-self'],
    contextHint: 'Reflexive pronoun or part of reflexive verb'
  },
  'си': { 
    meanings: ['yourself', 'your own', 'are', 'home'],
    contextHint: 'Dative reflexive or informal "you are"'
  },
  'го': { meanings: ['him', 'it (masc.)', 'the'] },
  'ја': { meanings: ['her', 'it (fem.)', 'the'] },
  'ги': { meanings: ['them', 'the (plural)'] },
  'ме': { meanings: ['me', 'myself'] },
  'те': { meanings: ['you (acc.)', 'yourself'] },
  'и': { 
    meanings: ['and', 'to her', 'also', 'too', 'her (dat.)'],
    contextHint: 'Most commonly "and"; "to her" when before verb'
  },
  'на': { 
    meanings: ['on', 'to', 'of', 'at', 'for'],
    contextHint: 'Preposition with multiple uses depending on case'
  },
  'во': { meanings: ['in', 'into', 'at', 'inside'] },
  'од': { meanings: ['from', 'of', 'off', 'than', 'by'] },
  'за': { meanings: ['for', 'about', 'to', 'in order to'] },
  'со': { meanings: ['with', 'by', 'using'] },
  'по': { meanings: ['after', 'by', 'along', 'per', 'more'] },
  'до': { meanings: ['to', 'until', 'by', 'next to', 'up to'] },
  'е': { 
    meanings: ['is', 'it is', 'he/she is'],
    contextHint: 'Third person singular of "to be"'
  },
  'ќе': { 
    meanings: ['will', 'shall', 'going to'],
    contextHint: 'Future tense marker - always before the verb'
  },
  'би': { 
    meanings: ['would', 'could', 'might'],
    contextHint: 'Conditional mood marker'
  },
  'што': { 
    meanings: ['what', 'that', 'which', 'why'],
    contextHint: 'Interrogative or relative pronoun'
  },
  'кој': { meanings: ['who', 'which', 'that'] },
  'која': { meanings: ['who (fem.)', 'which (fem.)', 'that'] },
  'кое': { meanings: ['what', 'which (neut.)', 'that'] },
  'како': { meanings: ['how', 'like', 'as', 'what'] },
  'каде': { meanings: ['where', 'wherever'] },
  'кога': { meanings: ['when', 'whenever'] },
  'зошто': { meanings: ['why', 'because'] },
  'ама': { meanings: ['but', 'however', 'yet'] },
  'или': { meanings: ['or', 'either'] },
  'ако': { meanings: ['if', 'whether'] },
  'дека': { meanings: ['that', 'because'] },
  'само': { meanings: ['only', 'just', 'merely'] },
  'уште': { meanings: ['still', 'yet', 'more', 'another'] },
  'веќе': { meanings: ['already', 'now', 'anymore'] },
  'пак': { meanings: ['again', 'but', 'however', 'on the other hand'] },
  'така': { meanings: ['so', 'thus', 'like that', 'in that way'] },
  'тука': { meanings: ['here', 'at this place'] },
  'таму': { meanings: ['there', 'at that place'] },
  
  // Common verbs with multiple senses
  'има': { meanings: ['has', 'there is', 'there are', 'have'] },
  'нема': { meanings: ['has not', 'there is no', "doesn't have"] },
  'може': { meanings: ['can', 'may', 'is possible', 'could'] },
  'треба': { meanings: ['must', 'should', 'need to', 'have to'] },
  'сака': { meanings: ['wants', 'loves', 'likes', 'wishes'] },
  'знае': { meanings: ['knows', 'knows how to', 'is aware'] },
  
  // English words with multiple Macedonian translations
  'to': { meanings: ['да', 'кон', 'до', 'на'] },
  'the': { meanings: ['(no equivalent)', 'тој/таа/тоа', '-от/-та/-то'] },
  'for': { meanings: ['за', 'за време на', 'бидејќи'] },
  'of': { meanings: ['од', 'на', 'за'] },
  'in': { meanings: ['во', 'внатре', 'на'] },
  'on': { meanings: ['на', 'врз', 'во'] },
  'at': { meanings: ['на', 'во', 'кај'] },
  'by': { meanings: ['од', 'со', 'покрај', 'до'] },
  'with': { meanings: ['со', 'заедно со'] },
  'from': { meanings: ['од', 'откако'] },
  'get': { meanings: ['добива', 'станува', 'зема', 'стигнува'] },
  'make': { meanings: ['прави', 'создава', 'тера'] },
  'take': { meanings: ['зема', 'носи', 'трае'] },
  'have': { meanings: ['има', 'мора', 'примил'] },
};

// Find the best contextual meaning by checking which alternative appears in full translation
function findContextualMeaning(
  word: string,
  fullTranslation: string,
  defaultTranslation: string
): { primary: string; alternatives: string[]; contextHint?: string } | undefined {
  const normalized = word.toLowerCase();
  const entry = MULTI_MEANING_WORDS[normalized];
  
  if (!entry) return undefined;
  
  const fullTransLower = fullTranslation.toLowerCase();
  
  // Check which meaning appears in the full contextual translation
  for (const meaning of entry.meanings) {
    if (meaning && fullTransLower.includes(meaning.toLowerCase())) {
      // Found matching meaning in context - use it as primary
      const alternatives = entry.meanings.filter(m => m !== meaning && m);
      return { 
        primary: meaning, 
        alternatives, 
        contextHint: entry.contextHint 
      };
    }
  }
  
  // If default translation matches one of our known meanings, prefer it
  const defLower = defaultTranslation.toLowerCase();
  if (entry.meanings.some(m => m.toLowerCase() === defLower)) {
    const alternatives = entry.meanings.filter(m => m.toLowerCase() !== defLower && m);
    return { 
      primary: defaultTranslation, 
      alternatives,
      contextHint: entry.contextHint 
    };
  }
  
  // No context match found - return first meaning as primary with all others as alternatives
  const [primary, ...alternatives] = entry.meanings.filter(m => m);
  return { primary, alternatives, contextHint: entry.contextHint };
}

// Get alternative translations for a word (legacy function for compatibility)
function getAlternativeTranslations(word: string): string[] | undefined {
  const normalized = word.toLowerCase();
  const entry = MULTI_MEANING_WORDS[normalized];
  return entry ? entry.meanings.slice(1) : undefined;
}

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

    // STEP 1: Get full text translation FIRST for context
    // This gives us the contextual translation that Google uses sentence-level understanding
    let fullTranslation = '';
    if (translateClient) {
      try {
        const [translation] = await translateClient.translate(text, {
          from: sourceLang,
          to: targetLang,
        });
        fullTranslation = typeof translation === 'string' ? translation : String(translation);
      } catch (error) {
        console.error('Full translation failed:', error);
        // Will fall back to word-by-word join later
      }
    } else {
      // Fallback: get full translation from public API
      try {
        const params = new URLSearchParams({
          client: 'gtx',
          sl: sourceLang ?? 'auto',
          tl: targetLang,
          dt: 't',
          q: text,
        });
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
          { cache: 'no-store', signal: AbortSignal.timeout(10000) }
        );
        if (response.ok) {
          const data = await response.json();
          const segments = Array.isArray(data?.[0]) ? data[0] : [];
          fullTranslation = segments
            .map((segment: unknown) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
            .join('')
            .trim();
        }
      } catch {
        // Will fall back to word-by-word join later
      }
    }

    // STEP 2: Translate words individually (in batches for efficiency)
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

    // If full translation failed, use word-by-word fallback
    if (!fullTranslation) {
      fullTranslation = translatedWords.join(' ');
    }

    // STEP 3: Build word analysis with CONTEXT-AWARE translations
    // Use the full sentence translation to pick the best meaning for ambiguous words
    const wordAnalysis = wordTokens.map((token, idx) => {
      const word = token.token;
      const rawTranslation = translatedWords[idx] || word;
      const pos = detectPartOfSpeech(word, sourceLang || 'en');
      const difficulty = calculateDifficulty(word);
      
      // Check if this word has multiple meanings and find the contextual one
      const contextualInfo = findContextualMeaning(word, fullTranslation, rawTranslation);
      
      if (contextualInfo) {
        // Word has multiple meanings - use context-aware primary with alternatives
        return {
          id: `word-${token.index}`,
          original: word,
          translation: contextualInfo.primary,
          contextualMeaning: contextualInfo.primary, // Explicitly mark as context-derived
          alternativeTranslations: contextualInfo.alternatives.length > 0 ? contextualInfo.alternatives : undefined,
          contextHint: contextualInfo.contextHint,
          pos,
          difficulty,
          index: token.index,
          hasMultipleMeanings: true,
        };
      }

      return {
        id: `word-${token.index}`,
        original: word,
        translation: rawTranslation,
        pos,
        difficulty,
        index: token.index,
      };
    });

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
