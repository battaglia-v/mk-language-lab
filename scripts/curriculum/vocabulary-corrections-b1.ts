#!/usr/bin/env tsx
/**
 * Vocabulary Corrections Script - B1 Level
 *
 * Fixes known translation errors in the B1 curriculum vocabulary:
 * 1. Proper names incorrectly translated as common words
 * 2. Truncated/invalid words that should be removed
 * 3. Common translation errors
 * 4. Null translations
 *
 * Based on the A1/A2 corrections script pattern.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Corrections Mapping (shared with A1/A2 + B1-specific additions)
// ============================================================================

/**
 * Words that should be removed (truncated, invalid, or not useful vocabulary)
 */
const WORDS_TO_REMOVE = new Set<string>([
  // Add any B1-specific words to remove here
]);

/**
 * Translation corrections for proper names and common errors
 * Includes universal corrections from A1/A2 + B1-specific additions
 */
const TRANSLATION_CORRECTIONS: Record<string, { translation: string; partOfSpeech?: string }> = {
  // === PROPER NAMES (should keep as transliteration) ===
  'Влатко': { translation: 'Vlatko (name)', partOfSpeech: 'proper noun' },
  'Новак': { translation: 'Novak (name)', partOfSpeech: 'proper noun' },
  'Ема': { translation: 'Emma (name)', partOfSpeech: 'proper noun' },
  'Андреј': { translation: 'Andrej (name)', partOfSpeech: 'proper noun' },
  'Весна': { translation: 'Vesna (name)', partOfSpeech: 'proper noun' },
  'Томислав': { translation: 'Tomislav (name)', partOfSpeech: 'proper noun' },
  'Марија': { translation: 'Maria (name)', partOfSpeech: 'proper noun' },
  'Ивана': { translation: 'Ivana (name)', partOfSpeech: 'proper noun' },
  'Ѓорѓи': { translation: 'Gjorgji (name)', partOfSpeech: 'proper noun' },
  'Маја': { translation: 'Maja (name)', partOfSpeech: 'proper noun' },
  'Сара': { translation: 'Sara (name)', partOfSpeech: 'proper noun' },
  'Лука': { translation: 'Luka (name)', partOfSpeech: 'proper noun' },
  'Марко': { translation: 'Marko (name)', partOfSpeech: 'proper noun' },
  'Ива': { translation: 'Iva (name)', partOfSpeech: 'proper noun' },
  'Петар': { translation: 'Petar (name)', partOfSpeech: 'proper noun' },
  'Ана': { translation: 'Ana (name)', partOfSpeech: 'proper noun' },
  'Иван': { translation: 'Ivan (name)', partOfSpeech: 'proper noun' },
  'Иванова': { translation: 'Ivanova (surname)', partOfSpeech: 'proper noun' },
  'Иванов': { translation: 'Ivanov (surname)', partOfSpeech: 'proper noun' },
  'Ивановски': { translation: 'Ivanovski (surname)', partOfSpeech: 'proper noun' },
  'Емануел': { translation: 'Emanuel (name)', partOfSpeech: 'proper noun' },
  'Маркови': { translation: 'Markovi (surname, plural)', partOfSpeech: 'proper noun' },

  // === B1-SPECIFIC NAMES (textbook authors and characters) ===
  'Анета': { translation: 'Aneta (name)', partOfSpeech: 'proper noun' },
  'Дучевска': { translation: 'Dučevska (surname)', partOfSpeech: 'proper noun' },
  'Симон': { translation: 'Simon (name)', partOfSpeech: 'proper noun' },
  'Саздов': { translation: 'Sazdov (surname)', partOfSpeech: 'proper noun' },

  // === COUNTRY/CITY NAMES ===
  'Скопје': { translation: 'Skopje (capital of North Macedonia)', partOfSpeech: 'proper noun' },
  'Македонија': { translation: 'Macedonia', partOfSpeech: 'proper noun' },
  'Србија': { translation: 'Serbia', partOfSpeech: 'proper noun' },
  'Словенија': { translation: 'Slovenia', partOfSpeech: 'proper noun' },
  'Германија': { translation: 'Germany', partOfSpeech: 'proper noun' },
  'Англија': { translation: 'England', partOfSpeech: 'proper noun' },
  'Австралија': { translation: 'Australia', partOfSpeech: 'proper noun' },
  'Ирска': { translation: 'Ireland', partOfSpeech: 'proper noun' },
  'Јапонија': { translation: 'Japan', partOfSpeech: 'proper noun' },
  'Турција': { translation: 'Turkey', partOfSpeech: 'proper noun' },
  'Швајцарија': { translation: 'Switzerland', partOfSpeech: 'proper noun' },
  'Шпанија': { translation: 'Spain', partOfSpeech: 'proper noun' },
  'Бразил': { translation: 'Brazil', partOfSpeech: 'proper noun' },
  'Лондон': { translation: 'London', partOfSpeech: 'proper noun' },
  'Струга': { translation: 'Struga (city in Macedonia)', partOfSpeech: 'proper noun' },
  'Сараево': { translation: 'Sarajevo (capital of Bosnia)', partOfSpeech: 'proper noun' },

  // === COMMON TRANSLATION FIXES ===
  'факултет': { translation: 'university/college', partOfSpeech: 'noun' },
  'лекција': { translation: 'lesson', partOfSpeech: 'noun' },
  'вежба': { translation: 'exercise', partOfSpeech: 'noun' },
  'реченици': { translation: 'sentences', partOfSpeech: 'noun' },
  'изговори': { translation: 'pronounce (imperative)', partOfSpeech: 'verb' },
  'Состави': { translation: 'compose/create (imperative)', partOfSpeech: 'verb' },
  'видови': { translation: 'types/kinds', partOfSpeech: 'noun' },

  // === GREETINGS AND COMMON PHRASES ===
  'Здраво': { translation: 'Hello/Hi', partOfSpeech: 'interjection' },
  'Добар ден': { translation: 'Good day/Good afternoon', partOfSpeech: 'phrase' },
  'Добро утро': { translation: 'Good morning', partOfSpeech: 'phrase' },
  'Добра вечер': { translation: 'Good evening', partOfSpeech: 'phrase' },
  'Како си?': { translation: 'How are you? (informal)', partOfSpeech: 'phrase' },
  'Како сте?': { translation: 'How are you? (formal)', partOfSpeech: 'phrase' },
  'Благодарам': { translation: 'Thank you', partOfSpeech: 'interjection' },
  'Ве молам': { translation: 'Please (formal)', partOfSpeech: 'phrase' },
  'Те молам': { translation: 'Please (informal)', partOfSpeech: 'phrase' },
  'Извинете': { translation: 'Excuse me (formal)', partOfSpeech: 'interjection' },
  'Извини': { translation: 'Excuse me (informal)', partOfSpeech: 'interjection' },

  // === PRONOUNS ===
  'јас': { translation: 'I', partOfSpeech: 'pronoun' },
  'ти': { translation: 'you (singular informal)', partOfSpeech: 'pronoun' },
  'тој': { translation: 'he', partOfSpeech: 'pronoun' },
  'таа': { translation: 'she', partOfSpeech: 'pronoun' },
  'тоа': { translation: 'it', partOfSpeech: 'pronoun' },
  'ние': { translation: 'we', partOfSpeech: 'pronoun' },
  'вие': { translation: 'you (plural/formal)', partOfSpeech: 'pronoun' },
  'тие': { translation: 'they', partOfSpeech: 'pronoun' },
  'нам': { translation: 'to us (dative)', partOfSpeech: 'pronoun' },

  // === POSSESSIVE PRONOUNS ===
  'мој': { translation: 'my (masculine)', partOfSpeech: 'possessive' },
  'моја': { translation: 'my (feminine)', partOfSpeech: 'possessive' },
  'мое': { translation: 'my (neuter)', partOfSpeech: 'possessive' },
  'мојот': { translation: 'my (masculine definite)', partOfSpeech: 'possessive' },
  'мојата': { translation: 'my (feminine definite)', partOfSpeech: 'possessive' },
  'моето': { translation: 'my (neuter definite)', partOfSpeech: 'possessive' },
  'твој': { translation: 'your (masculine, informal)', partOfSpeech: 'possessive' },
  'твоја': { translation: 'your (feminine, informal)', partOfSpeech: 'possessive' },
  'твое': { translation: 'your (neuter, informal)', partOfSpeech: 'possessive' },
  'твојот': { translation: 'your (masculine definite)', partOfSpeech: 'possessive' },
  'твојата': { translation: 'your (feminine definite)', partOfSpeech: 'possessive' },
  'твоето': { translation: 'your (neuter definite)', partOfSpeech: 'possessive' },

  // === COMMON VERBS ===
  'сум': { translation: 'am (to be)', partOfSpeech: 'verb' },
  'имам': { translation: 'have', partOfSpeech: 'verb' },
  'сакам': { translation: 'want/love', partOfSpeech: 'verb' },
  'одам': { translation: 'go', partOfSpeech: 'verb' },
  'правам': { translation: 'do/make', partOfSpeech: 'verb' },
  'зборувам': { translation: 'speak', partOfSpeech: 'verb' },
  'живеам': { translation: 'live', partOfSpeech: 'verb' },
  'работам': { translation: 'work', partOfSpeech: 'verb' },
  'учам': { translation: 'study/learn', partOfSpeech: 'verb' },
  'читам': { translation: 'read', partOfSpeech: 'verb' },
  'пишувам': { translation: 'write', partOfSpeech: 'verb' },
  'знам': { translation: 'know', partOfSpeech: 'verb' },
  'мислам': { translation: 'think', partOfSpeech: 'verb' },
  'оди': { translation: 'goes (3rd person)', partOfSpeech: 'verb' },
  'биде': { translation: 'to be (infinitive/subjunctive)', partOfSpeech: 'verb' },
  'бидат': { translation: 'to be (3rd person plural)', partOfSpeech: 'verb' },
  'направи': { translation: 'make/do (3rd person or imperative)', partOfSpeech: 'verb' },
  'направат': { translation: 'make/do (3rd person plural)', partOfSpeech: 'verb' },
  'направите': { translation: 'make/do (2nd person plural/formal)', partOfSpeech: 'verb' },
  'направете': { translation: 'make/do (imperative plural/formal)', partOfSpeech: 'verb' },
  'правете': { translation: 'do/make (imperative plural)', partOfSpeech: 'verb' },
  'почувствувате': { translation: 'you will feel (2nd person plural)', partOfSpeech: 'verb' },

  // === QUESTION WORDS ===
  'што': { translation: 'what', partOfSpeech: 'interrogative' },
  'кој': { translation: 'who (masculine)', partOfSpeech: 'interrogative' },
  'која': { translation: 'who (feminine)', partOfSpeech: 'interrogative' },
  'кое': { translation: 'which (neuter)', partOfSpeech: 'interrogative' },
  'каде': { translation: 'where', partOfSpeech: 'interrogative' },
  'кога': { translation: 'when', partOfSpeech: 'interrogative' },
  'како': { translation: 'how', partOfSpeech: 'interrogative' },
  'зошто': { translation: 'why', partOfSpeech: 'interrogative' },
  'колку': { translation: 'how much/how many', partOfSpeech: 'interrogative' },
  'дали': { translation: 'whether/do (question particle)', partOfSpeech: 'particle' },

  // === FAMILY ===
  'семејство': { translation: 'family', partOfSpeech: 'noun' },
  'татко': { translation: 'father', partOfSpeech: 'noun' },
  'мајка': { translation: 'mother', partOfSpeech: 'noun' },
  'брат': { translation: 'brother', partOfSpeech: 'noun' },
  'сестра': { translation: 'sister', partOfSpeech: 'noun' },
  'дедо': { translation: 'grandfather', partOfSpeech: 'noun' },
  'баба': { translation: 'grandmother', partOfSpeech: 'noun' },
  'син': { translation: 'son', partOfSpeech: 'noun' },
  'ќерка': { translation: 'daughter', partOfSpeech: 'noun' },
  'дете': { translation: 'child', partOfSpeech: 'noun' },
  'маж': { translation: 'man/husband', partOfSpeech: 'noun' },
  'жена': { translation: 'woman/wife', partOfSpeech: 'noun' },
  'момче': { translation: 'boy', partOfSpeech: 'noun' },
  'девојка': { translation: 'girl', partOfSpeech: 'noun' },
  'пријател': { translation: 'friend (male)', partOfSpeech: 'noun' },
  'пријателка': { translation: 'friend (female)', partOfSpeech: 'noun' },

  // === NUMBERS ===
  'еден': { translation: 'one (masculine)', partOfSpeech: 'numeral' },
  'една': { translation: 'one (feminine)', partOfSpeech: 'numeral' },
  'едно': { translation: 'one (neuter)', partOfSpeech: 'numeral' },
  'два': { translation: 'two (masculine)', partOfSpeech: 'numeral' },
  'две': { translation: 'two (feminine/neuter)', partOfSpeech: 'numeral' },
  'три': { translation: 'three', partOfSpeech: 'numeral' },
  'четири': { translation: 'four', partOfSpeech: 'numeral' },
  'пет': { translation: 'five', partOfSpeech: 'numeral' },
  'шест': { translation: 'six', partOfSpeech: 'numeral' },
  'седум': { translation: 'seven', partOfSpeech: 'numeral' },
  'осум': { translation: 'eight', partOfSpeech: 'numeral' },
  'девет': { translation: 'nine', partOfSpeech: 'numeral' },
  'десет': { translation: 'ten', partOfSpeech: 'numeral' },

  // === COMMON NOUNS ===
  'дом': { translation: 'home', partOfSpeech: 'noun' },
  'куќа': { translation: 'house', partOfSpeech: 'noun' },
  'стан': { translation: 'apartment', partOfSpeech: 'noun' },
  'соба': { translation: 'room', partOfSpeech: 'noun' },
  'кујна': { translation: 'kitchen', partOfSpeech: 'noun' },
  'бања': { translation: 'bathroom', partOfSpeech: 'noun' },
  'дневна': { translation: 'living room', partOfSpeech: 'noun' },
  'спална': { translation: 'bedroom', partOfSpeech: 'noun' },
  'маса': { translation: 'table', partOfSpeech: 'noun' },
  'столица': { translation: 'chair', partOfSpeech: 'noun' },
  'кревет': { translation: 'bed', partOfSpeech: 'noun' },
  'книга': { translation: 'book', partOfSpeech: 'noun' },
  'кола': { translation: 'car', partOfSpeech: 'noun' },
  'град': { translation: 'city/town', partOfSpeech: 'noun' },
  'улица': { translation: 'street', partOfSpeech: 'noun' },
  'парк': { translation: 'park', partOfSpeech: 'noun' },
  'универзитет': { translation: 'university', partOfSpeech: 'noun' },
  'училиште': { translation: 'school', partOfSpeech: 'noun' },
  'работа': { translation: 'work/job', partOfSpeech: 'noun' },
  'наспрема': { translation: 'compared to/versus', partOfSpeech: 'preposition' },

  // === ADJECTIVES ===
  'добар': { translation: 'good (masculine)', partOfSpeech: 'adjective' },
  'добра': { translation: 'good (feminine)', partOfSpeech: 'adjective' },
  'добро': { translation: 'good (neuter)', partOfSpeech: 'adjective' },
  'убав': { translation: 'beautiful (masculine)', partOfSpeech: 'adjective' },
  'убава': { translation: 'beautiful (feminine)', partOfSpeech: 'adjective' },
  'убаво': { translation: 'beautiful (neuter)', partOfSpeech: 'adjective' },
  'голем': { translation: 'big (masculine)', partOfSpeech: 'adjective' },
  'голема': { translation: 'big (feminine)', partOfSpeech: 'adjective' },
  'големо': { translation: 'big (neuter)', partOfSpeech: 'adjective' },
  'мал': { translation: 'small (masculine)', partOfSpeech: 'adjective' },
  'мала': { translation: 'small (feminine)', partOfSpeech: 'adjective' },
  'мало': { translation: 'small (neuter)', partOfSpeech: 'adjective' },
  'нов': { translation: 'new (masculine)', partOfSpeech: 'adjective' },
  'нова': { translation: 'new (feminine)', partOfSpeech: 'adjective' },
  'ново': { translation: 'new (neuter)', partOfSpeech: 'adjective' },
  'стар': { translation: 'old (masculine)', partOfSpeech: 'adjective' },
  'стара': { translation: 'old (feminine)', partOfSpeech: 'adjective' },
  'старо': { translation: 'old (neuter)', partOfSpeech: 'adjective' },
  'млад': { translation: 'young (masculine)', partOfSpeech: 'adjective' },
  'млада': { translation: 'young (feminine)', partOfSpeech: 'adjective' },
  'младо': { translation: 'young (neuter)', partOfSpeech: 'adjective' },
};

// ============================================================================
// Types
// ============================================================================

interface VocabularyItem {
  word: string;
  partOfSpeech?: string;
  context: string;
  translation: string;
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  startPage?: number;
  endPage?: number;
  themes?: unknown[];
  vocabularyItems: VocabularyItem[];
  grammarNotes?: unknown[];
}

interface Textbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  const inputPath = path.resolve('data/curriculum/structured/b1-zlatovrv.json');
  const backupPath = path.resolve('data/curriculum/structured/b1-zlatovrv.backup.json');
  const outputPath = path.resolve('data/curriculum/structured/b1-zlatovrv.json');

  console.log('📚 Loading B1 curriculum...');
  const textbook: Textbook = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  // Create backup
  console.log('💾 Creating backup...');
  fs.writeFileSync(backupPath, JSON.stringify(textbook, null, 2), 'utf-8');

  let totalVocab = 0;
  let corrected = 0;
  let removed = 0;
  let nullFixed = 0;

  // Process each chapter
  for (const chapter of textbook.chapters) {
    const originalCount = chapter.vocabularyItems.length;

    // Filter out words to remove
    chapter.vocabularyItems = chapter.vocabularyItems.filter(item => {
      if (WORDS_TO_REMOVE.has(item.word)) {
        removed++;
        return false;
      }
      return true;
    });

    // Apply corrections
    for (const item of chapter.vocabularyItems) {
      // Fix null translations
      if (item.translation === 'null' || item.translation === null) {
        item.translation = '(translation needed)';
        nullFixed++;
      }

      const correction = TRANSLATION_CORRECTIONS[item.word];
      if (correction) {
        item.translation = correction.translation;
        if (correction.partOfSpeech) {
          item.partOfSpeech = correction.partOfSpeech;
        }
        corrected++;
      }
    }

    totalVocab += chapter.vocabularyItems.length;
    console.log(`   Lesson ${chapter.lessonNumber}: ${chapter.vocabularyItems.length} items (was ${originalCount})`);
  }

  // Write corrected file directly (backup already created)
  fs.writeFileSync(outputPath, JSON.stringify(textbook, null, 2), 'utf-8');

  console.log('\n📊 Summary:');
  console.log(`   Total vocabulary items: ${totalVocab}`);
  console.log(`   Corrections applied: ${corrected}`);
  console.log(`   Null translations fixed: ${nullFixed}`);
  console.log(`   Items removed: ${removed}`);
  console.log(`\n✅ Corrections applied directly to: ${outputPath}`);
  console.log(`   Backup saved to: ${backupPath}`);
}

main().catch(console.error);
