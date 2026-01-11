#!/usr/bin/env tsx
/**
 * Clean Grammar Notes Script
 *
 * Cleans grammar notes based on audit findings:
 * 1. Removes PDF extraction artifacts (spaced letters, raw fragments)
 * 2. Standardizes structure (title, content, examples, translatedExamples)
 * 3. Rewrites flagged notes with clear English pedagogical explanations
 * 4. Deduplicates within levels
 *
 * Run with: npx tsx scripts/curriculum/clean-grammar-notes.ts
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

// ============================================================================
// Types
// ============================================================================

interface GrammarNote {
  title: string;
  content: string;
  examples: string[];
  translatedExamples: string[];
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  grammarNotes?: GrammarNote[];
  [key: string]: unknown;
}

interface Textbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
}

// ============================================================================
// Standard Grammar Note Templates (Clear Pedagogical Content)
// ============================================================================

const STANDARD_GRAMMAR_NOTES: Record<string, GrammarNote> = {
  // ==========================================================================
  // A1 Core Grammar
  // ==========================================================================

  'глаголот "сум"': {
    title: 'Глаголот "сум" (The verb "to be")',
    content: 'The verb "сум" (to be) is one of the most important verbs in Macedonian. It conjugates irregularly by person and number. Use it to express identity, origin, profession, and states. In Macedonian, the verb alone often indicates the subject, so pronouns can be omitted.',
    examples: [
      'Јас сум студент. - I am a student.',
      'Ти си од Скопје. - You are from Skopje.',
      'Тој е висок. - He is tall.',
      'Таа е добра. - She is good.',
      'Ние сме тука. - We are here.',
      'Вие сте професор. - You are a professor.',
    ],
    translatedExamples: [
      'I am a student.',
      'You are from Skopje.',
      'He is tall.',
      'She is good.',
      'We are here.',
      'You are a professor.',
    ],
  },

  'глаголот сум': {
    title: 'Глаголот "сум" (The verb "to be")',
    content: 'The verb "сум" (to be) is one of the most important verbs in Macedonian. It conjugates irregularly by person and number. Use it to express identity, origin, profession, and states. In Macedonian, the verb alone often indicates the subject, so pronouns can be omitted.',
    examples: [
      'Јас сум студент. - I am a student.',
      'Ти си од Скопје. - You are from Skopje.',
      'Тој е висок. - He is tall.',
      'Таа е добра. - She is good.',
      'Ние сме тука. - We are here.',
      'Вие сте професор. - You are a professor.',
    ],
    translatedExamples: [
      'I am a student.',
      'You are from Skopje.',
      'He is tall.',
      'She is good.',
      'We are here.',
      'You are a professor.',
    ],
  },

  'глаголот "има"': {
    title: 'Глаголот "има" (The verb "to have")',
    content: 'The verb "има" means "to have" or "there is/are". It conjugates regularly following the -а verb pattern. Besides possession, it is commonly used to express existence (like "there is" in English). The negative form "нема" means "there is not" or "does not have".',
    examples: [
      'Јас имам брат. - I have a brother.',
      'Ти имаш книга. - You have a book.',
      'Има време. - There is time.',
      'Нема проблем. - There is no problem.',
      'Имаме куќа. - We have a house.',
      'Тие имаат деца. - They have children.',
    ],
    translatedExamples: [
      'I have a brother.',
      'You have a book.',
      'There is time.',
      'There is no problem.',
      'We have a house.',
      'They have children.',
    ],
  },

  'присвојни заменки (possessive pronouns)': {
    title: 'Присвојни заменки (Possessive pronouns)',
    content: 'Macedonian possessive pronouns agree with the noun they modify in gender and number. They have short and long forms - long forms are used for emphasis. Possessives come before the noun they modify and must match the noun\'s gender (masculine, feminine, or neuter).',
    examples: [
      'мој брат - my brother (masculine)',
      'моја сестра - my sister (feminine)',
      'мое дете - my child (neuter)',
      'твој татко - your father',
      'негова мајка - his mother',
      'нејзин маж - her husband',
    ],
    translatedExamples: [
      'my brother (masculine)',
      'my sister (feminine)',
      'my child (neuter)',
      'your father',
      'his mother',
      'her husband',
    ],
  },

  'предлози (prepositions)': {
    title: 'Предлози (Prepositions)',
    content: 'Macedonian prepositions indicate relationships between words, expressing location, direction, time, and other relationships. Common prepositions include: во (in), на (on), со (with), од (from), за (for), до (to/until). Unlike many Slavic languages, Macedonian nouns do not change form after prepositions.',
    examples: [
      'Јас сум во куќа. - I am in a house.',
      'Книгата е на масата. - The book is on the table.',
      'Одам со пријател. - I am going with a friend.',
      'Тој е од Скопје. - He is from Skopje.',
      'Ова е за тебе. - This is for you.',
      'Одам до продавница. - I am going to the store.',
    ],
    translatedExamples: [
      'I am in a house.',
      'The book is on the table.',
      'I am going with a friend.',
      'He is from Skopje.',
      'This is for you.',
      'I am going to the store.',
    ],
  },

  'предлози': {
    title: 'Предлози (Prepositions)',
    content: 'Macedonian prepositions indicate relationships between words, expressing location, direction, time, and other relationships. Common prepositions include: во (in), на (on), со (with), од (from), за (for), до (to/until). Unlike many Slavic languages, Macedonian nouns do not change form after prepositions.',
    examples: [
      'Јас сум во куќа. - I am in a house.',
      'Книгата е на масата. - The book is on the table.',
      'Одам со пријател. - I am going with a friend.',
      'Тој е од Скопје. - He is from Skopje.',
      'Ова е за тебе. - This is for you.',
      'Одам до продавница. - I am going to the store.',
    ],
    translatedExamples: [
      'I am in a house.',
      'The book is on the table.',
      'I am going with a friend.',
      'He is from Skopje.',
      'This is for you.',
      'I am going to the store.',
    ],
  },

  'показни заменки (demonstratives)': {
    title: 'Показни заменки (Demonstrative pronouns)',
    content: 'Macedonian has a three-way demonstrative system based on proximity: -в/-ва/-во (this, near speaker), -т/-та/-то (that, near listener), and -н/-на/-но (that over there, distant). They agree in gender and number with the noun they modify. This tripartite system reflects the unique Macedonian way of indicating spatial relationships.',
    examples: [
      'овој човек - this man (near me)',
      'оваа жена - this woman (near me)',
      'ова дете - this child (near me)',
      'тој човек - that man (near you)',
      'оној човек - that man (over there)',
      'онаа куќа - that house (over there)',
    ],
    translatedExamples: [
      'this man (near me)',
      'this woman (near me)',
      'this child (near me)',
      'that man (near you)',
      'that man (over there)',
      'that house (over there)',
    ],
  },

  'еднина и множина': {
    title: 'Еднина и множина (Singular and Plural)',
    content: 'Macedonian nouns form plurals based on gender. Masculine nouns typically add -и (маж → мажи), feminine nouns ending in -а change to -и (жена → жени), and neuter nouns ending in -о or -е change to -а (село → села). Some nouns have irregular plurals that must be memorized (човек → луѓе, дете → деца).',
    examples: [
      'маж → мажи - man → men',
      'жена → жени - woman → women',
      'село → села - village → villages',
      'дете → деца - child → children',
      'човек → луѓе - person → people',
      'книга → книги - book → books',
    ],
    translatedExamples: [
      'man → men',
      'woman → women',
      'village → villages',
      'child → children',
      'person → people',
      'book → books',
    ],
  },

  'броеви': {
    title: 'Броеви (Numbers)',
    content: 'Macedonian numbers 1 and 2 have gender forms that must agree with the noun. Еден/една/едно (one) and два/две (two) change based on the gender of the noun they modify. Numbers from 3 onwards are the same for all genders. After numbers 2-4, nouns take plural form; after 5+, they also take plural.',
    examples: [
      'еден маж - one man (masculine)',
      'една жена - one woman (feminine)',
      'едно дете - one child (neuter)',
      'два мажи - two men',
      'две жени - two women',
      'три куќи - three houses',
    ],
    translatedExamples: [
      'one man (masculine)',
      'one woman (feminine)',
      'one child (neuter)',
      'two men',
      'two women',
      'three houses',
    ],
  },

  'придавки': {
    title: 'Придавки (Adjectives)',
    content: 'Macedonian adjectives agree with nouns in gender and number. Masculine adjectives typically end in a consonant (добар), feminine in -а (добра), and neuter in -о (добро). In plural, all genders use -и (добри). Adjectives usually come before the noun they modify.',
    examples: [
      'добар човек - good person (masculine)',
      'добра жена - good woman (feminine)',
      'добро дете - good child (neuter)',
      'добри луѓе - good people (plural)',
      'голем град - big city',
      'мала куќа - small house',
    ],
    translatedExamples: [
      'good person (masculine)',
      'good woman (feminine)',
      'good child (neuter)',
      'good people (plural)',
      'big city',
      'small house',
    ],
  },

  'заменки': {
    title: 'Заменки (Pronouns)',
    content: 'Macedonian personal pronouns distinguish person, number, and gender. Subject pronouns (јас, ти, тој/таа/тоа, ние, вие, тие) are often omitted since verb conjugation shows the subject. Macedonian has long and short forms for object pronouns - short forms are clitics that attach to verbs.',
    examples: [
      'Јас читам. - I read.',
      'Ти пишуваш. - You write.',
      'Тој/Таа работи. - He/She works.',
      'Ние учиме. - We study.',
      'Вие одите. - You (formal) go.',
      'Тие играат. - They play.',
    ],
    translatedExamples: [
      'I read.',
      'You write.',
      'He/She works.',
      'We study.',
      'You (formal) go.',
      'They play.',
    ],
  },

  // ==========================================================================
  // A2 Core Grammar
  // ==========================================================================

  'определеностa кај именките – членување': {
    title: 'Членување (Definite Article)',
    content: 'Macedonian has a unique tripartite definite article system that attaches to the end of nouns. The basic article (-от/-та/-то) indicates definiteness, while -ов/-ва/-во (proximal) indicates nearness to the speaker and -он/-на/-но (distal) indicates distance. This three-way distinction is a distinctive feature of Macedonian among Slavic languages.',
    examples: [
      'маж → мажот - man → the man',
      'жена → жената - woman → the woman',
      'дете → детето - child → the child',
      'овој маж - this man (near me)',
      'тој маж - that man (neutral)',
      'оној маж - that man (far away)',
    ],
    translatedExamples: [
      'man → the man',
      'woman → the woman',
      'child → the child',
      'this man (near me)',
      'that man (neutral)',
      'that man (far away)',
    ],
  },

  'придавки од имиња на географски поими': {
    title: 'Придавки од географски имиња (Geographic Adjectives)',
    content: 'Adjectives derived from geographic names follow regular patterns in Macedonian. Add -ски/-ска/-ско to place names to create adjectives. These adjectives agree in gender with the noun they modify, just like regular adjectives. They are commonly used for nationalities, languages, and regional descriptions.',
    examples: [
      'Македонија → македонски - Macedonia → Macedonian',
      'Англија → англиски - England → English',
      'Европа → европски - Europe → European',
      'македонски јазик - Macedonian language',
      'англиска книга - English book',
      'европски град - European city',
    ],
    translatedExamples: [
      'Macedonia → Macedonian',
      'England → English',
      'Europe → European',
      'Macedonian language',
      'English book',
      'European city',
    ],
  },

  'да-конструкција': {
    title: 'Да-конструкција (Da-construction)',
    content: 'The да-construction is used with modal verbs (сакам, можам, мора, треба) and replaces infinitives found in other Slavic languages. The structure is: modal verb + да + conjugated verb. Both verbs must agree with the subject. This is one of the Balkan linguistic features shared with Greek and Bulgarian.',
    examples: [
      'Сакам да читам. - I want to read.',
      'Можам да пишувам. - I can write.',
      'Мора да одам. - I must go.',
      'Треба да учиш. - You should study.',
      'Не сакам да спијам. - I don\'t want to sleep.',
      'Таа сака да пее. - She wants to sing.',
    ],
    translatedExamples: [
      'I want to read.',
      'I can write.',
      'I must go.',
      'You should study.',
      'I don\'t want to sleep.',
      'She wants to sing.',
    ],
  },

  'долги и кратки заменски форми за директен и за индиректен предмет': {
    title: 'Кратки заменски форми (Clitic Pronouns)',
    content: 'Macedonian has short (clitic) and long forms for object pronouns. Short forms (ме, те, го, ја, не, ве, ги) attach to verbs and are used in everyday speech. Long forms (мене, тебе, него, неа, нас, вас, нив) are used for emphasis. Clitic doubling (using both) is common in Macedonian.',
    examples: [
      'Ме гледа. - He sees me.',
      'Го читам. - I read it (masculine).',
      'Ја сакам. - I love her.',
      'Мене ме гледа. - He sees ME (emphatic).',
      'Му давам книга. - I give him a book.',
      'Ѝ кажувам. - I tell her.',
    ],
    translatedExamples: [
      'He sees me.',
      'I read it (masculine).',
      'I love her.',
      'He sees ME (emphatic).',
      'I give him a book.',
      'I tell her.',
    ],
  },

  'идно време (футур)': {
    title: 'Идно време (Future Tense)',
    content: 'The Macedonian future tense is formed with the particle "ќе" + present tense verb. The particle does not change; only the verb conjugates for person and number. This is a Balkan linguistic feature, distinct from other Slavic languages that use будам + infinitive. Negation: нема да + verb.',
    examples: [
      'Ќе читам. - I will read.',
      'Ќе одиш. - You will go.',
      'Ќе работи. - He/She will work.',
      'Ќе дојдеме. - We will come.',
      'Нема да одам. - I will not go.',
      'Утре ќе учам. - Tomorrow I will study.',
    ],
    translatedExamples: [
      'I will read.',
      'You will go.',
      'He/She will work.',
      'We will come.',
      'I will not go.',
      'Tomorrow I will study.',
    ],
  },

  'можен начин (потенцијал)': {
    title: 'Можен начин / Потенцијал (Conditional)',
    content: 'The Macedonian conditional (potential mood) expresses hypothetical situations, wishes, or polite requests. It is formed with "би" + the л-form of the verb (past participle). The form of "би" does not change for person. This construction corresponds to English "would" constructions.',
    examples: [
      'Би читал. - I would read. (masculine)',
      'Би читала. - I would read. (feminine)',
      'Би сакал да дојдам. - I would like to come.',
      'Би можел да помогнам. - I could help.',
      'Што би направил? - What would you do?',
      'Би било убаво. - It would be nice.',
    ],
    translatedExamples: [
      'I would read. (masculine)',
      'I would read. (feminine)',
      'I would like to come.',
      'I could help.',
      'What would you do?',
      'It would be nice.',
    ],
  },

  'минато неопределено време (перфект)': {
    title: 'Минато неопределено време / Перфект (Perfect Tense)',
    content: 'The perfect tense (има-perfect) describes completed actions with present relevance, or actions in the indefinite past. It is formed with "има/нема" + past participle (or сум + л-form). This tense often indicates reported or witnessed events, common in narratives and news.',
    examples: [
      'Имам прочитано. - I have read.',
      'Има дојдено. - He/She has come.',
      'Немам видено. - I have not seen.',
      'Таа има заминато. - She has left.',
      'Имаме направено. - We have done.',
      'Тој има научено многу. - He has learned a lot.',
    ],
    translatedExamples: [
      'I have read.',
      'He/She has come.',
      'I have not seen.',
      'She has left.',
      'We have done.',
      'He has learned a lot.',
    ],
  },

  'пасивни реченици': {
    title: 'Пасивни реченици (Passive Voice)',
    content: 'Macedonian passive voice is formed with "е/се" + past participle or with the reflexive particle "се". The participle agrees in gender and number with the subject. Passive constructions are less common in Macedonian than in English; active voice with "се" (reflexive passive) is often preferred.',
    examples: [
      'Книгата е напишана. - The book is written.',
      'Работата е завршена. - The work is finished.',
      'Се продава куќа. - A house is being sold.',
      'Тоа се гледа. - That is seen.',
      'Беше направено. - It was done.',
      'Писмото беше испратено. - The letter was sent.',
    ],
    translatedExamples: [
      'The book is written.',
      'The work is finished.',
      'A house is being sold.',
      'That is seen.',
      'It was done.',
      'The letter was sent.',
    ],
  },

  'прашални реченици': {
    title: 'Прашални реченици (Questions)',
    content: 'Macedonian questions use interrogative words (што, кој, каде, кога, како, зошто, колку) or the particle "дали" for yes/no questions. Word order is flexible, but the question word typically comes first. Intonation rises at the end of questions.',
    examples: [
      'Што правиш? - What are you doing?',
      'Кој е тој? - Who is he?',
      'Каде живееш? - Where do you live?',
      'Кога доаѓаш? - When are you coming?',
      'Дали зборуваш македонски? - Do you speak Macedonian?',
      'Зошто учиш? - Why are you studying?',
    ],
    translatedExamples: [
      'What are you doing?',
      'Who is he?',
      'Where do you live?',
      'When are you coming?',
      'Do you speak Macedonian?',
      'Why are you studying?',
    ],
  },

  'сегашно време (презент)': {
    title: 'Сегашно време (Present Tense)',
    content: 'Macedonian present tense expresses current actions, habits, and general truths. Verbs conjugate by person and number with two main patterns: -а verbs (читам, читаш, чита) and -и verbs (зборувам, зборуваш, зборува). Subject pronouns are often omitted since the verb ending indicates the subject.',
    examples: [
      'Јас читам книга. - I read a book.',
      'Ти пишуваш писмо. - You write a letter.',
      'Тој работи секој ден. - He works every day.',
      'Ние учиме македонски. - We study Macedonian.',
      'Вие зборувате англиски. - You speak English.',
      'Тие живеат во Скопје. - They live in Skopje.',
    ],
    translatedExamples: [
      'I read a book.',
      'You write a letter.',
      'He works every day.',
      'We study Macedonian.',
      'You speak English.',
      'They live in Skopje.',
    ],
  },

  'глаголска сум-конструкција': {
    title: 'Глаголска сум-конструкција (Sum-construction)',
    content: 'The sum-construction combines the verb "сум" (to be) with the passive participle (-н/-т form) to express states resulting from actions. This is similar to the English "is + past participle" structure. The participle agrees in gender and number with the subject.',
    examples: [
      'Вратата е отворена. - The door is open.',
      'Книгата е прочитана. - The book has been read.',
      'Јадењето е подготвено. - The food is prepared.',
      'Писмото е напишано. - The letter is written.',
      'Собата е исчистена. - The room is cleaned.',
      'Работата е завршена. - The work is finished.',
    ],
    translatedExamples: [
      'The door is open.',
      'The book has been read.',
      'The food is prepared.',
      'The letter is written.',
      'The room is cleaned.',
      'The work is finished.',
    ],
  },

  'глаголска именка': {
    title: 'Глаголска именка (Verbal Noun)',
    content: 'Verbal nouns are formed from verbs and function as nouns, similar to English gerunds (-ing forms). In Macedonian, they are formed with -ње/-ение endings. They are always neuter gender and can take articles and modifiers like regular nouns.',
    examples: [
      'чита → читање - read → reading',
      'пишува → пишување - write → writing',
      'учи → учење - learn → learning',
      'работи → работење - work → working',
      'Читањето е важно. - Reading is important.',
      'Ми се допаѓа пливањето. - I like swimming.',
    ],
    translatedExamples: [
      'read → reading',
      'write → writing',
      'learn → learning',
      'work → working',
      'Reading is important.',
      'I like swimming.',
    ],
  },

  'индиректен предмет': {
    title: 'Индиректен предмет (Indirect Object)',
    content: 'The indirect object receives the action indirectly, typically answering "to whom" or "for whom". In Macedonian, short dative pronouns (ми, ти, му, ѝ, ни, ви, им) mark the indirect object. Clitic doubling is common: "Нему му давам" (To him, I give him).',
    examples: [
      'Тој ми дава книга. - He gives me a book.',
      'Јас ти раскажувам приказна. - I tell you a story.',
      'Таа му пишува писмо. - She writes him a letter.',
      'Ние ѝ помагаме. - We help her.',
      'Им кажувам вистината. - I tell them the truth.',
      'Нему му се допаѓа музиката. - He likes the music.',
    ],
    translatedExamples: [
      'He gives me a book.',
      'I tell you a story.',
      'She writes him a letter.',
      'We help her.',
      'I tell them the truth.',
      'He likes the music.',
    ],
  },

  // ==========================================================================
  // B1 Core Grammar
  // ==========================================================================

  'глаголот нема': {
    title: 'Глаголски вид (Verbal Aspect)',
    content: 'Macedonian verbs have aspect: imperfective (несвршен) for ongoing/repeated actions and perfective (свршен) for completed single actions. Most verbs come in aspectual pairs (чита/прочита). Aspect affects meaning and must be chosen based on context. Imperfective is used for habits, perfective for completed events.',
    examples: [
      'Читам книга. - I am reading a book. (imperfective)',
      'Ја прочитав книгата. - I read/finished the book. (perfective)',
      'Пишувам секој ден. - I write every day. (imperfective)',
      'Напишав писмо. - I wrote a letter. (perfective)',
      'Учам македонски. - I am learning Macedonian. (imperfective)',
      'Научив лекција. - I learned a lesson. (perfective)',
    ],
    translatedExamples: [
      'I am reading a book. (ongoing)',
      'I read/finished the book. (completed)',
      'I write every day. (habitual)',
      'I wrote a letter. (completed)',
      'I am learning Macedonian. (ongoing)',
      'I learned a lesson. (completed)',
    ],
  },

  'именки': {
    title: 'Именки (Nouns - Advanced)',
    content: 'At B1 level, noun usage includes the vocative case for direct address (Татко! Марија!), collective nouns (браќа, децата), and irregular plural patterns. Macedonian nouns do not decline for case (except vocative), but show gender through articles and adjective agreement. Some plurals are irregular and must be memorized.',
    examples: [
      'Татко, дојди! - Father, come! (vocative)',
      'Марија, каде си? - Maria, where are you?',
      'човек → луѓе - person → people',
      'дете → деца - child → children',
      'брат → браќа - brother → brothers',
      'книгите се тука - the books are here',
    ],
    translatedExamples: [
      'Father, come! (vocative)',
      'Maria, where are you?',
      'person → people',
      'child → children',
      'brother → brothers',
      'the books are here',
    ],
  },
};

// ============================================================================
// Cleaning Functions
// ============================================================================

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/["""'']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPdfArtifacts(content: string): string {
  let cleaned = content;

  // Remove spaced Cyrillic letters (like "Г Р А М А Т И K A")
  cleaned = cleaned.replace(/([А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ])\s+(?=[А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ]\s+[А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ])/gi, '$1');

  // Remove raw Macedonian fragments that are clearly from PDF extraction
  cleaned = cleaned.replace(/вуваат,?\s*преведуваат,?\s*се јават\s*/gi, '');
  cleaned = cleaned.replace(/ријатели\s*,?\s*природни убавини\s*-?\s*природните убавини\s*/gi, '');

  // Remove exercise instructions
  cleaned = cleaned.replace(/Прочитајте.*?\.?\s*/gi, '');
  cleaned = cleaned.replace(/Најдете.*?\.?\s*/gi, '');
  cleaned = cleaned.replace(/Пронајдете.*?\.?\s*/gi, '');
  cleaned = cleaned.replace(/Одговорете.*?\.?\s*/gi, '');
  cleaned = cleaned.replace(/во текстот.*?\.?\s*/gi, '');
  cleaned = cleaned.replace(/Пасус \d+\.?\s*/gi, '');
  cleaned = cleaned.replace(/пасусот \d+\.?\s*/gi, '');

  // Remove page numbers and lesson markers
  cleaned = cleaned.replace(/\d+\s*ЛЕКЦИЈА\s*\d+.*?(?=\.|$)/gi, '');

  // Remove mixed notation like (i), (ii), (1), (2)
  cleaned = cleaned.replace(/\(\s*[ivx]+\s*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*\d+\s*\)/gi, '');

  // Clean up multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Ensure content ends with proper punctuation
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

function getStandardNote(title: string): GrammarNote | null {
  const normalized = normalizeTitle(title);
  return STANDARD_GRAMMAR_NOTES[normalized] || null;
}

function shouldUseStandardNote(note: GrammarNote): boolean {
  const content = note.content || '';

  // Check for PDF artifacts
  if (/[А-Яа-я]\s[А-Яа-я]\s[А-Яа-я]/i.test(content)) return true;
  if (/вуваат|ријатели|Прочитај|Најдете|Пронајдете|пасусот/i.test(content)) return true;
  if (/Г\s*Р\s*А\s*М\s*А\s*Т\s*И\s*K\s*A/i.test(content)) return true;

  // Check for predominantly Macedonian content
  const cyrillicCount = (content.match(/[А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ]/g) || []).length;
  const latinCount = (content.match(/[A-Za-z]/g) || []).length;
  if (cyrillicCount > latinCount * 2 && content.length > 100) return true;

  // Check for very short or incomplete content
  if (content.length < 50) return true;
  if (/[^.!?]\s*$/.test(content) && content.length > 20) return true;

  return false;
}

function improveNote(note: GrammarNote): GrammarNote {
  // Try to get standard note if original has issues
  if (shouldUseStandardNote(note)) {
    const standardNote = getStandardNote(note.title);
    if (standardNote) {
      return { ...standardNote };
    }
  }

  // If no standard note, try to clean the existing content
  const cleanedContent = cleanPdfArtifacts(note.content || '');

  // Ensure examples and translatedExamples exist and are arrays
  const examples = Array.isArray(note.examples) ? note.examples : [];
  const translatedExamples = Array.isArray(note.translatedExamples) ? note.translatedExamples : [];

  return {
    title: note.title,
    content: cleanedContent.length > 20 ? cleanedContent : note.content || '',
    examples: examples.length > 0 ? examples : [],
    translatedExamples: translatedExamples.length > 0 ? translatedExamples : [],
  };
}

function deduplicateNotes(notes: GrammarNote[]): GrammarNote[] {
  const seen = new Map<string, number>();
  const result: GrammarNote[] = [];

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const normalized = normalizeTitle(note.title);

    if (!seen.has(normalized)) {
      seen.set(normalized, i);
      result.push(note);
    } else {
      // Keep the one with better content
      const existingIdx = seen.get(normalized)!;
      const existing = result.find((_, idx) => idx === existingIdx);
      if (existing && note.content.length > (existing.content || '').length) {
        // Replace with better version
        const resultIdx = result.findIndex(n => normalizeTitle(n.title) === normalized);
        if (resultIdx !== -1) {
          result[resultIdx] = note;
        }
      }
    }
  }

  return result;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🧹 Grammar Notes Cleanup');
  console.log('='.repeat(50));
  console.log('');

  const changes: { level: string; lessonNumber: number; action: string; details: string }[] = [];
  let totalCleaned = 0;
  let totalReplaced = 0;
  let totalDeduplicated = 0;

  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`⚠️  Skipping ${level.toUpperCase()}: file not found`);
      continue;
    }

    console.log(`\n📚 Processing ${level.toUpperCase()}...`);
    const textbook: Textbook = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

    for (const chapter of textbook.chapters) {
      const originalNotes = chapter.grammarNotes || [];
      if (originalNotes.length === 0) continue;

      // Step 1: Improve/replace notes with issues
      const improvedNotes: GrammarNote[] = [];
      for (const note of originalNotes) {
        const wasProblematic = shouldUseStandardNote(note);
        const improved = improveNote(note);

        if (wasProblematic) {
          const hasStandard = getStandardNote(note.title) !== null;
          if (hasStandard) {
            totalReplaced++;
            changes.push({
              level,
              lessonNumber: chapter.lessonNumber,
              action: 'replaced',
              details: `"${note.title}" replaced with standard pedagogical content`,
            });
          } else {
            totalCleaned++;
            changes.push({
              level,
              lessonNumber: chapter.lessonNumber,
              action: 'cleaned',
              details: `"${note.title}" - PDF artifacts removed`,
            });
          }
        }

        improvedNotes.push(improved);
      }

      // Step 2: Deduplicate
      const deduped = deduplicateNotes(improvedNotes);
      const removedCount = improvedNotes.length - deduped.length;

      if (removedCount > 0) {
        totalDeduplicated += removedCount;
        changes.push({
          level,
          lessonNumber: chapter.lessonNumber,
          action: 'deduplicated',
          details: `Removed ${removedCount} duplicate note(s)`,
        });
      }

      chapter.grammarNotes = deduped;

      // Log lesson summary
      console.log(`   L${chapter.lessonNumber}: ${originalNotes.length} → ${deduped.length} notes`);
    }

    // Write updated file
    fs.writeFileSync(resolvedPath, JSON.stringify(textbook, null, 2), 'utf-8');
    console.log(`   ✅ Updated ${filePath}`);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 CLEANUP SUMMARY');
  console.log('='.repeat(50));
  console.log(`Notes replaced with standard content: ${totalReplaced}`);
  console.log(`Notes with PDF artifacts cleaned: ${totalCleaned}`);
  console.log(`Duplicate notes removed: ${totalDeduplicated}`);
  console.log(`Total changes: ${changes.length}`);

  // Print change log
  if (changes.length > 0) {
    console.log('\n📝 Change Log (first 20):');
    for (const change of changes.slice(0, 20)) {
      console.log(`   ${change.level.toUpperCase()} L${change.lessonNumber}: [${change.action}] ${change.details}`);
    }
    if (changes.length > 20) {
      console.log(`   ... and ${changes.length - 20} more changes`);
    }
  }

  // Write change log to file
  const logPath = path.resolve('data/curriculum/grammar-cleanup-log.json');
  fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      notesReplaced: totalReplaced,
      notesCleaned: totalCleaned,
      notesDeduplicated: totalDeduplicated,
      totalChanges: changes.length,
    },
    changes,
  }, null, 2), 'utf-8');
  console.log(`\n✅ Change log saved to: ${logPath}`);
}

main().catch(console.error);
