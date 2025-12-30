/**
 * Cloze Seed Dataset
 *
 * 20 verified Macedonian sentences from trusted sources:
 * - Wikivoyage (Macedonian phrasebook)
 * - Wikibooks (Macedonian/Common phrases)
 * - Omniglot (Useful Macedonian phrases)
 * - Language Trainers (Macedonian basics)
 */

export type ClozeItem = {
  id: string;
  mk: string;           // Full Macedonian sentence
  en: string;           // English translation
  blank: string;        // Word that's blanked out
  maskedMk: string;     // Sentence with ____ in place of blank
  options: string[];    // 4 options (includes correct answer)
  answerIndex: number;  // Index of correct answer in options
  source: string;       // Attribution
};

// Word bank for distractors
const wordBank = [
  'Здраво', 'Како', 'сте', 'Многу', 'добро', 'благодарам', 'Јас', 'не', 'разбирам',
  'Каде', 'се', 'тоалетите', 'си', 'Добро', 'утро', 'Догледање', 'фала', 'А', 'ти',
  'Колку', 'чини', 'ова', 'е', 'тоалетот', 'Учам', 'македонски', 'Остави', 'ме', 'мир',
  'Викни', 'полиција', 'викаш', 'Од', 'каде', 'Дали', 'зборуваш', 'англиски', 'Може',
  'ли', 'помогнете', 'Ми', 'треба', 'такси'
];

function getDistractors(correct: string, count: number = 3): string[] {
  const filtered = wordBank.filter(w => w.toLowerCase() !== correct.toLowerCase());
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function createOptions(correct: string): { options: string[]; answerIndex: number } {
  const distractors = getDistractors(correct);
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);
  return { options, answerIndex: options.indexOf(correct) };
}

export const clozeSeedData: ClozeItem[] = [
  // Wikivoyage
  {
    id: 'cloze-1',
    mk: 'Здраво!',
    en: 'Hello!',
    blank: 'Здраво',
    maskedMk: '____!',
    ...createOptions('Здраво'),
    source: 'Wikivoyage',
  },
  {
    id: 'cloze-2',
    mk: 'Како сте?',
    en: 'How are you?',
    blank: 'Како',
    maskedMk: '____ сте?',
    ...createOptions('Како'),
    source: 'Wikivoyage',
  },
  {
    id: 'cloze-3',
    mk: 'Многу добро, благодарам!',
    en: 'Very well, thank you!',
    blank: 'благодарам',
    maskedMk: 'Многу добро, ____!',
    ...createOptions('благодарам'),
    source: 'Wikivoyage',
  },
  {
    id: 'cloze-4',
    mk: 'Јас не разбирам.',
    en: "I don't understand.",
    blank: 'разбирам',
    maskedMk: 'Јас не ____.',
    ...createOptions('разбирам'),
    source: 'Wikivoyage',
  },
  {
    id: 'cloze-5',
    mk: 'Каде се тоалетите?',
    en: 'Where are the toilets?',
    blank: 'тоалетите',
    maskedMk: 'Каде се ____?',
    ...createOptions('тоалетите'),
    source: 'Wikivoyage',
  },
  // Wikibooks
  {
    id: 'cloze-6',
    mk: 'Како си?',
    en: 'How are you? (informal)',
    blank: 'си',
    maskedMk: 'Како ____?',
    ...createOptions('си'),
    source: 'Wikibooks',
  },
  {
    id: 'cloze-7',
    mk: 'Добро утро.',
    en: 'Good morning.',
    blank: 'утро',
    maskedMk: 'Добро ____.',
    ...createOptions('утро'),
    source: 'Wikibooks',
  },
  {
    id: 'cloze-8',
    mk: 'Догледање.',
    en: 'Goodbye.',
    blank: 'Догледање',
    maskedMk: '____.',
    ...createOptions('Догледање'),
    source: 'Wikibooks',
  },
  {
    id: 'cloze-9',
    mk: 'Добро утро, како си?',
    en: 'Good morning, how are you?',
    blank: 'Добро',
    maskedMk: '____ утро, како си?',
    ...createOptions('Добро'),
    source: 'Wikibooks',
  },
  {
    id: 'cloze-10',
    mk: 'Добро, фала. А ти?',
    en: 'Good, thanks. And you?',
    blank: 'фала',
    maskedMk: 'Добро, ____. А ти?',
    ...createOptions('фала'),
    source: 'Wikibooks',
  },
  // Omniglot
  {
    id: 'cloze-11',
    mk: 'Колку чини ова?',
    en: 'How much does this cost?',
    blank: 'чини',
    maskedMk: 'Колку ____ ова?',
    ...createOptions('чини'),
    source: 'Omniglot',
  },
  {
    id: 'cloze-12',
    mk: 'Каде е тоалетот?',
    en: 'Where is the toilet?',
    blank: 'тоалетот',
    maskedMk: 'Каде е ____?',
    ...createOptions('тоалетот'),
    source: 'Omniglot',
  },
  {
    id: 'cloze-13',
    mk: 'Учам македонски.',
    en: "I'm learning Macedonian.",
    blank: 'македонски',
    maskedMk: 'Учам ____.',
    ...createOptions('македонски'),
    source: 'Omniglot',
  },
  {
    id: 'cloze-14',
    mk: 'Остави ме на мир!',
    en: 'Leave me alone!',
    blank: 'мир',
    maskedMk: 'Остави ме на ____!',
    ...createOptions('мир'),
    source: 'Omniglot',
  },
  {
    id: 'cloze-15',
    mk: 'Викни полиција!',
    en: 'Call the police!',
    blank: 'полиција',
    maskedMk: 'Викни ____!',
    ...createOptions('полиција'),
    source: 'Omniglot',
  },
  // Language Trainers
  {
    id: 'cloze-16',
    mk: 'Како се викаш?',
    en: 'What is your name?',
    blank: 'викаш',
    maskedMk: 'Како се ____?',
    ...createOptions('викаш'),
    source: 'Language Trainers',
  },
  {
    id: 'cloze-17',
    mk: 'Од каде си?',
    en: 'Where are you from?',
    blank: 'каде',
    maskedMk: 'Од ____ си?',
    ...createOptions('каде'),
    source: 'Language Trainers',
  },
  {
    id: 'cloze-18',
    mk: 'Дали зборуваш англиски?',
    en: 'Do you speak English?',
    blank: 'англиски',
    maskedMk: 'Дали зборуваш ____?',
    ...createOptions('англиски'),
    source: 'Language Trainers',
  },
  {
    id: 'cloze-19',
    mk: 'Може ли да ми помогнете?',
    en: 'Can you help me?',
    blank: 'помогнете',
    maskedMk: 'Може ли да ми ____?',
    ...createOptions('помогнете'),
    source: 'Language Trainers',
  },
  {
    id: 'cloze-20',
    mk: 'Ми треба такси.',
    en: 'I need a taxi.',
    blank: 'такси',
    maskedMk: 'Ми треба ____.',
    ...createOptions('такси'),
    source: 'Language Trainers',
  },
];

/**
 * Get a shuffled session of N cloze items
 */
export function getClozeSession(count: number = 10): ClozeItem[] {
  const shuffled = [...clozeSeedData].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, clozeSeedData.length));
}

/**
 * Regenerate options for runtime (prevents predictable patterns)
 */
export function refreshItemOptions(item: ClozeItem): ClozeItem {
  const { options, answerIndex } = createOptions(item.blank);
  return { ...item, options, answerIndex };
}
