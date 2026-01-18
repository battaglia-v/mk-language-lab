/**
 * Word Sprint practice mode for React Native
 * 
 * Fill-in-the-blank multiple choice practice with Macedonian sentences
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see content/word-sprint/sentences.ts (PWA data source)
 * @see components/practice/word-sprint/WordSprintSession.tsx (PWA implementation)
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type SessionLength = 5 | 10 | 15 | 20;

export type WordSprintItem = {
  id: string;
  mk: string;           // Full Macedonian sentence
  en: string;           // English translation
  missing: string;      // The blanked word (correct answer)
  maskedMk: string;     // Sentence with ____ placeholder
  choices: string[];    // Multiple choice options
  difficulty: Difficulty;
  category: string;
};

// Word banks for generating distractors
const wordBanks: Record<string, string[]> = {
  greetings: ['Здраво', 'Добро', 'утро', 'ден', 'вечер', 'ноќ', 'Довидување', 'Како', 'си', 'сум', 'благодарам', 'пријатно'],
  common: ['благодарам', 'Молам', 'фала', 'да', 'не', 'извинете', 'ве', 'молам', 'секогаш', 'никогаш', 'сега', 'потоа'],
  questions: ['Каде', 'Колку', 'Што', 'Кој', 'Зошто', 'Како', 'Кога', 'Дали', 'Чие'],
  places: ['тоалетот', 'аптеката', 'болница', 'ресторан', 'хотел', 'банка', 'пошта', 'пазар', 'продавница', 'парк'],
  food: ['кафе', 'вода', 'чај', 'леб', 'месо', 'риба', 'салата', 'супа', 'сок', 'пиво', 'вино', 'млеко'],
  family: ['мајка', 'татко', 'брат', 'сестра', 'баба', 'дедо', 'сопруг', 'сопруга', 'дете', 'пријател'],
  activities: ['читам', 'пишувам', 'зборувам', 'учам', 'работам', 'одам', 'доаѓам', 'спијам', 'јадам', 'пијам'],
  emotions: ['среќен', 'тажен', 'љут', 'уморен', 'гладен', 'жеден', 'заљубен', 'изненаден', 'загрижен', 'возбуден'],
  numbers: ['еден', 'два', 'три', 'четири', 'пет', 'шест', 'седум', 'осум', 'девет', 'десет'],
};

// Sample sentences (subset for mobile - can be expanded)
const sentences: Omit<WordSprintItem, 'choices'>[] = [
  // Easy
  { id: 'ws-1', mk: 'Здраво', en: 'Hello', missing: 'Здраво', maskedMk: '____', difficulty: 'easy', category: 'greetings' },
  { id: 'ws-2', mk: 'Како си?', en: 'How are you?', missing: 'Како', maskedMk: '____ си?', difficulty: 'easy', category: 'greetings' },
  { id: 'ws-3', mk: 'Добро сум', en: 'I am good', missing: 'Добро', maskedMk: '____ сум', difficulty: 'easy', category: 'greetings' },
  { id: 'ws-4', mk: 'Добро утро', en: 'Good morning', missing: 'утро', maskedMk: 'Добро ____', difficulty: 'easy', category: 'greetings' },
  { id: 'ws-5', mk: 'Добар ден', en: 'Good day', missing: 'ден', maskedMk: 'Добар ____', difficulty: 'easy', category: 'greetings' },
  { id: 'ws-6', mk: 'Благодарам', en: 'Thank you', missing: 'Благодарам', maskedMk: '____', difficulty: 'easy', category: 'common' },
  { id: 'ws-7', mk: 'Молам', en: 'Please', missing: 'Молам', maskedMk: '____', difficulty: 'easy', category: 'common' },
  { id: 'ws-8', mk: 'Да', en: 'Yes', missing: 'Да', maskedMk: '____', difficulty: 'easy', category: 'common' },
  { id: 'ws-9', mk: 'Не', en: 'No', missing: 'Не', maskedMk: '____', difficulty: 'easy', category: 'common' },
  { id: 'ws-10', mk: 'Сакам кафе', en: 'I want coffee', missing: 'кафе', maskedMk: 'Сакам ____', difficulty: 'easy', category: 'food' },
  { id: 'ws-11', mk: 'Сакам вода', en: 'I want water', missing: 'вода', maskedMk: 'Сакам ____', difficulty: 'easy', category: 'food' },
  { id: 'ws-12', mk: 'Јас сум среќен', en: 'I am happy', missing: 'среќен', maskedMk: 'Јас сум ____', difficulty: 'easy', category: 'emotions' },
  { id: 'ws-13', mk: 'Моја мајка', en: 'My mother', missing: 'мајка', maskedMk: 'Моја ____', difficulty: 'easy', category: 'family' },
  { id: 'ws-14', mk: 'Мој татко', en: 'My father', missing: 'татко', maskedMk: 'Мој ____', difficulty: 'easy', category: 'family' },
  { id: 'ws-15', mk: 'Имам брат', en: 'I have a brother', missing: 'брат', maskedMk: 'Имам ____', difficulty: 'easy', category: 'family' },

  // Medium
  { id: 'ws-21', mk: 'Каде е тоалетот?', en: 'Where is the toilet?', missing: 'тоалетот', maskedMk: 'Каде е ____?', difficulty: 'medium', category: 'places' },
  { id: 'ws-22', mk: 'Каде е аптеката?', en: 'Where is the pharmacy?', missing: 'аптеката', maskedMk: 'Каде е ____?', difficulty: 'medium', category: 'places' },
  { id: 'ws-23', mk: 'Колку чини ова?', en: 'How much is this?', missing: 'чини', maskedMk: 'Колку ____ ова?', difficulty: 'medium', category: 'questions' },
  { id: 'ws-24', mk: 'Не разбирам', en: "I don't understand", missing: 'разбирам', maskedMk: 'Не ____', difficulty: 'medium', category: 'common' },
  { id: 'ws-25', mk: 'Зборувате ли англиски?', en: 'Do you speak English?', missing: 'англиски', maskedMk: 'Зборувате ли ____?', difficulty: 'medium', category: 'common' },
  { id: 'ws-26', mk: 'Јас читам книга', en: 'I read a book', missing: 'читам', maskedMk: 'Јас ____ книга', difficulty: 'medium', category: 'activities' },
  { id: 'ws-27', mk: 'Јас учам македонски', en: 'I learn Macedonian', missing: 'учам', maskedMk: 'Јас ____ македонски', difficulty: 'medium', category: 'activities' },
  { id: 'ws-28', mk: 'Денес е понеделник', en: 'Today is Monday', missing: 'Денес', maskedMk: '____ е понеделник', difficulty: 'medium', category: 'common' },
  { id: 'ws-29', mk: 'Времето е убаво', en: 'The weather is nice', missing: 'убаво', maskedMk: 'Времето е ____', difficulty: 'medium', category: 'common' },
  { id: 'ws-30', mk: 'Каде е хотелот?', en: 'Where is the hotel?', missing: 'хотелот', maskedMk: 'Каде е ____?', difficulty: 'medium', category: 'places' },

  // Hard
  { id: 'ws-41', mk: 'Би сакал да резервирам маса', en: 'I would like to reserve a table', missing: 'резервирам', maskedMk: 'Би сакал да ____ маса', difficulty: 'hard', category: 'common' },
  { id: 'ws-42', mk: 'Можете ли да ми помогнете?', en: 'Can you help me?', missing: 'помогнете', maskedMk: 'Можете ли да ми ____?', difficulty: 'hard', category: 'common' },
  { id: 'ws-43', mk: 'Кога тргнува автобусот?', en: 'When does the bus leave?', missing: 'тргнува', maskedMk: 'Кога ____ автобусот?', difficulty: 'hard', category: 'questions' },
  { id: 'ws-44', mk: 'Дали прифаќате кредитни картички?', en: 'Do you accept credit cards?', missing: 'кредитни', maskedMk: 'Дали прифаќате ____ картички?', difficulty: 'hard', category: 'questions' },
  { id: 'ws-45', mk: 'Би сакал да платам', en: 'I would like to pay', missing: 'платам', maskedMk: 'Би сакал да ____', difficulty: 'hard', category: 'common' },
  { id: 'ws-46', mk: 'Имам резервација', en: 'I have a reservation', missing: 'резервација', maskedMk: 'Имам ____', difficulty: 'hard', category: 'common' },
  { id: 'ws-47', mk: 'Треба ми лекар итно', en: 'I need a doctor urgently', missing: 'итно', maskedMk: 'Треба ми лекар ____', difficulty: 'hard', category: 'common' },
  { id: 'ws-48', mk: 'Мислам дека тоа е добра идеја', en: 'I think that is a good idea', missing: 'Мислам', maskedMk: '____ дека тоа е добра идеја', difficulty: 'hard', category: 'common' },
];

/**
 * Get random distractors from word banks
 */
function getDistractors(correct: string, category: string, count = 3): string[] {
  const categoryWords = wordBanks[category] || [];
  const allWords = [...categoryWords, ...Object.values(wordBanks).flat()];
  
  const filtered = allWords.filter(
    (w) => w.toLowerCase() !== correct.toLowerCase()
  );
  
  // Shuffle and take unique words
  const unique = [...new Set(filtered)];
  const shuffled = unique.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count);
}

/**
 * Generate choices for an item
 */
function generateChoices(item: Omit<WordSprintItem, 'choices'>): string[] {
  const choiceCount = item.difficulty === 'easy' ? 2 : 4;
  const distractors = getDistractors(item.missing, item.category, choiceCount - 1);
  const choices = [...distractors, item.missing];
  
  // Shuffle choices
  return choices.sort(() => Math.random() - 0.5);
}

/**
 * Get a Word Sprint session
 */
export function getWordSprintSession(
  count: SessionLength,
  difficulty?: Difficulty
): WordSprintItem[] {
  // Filter by difficulty if specified
  const filtered = difficulty
    ? sentences.filter((s) => s.difficulty === difficulty)
    : [...sentences];
  
  // Shuffle and take requested count
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  // Generate choices for each item
  return selected.map((item) => ({
    ...item,
    choices: generateChoices(item),
  }));
}

/**
 * Refresh choices for an item (for retry after wrong answer)
 */
export function refreshItemChoices(item: WordSprintItem): WordSprintItem {
  return {
    ...item,
    choices: generateChoices(item),
  };
}

/**
 * Check if answer is correct
 * For hard mode, uses flexible matching
 */
export function isAnswerCorrect(
  answer: string,
  correct: string,
  difficulty: Difficulty
): boolean {
  if (difficulty === 'hard') {
    // More flexible matching for hard mode (typing)
    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedCorrect = correct.toLowerCase().trim();
    return normalizedAnswer === normalizedCorrect;
  }
  
  // Exact match for easy/medium (multiple choice)
  return answer === correct;
}

// XP values per question
export const BASE_XP_PER_QUESTION: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
};

/**
 * Get combo multiplier for streaks
 */
export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 2.0;
  if (combo >= 7) return 1.5;
  if (combo >= 5) return 1.3;
  if (combo >= 3) return 1.2;
  return 1.0;
}

/**
 * Calculate XP for a correct answer
 */
export function calculateXPForAnswer(
  difficulty: Difficulty,
  combo: number
): number {
  const base = BASE_XP_PER_QUESTION[difficulty];
  const multiplier = getComboMultiplier(combo);
  return Math.round(base * multiplier);
}
