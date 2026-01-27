import cafeConversation from '@/data/reader/conversations/cafe-conversation.json';
// 30-Day Folktales Challenge
import day01 from '@/data/reader/challenges/30-day-folktales/day01-siljan-shtrkot.json';
import day02 from '@/data/reader/challenges/30-day-folktales/day02-siljan-shtrkot.json';
import day03 from '@/data/reader/challenges/30-day-folktales/day03-siljan-shtrkot.json';
import day04 from '@/data/reader/challenges/30-day-folktales/day04-siljan-shtrkot.json';
import day05 from '@/data/reader/challenges/30-day-folktales/day05-siljan-shtrkot.json';
import day06 from '@/data/reader/challenges/30-day-folktales/day06-siljan-shtrkot.json';
import day07 from '@/data/reader/challenges/30-day-folktales/day07-siljan-shtrkot.json';
import day08 from '@/data/reader/challenges/30-day-folktales/day08-siljan-shtrkot.json';
import day09 from '@/data/reader/challenges/30-day-folktales/day09-siljan-shtrkot.json';
import day10 from '@/data/reader/challenges/30-day-folktales/day10-siljan-shtrkot.json';
import day11 from '@/data/reader/challenges/30-day-folktales/day11-itar-pejo.json';
import day12 from '@/data/reader/challenges/30-day-folktales/day12-itar-pejo.json';
import day13 from '@/data/reader/challenges/30-day-folktales/day13-itar-pejo.json';
import day14 from '@/data/reader/challenges/30-day-folktales/day14-itar-pejo.json';
import day15 from '@/data/reader/challenges/30-day-folktales/day15-itar-pejo.json';
import day16 from '@/data/reader/challenges/30-day-folktales/day16-itar-pejo.json';
import day17 from '@/data/reader/challenges/30-day-folktales/day17-itar-pejo.json';
import day18 from '@/data/reader/challenges/30-day-folktales/day18-itar-pejo.json';
import day19 from '@/data/reader/challenges/30-day-folktales/day19-itar-pejo.json';
import day20 from '@/data/reader/challenges/30-day-folktales/day20-itar-pejo.json';
import day21 from '@/data/reader/challenges/30-day-folktales/day21-zlaten-kljuch.json';
import day22 from '@/data/reader/challenges/30-day-folktales/day22-zlaten-kljuch.json';
import day23 from '@/data/reader/challenges/30-day-folktales/day23-zlaten-kljuch.json';
import day24 from '@/data/reader/challenges/30-day-folktales/day24-zlaten-kljuch.json';
import day25 from '@/data/reader/challenges/30-day-folktales/day25-marko-kralevic.json';
import day26 from '@/data/reader/challenges/30-day-folktales/day26-marko-kralevic.json';
import day27 from '@/data/reader/challenges/30-day-folktales/day27-marko-kralevic.json';
import day28 from '@/data/reader/challenges/30-day-folktales/day28-marko-kralevic.json';
import day29 from '@/data/reader/challenges/30-day-folktales/day29-marko-kralevic.json';
import day30 from '@/data/reader/challenges/30-day-folktales/day30-krajot.json';
import dayInSkopje from '@/data/reader/stories/day-in-skopje.json';
// Graded Readers - A1
import a1AnasFamily from '@/data/reader/graded/a1-anas-family.json';
import a1MyMorning from '@/data/reader/graded/a1-my-morning.json';
import a1AtTheStore from '@/data/reader/graded/a1-at-the-store.json';
import a1MyBestFriend from '@/data/reader/graded/a1-my-best-friend.json';
import a1MyFamily from '@/data/reader/graded/a1-my-family.json';
import a1MacedonianFood from '@/data/reader/graded/a1-macedonian-food.json';
import a1Weather from '@/data/reader/graded/a1-weather.json';
// Graded Readers - A2
import a2DayInOhrid from '@/data/reader/graded/a2-day-in-ohrid.json';
import a2MyJob from '@/data/reader/graded/a2-my-job.json';
import a2Hobbies from '@/data/reader/graded/a2-hobbies.json';
import a2TheHoliday from '@/data/reader/graded/a2-the-holiday.json';
import a2Traveling from '@/data/reader/graded/a2-traveling.json';
import a2Traditions from '@/data/reader/graded/a2-traditions.json';
import a2Weekend from '@/data/reader/graded/a2-weekend.json';
// Graded Readers - B1
import b1EasterTraditions from '@/data/reader/graded/b1-easter-traditions.json';
import b1MacedonianCuisine from '@/data/reader/graded/b1-macedonian-cuisine.json';
import b1CityVsVillage from '@/data/reader/graded/b1-city-vs-village.json';
import b1MacedonianLegends from '@/data/reader/graded/b1-macedonian-legends.json';
import b1MacedonianHistory from '@/data/reader/graded/b1-macedonian-history.json';
import b1OhridUnesco from '@/data/reader/graded/b1-ohrid-unesco.json';
import b1ModernLife from '@/data/reader/graded/b1-modern-life.json';

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
  // 30-Day Folktales Challenge
  'day01-siljan-shtrkot': withCategory(day01, 'challenge') as ReaderSample,
  'day02-siljan-shtrkot': withCategory(day02, 'challenge') as ReaderSample,
  'day03-siljan-shtrkot': withCategory(day03, 'challenge') as ReaderSample,
  'day04-siljan-shtrkot': withCategory(day04, 'challenge') as ReaderSample,
  'day05-siljan-shtrkot': withCategory(day05, 'challenge') as ReaderSample,
  'day06-siljan-shtrkot': withCategory(day06, 'challenge') as ReaderSample,
  'day07-siljan-shtrkot': withCategory(day07, 'challenge') as ReaderSample,
  'day08-siljan-shtrkot': withCategory(day08, 'challenge') as ReaderSample,
  'day09-siljan-shtrkot': withCategory(day09, 'challenge') as ReaderSample,
  'day10-siljan-shtrkot': withCategory(day10, 'challenge') as ReaderSample,
  'day11-itar-pejo': withCategory(day11, 'challenge') as ReaderSample,
  'day12-itar-pejo': withCategory(day12, 'challenge') as ReaderSample,
  'day13-itar-pejo': withCategory(day13, 'challenge') as ReaderSample,
  'day14-itar-pejo': withCategory(day14, 'challenge') as ReaderSample,
  'day15-itar-pejo': withCategory(day15, 'challenge') as ReaderSample,
  'day16-itar-pejo': withCategory(day16, 'challenge') as ReaderSample,
  'day17-itar-pejo': withCategory(day17, 'challenge') as ReaderSample,
  'day18-itar-pejo': withCategory(day18, 'challenge') as ReaderSample,
  'day19-itar-pejo': withCategory(day19, 'challenge') as ReaderSample,
  'day20-itar-pejo': withCategory(day20, 'challenge') as ReaderSample,
  'day21-zlaten-kljuch': withCategory(day21, 'challenge') as ReaderSample,
  'day22-zlaten-kljuch': withCategory(day22, 'challenge') as ReaderSample,
  'day23-zlaten-kljuch': withCategory(day23, 'challenge') as ReaderSample,
  'day24-zlaten-kljuch': withCategory(day24, 'challenge') as ReaderSample,
  'day25-marko-kralevic': withCategory(day25, 'challenge') as ReaderSample,
  'day26-marko-kralevic': withCategory(day26, 'challenge') as ReaderSample,
  'day27-marko-kralevic': withCategory(day27, 'challenge') as ReaderSample,
  'day28-marko-kralevic': withCategory(day28, 'challenge') as ReaderSample,
  'day29-marko-kralevic': withCategory(day29, 'challenge') as ReaderSample,
  'day30-krajot': withCategory(day30, 'challenge') as ReaderSample,
  'day-in-skopje': withCategoryAndTopic(dayInSkopje, 'story', 'Travel') as ReaderSample,
  // Graded Readers - A1
  'a1-anas-family': withCategoryAndTopic(a1AnasFamily, 'story', 'Family') as ReaderSample,
  'a1-my-morning': withCategoryAndTopic(a1MyMorning, 'story', 'Daily Life') as ReaderSample,
  'a1-at-the-store': withCategoryAndTopic(a1AtTheStore, 'story', 'Food') as ReaderSample,
  'a1-my-best-friend': withCategoryAndTopic(a1MyBestFriend, 'story', 'Family') as ReaderSample,
  'a1-my-family': withCategoryAndTopic(a1MyFamily, 'story', 'Family') as ReaderSample,
  'a1-macedonian-food': withCategoryAndTopic(a1MacedonianFood, 'story', 'Food') as ReaderSample,
  'a1-weather': withCategoryAndTopic(a1Weather, 'story', 'Daily Life') as ReaderSample,
  // Graded Readers - A2
  'a2-day-in-ohrid': withCategoryAndTopic(a2DayInOhrid, 'story', 'Travel') as ReaderSample,
  'a2-my-job': withCategoryAndTopic(a2MyJob, 'story', 'Daily Life') as ReaderSample,
  'a2-hobbies': withCategoryAndTopic(a2Hobbies, 'story', 'Culture') as ReaderSample,
  'a2-the-holiday': withCategoryAndTopic(a2TheHoliday, 'story', 'Culture') as ReaderSample,
  'a2-traveling': withCategoryAndTopic(a2Traveling, 'story', 'Travel') as ReaderSample,
  'a2-traditions': withCategoryAndTopic(a2Traditions, 'story', 'Culture') as ReaderSample,
  'a2-weekend': withCategoryAndTopic(a2Weekend, 'story', 'Daily Life') as ReaderSample,
  // Graded Readers - B1
  'b1-easter-traditions': withCategoryAndTopic(b1EasterTraditions, 'story', 'Culture') as ReaderSample,
  'b1-macedonian-cuisine': withCategoryAndTopic(b1MacedonianCuisine, 'story', 'Food') as ReaderSample,
  'b1-city-vs-village': withCategoryAndTopic(b1CityVsVillage, 'story', 'Culture') as ReaderSample,
  'b1-macedonian-legends': withCategoryAndTopic(b1MacedonianLegends, 'story', 'Culture') as ReaderSample,
  'b1-macedonian-history': withCategoryAndTopic(b1MacedonianHistory, 'story', 'Culture') as ReaderSample,
  'b1-ohrid-unesco': withCategoryAndTopic(b1OhridUnesco, 'story', 'Culture') as ReaderSample,
  'b1-modern-life': withCategoryAndTopic(b1ModernLife, 'story', 'Daily Life') as ReaderSample,
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
