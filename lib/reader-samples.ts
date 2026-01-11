import cafeConversation from '@/data/reader/conversations/cafe-conversation.json';
import day01 from '@/data/reader/challenges/30-day-little-prince/day01-maliot-princ.json';
import day02 from '@/data/reader/challenges/30-day-little-prince/day02-maliot-princ.json';
import day03 from '@/data/reader/challenges/30-day-little-prince/day03-maliot-princ.json';
import day04 from '@/data/reader/challenges/30-day-little-prince/day04-maliot-princ.json';
import day05 from '@/data/reader/challenges/30-day-little-prince/day05-maliot-princ.json';
import day06 from '@/data/reader/challenges/30-day-little-prince/day06-maliot-princ.json';
import day07 from '@/data/reader/challenges/30-day-little-prince/day07-maliot-princ.json';
import day08 from '@/data/reader/challenges/30-day-little-prince/day08-maliot-princ.json';
import day09 from '@/data/reader/challenges/30-day-little-prince/day09-maliot-princ.json';
import day10 from '@/data/reader/challenges/30-day-little-prince/day10-maliot-princ.json';
import day11 from '@/data/reader/challenges/30-day-little-prince/day11-maliot-princ.json';
import day12 from '@/data/reader/challenges/30-day-little-prince/day12-maliot-princ.json';
import day13 from '@/data/reader/challenges/30-day-little-prince/day13-maliot-princ.json';
import day14 from '@/data/reader/challenges/30-day-little-prince/day14-maliot-princ.json';
import day15 from '@/data/reader/challenges/30-day-little-prince/day15-maliot-princ.json';
import day16 from '@/data/reader/challenges/30-day-little-prince/day16-maliot-princ.json';
import day17 from '@/data/reader/challenges/30-day-little-prince/day17-maliot-princ.json';
import day18 from '@/data/reader/challenges/30-day-little-prince/day18-maliot-princ.json';
import day19 from '@/data/reader/challenges/30-day-little-prince/day19-maliot-princ.json';
import day20 from '@/data/reader/challenges/30-day-little-prince/day20-maliot-princ.json';
import day21 from '@/data/reader/challenges/30-day-little-prince/day21-maliot-princ.json';
import day22 from '@/data/reader/challenges/30-day-little-prince/day22-maliot-princ.json';
import day23 from '@/data/reader/challenges/30-day-little-prince/day23-maliot-princ.json';
import day24 from '@/data/reader/challenges/30-day-little-prince/day24-maliot-princ.json';
import day25 from '@/data/reader/challenges/30-day-little-prince/day25-maliot-princ.json';
import day26 from '@/data/reader/challenges/30-day-little-prince/day26-maliot-princ.json';
import day27 from '@/data/reader/challenges/30-day-little-prince/day27-maliot-princ.json';
import day28 from '@/data/reader/challenges/30-day-little-prince/day28-maliot-princ.json';
import day29 from '@/data/reader/challenges/30-day-little-prince/day29-maliot-princ.json';
import day30 from '@/data/reader/challenges/30-day-little-prince/day30-maliot-princ.json';
import dayInSkopje from '@/data/reader/stories/day-in-skopje.json';
// Graded Readers - A1
import a1AnasFamily from '@/data/reader/graded/a1-anas-family.json';
import a1MyMorning from '@/data/reader/graded/a1-my-morning.json';
import a1AtTheStore from '@/data/reader/graded/a1-at-the-store.json';
import a1MyBestFriend from '@/data/reader/graded/a1-my-best-friend.json';
// Graded Readers - A2
import a2DayInOhrid from '@/data/reader/graded/a2-day-in-ohrid.json';
import a2MyJob from '@/data/reader/graded/a2-my-job.json';
import a2Hobbies from '@/data/reader/graded/a2-hobbies.json';
import a2TheHoliday from '@/data/reader/graded/a2-the-holiday.json';
// Graded Readers - B1
import b1EasterTraditions from '@/data/reader/graded/b1-easter-traditions.json';
import b1MacedonianCuisine from '@/data/reader/graded/b1-macedonian-cuisine.json';
import b1CityVsVillage from '@/data/reader/graded/b1-city-vs-village.json';
import b1MacedonianLegends from '@/data/reader/graded/b1-macedonian-legends.json';

export interface ReaderSampleVocab {
  mk: string;
  en: string;
  pos?: string;
  note?: string;
}

export interface ReaderSampleExpression {
  mk: string;
  en: string;
  usage?: string;
  examples?: Array<{
    mk: string;
    en: string;
  }>;
}

export interface ReaderSampleGrammarHighlight {
  title_mk: string;
  title_en: string;
  description_mk?: string;
  description_en?: string;
  bullets?: string[];
  examples?: Array<{
    mk: string;
    en: string;
    note?: string;
  }>;
}

export interface ReaderSampleAttribution {
  handle: string;
  series: string;
  day: string;
  sourceTitle?: string;
  author?: string;
}

/** Pre-analyzed word from Text Analyzer API */
export interface AnalyzedWord {
  id: string;
  original: string;
  translation: string;
  alternativeTranslations?: string[];
  contextualMeaning?: string;
  contextHint?: string;
  hasMultipleMeanings?: boolean;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  index: number;
}

/** Pre-analyzed text data from Text Analyzer */
export interface AnalyzedTextData {
  words: AnalyzedWord[];
  tokens: Array<{ token: string; isWord: boolean; index: number }>;
  fullTranslation: string;
  difficulty: {
    level: 'beginner' | 'intermediate' | 'advanced';
    score: number;
  };
  metadata: {
    wordCount: number;
    sentenceCount: number;
    characterCount: number;
  };
}

export type ReaderCategory = 'challenge' | 'conversation' | 'story';

/** Topics for graded readers, mapped from category in graded-readers.json */
export type ReaderTopic = 'Family' | 'Daily Life' | 'Food' | 'Travel' | 'Culture';

export interface ReaderSample {
  id: string;
  locale: string;
  title_mk: string;
  title_en: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  estimatedMinutes: number;
  tags: string[];
  category: ReaderCategory;
  /** Topic for graded readers (optional, only for story category) */
  topic?: ReaderTopic;
  text_blocks_mk: Array<{
    type: 'p' | 'h1' | 'h2' | 'h3' | 'note';
    value: string;
  }>;
  grammar_highlights: ReaderSampleGrammarHighlight[];
  vocabulary: ReaderSampleVocab[];
  expressions: ReaderSampleExpression[];
  attribution: ReaderSampleAttribution;
  /** Pre-analyzed text data for instant word lookups */
  analyzedData?: AnalyzedTextData;
}

// Helper to add category to imported JSON
function withCategory<T>(data: T, category: ReaderCategory): T & { category: ReaderCategory } {
  return { ...data, category };
}

// Helper to add category and topic to graded reader JSON
function withCategoryAndTopic<T>(
  data: T,
  category: ReaderCategory,
  topic: ReaderTopic
): T & { category: ReaderCategory; topic: ReaderTopic } {
  return { ...data, category, topic };
}

// Reader samples - add new samples here
const samples: Record<string, ReaderSample> = {
  'cafe-conversation': withCategory(cafeConversation, 'conversation') as ReaderSample,
  'day01-maliot-princ': withCategory(day01, 'challenge') as ReaderSample,
  'day02-maliot-princ': withCategory(day02, 'challenge') as ReaderSample,
  'day03-maliot-princ': withCategory(day03, 'challenge') as ReaderSample,
  'day04-maliot-princ': withCategory(day04, 'challenge') as ReaderSample,
  'day05-maliot-princ': withCategory(day05, 'challenge') as ReaderSample,
  'day06-maliot-princ': withCategory(day06, 'challenge') as ReaderSample,
  'day07-maliot-princ': withCategory(day07, 'challenge') as ReaderSample,
  'day08-maliot-princ': withCategory(day08, 'challenge') as ReaderSample,
  'day09-maliot-princ': withCategory(day09, 'challenge') as ReaderSample,
  'day10-maliot-princ': withCategory(day10, 'challenge') as ReaderSample,
  'day11-maliot-princ': withCategory(day11, 'challenge') as ReaderSample,
  'day12-maliot-princ': withCategory(day12, 'challenge') as ReaderSample,
  'day13-maliot-princ': withCategory(day13, 'challenge') as ReaderSample,
  'day14-maliot-princ': withCategory(day14, 'challenge') as ReaderSample,
  'day15-maliot-princ': withCategory(day15, 'challenge') as ReaderSample,
  'day16-maliot-princ': withCategory(day16, 'challenge') as ReaderSample,
  'day17-maliot-princ': withCategory(day17, 'challenge') as ReaderSample,
  'day18-maliot-princ': withCategory(day18, 'challenge') as ReaderSample,
  'day19-maliot-princ': withCategory(day19, 'challenge') as ReaderSample,
  'day20-maliot-princ': withCategory(day20, 'challenge') as ReaderSample,
  'day21-maliot-princ': withCategory(day21, 'challenge') as ReaderSample,
  'day22-maliot-princ': withCategory(day22, 'challenge') as ReaderSample,
  'day23-maliot-princ': withCategory(day23, 'challenge') as ReaderSample,
  'day24-maliot-princ': withCategory(day24, 'challenge') as ReaderSample,
  'day25-maliot-princ': withCategory(day25, 'challenge') as ReaderSample,
  'day26-maliot-princ': withCategory(day26, 'challenge') as ReaderSample,
  'day27-maliot-princ': withCategory(day27, 'challenge') as ReaderSample,
  'day28-maliot-princ': withCategory(day28, 'challenge') as ReaderSample,
  'day29-maliot-princ': withCategory(day29, 'challenge') as ReaderSample,
  'day30-maliot-princ': withCategory(day30, 'challenge') as ReaderSample,
  'day-in-skopje': withCategoryAndTopic(dayInSkopje, 'story', 'Travel') as ReaderSample,
  // Graded Readers - A1
  'a1-anas-family': withCategoryAndTopic(a1AnasFamily, 'story', 'Family') as ReaderSample,
  'a1-my-morning': withCategoryAndTopic(a1MyMorning, 'story', 'Daily Life') as ReaderSample,
  'a1-at-the-store': withCategoryAndTopic(a1AtTheStore, 'story', 'Food') as ReaderSample,
  'a1-my-best-friend': withCategoryAndTopic(a1MyBestFriend, 'story', 'Family') as ReaderSample,
  // Graded Readers - A2
  'a2-day-in-ohrid': withCategoryAndTopic(a2DayInOhrid, 'story', 'Travel') as ReaderSample,
  'a2-my-job': withCategoryAndTopic(a2MyJob, 'story', 'Daily Life') as ReaderSample,
  'a2-hobbies': withCategoryAndTopic(a2Hobbies, 'story', 'Culture') as ReaderSample,
  'a2-the-holiday': withCategoryAndTopic(a2TheHoliday, 'story', 'Culture') as ReaderSample,
  // Graded Readers - B1
  'b1-easter-traditions': withCategoryAndTopic(b1EasterTraditions, 'story', 'Culture') as ReaderSample,
  'b1-macedonian-cuisine': withCategoryAndTopic(b1MacedonianCuisine, 'story', 'Food') as ReaderSample,
  'b1-city-vs-village': withCategoryAndTopic(b1CityVsVillage, 'story', 'Culture') as ReaderSample,
  'b1-macedonian-legends': withCategoryAndTopic(b1MacedonianLegends, 'story', 'Culture') as ReaderSample,
};

export function getReaderSample(id: string): ReaderSample | null {
  return samples[id] || null;
}

export function getAllReaderSamples(): ReaderSample[] {
  return Object.values(samples);
}

export function getReaderSamplesByLocale(locale: string): ReaderSample[] {
  return Object.values(samples).filter((sample) => sample.locale === locale);
}

export function getReaderSamplesByCategory(category: ReaderCategory): ReaderSample[] {
  return Object.values(samples).filter((sample) => sample.category === category);
}

/**
 * Get all unique topics from story samples (graded readers).
 * Returns topics in a consistent order for UI display.
 */
export function getAvailableTopics(): ReaderTopic[] {
  const topicOrder: ReaderTopic[] = ['Family', 'Daily Life', 'Food', 'Travel', 'Culture'];
  const existingTopics = new Set(
    Object.values(samples)
      .map((sample) => sample.topic)
      .filter((topic): topic is ReaderTopic => topic !== undefined)
  );
  return topicOrder.filter((topic) => existingTopics.has(topic));
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'A1':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'A2':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'B1':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'B2':
      return 'text-pink-600 bg-pink-50 border-pink-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
