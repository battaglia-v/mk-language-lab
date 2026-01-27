'use client';

/**
 * Cyrillic Typing Trainer
 *
 * Provides typing exercises for learning the Macedonian Cyrillic alphabet.
 * Tracks accuracy, speed, and problem characters.
 */

const STORAGE_KEY = 'mkll:typing-stats';

// Character difficulty groups
export const CYRILLIC_GROUPS = {
  basic: ['а', 'б', 'в', 'г', 'д', 'е', 'з', 'и', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф'],
  intermediate: ['ж', 'ш', 'ч', 'ц', 'х', 'ј', 'љ', 'њ'],
  advanced: ['ѓ', 'ќ', 'џ', 'ѕ'],
} as const;

export type DifficultyLevel = keyof typeof CYRILLIC_GROUPS;

// Typing exercise data
export const TYPING_EXERCISES = {
  letters: {
    basic: [
      { prompt: 'а', hint: 'Like "a" in "father"' },
      { prompt: 'б', hint: 'Like "b" in "boy"' },
      { prompt: 'в', hint: 'Like "v" in "very"' },
      { prompt: 'г', hint: 'Like "g" in "go"' },
      { prompt: 'д', hint: 'Like "d" in "day"' },
      { prompt: 'е', hint: 'Like "e" in "bed"' },
      { prompt: 'з', hint: 'Like "z" in "zoo"' },
      { prompt: 'и', hint: 'Like "ee" in "see"' },
      { prompt: 'к', hint: 'Like "k" in "king"' },
      { prompt: 'л', hint: 'Like "l" in "love"' },
      { prompt: 'м', hint: 'Like "m" in "mother"' },
      { prompt: 'н', hint: 'Like "n" in "no"' },
      { prompt: 'о', hint: 'Like "o" in "more"' },
      { prompt: 'п', hint: 'Like "p" in "pot"' },
      { prompt: 'р', hint: 'Rolled "r"' },
      { prompt: 'с', hint: 'Like "s" in "sun"' },
      { prompt: 'т', hint: 'Like "t" in "top"' },
      { prompt: 'у', hint: 'Like "oo" in "moon"' },
      { prompt: 'ф', hint: 'Like "f" in "fun"' },
    ],
    intermediate: [
      { prompt: 'ж', hint: 'Like "s" in "pleasure"' },
      { prompt: 'ш', hint: 'Like "sh" in "ship"' },
      { prompt: 'ч', hint: 'Like "ch" in "church"' },
      { prompt: 'ц', hint: 'Like "ts" in "cats"' },
      { prompt: 'х', hint: 'Like "h" in "hello"' },
      { prompt: 'ј', hint: 'Like "y" in "yes"' },
      { prompt: 'љ', hint: 'Like "lli" in "million"' },
      { prompt: 'њ', hint: 'Like "ny" in "canyon"' },
    ],
    advanced: [
      { prompt: 'ѓ', hint: 'Soft "g" + "y" sound' },
      { prompt: 'ќ', hint: 'Soft "k" + "y" sound' },
      { prompt: 'џ', hint: 'Like "j" in "jam"' },
      { prompt: 'ѕ', hint: 'Like "dz" in "adze"' },
    ],
  },
  words: {
    basic: [
      { mk: 'ден', en: 'day' },
      { mk: 'ноќ', en: 'night' },
      { mk: 'вода', en: 'water' },
      { mk: 'леб', en: 'bread' },
      { mk: 'куќа', en: 'house' },
      { mk: 'мама', en: 'mom' },
      { mk: 'тато', en: 'dad' },
      { mk: 'сонце', en: 'sun' },
      { mk: 'месец', en: 'moon/month' },
      { mk: 'дрво', en: 'tree' },
    ],
    intermediate: [
      { mk: 'здраво', en: 'hello' },
      { mk: 'благодарам', en: 'thank you' },
      { mk: 'молам', en: 'please' },
      { mk: 'добро', en: 'good' },
      { mk: 'убаво', en: 'beautiful' },
      { mk: 'јазик', en: 'language' },
      { mk: 'пријател', en: 'friend' },
      { mk: 'семејство', en: 'family' },
      { mk: 'работа', en: 'work' },
      { mk: 'училиште', en: 'school' },
    ],
    advanced: [
      { mk: 'ѓердан', en: 'necklace' },
      { mk: 'ќерка', en: 'daughter' },
      { mk: 'џем', en: 'jam' },
      { mk: 'ѕвезда', en: 'star' },
      { mk: 'раѓање', en: 'birth' },
      { mk: 'среќа', en: 'happiness/luck' },
      { mk: 'љубов', en: 'love' },
      { mk: 'пеперуџа', en: 'butterfly' },
      { mk: 'маџепс', en: 'magic' },
      { mk: 'џиновски', en: 'giant (adj)' },
    ],
  },
  sentences: [
    { mk: 'Јас сум добро.', en: 'I am fine.' },
    { mk: 'Како се викаш?', en: 'What is your name?' },
    { mk: 'Јас учам македонски.', en: 'I am learning Macedonian.' },
    { mk: 'Денес е убав ден.', en: 'Today is a beautiful day.' },
    { mk: 'Сакам да јадам бурек.', en: 'I want to eat burek.' },
    { mk: 'Македонија е убава земја.', en: 'Macedonia is a beautiful country.' },
    { mk: 'Охридското езеро е длабоко.', en: 'Lake Ohrid is deep.' },
    { mk: 'Ние живееме во Скопје.', en: 'We live in Skopje.' },
    { mk: 'Тие зборуваат македонски.', en: 'They speak Macedonian.' },
    { mk: 'Сакам да патувам.', en: 'I like to travel.' },
  ],
};

// Stats for tracking typing progress
export type TypingStats = {
  totalCharactersTyped: number;
  correctCharacters: number;
  totalExercisesCompleted: number;
  averageAccuracy: number;
  averageWPM: number;
  problemCharacters: Record<string, { attempts: number; errors: number }>;
  lastPracticeDate: string | null;
  streakDays: number;
};

const DEFAULT_STATS: TypingStats = {
  totalCharactersTyped: 0,
  correctCharacters: 0,
  totalExercisesCompleted: 0,
  averageAccuracy: 0,
  averageWPM: 0,
  problemCharacters: {},
  lastPracticeDate: null,
  streakDays: 0,
};

/**
 * Read typing stats from localStorage
 */
export function readTypingStats(): TypingStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

/**
 * Save typing stats to localStorage
 */
export function saveTypingStats(stats: TypingStats): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

/**
 * Record the result of a typing exercise
 */
export function recordTypingResult(
  target: string,
  typed: string,
  durationMs: number
): {
  accuracy: number;
  wpm: number;
  errors: string[];
} {
  const stats = readTypingStats();
  const errors: string[] = [];
  let correct = 0;

  // Compare character by character
  for (let i = 0; i < target.length; i++) {
    const targetChar = target[i].toLowerCase();
    const typedChar = typed[i]?.toLowerCase();

    if (targetChar === typedChar) {
      correct++;
    } else if (typedChar) {
      errors.push(targetChar);
      // Track problem characters
      if (!stats.problemCharacters[targetChar]) {
        stats.problemCharacters[targetChar] = { attempts: 0, errors: 0 };
      }
      stats.problemCharacters[targetChar].attempts++;
      stats.problemCharacters[targetChar].errors++;
    }

    // Track attempts for all characters
    if (targetChar.match(/[а-яѓќљњџѕ]/)) {
      if (!stats.problemCharacters[targetChar]) {
        stats.problemCharacters[targetChar] = { attempts: 0, errors: 0 };
      }
      stats.problemCharacters[targetChar].attempts++;
    }
  }

  const accuracy = target.length > 0 ? (correct / target.length) * 100 : 0;

  // Calculate WPM (assuming average word length of 5 characters)
  const minutes = durationMs / 60000;
  const words = target.length / 5;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

  // Update aggregate stats
  stats.totalCharactersTyped += target.length;
  stats.correctCharacters += correct;
  stats.totalExercisesCompleted++;
  stats.averageAccuracy = stats.totalCharactersTyped > 0
    ? (stats.correctCharacters / stats.totalCharactersTyped) * 100
    : 0;

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastPracticeDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (stats.lastPracticeDate === yesterdayStr) {
      stats.streakDays++;
    } else {
      stats.streakDays = 1;
    }
    stats.lastPracticeDate = today;
  }

  saveTypingStats(stats);

  return { accuracy, wpm, errors };
}

/**
 * Get problem characters sorted by error rate
 */
export function getProblemCharacters(limit = 5): Array<{
  char: string;
  errorRate: number;
  attempts: number;
}> {
  const stats = readTypingStats();

  return Object.entries(stats.problemCharacters)
    .filter(([, data]) => data.attempts >= 3) // Only consider chars with enough attempts
    .map(([char, data]) => ({
      char,
      errorRate: (data.errors / data.attempts) * 100,
      attempts: data.attempts,
    }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, limit);
}

/**
 * Generate a typing exercise based on difficulty and focus areas
 */
export function generateTypingExercise(
  type: 'letters' | 'words' | 'sentences',
  difficulty: DifficultyLevel = 'basic',
  focusOnProblemChars = false
): { target: string; hint?: string; translation?: string } {
  const problemChars = focusOnProblemChars ? getProblemCharacters(3).map(p => p.char) : [];

  if (type === 'letters') {
    const letters = TYPING_EXERCISES.letters[difficulty];
    // Prioritize problem characters if available
    const candidates = problemChars.length > 0
      ? letters.filter(l => problemChars.includes(l.prompt))
      : letters;

    if (candidates.length === 0) {
      const item = letters[Math.floor(Math.random() * letters.length)];
      return { target: item.prompt, hint: item.hint };
    }

    const item = candidates[Math.floor(Math.random() * candidates.length)];
    return { target: item.prompt, hint: item.hint };
  }

  if (type === 'words') {
    const words = TYPING_EXERCISES.words[difficulty];
    // Prioritize words with problem characters
    const candidates = problemChars.length > 0
      ? words.filter(w => problemChars.some(c => w.mk.includes(c)))
      : words;

    if (candidates.length === 0) {
      const item = words[Math.floor(Math.random() * words.length)];
      return { target: item.mk, translation: item.en };
    }

    const item = candidates[Math.floor(Math.random() * candidates.length)];
    return { target: item.mk, translation: item.en };
  }

  // Sentences
  const sentences = TYPING_EXERCISES.sentences;
  const item = sentences[Math.floor(Math.random() * sentences.length)];
  return { target: item.mk, translation: item.en };
}

/**
 * Get mastery level for the Cyrillic alphabet
 */
export function getCyrillicMastery(): {
  overall: number;
  basic: number;
  intermediate: number;
  advanced: number;
} {
  const stats = readTypingStats();

  const calculateGroupMastery = (chars: readonly string[]): number => {
    let totalAccuracy = 0;
    let count = 0;

    chars.forEach(char => {
      const data = stats.problemCharacters[char];
      if (data && data.attempts >= 3) {
        totalAccuracy += ((data.attempts - data.errors) / data.attempts) * 100;
        count++;
      }
    });

    return count > 0 ? totalAccuracy / count : 0;
  };

  const basic = calculateGroupMastery(CYRILLIC_GROUPS.basic);
  const intermediate = calculateGroupMastery(CYRILLIC_GROUPS.intermediate);
  const advanced = calculateGroupMastery(CYRILLIC_GROUPS.advanced);

  // Overall is weighted average (basic is easier, advanced is harder)
  const overall = (basic * 0.3 + intermediate * 0.4 + advanced * 0.3);

  return { overall, basic, intermediate, advanced };
}

/**
 * Reset typing statistics
 */
export function resetTypingStats(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
