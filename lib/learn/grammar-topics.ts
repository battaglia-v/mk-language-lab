/**
 * Grammar Topics - Canonical list for MKLanguage
 * 
 * Used for:
 * - Tagging exercises with grammarTopic
 * - Tracking user performance by topic
 * - Surfacing weak areas for focused practice
 * 
 * Topics are organized by CEFR level and category.
 */

export type GrammarTopicId = 
  // A1 Topics - Basics
  | 'alphabet-cyrillic'
  | 'greetings-basic'
  | 'pronouns-personal'
  | 'nouns-gender'
  | 'nouns-plural'
  | 'verbs-present-sum' // To be: сум, си, е...
  | 'verbs-present-regular'
  | 'adjectives-agreement'
  | 'numbers-1-20'
  | 'definite-article'
  // A2 Topics - Elementary
  | 'verbs-past-simple'
  | 'verbs-future'
  | 'pronouns-object'
  | 'prepositions-basic'
  | 'questions-formation'
  | 'negation'
  | 'adjectives-comparison'
  | 'adverbs-basic'
  | 'numbers-21-100'
  | 'time-expressions'
  // B1 Topics - Intermediate
  | 'verbs-aspect-imperfective'
  | 'verbs-aspect-perfective'
  | 'conditional-mood'
  | 'relative-clauses'
  | 'indirect-speech'
  | 'passive-voice'
  | 'modal-verbs'
  | 'complex-sentences'
  | 'formal-vs-informal';

export interface GrammarTopic {
  id: GrammarTopicId;
  /** Display name in English */
  nameEn: string;
  /** Display name in Macedonian */
  nameMk: string;
  /** Short description for learners */
  description: string;
  /** CEFR level */
  level: 'A1' | 'A2' | 'B1' | 'B2';
  /** Topic category for grouping */
  category: 'verbs' | 'nouns' | 'pronouns' | 'adjectives' | 'adverbs' | 'syntax' | 'other';
}

/**
 * Master list of grammar topics
 */
export const GRAMMAR_TOPICS: Record<GrammarTopicId, GrammarTopic> = {
  // A1 Topics
  'alphabet-cyrillic': {
    id: 'alphabet-cyrillic',
    nameEn: 'Cyrillic Alphabet',
    nameMk: 'Кирилица',
    description: 'Learn the Macedonian Cyrillic alphabet and pronunciation',
    level: 'A1',
    category: 'other',
  },
  'greetings-basic': {
    id: 'greetings-basic',
    nameEn: 'Basic Greetings',
    nameMk: 'Основни поздрави',
    description: 'Hello, goodbye, and common pleasantries',
    level: 'A1',
    category: 'other',
  },
  'pronouns-personal': {
    id: 'pronouns-personal',
    nameEn: 'Personal Pronouns',
    nameMk: 'Лични заменки',
    description: 'I, you, he, she, we, they in Macedonian',
    level: 'A1',
    category: 'pronouns',
  },
  'nouns-gender': {
    id: 'nouns-gender',
    nameEn: 'Noun Gender',
    nameMk: 'Род на именки',
    description: 'Masculine, feminine, and neuter nouns',
    level: 'A1',
    category: 'nouns',
  },
  'nouns-plural': {
    id: 'nouns-plural',
    nameEn: 'Plural Nouns',
    nameMk: 'Множина на именки',
    description: 'Making nouns plural in Macedonian',
    level: 'A1',
    category: 'nouns',
  },
  'verbs-present-sum': {
    id: 'verbs-present-sum',
    nameEn: 'To Be (сум)',
    nameMk: 'Глаголот „сум"',
    description: 'The verb "to be" in present tense',
    level: 'A1',
    category: 'verbs',
  },
  'verbs-present-regular': {
    id: 'verbs-present-regular',
    nameEn: 'Present Tense',
    nameMk: 'Сегашно време',
    description: 'Regular verbs in present tense',
    level: 'A1',
    category: 'verbs',
  },
  'adjectives-agreement': {
    id: 'adjectives-agreement',
    nameEn: 'Adjective Agreement',
    nameMk: 'Согласување на придавки',
    description: 'Making adjectives match nouns',
    level: 'A1',
    category: 'adjectives',
  },
  'numbers-1-20': {
    id: 'numbers-1-20',
    nameEn: 'Numbers 1-20',
    nameMk: 'Броеви 1-20',
    description: 'Counting from one to twenty',
    level: 'A1',
    category: 'other',
  },
  'definite-article': {
    id: 'definite-article',
    nameEn: 'Definite Article',
    nameMk: 'Определен член',
    description: 'The suffixed definite article (-от, -та, -то)',
    level: 'A1',
    category: 'nouns',
  },
  
  // A2 Topics
  'verbs-past-simple': {
    id: 'verbs-past-simple',
    nameEn: 'Past Tense',
    nameMk: 'Минато време',
    description: 'Simple past tense for completed actions',
    level: 'A2',
    category: 'verbs',
  },
  'verbs-future': {
    id: 'verbs-future',
    nameEn: 'Future Tense',
    nameMk: 'Идно време',
    description: 'Forming the future with ќе',
    level: 'A2',
    category: 'verbs',
  },
  'pronouns-object': {
    id: 'pronouns-object',
    nameEn: 'Object Pronouns',
    nameMk: 'Лични заменки (акузатив)',
    description: 'Me, you, him, her - direct objects',
    level: 'A2',
    category: 'pronouns',
  },
  'prepositions-basic': {
    id: 'prepositions-basic',
    nameEn: 'Basic Prepositions',
    nameMk: 'Основни предлози',
    description: 'In, on, at, from, to in Macedonian',
    level: 'A2',
    category: 'syntax',
  },
  'questions-formation': {
    id: 'questions-formation',
    nameEn: 'Forming Questions',
    nameMk: 'Прашања',
    description: 'How to ask questions in Macedonian',
    level: 'A2',
    category: 'syntax',
  },
  'negation': {
    id: 'negation',
    nameEn: 'Negation',
    nameMk: 'Негација',
    description: 'Making sentences negative with не',
    level: 'A2',
    category: 'syntax',
  },
  'adjectives-comparison': {
    id: 'adjectives-comparison',
    nameEn: 'Comparative Adjectives',
    nameMk: 'Компарација',
    description: 'Bigger, smaller, more, less',
    level: 'A2',
    category: 'adjectives',
  },
  'adverbs-basic': {
    id: 'adverbs-basic',
    nameEn: 'Basic Adverbs',
    nameMk: 'Основни прилози',
    description: 'Quickly, slowly, well, badly',
    level: 'A2',
    category: 'adverbs',
  },
  'numbers-21-100': {
    id: 'numbers-21-100',
    nameEn: 'Numbers 21-100',
    nameMk: 'Броеви 21-100',
    description: 'Counting higher numbers',
    level: 'A2',
    category: 'other',
  },
  'time-expressions': {
    id: 'time-expressions',
    nameEn: 'Time Expressions',
    nameMk: 'Изрази за време',
    description: 'Yesterday, tomorrow, last week',
    level: 'A2',
    category: 'other',
  },
  
  // B1 Topics
  'verbs-aspect-imperfective': {
    id: 'verbs-aspect-imperfective',
    nameEn: 'Imperfective Aspect',
    nameMk: 'Несвршен вид',
    description: 'Ongoing or repeated actions',
    level: 'B1',
    category: 'verbs',
  },
  'verbs-aspect-perfective': {
    id: 'verbs-aspect-perfective',
    nameEn: 'Perfective Aspect',
    nameMk: 'Свршен вид',
    description: 'Completed, one-time actions',
    level: 'B1',
    category: 'verbs',
  },
  'conditional-mood': {
    id: 'conditional-mood',
    nameEn: 'Conditional Mood',
    nameMk: 'Условен начин',
    description: 'Would, could, might expressions',
    level: 'B1',
    category: 'verbs',
  },
  'relative-clauses': {
    id: 'relative-clauses',
    nameEn: 'Relative Clauses',
    nameMk: 'Релативни реченици',
    description: 'Who, which, that in sentences',
    level: 'B1',
    category: 'syntax',
  },
  'indirect-speech': {
    id: 'indirect-speech',
    nameEn: 'Indirect Speech',
    nameMk: 'Индиректен говор',
    description: 'He said that, she asked if',
    level: 'B1',
    category: 'syntax',
  },
  'passive-voice': {
    id: 'passive-voice',
    nameEn: 'Passive Voice',
    nameMk: 'Пасив',
    description: 'It was done, it is being made',
    level: 'B1',
    category: 'verbs',
  },
  'modal-verbs': {
    id: 'modal-verbs',
    nameEn: 'Modal Verbs',
    nameMk: 'Модални глаголи',
    description: 'Can, must, should, may',
    level: 'B1',
    category: 'verbs',
  },
  'complex-sentences': {
    id: 'complex-sentences',
    nameEn: 'Complex Sentences',
    nameMk: 'Сложени реченици',
    description: 'Combining clauses and ideas',
    level: 'B1',
    category: 'syntax',
  },
  'formal-vs-informal': {
    id: 'formal-vs-informal',
    nameEn: 'Formal vs Informal',
    nameMk: 'Формално и неформално',
    description: 'Вие vs ти - choosing the right register',
    level: 'B1',
    category: 'other',
  },
};

/**
 * Get topics by CEFR level
 */
export function getTopicsByLevel(level: 'A1' | 'A2' | 'B1' | 'B2'): GrammarTopic[] {
  return Object.values(GRAMMAR_TOPICS).filter(t => t.level === level);
}

/**
 * Get topics by category
 */
export function getTopicsByCategory(category: GrammarTopic['category']): GrammarTopic[] {
  return Object.values(GRAMMAR_TOPICS).filter(t => t.category === category);
}

/**
 * Get topic by ID (with type safety)
 */
export function getTopic(id: GrammarTopicId): GrammarTopic | undefined {
  return GRAMMAR_TOPICS[id];
}
