#!/usr/bin/env tsx
/**
 * Vocabulary Corrections Script
 *
 * Fixes known translation errors in the A1/A2/B1 curriculum vocabulary:
 * 1. Proper names incorrectly translated as common words
 * 2. Truncated/invalid words that should be removed
 * 3. Common translation errors
 * 4. Empty translations identified by validation
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Level Files Configuration
// ============================================================================

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

// ============================================================================
// Corrections Mapping
// ============================================================================

/**
 * Words that should be removed (truncated, invalid, or not useful vocabulary)
 */
const WORDS_TO_REMOVE = new Set([
  'прија',      // Truncated from пријател
  'тел',        // Truncated from телефон
  'Ѓокови',     // Should be Ѓоковиќ (duplicate entry)
  'Белучи',     // Proper name, not vocabulary
  'Моника',     // Proper name
  'весни',      // Truncated/misspelled - should be Весна
  'кенд',       // Truncated - fragment
  'плани',      // Truncated from планира
  'сендви',     // Truncated from сендвич
  'пинг',       // Fragment (ping-pong)
  'понг',       // Fragment (ping-pong)
]);

/**
 * Translation corrections for proper names and common errors
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
  'Ангела': { translation: 'Angela (name)', partOfSpeech: 'proper noun' },
  'Мирјана': { translation: 'Mirjana (name)', partOfSpeech: 'proper noun' },
  'Миле': { translation: 'Mile (name)', partOfSpeech: 'proper noun' },
  'Ванчо': { translation: 'Vancho (name)', partOfSpeech: 'proper noun' },
  'Наталија': { translation: 'Natalija (name)', partOfSpeech: 'proper noun' },
  'Марта': { translation: 'Marta (name)', partOfSpeech: 'proper noun' },
  'Соколова': { translation: 'Sokolova (surname)', partOfSpeech: 'proper noun' },

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

  // === COMMON TRANSLATION FIXES ===
  'факултет': { translation: 'university/college', partOfSpeech: 'noun' },
  'лекција': { translation: 'lesson', partOfSpeech: 'noun' },
  'вежба': { translation: 'exercise', partOfSpeech: 'noun' },
  'реченици': { translation: 'sentences', partOfSpeech: 'noun' },
  'изговори': { translation: 'pronounce (imperative)', partOfSpeech: 'verb' },
  'Состави': { translation: 'compose/create (imperative)', partOfSpeech: 'verb' },

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
  'Повели': { translation: 'Here you go (informal)', partOfSpeech: 'interjection' },
  'Повелете': { translation: 'Here you go (formal)', partOfSpeech: 'interjection' },
  'Фала': { translation: 'Thanks (colloquial)', partOfSpeech: 'interjection' },
  'молам': { translation: 'please', partOfSpeech: 'verb' },

  // === PRONOUNS ===
  'јас': { translation: 'I', partOfSpeech: 'pronoun' },
  'ти': { translation: 'you (singular informal)', partOfSpeech: 'pronoun' },
  'тој': { translation: 'he', partOfSpeech: 'pronoun' },
  'таа': { translation: 'she', partOfSpeech: 'pronoun' },
  'тоа': { translation: 'it', partOfSpeech: 'pronoun' },
  'ние': { translation: 'we', partOfSpeech: 'pronoun' },
  'вие': { translation: 'you (plural/formal)', partOfSpeech: 'pronoun' },
  'тие': { translation: 'they', partOfSpeech: 'pronoun' },
  'кого': { translation: 'whom', partOfSpeech: 'pronoun' },

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
  'нашите': { translation: 'our (plural definite)', partOfSpeech: 'possessive' },
  'Неговите': { translation: 'his (plural definite)', partOfSpeech: 'possessive' },
  'неговите': { translation: 'his (plural definite)', partOfSpeech: 'possessive' },

  // === COMMON VERBS (present tense, 1st person) ===
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
  'носам': { translation: 'carry/wear', partOfSpeech: 'verb' },
  'возам': { translation: 'drive', partOfSpeech: 'verb' },
  'доцнам': { translation: 'be late', partOfSpeech: 'verb' },

  // === VERBS (3rd person, other forms) ===
  'гледа': { translation: 'watches/looks at', partOfSpeech: 'verb' },
  'гледаш': { translation: 'you watch/look at', partOfSpeech: 'verb' },
  'чита': { translation: 'reads', partOfSpeech: 'verb' },
  'слуша': { translation: 'listens', partOfSpeech: 'verb' },
  'работи': { translation: 'works', partOfSpeech: 'verb' },
  'седи': { translation: 'sits', partOfSpeech: 'verb' },
  'пуши': { translation: 'smokes', partOfSpeech: 'verb' },
  'прават': { translation: 'they do/make', partOfSpeech: 'verb' },
  'играме': { translation: 'we play', partOfSpeech: 'verb' },
  'Играме': { translation: 'we play', partOfSpeech: 'verb' },
  'продаваат': { translation: 'they sell', partOfSpeech: 'verb' },
  'допаѓа': { translation: 'pleases/likes', partOfSpeech: 'verb' },
  'брои': { translation: 'counts', partOfSpeech: 'verb' },
  'крои': { translation: 'cuts/tailors', partOfSpeech: 'verb' },
  'спои': { translation: 'joins/connects', partOfSpeech: 'verb' },

  // === IMPERATIVE VERBS ===
  'Зборувајте': { translation: 'speak (formal imperative)', partOfSpeech: 'verb' },
  'Слушајте': { translation: 'listen (formal imperative)', partOfSpeech: 'verb' },
  'Вметни': { translation: 'insert (imperative)', partOfSpeech: 'verb' },
  'Составете': { translation: 'compose/create (formal imperative)', partOfSpeech: 'verb' },
  'Предавам': { translation: 'I teach/lecture', partOfSpeech: 'verb' },
  'Потсети': { translation: 'remind (imperative)', partOfSpeech: 'verb' },

  // === PAST TENSE VERBS ===
  'учили': { translation: 'studied/learned (plural past)', partOfSpeech: 'verb' },
  'почна': { translation: 'started', partOfSpeech: 'verb' },
  'свиреше': { translation: 'was playing (music)', partOfSpeech: 'verb' },
  'напиша': { translation: 'wrote', partOfSpeech: 'verb' },
  'гледаше': { translation: 'was watching', partOfSpeech: 'verb' },
  'јадеше': { translation: 'was eating', partOfSpeech: 'verb' },
  'пиеше': { translation: 'was drinking', partOfSpeech: 'verb' },
  'ручаше': { translation: 'was having lunch', partOfSpeech: 'verb' },
  'носеше': { translation: 'was carrying/wearing', partOfSpeech: 'verb' },
  'земаше': { translation: 'was taking', partOfSpeech: 'verb' },
  'чинеше': { translation: 'was costing', partOfSpeech: 'verb' },
  'правеше': { translation: 'was doing/making', partOfSpeech: 'verb' },
  'победи': { translation: 'won', partOfSpeech: 'verb' },
  'испи': { translation: 'drank up', partOfSpeech: 'verb' },
  'облече': { translation: 'put on (clothes)', partOfSpeech: 'verb' },
  'потроши': { translation: 'spent/used up', partOfSpeech: 'verb' },
  'планирале': { translation: 'had planned', partOfSpeech: 'verb' },
  'почувствувате': { translation: 'you will feel', partOfSpeech: 'verb' },

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
  'соседи': { translation: 'neighbors', partOfSpeech: 'noun' },

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
  'трети': { translation: 'third', partOfSpeech: 'numeral' },

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
  'колата': { translation: 'the car', partOfSpeech: 'noun' },
  'град': { translation: 'city/town', partOfSpeech: 'noun' },
  'улица': { translation: 'street', partOfSpeech: 'noun' },
  'парк': { translation: 'park', partOfSpeech: 'noun' },
  'универзитет': { translation: 'university', partOfSpeech: 'noun' },
  'училиште': { translation: 'school', partOfSpeech: 'noun' },
  'Училиштето': { translation: 'the school', partOfSpeech: 'noun' },
  'работа': { translation: 'work/job', partOfSpeech: 'noun' },
  'село': { translation: 'village', partOfSpeech: 'noun' },
  'хотел': { translation: 'hotel', partOfSpeech: 'noun' },
  'хотели': { translation: 'hotels', partOfSpeech: 'noun' },

  // === FOOD AND DRINK ===
  'сок': { translation: 'juice', partOfSpeech: 'noun' },
  'чаша': { translation: 'glass/cup', partOfSpeech: 'noun' },
  'шолја': { translation: 'cup (for coffee)', partOfSpeech: 'noun' },
  'банана': { translation: 'banana', partOfSpeech: 'noun' },
  'сендвич': { translation: 'sandwich', partOfSpeech: 'noun' },
  'ручек': { translation: 'lunch', partOfSpeech: 'noun' },

  // === MEDIA AND ENTERTAINMENT ===
  'списание': { translation: 'magazine', partOfSpeech: 'noun' },
  'видеоигри': { translation: 'video games', partOfSpeech: 'noun' },
  'филмови': { translation: 'movies', partOfSpeech: 'noun' },
  'телевизија': { translation: 'television', partOfSpeech: 'noun' },
  'албум': { translation: 'album', partOfSpeech: 'noun' },

  // === GRAMMAR TERMS ===
  'присвојни': { translation: 'possessive (grammar)', partOfSpeech: 'adjective' },
  'глаголи': { translation: 'verbs', partOfSpeech: 'noun' },
  'антоними': { translation: 'antonyms', partOfSpeech: 'noun' },
  'множински': { translation: 'plural (grammar)', partOfSpeech: 'adjective' },
  'согласки': { translation: 'consonants', partOfSpeech: 'noun' },

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
  'познати': { translation: 'famous/known', partOfSpeech: 'adjective' },
  'високи': { translation: 'tall (plural)', partOfSpeech: 'adjective' },
  'Високи': { translation: 'tall (plural)', partOfSpeech: 'adjective' },
  'слатки': { translation: 'sweet (plural)', partOfSpeech: 'adjective' },
  'уморна': { translation: 'tired (feminine)', partOfSpeech: 'adjective' },
  'болна': { translation: 'sick (feminine)', partOfSpeech: 'adjective' },
  'германски': { translation: 'German (adjective)', partOfSpeech: 'adjective' },
  'хотелска': { translation: 'hotel (adjective)', partOfSpeech: 'adjective' },
  'мобилни': { translation: 'mobile (plural)', partOfSpeech: 'adjective' },
  'Црвената': { translation: 'the red (feminine definite)', partOfSpeech: 'adjective' },
  'даден': { translation: 'given', partOfSpeech: 'adjective' },

  // === DEFINITE NOUNS ===
  'студентите': { translation: 'the students', partOfSpeech: 'noun' },
  'гласовите': { translation: 'the voices', partOfSpeech: 'noun' },
  'крајот': { translation: 'the end', partOfSpeech: 'noun' },
  'минусот': { translation: 'the minus', partOfSpeech: 'noun' },
  'плусот': { translation: 'the plus', partOfSpeech: 'noun' },
  'кабелот': { translation: 'the cable', partOfSpeech: 'noun' },
  'јаболкото': { translation: 'the apple', partOfSpeech: 'noun' },
  'кутијата': { translation: 'the box', partOfSpeech: 'noun' },
  'испуштените': { translation: 'the omitted ones', partOfSpeech: 'noun' },
  'паузата': { translation: 'the break/pause', partOfSpeech: 'noun' },
  'Библиотеката': { translation: 'the library', partOfSpeech: 'noun' },
  'левата': { translation: 'the left (one)', partOfSpeech: 'noun' },

  // === ABSTRACT NOUNS ===
  'свет': { translation: 'world', partOfSpeech: 'noun' },
  'цел': { translation: 'whole/goal', partOfSpeech: 'noun' },
  'однос': { translation: 'relationship/ratio', partOfSpeech: 'noun' },
  'ред': { translation: 'order/row', partOfSpeech: 'noun' },
  'ситуација': { translation: 'situation', partOfSpeech: 'noun' },
  'помнење': { translation: 'memory/remembering', partOfSpeech: 'noun' },
  'држење': { translation: 'holding/behavior', partOfSpeech: 'noun' },
  'титули': { translation: 'titles', partOfSpeech: 'noun' },
  'првак': { translation: 'champion/first-grader', partOfSpeech: 'noun' },
  'Тест': { translation: 'test', partOfSpeech: 'noun' },
  'сојузник': { translation: 'ally', partOfSpeech: 'noun' },

  // === ADVERBS ===
  'обично': { translation: 'usually', partOfSpeech: 'adverb' },
  'Обично': { translation: 'usually', partOfSpeech: 'adverb' },
  'спротивно': { translation: 'opposite/contrary', partOfSpeech: 'adverb' },

  // === OTHER ===
  'бој': { translation: 'battle/color', partOfSpeech: 'noun' },
  'крој': { translation: 'cut/style', partOfSpeech: 'noun' },
  'спој': { translation: 'connection/joint', partOfSpeech: 'noun' },
  'автобуска': { translation: 'bus (adjective)', partOfSpeech: 'adjective' },
  'постојка': { translation: 'stop/station', partOfSpeech: 'noun' },
};

// ============================================================================
// Types
// ============================================================================

interface VocabularyItem {
  word: string;
  partOfSpeech: string;
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

async function processLevel(level: string, filePath: string): Promise<{
  totalVocab: number;
  corrected: number;
  removed: number;
  emptyFixed: number;
}> {
  console.log(`\n📚 Processing ${level.toUpperCase()} curriculum...`);
  const textbook: Textbook = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  let totalVocab = 0;
  let corrected = 0;
  let removed = 0;
  let emptyFixed = 0;

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

    // Apply corrections and fix empty translations
    for (const item of chapter.vocabularyItems) {
      const correction = TRANSLATION_CORRECTIONS[item.word];
      if (correction) {
        const wasEmpty = !item.translation || item.translation.trim() === '';
        item.translation = correction.translation;
        if (correction.partOfSpeech) {
          item.partOfSpeech = correction.partOfSpeech;
        }
        corrected++;
        if (wasEmpty) {
          emptyFixed++;
        }
      }
    }

    totalVocab += chapter.vocabularyItems.length;
    console.log(`   Lesson ${chapter.lessonNumber}: ${chapter.vocabularyItems.length} items (was ${originalCount})`);
  }

  // Write directly to the source file (in-place update)
  fs.writeFileSync(filePath, JSON.stringify(textbook, null, 2), 'utf-8');

  return { totalVocab, corrected, removed, emptyFixed };
}

async function main() {
  const args = process.argv.slice(2);
  const levelArg = args.indexOf('--level');
  const specificLevel = levelArg !== -1 ? args[levelArg + 1]?.toLowerCase() : null;

  // Determine which levels to process
  const levelsToProcess = specificLevel
    ? { [specificLevel]: LEVEL_FILES[specificLevel] }
    : LEVEL_FILES;

  if (specificLevel && !LEVEL_FILES[specificLevel]) {
    console.error(`Unknown level: ${specificLevel}. Use --level a1, --level a2, or --level b1`);
    process.exit(1);
  }

  console.log('🔧 Vocabulary Corrections Script');
  console.log('================================');

  let grandTotalVocab = 0;
  let grandTotalCorrected = 0;
  let grandTotalRemoved = 0;
  let grandTotalEmptyFixed = 0;

  for (const [level, filePath] of Object.entries(levelsToProcess)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`⚠️  Skipping ${level.toUpperCase()}: file not found at ${filePath}`);
      continue;
    }

    const result = await processLevel(level, resolvedPath);
    grandTotalVocab += result.totalVocab;
    grandTotalCorrected += result.corrected;
    grandTotalRemoved += result.removed;
    grandTotalEmptyFixed += result.emptyFixed;
  }

  console.log('\n📊 Grand Total Summary:');
  console.log(`   Total vocabulary items: ${grandTotalVocab}`);
  console.log(`   Corrections applied: ${grandTotalCorrected}`);
  console.log(`   Empty translations fixed: ${grandTotalEmptyFixed}`);
  console.log(`   Items removed: ${grandTotalRemoved}`);
  console.log('\n✅ All files updated in-place');
  console.log('\nTo validate, run:');
  console.log('   npx tsx scripts/curriculum/validate-content.ts');
}

main().catch(console.error);
