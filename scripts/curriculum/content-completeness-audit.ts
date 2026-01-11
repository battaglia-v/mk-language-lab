#!/usr/bin/env tsx
/**
 * Content Completeness Audit Script
 *
 * Analyzes each lesson's intro promises vs actual content:
 * 1. Parse intro text to extract promised topics
 * 2. Check if grammar notes cover promised topics
 * 3. Check if vocabulary aligns with themes
 * 4. Identify gaps where intro promises something not covered
 * 5. Flag lessons with low content (vocab < 30 or grammar < 2)
 *
 * Run with: npx tsx scripts/curriculum/content-completeness-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

// Minimum content thresholds
const MIN_VOCAB_PER_LESSON = 30;
const MIN_GRAMMAR_PER_LESSON = 2;

// Topic extraction patterns - keywords that indicate promised topics
const TOPIC_PATTERNS: Array<{ keyword: RegExp; topic: string; category: 'grammar' | 'vocabulary' }> = [
  // Grammar topics
  { keyword: /\bverb\s*['"]?сум['"]?/i, topic: 'verb сум (to be)', category: 'grammar' },
  { keyword: /\bverb\s*['"]?има['"]?/i, topic: 'verb има (to have)', category: 'grammar' },
  { keyword: /\bpossessive\s+pronouns?\b/i, topic: 'possessive pronouns', category: 'grammar' },
  { keyword: /\bpersonal\s+pronouns?\b/i, topic: 'personal pronouns', category: 'grammar' },
  { keyword: /\bpresent\s+tense\b/i, topic: 'present tense', category: 'grammar' },
  { keyword: /\bpast\s+tense\b/i, topic: 'past tense', category: 'grammar' },
  { keyword: /\bfuture\s+tense\b/i, topic: 'future tense', category: 'grammar' },
  { keyword: /\bcomparative\b/i, topic: 'comparative adjectives', category: 'grammar' },
  { keyword: /\bsuperlative\b/i, topic: 'superlative adjectives', category: 'grammar' },
  { keyword: /\bquestions?\b/i, topic: 'questions', category: 'grammar' },
  { keyword: /\bdали\b/i, topic: 'дали questions', category: 'grammar' },
  { keyword: /\bnegation\b/i, topic: 'negation', category: 'grammar' },
  { keyword: /\bprepositions?\b/i, topic: 'prepositions', category: 'grammar' },
  { keyword: /\bmust\b.*\bmust not\b/i, topic: 'modal verbs (must/must not)', category: 'grammar' },
  { keyword: /\bconjugation/i, topic: 'verb conjugation', category: 'grammar' },
  { keyword: /\barticles?\b/i, topic: 'definite articles', category: 'grammar' },

  // Vocabulary themes
  { keyword: /\bgreetings?\b/i, topic: 'greetings', category: 'vocabulary' },
  { keyword: /\bfamily\b/i, topic: 'family members', category: 'vocabulary' },
  { keyword: /\bnumbers?\b/i, topic: 'numbers', category: 'vocabulary' },
  { keyword: /\bcolors?\b/i, topic: 'colors', category: 'vocabulary' },
  { keyword: /\bfood\b/i, topic: 'food vocabulary', category: 'vocabulary' },
  { keyword: /\bdining\b|restaurant/i, topic: 'restaurant/dining', category: 'vocabulary' },
  { keyword: /\bclothing\b|\bclothes\b/i, topic: 'clothing', category: 'vocabulary' },
  { keyword: /\bweather\b/i, topic: 'weather', category: 'vocabulary' },
  { keyword: /\bseasons?\b/i, topic: 'seasons', category: 'vocabulary' },
  { keyword: /\bmonths?\b/i, topic: 'months', category: 'vocabulary' },
  { keyword: /\bdirections?\b/i, topic: 'directions', category: 'vocabulary' },
  { keyword: /\btransportation\b/i, topic: 'transportation', category: 'vocabulary' },
  { keyword: /\bbody\s*(parts|vocabulary)?\b/i, topic: 'body parts', category: 'vocabulary' },
  { keyword: /\bhealth\b/i, topic: 'health expressions', category: 'vocabulary' },
  { keyword: /\bprofessions?\b|\bjobs?\b|\boccupations?\b/i, topic: 'professions', category: 'vocabulary' },
  { keyword: /\bdaily\s+(routine|activities)\b/i, topic: 'daily activities', category: 'vocabulary' },
  { keyword: /\bhobbies\b|\bleisure\b|\bfree\s+time\b/i, topic: 'hobbies/leisure', category: 'vocabulary' },
  { keyword: /\bshopping\b|\bstore\b|\bmarket\b/i, topic: 'shopping', category: 'vocabulary' },
  { keyword: /\bprices?\b|\bcost\b/i, topic: 'prices/shopping', category: 'vocabulary' },
  { keyword: /\bcountry\b|\bcountries\b|\bnationalities\b/i, topic: 'countries/nationalities', category: 'vocabulary' },
  { keyword: /\bfeelings?\b|\bemotions?\b/i, topic: 'feelings/emotions', category: 'vocabulary' },
  { keyword: /\bfurniture\b|\brooms?\b|\bhouse\b|\bhome\b/i, topic: 'home/furniture', category: 'vocabulary' },
  { keyword: /\baddress\b/i, topic: 'addresses', category: 'vocabulary' },
];

// ============================================================================
// Types
// ============================================================================

interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  translation: string;
  category?: string;
  isCore?: boolean;
}

interface GrammarNote {
  title: string;
  content: string;
  examples?: string[];
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  intro?: string;
  vocabularyItems: VocabularyItem[];
  grammarNotes: GrammarNote[];
}

interface Textbook {
  id: string;
  level: string;
  chapters: Chapter[];
}

interface LessonAnalysis {
  level: string;
  lesson: number;
  title: string;
  intro: string;
  promisedTopics: { topic: string; category: string }[];
  grammarCovers: string[];
  vocabCount: number;
  grammarCount: number;
  gaps: {
    topic: string;
    category: string;
    reason: string;
  }[];
  warnings: string[];
  isComplete: boolean;
  completenessScore: number;
}

interface AuditReport {
  auditDate: string;
  summary: {
    totalLessons: number;
    completeCount: number;
    incompleteCount: number;
    gapsFound: number;
    lowVocabLessons: number;
    lowGrammarLessons: number;
    avgCompletenessScore: number;
  };
  byLevel: Record<string, {
    totalLessons: number;
    completeCount: number;
    avgVocab: number;
    avgGrammar: number;
    avgScore: number;
  }>;
  lessons: LessonAnalysis[];
  recommendations: string[];
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Extract promised topics from lesson intro text
 */
function extractPromisedTopics(intro: string): { topic: string; category: string }[] {
  const topics: { topic: string; category: string }[] = [];

  for (const { keyword, topic, category } of TOPIC_PATTERNS) {
    if (keyword.test(intro)) {
      // Avoid duplicates
      if (!topics.some(t => t.topic === topic)) {
        topics.push({ topic, category });
      }
    }
  }

  return topics;
}

/**
 * Check if a topic is covered by grammar notes
 */
function isTopicCoveredByGrammar(topic: string, grammarNotes: GrammarNote[]): boolean {
  const topicLower = topic.toLowerCase();

  // Map promised topics to grammar title patterns
  const grammarMappings: Record<string, RegExp[]> = {
    'verb сум (to be)': [/сум/i, /to be/i],
    'verb има (to have)': [/има/i, /to have/i],
    'possessive pronouns': [/possessive/i, /присвојн/i, /мој/i],
    'personal pronouns': [/personal.*pronoun/i, /лични.*заменки/i, /јас.*ти/i],
    'present tense': [/present/i, /сегашн/i],
    'past tense': [/past/i, /минат/i, /аорист/i, /имперфект/i],
    'future tense': [/future/i, /идн/i],
    'comparative adjectives': [/comparative/i, /компаратив/i, /подобр/i, /по-/],
    'superlative adjectives': [/superlative/i, /суперлатив/i, /најдобр/i, /нај-/],
    'questions': [/question/i, /прашал/i, /прашања/i],
    'дали questions': [/дали/i, /yes.*no/i],
    'negation': [/negat/i, /негац/i, /не\s/i],
    'prepositions': [/preposition/i, /предлог/i, /во|на|од|со/i],
    'modal verbs (must/must not)': [/modal/i, /мора/i, /смее/i, /треба/i],
    'verb conjugation': [/conjugat/i, /конјугац/i, /глагол/i],
    'definite articles': [/article/i, /член/i, /definite/i, /-от|-та|-то/i],
  };

  const patterns = grammarMappings[topic] || [new RegExp(topicLower.split(' ')[0], 'i')];

  for (const note of grammarNotes) {
    const titleLower = note.title?.toLowerCase() || '';
    const contentLower = note.content?.toLowerCase() || '';

    for (const pattern of patterns) {
      if (pattern.test(titleLower) || pattern.test(contentLower)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if vocabulary aligns with a theme
 */
function isThemeCoveredByVocab(theme: string, vocabulary: VocabularyItem[]): boolean {
  // Map themes to vocabulary indicators
  const vocabMappings: Record<string, { words?: RegExp[]; categories?: string[]; translations?: RegExp[] }> = {
    'greetings': {
      words: [/здраво/i, /добар/i, /добро/i, /пријатно/i],
      categories: ['greetings'],
      translations: [/hello/i, /good\s*(morning|day|evening)/i, /goodbye/i],
    },
    'family members': {
      words: [/мајка/i, /татко/i, /брат/i, /сестра/i, /баба/i, /дедо/i],
      categories: ['family'],
      translations: [/mother/i, /father/i, /brother/i, /sister/i, /family/i],
    },
    'numbers': {
      words: [/еден|два|три|четири|пет|шест|седум|осум|девет|десет/i],
      categories: ['numbers'],
      translations: [/one|two|three|four|five|six|seven|eight|nine|ten/i],
    },
    'colors': {
      words: [/црвен|син|зелен|жолт|бел|црн/i],
      categories: ['colors'],
      translations: [/red|blue|green|yellow|white|black|color/i],
    },
    'food vocabulary': {
      words: [/јаде|пие|леб|вода|месо|овошје/i],
      categories: ['food'],
      translations: [/food|eat|drink|bread|water|meat|fruit/i],
    },
    'restaurant/dining': {
      words: [/ресторан|келнер|мени|јаде/i],
      categories: ['food', 'dining'],
      translations: [/restaurant|waiter|menu|order/i],
    },
    'clothing': {
      words: [/облека|кошула|панталон|фустан/i],
      categories: ['clothing'],
      translations: [/shirt|pants|dress|clothes|wear/i],
    },
    'weather': {
      words: [/време|сонце|дожд|снег/i],
      categories: ['weather'],
      translations: [/weather|sun|rain|snow|cold|hot/i],
    },
    'seasons': {
      words: [/пролет|лето|есен|зима/i],
      categories: ['seasons'],
      translations: [/spring|summer|autumn|winter|season/i],
    },
    'months': {
      words: [/јануари|февруари|март|април/i],
      categories: ['time', 'months'],
      translations: [/january|february|march|month/i],
    },
    'directions': {
      words: [/лево|десно|право|назад/i],
      categories: ['directions'],
      translations: [/left|right|straight|direction/i],
    },
    'transportation': {
      words: [/автобус|воз|такси|кола|авион/i],
      categories: ['transportation'],
      translations: [/bus|train|taxi|car|plane|transport/i],
    },
    'body parts': {
      words: [/глава|рака|нога|око|уво/i],
      categories: ['body'],
      translations: [/head|hand|leg|eye|ear|body/i],
    },
    'health expressions': {
      words: [/болен|здрав|лекар|болница/i],
      categories: ['health'],
      translations: [/sick|healthy|doctor|hospital|health/i],
    },
    'professions': {
      words: [/професор|доктор|инженер|работа/i],
      categories: ['professions', 'jobs'],
      translations: [/professor|doctor|engineer|job|work|profession/i],
    },
    'daily activities': {
      words: [/станува|јаде|спие|работи/i],
      categories: ['daily'],
      translations: [/wake|eat|sleep|work|daily/i],
    },
    'hobbies/leisure': {
      words: [/спорт|музика|читање|филм/i],
      categories: ['hobbies', 'leisure'],
      translations: [/sport|music|read|movie|hobby/i],
    },
    'shopping': {
      words: [/купува|продавница|пазар|цена/i],
      categories: ['shopping'],
      translations: [/buy|shop|store|market|price/i],
    },
    'prices/shopping': {
      words: [/цена|денар|плаќа|скапо/i],
      categories: ['shopping', 'money'],
      translations: [/price|cost|pay|expensive|cheap/i],
    },
    'countries/nationalities': {
      words: [/македонија|германија|англија|американец/i],
      categories: ['countries', 'nationalities'],
      translations: [/macedonia|germany|england|american|country/i],
    },
    'feelings/emotions': {
      words: [/среќен|тажен|љут|гладен|жеден/i],
      categories: ['feelings', 'emotions'],
      translations: [/happy|sad|angry|hungry|thirsty|feel/i],
    },
    'home/furniture': {
      words: [/куќа|соба|маса|стол|кревет/i],
      categories: ['home', 'furniture'],
      translations: [/house|room|table|chair|bed|furniture/i],
    },
    'addresses': {
      words: [/адреса|улица|број|град/i],
      categories: ['location'],
      translations: [/address|street|number|city/i],
    },
  };

  const mapping = vocabMappings[theme];
  if (!mapping) return vocabulary.length >= MIN_VOCAB_PER_LESSON; // Generic check

  for (const item of vocabulary) {
    // Check category
    if (mapping.categories && item.category) {
      if (mapping.categories.some(cat => item.category?.toLowerCase().includes(cat))) {
        return true;
      }
    }

    // Check word patterns
    if (mapping.words) {
      for (const pattern of mapping.words) {
        if (pattern.test(item.word)) {
          return true;
        }
      }
    }

    // Check translation patterns
    if (mapping.translations && item.translation) {
      for (const pattern of mapping.translations) {
        if (pattern.test(item.translation)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Analyze a single lesson for content completeness
 */
function analyzeLesson(chapter: Chapter, level: string): LessonAnalysis {
  const intro = chapter.intro || '';
  const promisedTopics = extractPromisedTopics(intro);
  const grammarTitles = chapter.grammarNotes.map(g => g.title);
  const vocabCount = chapter.vocabularyItems.length;
  const grammarCount = chapter.grammarNotes.length;

  const gaps: LessonAnalysis['gaps'] = [];
  const warnings: string[] = [];

  // Check grammar topic coverage
  for (const { topic, category } of promisedTopics) {
    if (category === 'grammar') {
      if (!isTopicCoveredByGrammar(topic, chapter.grammarNotes)) {
        gaps.push({
          topic,
          category,
          reason: `Intro promises "${topic}" but no matching grammar note found`,
        });
      }
    }
  }

  // Check vocabulary theme coverage
  for (const { topic, category } of promisedTopics) {
    if (category === 'vocabulary') {
      if (!isThemeCoveredByVocab(topic, chapter.vocabularyItems)) {
        gaps.push({
          topic,
          category,
          reason: `Intro mentions "${topic}" but vocabulary doesn't clearly cover this theme`,
        });
      }
    }
  }

  // Check minimum thresholds
  if (vocabCount < MIN_VOCAB_PER_LESSON) {
    warnings.push(`Low vocabulary: ${vocabCount} items (target: ${MIN_VOCAB_PER_LESSON}+)`);
  }

  if (grammarCount < MIN_GRAMMAR_PER_LESSON) {
    warnings.push(`Low grammar: ${grammarCount} notes (target: ${MIN_GRAMMAR_PER_LESSON}+)`);
  }

  // Calculate completeness score
  const topicCount = promisedTopics.length;
  const gapCount = gaps.length;
  const topicScore = topicCount > 0 ? ((topicCount - gapCount) / topicCount) * 100 : 100;
  const vocabScore = Math.min(100, (vocabCount / MIN_VOCAB_PER_LESSON) * 100);
  const grammarScore = Math.min(100, (grammarCount / MIN_GRAMMAR_PER_LESSON) * 100);
  const completenessScore = Math.round((topicScore + vocabScore + grammarScore) / 3);

  const isComplete = gaps.length === 0 &&
    vocabCount >= MIN_VOCAB_PER_LESSON &&
    grammarCount >= MIN_GRAMMAR_PER_LESSON;

  return {
    level,
    lesson: chapter.lessonNumber,
    title: chapter.title,
    intro,
    promisedTopics,
    grammarCovers: grammarTitles,
    vocabCount,
    grammarCount,
    gaps,
    warnings,
    isComplete,
    completenessScore,
  };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('📊 Content Completeness Audit');
  console.log('='.repeat(50));
  console.log('');

  const report: AuditReport = {
    auditDate: new Date().toISOString(),
    summary: {
      totalLessons: 0,
      completeCount: 0,
      incompleteCount: 0,
      gapsFound: 0,
      lowVocabLessons: 0,
      lowGrammarLessons: 0,
      avgCompletenessScore: 0,
    },
    byLevel: {},
    lessons: [],
    recommendations: [],
  };

  let totalScore = 0;

  // Process each level
  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`  Skipping ${level.toUpperCase()}: file not found`);
      continue;
    }

    console.log(`\n📚 Analyzing ${level.toUpperCase()}...`);
    const textbook: Textbook = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

    let levelComplete = 0;
    let levelVocabTotal = 0;
    let levelGrammarTotal = 0;
    let levelScoreTotal = 0;

    for (const chapter of textbook.chapters) {
      const analysis = analyzeLesson(chapter, level.toUpperCase());
      report.lessons.push(analysis);

      // Update counts
      report.summary.totalLessons++;
      if (analysis.isComplete) {
        report.summary.completeCount++;
        levelComplete++;
      } else {
        report.summary.incompleteCount++;
      }
      report.summary.gapsFound += analysis.gaps.length;

      if (analysis.vocabCount < MIN_VOCAB_PER_LESSON) {
        report.summary.lowVocabLessons++;
      }
      if (analysis.grammarCount < MIN_GRAMMAR_PER_LESSON) {
        report.summary.lowGrammarLessons++;
      }

      levelVocabTotal += analysis.vocabCount;
      levelGrammarTotal += analysis.grammarCount;
      levelScoreTotal += analysis.completenessScore;
      totalScore += analysis.completenessScore;

      // Print lesson summary
      const status = analysis.isComplete ? '✅' : '⚠️';
      const issues: string[] = [];
      if (analysis.gaps.length > 0) issues.push(`${analysis.gaps.length} gaps`);
      if (analysis.vocabCount < MIN_VOCAB_PER_LESSON) issues.push(`vocab: ${analysis.vocabCount}`);
      if (analysis.grammarCount < MIN_GRAMMAR_PER_LESSON) issues.push(`grammar: ${analysis.grammarCount}`);

      const issueStr = issues.length > 0 ? ` [${issues.join(', ')}]` : '';
      console.log(`   ${status} Lesson ${chapter.lessonNumber}: ${analysis.completenessScore}%${issueStr}`);
    }

    // Level summary
    report.byLevel[level] = {
      totalLessons: textbook.chapters.length,
      completeCount: levelComplete,
      avgVocab: Math.round(levelVocabTotal / textbook.chapters.length),
      avgGrammar: Math.round(levelGrammarTotal / textbook.chapters.length),
      avgScore: Math.round(levelScoreTotal / textbook.chapters.length),
    };
  }

  // Calculate average score
  report.summary.avgCompletenessScore = report.summary.totalLessons > 0
    ? Math.round(totalScore / report.summary.totalLessons)
    : 0;

  // Generate recommendations
  if (report.summary.lowVocabLessons > 0) {
    report.recommendations.push(
      `Add vocabulary to ${report.summary.lowVocabLessons} lesson(s) below ${MIN_VOCAB_PER_LESSON} words`
    );
  }
  if (report.summary.lowGrammarLessons > 0) {
    report.recommendations.push(
      `Add grammar notes to ${report.summary.lowGrammarLessons} lesson(s) below ${MIN_GRAMMAR_PER_LESSON} notes`
    );
  }
  if (report.summary.gapsFound > 0) {
    report.recommendations.push(
      `Review ${report.summary.gapsFound} topic gap(s) where intro promises don't match content`
    );
  }

  // Find specific lessons needing attention
  const lessonsNeedingVocab = report.lessons
    .filter(l => l.vocabCount < MIN_VOCAB_PER_LESSON)
    .map(l => `${l.level} L${l.lesson} (${l.vocabCount} words)`);

  const lessonsNeedingGrammar = report.lessons
    .filter(l => l.grammarCount < MIN_GRAMMAR_PER_LESSON)
    .map(l => `${l.level} L${l.lesson} (${l.grammarCount} notes)`);

  if (lessonsNeedingVocab.length > 0) {
    report.recommendations.push(`Lessons needing vocabulary: ${lessonsNeedingVocab.join(', ')}`);
  }
  if (lessonsNeedingGrammar.length > 0) {
    report.recommendations.push(`Lessons needing grammar: ${lessonsNeedingGrammar.join(', ')}`);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total lessons: ${report.summary.totalLessons}`);
  console.log(`Complete: ${report.summary.completeCount} (${Math.round(report.summary.completeCount / report.summary.totalLessons * 100)}%)`);
  console.log(`Incomplete: ${report.summary.incompleteCount}`);
  console.log(`Content gaps found: ${report.summary.gapsFound}`);
  console.log(`Lessons below ${MIN_VOCAB_PER_LESSON} vocab: ${report.summary.lowVocabLessons}`);
  console.log(`Lessons below ${MIN_GRAMMAR_PER_LESSON} grammar: ${report.summary.lowGrammarLessons}`);
  console.log(`Average completeness: ${report.summary.avgCompletenessScore}%`);

  console.log('\nBy Level:');
  for (const [level, stats] of Object.entries(report.byLevel)) {
    console.log(`  ${level.toUpperCase()}: ${stats.completeCount}/${stats.totalLessons} complete, avg vocab ${stats.avgVocab}, avg grammar ${stats.avgGrammar}`);
  }

  console.log('\nRecommendations:');
  for (const rec of report.recommendations) {
    console.log(`  - ${rec}`);
  }

  // Write report to file
  const outputPath = path.resolve('data/curriculum/content-completeness-audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ Full report saved to: ${outputPath}`);
}

main().catch(console.error);
