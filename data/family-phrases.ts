/**
 * Common Phrases Library for Family Conversations
 *
 * Format for each phrase:
 * - macedonian: Cyrillic text
 * - english: English translation
 * - context: When/how to use this phrase
 * - formality: 'formal' | 'informal' | 'neutral'
 */

export type Formality = 'formal' | 'informal' | 'neutral';

export type Phrase = {
  id: string;
  macedonian: string;
  english: string;
  context: string;
  formality: Formality;
};

export type PhraseCategory = {
  id: string;
  name: string;
  phrases: Phrase[];
};

export const familyPhrases: PhraseCategory[] = [
  {
    id: 'greetings',
    name: 'Greetings and Introductions',
    phrases: [
      {
        id: 'greet-1',
        macedonian: 'Здраво!',
        english: 'Hello!',
        context: 'Casual greeting for friends and close family',
        formality: 'informal',
      },
      {
        id: 'greet-2',
        macedonian: 'Добар ден!',
        english: 'Good day!',
        context: 'Polite greeting for any time of day',
        formality: 'neutral',
      },
      {
        id: 'greet-3',
        macedonian: 'Добро утро!',
        english: 'Good morning!',
        context: 'Morning greeting, used until around 11 AM',
        formality: 'neutral',
      },
      {
        id: 'greet-4',
        macedonian: 'Добро попладне!',
        english: 'Good afternoon!',
        context: 'Afternoon greeting, used from noon to evening',
        formality: 'neutral',
      },
      {
        id: 'greet-5',
        macedonian: 'Добра вечер!',
        english: 'Good evening!',
        context: 'Evening greeting, used after sunset',
        formality: 'neutral',
      },
      {
        id: 'greet-6',
        macedonian: 'Како си?',
        english: 'How are you?',
        context: 'Informal way to ask how someone is doing',
        formality: 'informal',
      },
      {
        id: 'greet-7',
        macedonian: 'Како сте?',
        english: 'How are you?',
        context: 'Formal way to ask how someone is doing, use with elders',
        formality: 'formal',
      },
      {
        id: 'greet-8',
        macedonian: 'Добро дојдовте!',
        english: 'Welcome!',
        context: 'Formal welcome when guests arrive',
        formality: 'formal',
      },
      {
        id: 'greet-9',
        macedonian: 'Драго ми е!',
        english: 'Nice to meet you!',
        context: 'When meeting someone for the first time',
        formality: 'neutral',
      },
      {
        id: 'greet-10',
        macedonian: 'Дај здравје!',
        english: 'Good health to you!',
        context: 'Traditional warm greeting wishing good health',
        formality: 'neutral',
      },
    ],
  },
  {
    id: 'family-questions',
    name: 'Asking About Family Members',
    phrases: [
      {
        id: 'fam-1',
        macedonian: 'Како е мама?',
        english: 'How is mom?',
        context: 'Asking about mother\'s well-being',
        formality: 'informal',
      },
      {
        id: 'fam-2',
        macedonian: 'Како е татко?',
        english: 'How is dad?',
        context: 'Asking about father\'s well-being',
        formality: 'informal',
      },
      {
        id: 'fam-3',
        macedonian: 'Како се децата?',
        english: 'How are the children?',
        context: 'Asking about kids in the family',
        formality: 'neutral',
      },
      {
        id: 'fam-4',
        macedonian: 'Каде се внуците?',
        english: 'Where are the grandchildren?',
        context: 'Asking about grandchildren\'s whereabouts',
        formality: 'neutral',
      },
      {
        id: 'fam-5',
        macedonian: 'Што прави твојот брат?',
        english: 'What is your brother doing?',
        context: 'Asking about brother\'s activities or job',
        formality: 'informal',
      },
      {
        id: 'fam-6',
        macedonian: 'Како се чувствува баба?',
        english: 'How is grandma feeling?',
        context: 'Asking about grandmother\'s health',
        formality: 'neutral',
      },
      {
        id: 'fam-7',
        macedonian: 'Дали дедо е дома?',
        english: 'Is grandpa home?',
        context: 'Asking if grandfather is at home',
        formality: 'neutral',
      },
      {
        id: 'fam-8',
        macedonian: 'Кога доаѓа твојата сестра?',
        english: 'When is your sister coming?',
        context: 'Asking about sister\'s visit timing',
        formality: 'informal',
      },
      {
        id: 'fam-9',
        macedonian: 'Дали вујко е подобро?',
        english: 'Is uncle feeling better?',
        context: 'Asking about uncle\'s recovery or health improvement',
        formality: 'neutral',
      },
      {
        id: 'fam-10',
        macedonian: 'Каде работи твојата тетка?',
        english: 'Where does your aunt work?',
        context: 'Asking about aunt\'s workplace',
        formality: 'informal',
      },
    ],
  },
  {
    id: 'health',
    name: 'Health and Well-Being',
    phrases: [
      {
        id: 'health-1',
        macedonian: 'Како е здравјето?',
        english: 'How is your health?',
        context: 'Polite way to ask about someone\'s health status',
        formality: 'neutral',
      },
      {
        id: 'health-2',
        macedonian: 'Дали сè е во ред?',
        english: 'Is everything okay?',
        context: 'Expressing concern, asking if things are alright',
        formality: 'neutral',
      },
      {
        id: 'health-3',
        macedonian: 'Грижам се за тебе.',
        english: 'I\'m worried about you.',
        context: 'Expressing concern for someone\'s well-being',
        formality: 'informal',
      },
      {
        id: 'health-4',
        macedonian: 'Ако треба нешто, јави ми.',
        english: 'If you need anything, let me know.',
        context: 'Offering help and support',
        formality: 'informal',
      },
      {
        id: 'health-5',
        macedonian: 'Чувај се!',
        english: 'Take care!',
        context: 'Caring farewell wishing good health',
        formality: 'informal',
      },
      {
        id: 'health-6',
        macedonian: 'Дали одиш кај докторот?',
        english: 'Are you going to the doctor?',
        context: 'Asking about medical appointments with concern',
        formality: 'informal',
      },
      {
        id: 'health-7',
        macedonian: 'Се надевам дека ќе се оздравиш брзо.',
        english: 'I hope you get better soon.',
        context: 'Wishing speedy recovery',
        formality: 'neutral',
      },
      {
        id: 'health-8',
        macedonian: 'Јави ми како си.',
        english: 'Let me know how you are.',
        context: 'Asking someone to update you on their condition',
        formality: 'informal',
      },
    ],
  },
  {
    id: 'food',
    name: 'Food and Meals',
    phrases: [
      {
        id: 'food-1',
        macedonian: 'Ќе јадеш нешто?',
        english: 'Will you eat something?',
        context: 'Offering food to guests, very common hospitality phrase',
        formality: 'informal',
      },
      {
        id: 'food-2',
        macedonian: 'Благодарам, сум сит/сита.',
        english: 'Thank you, I\'m full.',
        context: 'Politely declining more food (сит for male, сита for female)',
        formality: 'neutral',
      },
      {
        id: 'food-3',
        macedonian: 'Беше многу вкусно!',
        english: 'It was very delicious!',
        context: 'Complimenting the food',
        formality: 'neutral',
      },
      {
        id: 'food-4',
        macedonian: 'Што ќе готвиш денес?',
        english: 'What are you cooking today?',
        context: 'Asking about meal plans',
        formality: 'informal',
      },
      {
        id: 'food-5',
        macedonian: 'Дали сакаш кафе?',
        english: 'Would you like coffee?',
        context: 'Offering coffee, very common in Macedonian culture',
        formality: 'informal',
      },
      {
        id: 'food-6',
        macedonian: 'Заповедајте на трпеза!',
        english: 'Please come to the table!',
        context: 'Formal invitation to sit and eat',
        formality: 'formal',
      },
      {
        id: 'food-7',
        macedonian: 'Што има за ручек?',
        english: 'What\'s for lunch?',
        context: 'Asking what food is being served for lunch',
        formality: 'informal',
      },
      {
        id: 'food-8',
        macedonian: 'Приjатно!',
        english: 'Enjoy your meal!',
        context: 'Wishing someone a pleasant meal',
        formality: 'neutral',
      },
    ],
  },
  {
    id: 'plans',
    name: 'Making Plans',
    phrases: [
      {
        id: 'plans-1',
        macedonian: 'Ќе дојдеш на ручек?',
        english: 'Will you come for lunch?',
        context: 'Inviting someone to a meal',
        formality: 'informal',
      },
      {
        id: 'plans-2',
        macedonian: 'Да се видиме во недела.',
        english: 'Let\'s meet on Sunday.',
        context: 'Making plans to meet on the weekend',
        formality: 'informal',
      },
      {
        id: 'plans-3',
        macedonian: 'Кога си слободен/слободна?',
        english: 'When are you free?',
        context: 'Asking about availability (слободен for male, слободна for female)',
        formality: 'informal',
      },
      {
        id: 'plans-4',
        macedonian: 'Ајде да одиме заедно.',
        english: 'Let\'s go together.',
        context: 'Suggesting to do something together',
        formality: 'informal',
      },
      {
        id: 'plans-5',
        macedonian: 'Дали можеш да дојдеш утре?',
        english: 'Can you come tomorrow?',
        context: 'Asking if someone can visit the next day',
        formality: 'informal',
      },
      {
        id: 'plans-6',
        macedonian: 'Што правиш во саботата?',
        english: 'What are you doing on Saturday?',
        context: 'Asking about weekend plans',
        formality: 'informal',
      },
      {
        id: 'plans-7',
        macedonian: 'Ќе се јавам кога ќе знам.',
        english: 'I\'ll let you know when I know.',
        context: 'Promising to update later about plans',
        formality: 'informal',
      },
      {
        id: 'plans-8',
        macedonian: 'Се гледаме наскоро!',
        english: 'See you soon!',
        context: 'Friendly way to say you\'ll meet again soon',
        formality: 'informal',
      },
    ],
  },
  {
    id: 'emotions',
    name: 'Emotions and Reactions',
    phrases: [
      {
        id: 'emotion-1',
        macedonian: 'Многу се радувам!',
        english: 'I\'m so happy!',
        context: 'Expressing joy and happiness',
        formality: 'neutral',
      },
      {
        id: 'emotion-2',
        macedonian: 'Ми недостигаш.',
        english: 'I miss you.',
        context: 'Expressing that you miss someone',
        formality: 'informal',
      },
      {
        id: 'emotion-3',
        macedonian: 'Жал ми е.',
        english: 'I\'m sorry.',
        context: 'Apologizing or expressing regret',
        formality: 'neutral',
      },
      {
        id: 'emotion-4',
        macedonian: 'Те сакам многу.',
        english: 'I love you very much.',
        context: 'Expressing love to family members',
        formality: 'informal',
      },
      {
        id: 'emotion-5',
        macedonian: 'Се гордеам со тебе.',
        english: 'I\'m proud of you.',
        context: 'Expressing pride in someone\'s achievements',
        formality: 'informal',
      },
      {
        id: 'emotion-6',
        macedonian: 'Не се грижи.',
        english: 'Don\'t worry.',
        context: 'Comforting someone who is concerned',
        formality: 'informal',
      },
      {
        id: 'emotion-7',
        macedonian: 'Сè ќе биде во ред.',
        english: 'Everything will be okay.',
        context: 'Reassuring someone during difficult times',
        formality: 'neutral',
      },
      {
        id: 'emotion-8',
        macedonian: 'Благодарам за сè.',
        english: 'Thank you for everything.',
        context: 'Expressing gratitude for someone\'s help or support',
        formality: 'neutral',
      },
    ],
  },
  {
    id: 'compliments-goodbyes',
    name: 'Compliments and Goodbyes',
    phrases: [
      {
        id: 'comp-1',
        macedonian: 'Многу убаво изгледаш!',
        english: 'You look very nice!',
        context: 'Complimenting someone\'s appearance',
        formality: 'informal',
      },
      {
        id: 'comp-2',
        macedonian: 'Одлично го направи тоа!',
        english: 'You did that excellently!',
        context: 'Praising someone\'s achievement',
        formality: 'neutral',
      },
      {
        id: 'comp-3',
        macedonian: 'Среќен пат!',
        english: 'Have a safe journey!',
        context: 'Wishing safe travels when someone is leaving',
        formality: 'neutral',
      },
      {
        id: 'comp-4',
        macedonian: 'Довидување!',
        english: 'Goodbye!',
        context: 'Formal way to say goodbye',
        formality: 'formal',
      },
      {
        id: 'comp-5',
        macedonian: 'Чао!',
        english: 'Bye!',
        context: 'Casual way to say goodbye',
        formality: 'informal',
      },
      {
        id: 'comp-6',
        macedonian: 'Пријатен викенд!',
        english: 'Have a nice weekend!',
        context: 'Weekend farewell greeting',
        formality: 'neutral',
      },
      {
        id: 'comp-7',
        macedonian: 'Се гледаме!',
        english: 'See you!',
        context: 'Casual goodbye expecting to meet again',
        formality: 'informal',
      },
      {
        id: 'comp-8',
        macedonian: 'Благодарам што дојде.',
        english: 'Thank you for coming.',
        context: 'Thanking someone for visiting',
        formality: 'neutral',
      },
      {
        id: 'comp-9',
        macedonian: 'Добра ноќ!',
        english: 'Good night!',
        context: 'Nighttime farewell or before going to sleep',
        formality: 'neutral',
      },
      {
        id: 'comp-10',
        macedonian: 'Да се дружиме повторно наскоро!',
        english: 'Let\'s get together again soon!',
        context: 'Warm farewell with intent to meet again',
        formality: 'informal',
      },
    ],
  },
];

// Helper function to get all phrases
export function getAllPhrases(): Phrase[] {
  return familyPhrases.flatMap(category => category.phrases);
}

// Helper function to get phrases by category
export function getPhrasesByCategory(categoryId: string): Phrase[] {
  const category = familyPhrases.find(cat => cat.id === categoryId);
  return category?.phrases || [];
}

// Helper function to count total phrases
export function getTotalPhrasesCount(): number {
  return getAllPhrases().length;
}
