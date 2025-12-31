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

export interface ReaderSample {
  id: string;
  locale: string;
  title_mk: string;
  title_en: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  estimatedMinutes: number;
  tags: string[];
  text_blocks_mk: Array<{
    type: 'p' | 'h1' | 'h2' | 'h3';
    value: string;
  }>;
  grammar_highlights: ReaderSampleGrammarHighlight[];
  vocabulary: ReaderSampleVocab[];
  expressions: ReaderSampleExpression[];
  attribution: ReaderSampleAttribution;
}

// Reader samples will be populated as content is added
const samples: Record<string, ReaderSample> = {};

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
