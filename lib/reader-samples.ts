import cafeConversation from '@/data/reader/samples/cafe-conversation.json';
import day01 from '@/data/reader/samples/day01-maliot-princ.json';
import day02 from '@/data/reader/samples/day02-maliot-princ.json';
import day03 from '@/data/reader/samples/day03-maliot-princ.json';
import day04 from '@/data/reader/samples/day04-maliot-princ.json';
import day05 from '@/data/reader/samples/day05-maliot-princ.json';
import day06 from '@/data/reader/samples/day06-maliot-princ.json';
import day07 from '@/data/reader/samples/day07-maliot-princ.json';
import day08 from '@/data/reader/samples/day08-maliot-princ.json';
import day09 from '@/data/reader/samples/day09-maliot-princ.json';
import day10 from '@/data/reader/samples/day10-maliot-princ.json';
import day11 from '@/data/reader/samples/day11-maliot-princ.json';
import day12 from '@/data/reader/samples/day12-maliot-princ.json';
import day13 from '@/data/reader/samples/day13-maliot-princ.json';
import day14 from '@/data/reader/samples/day14-maliot-princ.json';
import day15 from '@/data/reader/samples/day15-maliot-princ.json';
import day16 from '@/data/reader/samples/day16-maliot-princ.json';
import day17 from '@/data/reader/samples/day17-maliot-princ.json';
import day18 from '@/data/reader/samples/day18-maliot-princ.json';
import day19 from '@/data/reader/samples/day19-maliot-princ.json';
import day20 from '@/data/reader/samples/day20-maliot-princ.json';
import day21 from '@/data/reader/samples/day21-maliot-princ.json';
import day22 from '@/data/reader/samples/day22-maliot-princ.json';
import day23 from '@/data/reader/samples/day23-maliot-princ.json';
import day24 from '@/data/reader/samples/day24-maliot-princ.json';
import day25 from '@/data/reader/samples/day25-maliot-princ.json';
import day26 from '@/data/reader/samples/day26-maliot-princ.json';
import day27 from '@/data/reader/samples/day27-maliot-princ.json';
import day28 from '@/data/reader/samples/day28-maliot-princ.json';
import day29 from '@/data/reader/samples/day29-maliot-princ.json';
import day30 from '@/data/reader/samples/day30-maliot-princ.json';

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

export interface ReaderSample {
  id: string;
  locale: string;
  title_mk: string;
  title_en: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  estimatedMinutes: number;
  tags: string[];
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

// Reader samples - add new samples here
const samples: Record<string, ReaderSample> = {
  'cafe-conversation': cafeConversation as ReaderSample,
  'day01-maliot-princ': day01 as ReaderSample,
  'day02-maliot-princ': day02 as ReaderSample,
  'day03-maliot-princ': day03 as ReaderSample,
  'day04-maliot-princ': day04 as ReaderSample,
  'day05-maliot-princ': day05 as ReaderSample,
  'day06-maliot-princ': day06 as ReaderSample,
  'day07-maliot-princ': day07 as ReaderSample,
  'day08-maliot-princ': day08 as ReaderSample,
  'day09-maliot-princ': day09 as ReaderSample,
  'day10-maliot-princ': day10 as ReaderSample,
  'day11-maliot-princ': day11 as ReaderSample,
  'day12-maliot-princ': day12 as ReaderSample,
  'day13-maliot-princ': day13 as ReaderSample,
  'day14-maliot-princ': day14 as ReaderSample,
  'day15-maliot-princ': day15 as ReaderSample,
  'day16-maliot-princ': day16 as ReaderSample,
  'day17-maliot-princ': day17 as ReaderSample,
  'day18-maliot-princ': day18 as ReaderSample,
  'day19-maliot-princ': day19 as ReaderSample,
  'day20-maliot-princ': day20 as ReaderSample,
  'day21-maliot-princ': day21 as ReaderSample,
  'day22-maliot-princ': day22 as ReaderSample,
  'day23-maliot-princ': day23 as ReaderSample,
  'day24-maliot-princ': day24 as ReaderSample,
  'day25-maliot-princ': day25 as ReaderSample,
  'day26-maliot-princ': day26 as ReaderSample,
  'day27-maliot-princ': day27 as ReaderSample,
  'day28-maliot-princ': day28 as ReaderSample,
  'day29-maliot-princ': day29 as ReaderSample,
  'day30-maliot-princ': day30 as ReaderSample,
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
