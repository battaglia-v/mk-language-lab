/**
 * Word Gaps Seed Dataset
 *
 * 20 essential Macedonian sentences for fill-in-the-blank practice.
 * Difficulty levels: easy (8 XP), medium (10 XP), hard (15 XP)
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export type WordGapItem = {
  id: string;
  mk: string;           // Full Macedonian sentence
  en: string;           // English translation
  blank: string;        // Word that's blanked out
  maskedMk: string;     // Sentence with ____ in place of blank
  options: string[];    // 4 options (includes correct answer)
  answerIndex: number;  // Index of correct answer in options
  difficulty: Difficulty;
  xpReward: number;
  category: string;
};

// XP rewards by difficulty
export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 8,
  medium: 10,
  hard: 15,
};

// Word bank for distractors by category
const wordBankByCategory: Record<string, string[]> = {
  greetings: ['Здраво', 'Добро', 'утро', 'ден', 'вечер', 'ноќ', 'Довидување', 'си', 'сум'],
  common: ['благодарам', 'Молам', 'фала', 'да', 'не'],
  emergency: ['Каде', 'тоалетот', 'аптеката', 'доктор', 'треба', 'Итно', 'Викни'],
  communication: ['разбирам', 'Разбирам', 'зборуваш', 'англиски', 'Не'],
  shopping: ['Колку', 'ова', 'Скапо', 'цената', 'Намали', 'чини'],
};

// Flattened word bank for general distractors
const allWords = Object.values(wordBankByCategory).flat();

function getDistractors(correct: string, category: string, count: number = 3): string[] {
  // Prefer distractors from same category for plausibility
  const categoryWords = wordBankByCategory[category] || [];
  const otherWords = allWords.filter(w => !categoryWords.includes(w));

  const candidates = [...categoryWords, ...otherWords]
    .filter(w => w.toLowerCase() !== correct.toLowerCase());

  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function createOptions(correct: string, category: string): { options: string[]; answerIndex: number } {
  const distractors = getDistractors(correct, category);
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);
  return { options, answerIndex: options.indexOf(correct) };
}

export const wordGapsSeedData: WordGapItem[] = [
  // Greetings (Easy)
  {
    id: 'wg-1',
    mk: 'Здраво',
    en: 'Hello',
    blank: 'Здраво',
    maskedMk: '____',
    ...createOptions('Здраво', 'greetings'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  {
    id: 'wg-2',
    mk: 'Како си?',
    en: 'How are you?',
    blank: 'Како',
    maskedMk: '____ си?',
    ...createOptions('Како', 'greetings'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  {
    id: 'wg-3',
    mk: 'Добро сум, благодарам',
    en: "I'm good, thank you",
    blank: 'благодарам',
    maskedMk: 'Добро сум, ____',
    ...createOptions('благодарам', 'common'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  {
    id: 'wg-4',
    mk: 'Добро утро',
    en: 'Good morning',
    blank: 'утро',
    maskedMk: 'Добро ____',
    ...createOptions('утро', 'greetings'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  {
    id: 'wg-5',
    mk: 'Добар ден',
    en: 'Good day',
    blank: 'ден',
    maskedMk: 'Добар ____',
    ...createOptions('ден', 'greetings'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  {
    id: 'wg-6',
    mk: 'Добра вечер',
    en: 'Good evening',
    blank: 'вечер',
    maskedMk: 'Добра ____',
    ...createOptions('вечер', 'greetings'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  {
    id: 'wg-7',
    mk: 'Добра ноќ',
    en: 'Good night',
    blank: 'ноќ',
    maskedMk: 'Добра ____',
    ...createOptions('ноќ', 'greetings'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  {
    id: 'wg-8',
    mk: 'Довидување',
    en: 'Goodbye',
    blank: 'Довидување',
    maskedMk: '____',
    ...createOptions('Довидување', 'greetings'),
    difficulty: 'easy',
    xpReward: XP_REWARDS.easy,
    category: 'greetings',
  },
  // Common (Medium)
  {
    id: 'wg-9',
    mk: 'Благодарам',
    en: 'Thank you',
    blank: 'Благодарам',
    maskedMk: '____',
    ...createOptions('Благодарам', 'common'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'common',
  },
  {
    id: 'wg-10',
    mk: 'Молам',
    en: 'Please',
    blank: 'Молам',
    maskedMk: '____',
    ...createOptions('Молам', 'common'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'common',
  },
  // Emergency (Medium)
  {
    id: 'wg-11',
    mk: 'Каде е тоалетот?',
    en: 'Where is the toilet?',
    blank: 'тоалетот',
    maskedMk: 'Каде е ____?',
    ...createOptions('тоалетот', 'emergency'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'emergency',
  },
  {
    id: 'wg-12',
    mk: 'Каде е аптеката?',
    en: 'Where is the pharmacy?',
    blank: 'аптеката',
    maskedMk: 'Каде е ____?',
    ...createOptions('аптеката', 'emergency'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'emergency',
  },
  {
    id: 'wg-13',
    mk: 'Ми треба доктор!',
    en: 'I need a doctor!',
    blank: 'доктор',
    maskedMk: 'Ми треба ____!',
    ...createOptions('доктор', 'emergency'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'emergency',
  },
  {
    id: 'wg-14',
    mk: 'Итно!',
    en: 'Urgently!',
    blank: 'Итно',
    maskedMk: '____!',
    ...createOptions('Итно', 'emergency'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'emergency',
  },
  // Communication (Medium/Hard)
  {
    id: 'wg-15',
    mk: 'Не разбирам',
    en: "I don't understand",
    blank: 'разбирам',
    maskedMk: 'Не ____',
    ...createOptions('разбирам', 'communication'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'communication',
  },
  {
    id: 'wg-16',
    mk: 'Разбирам',
    en: 'I understand',
    blank: 'Разбирам',
    maskedMk: '____',
    ...createOptions('Разбирам', 'communication'),
    difficulty: 'medium',
    xpReward: XP_REWARDS.medium,
    category: 'communication',
  },
  {
    id: 'wg-17',
    mk: 'Зборуваш ли англиски?',
    en: 'Do you speak English?',
    blank: 'англиски',
    maskedMk: 'Зборуваш ли ____?',
    ...createOptions('англиски', 'communication'),
    difficulty: 'hard',
    xpReward: XP_REWARDS.hard,
    category: 'communication',
  },
  // Shopping (Hard)
  {
    id: 'wg-18',
    mk: 'Колку е ова?',
    en: 'How much is this?',
    blank: 'Колку',
    maskedMk: '____ е ова?',
    ...createOptions('Колку', 'shopping'),
    difficulty: 'hard',
    xpReward: XP_REWARDS.hard,
    category: 'shopping',
  },
  {
    id: 'wg-19',
    mk: 'Скапо е!',
    en: "It's expensive!",
    blank: 'Скапо',
    maskedMk: '____ е!',
    ...createOptions('Скапо', 'shopping'),
    difficulty: 'hard',
    xpReward: XP_REWARDS.hard,
    category: 'shopping',
  },
  {
    id: 'wg-20',
    mk: 'Намали ми ја цената!',
    en: 'Lower the price!',
    blank: 'цената',
    maskedMk: 'Намали ми ја ____!',
    ...createOptions('цената', 'shopping'),
    difficulty: 'hard',
    xpReward: XP_REWARDS.hard,
    category: 'shopping',
  },
];

/**
 * Get a shuffled session of N word gap items, optionally filtered by difficulty
 */
export function getWordGapsSession(
  count: number = 10,
  difficulty?: Difficulty
): WordGapItem[] {
  let items = [...wordGapsSeedData];

  if (difficulty) {
    items = items.filter(item => item.difficulty === difficulty);
  }

  const shuffled = items.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

/**
 * Regenerate options for runtime (prevents predictable patterns)
 */
export function refreshItemOptions(item: WordGapItem): WordGapItem {
  const { options, answerIndex } = createOptions(item.blank, item.category);
  return { ...item, options, answerIndex };
}

/**
 * Get items by difficulty
 */
export function getItemsByDifficulty(difficulty: Difficulty): WordGapItem[] {
  return wordGapsSeedData.filter(item => item.difficulty === difficulty);
}

// Re-export types for backwards compatibility
export type ClozeItem = WordGapItem;
export const clozeSeedData = wordGapsSeedData;
export const getClozeSession = getWordGapsSession;
