/**
 * Quality grammar content templates for A1 (Тешкото) level
 *
 * These templates provide substantive explanations and examples for A1 grammar topics.
 * Used to supplement extracted content that may be incomplete or missing.
 *
 * Each topic has:
 * - title: Topic name in Macedonian (with variants)
 * - explanation: 50-150 char English explanation of the grammar concept
 * - examples: 5-10 example sentences in Macedonian at A1 level
 */

export interface GrammarTemplate {
  title: string;
  titleVariants: string[]; // Alternative titles for matching
  explanation: string;
  examples: string[];
}

/**
 * A1 grammar content templates organized by topic
 */
export const A1_GRAMMAR_CONTENT: GrammarTemplate[] = [
  // 1. Verb "to be" - сум
  {
    title: 'Глаголот "сум" (To be)',
    titleVariants: ['глаголот сум', 'глаголот "сум"', 'to be', 'verb sum'],
    explanation:
      'Present tense conjugation of "to be" (сум). The verb changes form based on the subject pronoun. Used to express identity, origin, profession, and states.',
    examples: [
      'Јас сум студент.',
      'Ти си од Скопје.',
      'Тој е висок.',
      'Таа е учителка.',
      'Тоа е убаво.',
      'Ние сме пријатели.',
      'Вие сте од Англија.',
      'Тие се гладни.',
    ],
  },

  // 2. Possessive pronouns
  {
    title: 'Присвојни заменки (Possessive pronouns)',
    titleVariants: ['присвојни заменки', 'possessive pronouns', 'мој моја мое'],
    explanation:
      'Possessive pronouns in Macedonian agree in gender and number with the noun they modify, not the possessor. Three forms: masculine, feminine, neuter.',
    examples: [
      'Ова е мојот брат. (m)',
      'Ова е мојата сестра. (f)',
      'Ова е моето куче. (n)',
      'Твојот дом е голем.',
      'Нејзината книга е нова.',
      'Неговото име е Марко.',
      'Нашата куќа е стара.',
      'Вашиот автобус доаѓа.',
    ],
  },

  // 3. Prepositions
  {
    title: 'Предлози (Prepositions)',
    titleVariants: ['предлози', 'prepositions'],
    explanation:
      'Common Macedonian prepositions indicate location, direction, accompaniment, and relationships. Key prepositions: во (in), на (on), со (with), од (from), за (for), до (to).',
    examples: [
      'Јас живеам во Скопје.',
      'Книгата е на масата.',
      'Одам со пријател.',
      'Доаѓам од Охрид.',
      'Ова е за тебе.',
      'Одам до училиште.',
      'Седам кај прозорецот.',
      'Јас сум од Македонија.',
    ],
  },

  // 4. Singular and plural
  {
    title: 'Еднина и множина (Singular and plural)',
    titleVariants: ['еднина и множина', 'singular plural', 'еднина множина'],
    explanation:
      'Macedonian nouns change endings to form plurals. Common patterns: masculine -и/-ови, feminine -и, neuter -а. The plural depends on the noun gender and ending.',
    examples: [
      'маж → мажи',
      'жена → жени',
      'дете → деца',
      'книга → книги',
      'студент → студенти',
      'пријател → пријатели',
      'куќа → куќи',
      'село → села',
    ],
  },

  // 5. Numbers
  {
    title: 'Броеви (Numbers)',
    titleVariants: ['броеви', 'numbers', 'броеви (numbers)'],
    explanation:
      'Macedonian cardinal numbers 1-10. Numbers 1 (еден/една/едно) and 2 (два/две) have gender forms. Numbers 3-10 are invariable.',
    examples: [
      'еден човек / една жена / едно дете',
      'два брата / две сестри',
      'три книги',
      'четири маси',
      'пет студенти',
      'шест години',
      'седум дена',
      'осум часа',
      'девет месеци',
      'десет лекции',
    ],
  },

  // 6. Verb "to have" - има
  {
    title: 'Глаголот "има" (To have)',
    titleVariants: ['глаголот има', 'глаголот "има"', 'to have', 'verb ima'],
    explanation:
      'Present tense conjugation of "to have" (има). Regular -а verb conjugation pattern. Used for possession and existence (There is/are).',
    examples: [
      'Јас имам брат.',
      'Ти имаш куче.',
      'Тој има голема куќа.',
      'Таа има три деца.',
      'Ние имаме време.',
      'Вие имате прашање.',
      'Тие имаат многу пари.',
      'Има маса во собата.',
    ],
  },

  // 7. Demonstrative pronouns
  {
    title: 'Показни заменки (Demonstratives)',
    titleVariants: ['показни заменки', 'demonstratives', 'demonstrative pronouns'],
    explanation:
      'Macedonian demonstratives point to things: ова/овој/оваа (this, near), тоа/тој/таа (that, medium), она/оној/онаа (that over there, far). They agree in gender.',
    examples: [
      'Ова е мојата книга.',
      'Овој човек е мој пријател.',
      'Оваа жена е учителка.',
      'Тоа е интересно.',
      'Тој автобус оди до центар.',
      'Таа куќа е голема.',
      'Она село е далеку.',
      'Оној маж е мој татко.',
    ],
  },

  // 8. Adjectives
  {
    title: 'Придавки (Adjectives)',
    titleVariants: ['придавки', 'adjectives', 'придавка'],
    explanation:
      'Macedonian adjectives agree with nouns in gender, number, and definiteness. Three gender forms: -o/-ø (m), -a (f), -o (n). Definite forms add article suffix.',
    examples: [
      'голем маж / голема жена / големо дете',
      'убав ден / убава ноќ / убаво време',
      'нов дом / нова книга / ново село',
      'млад студент / млада студентка',
      'Куќата е голема.',
      'Денот е убав.',
      'Детето е мало.',
      'Студентите се млади.',
    ],
  },

  // 9. Nouns and gender
  {
    title: 'Именки (Nouns)',
    titleVariants: ['именки', 'nouns', 'именка'],
    explanation:
      'Macedonian nouns have three genders. Masculine: usually end in consonant. Feminine: usually end in -а. Neuter: usually end in -о or -е. Gender affects adjective and pronoun agreement.',
    examples: [
      'маж, брат, студент (masculine)',
      'жена, сестра, книга (feminine)',
      'дете, село, јајце (neuter)',
      'Тој е маж. (m)',
      'Таа е жена. (f)',
      'Тоа е дете. (n)',
      'Моето село е мало.',
      'Нејзината книга е нова.',
    ],
  },

  // 10. Personal pronouns
  {
    title: 'Заменки (Personal pronouns)',
    titleVariants: ['заменки', 'pronouns', 'personal pronouns', 'лични заменки'],
    explanation:
      'Macedonian personal pronouns: јас (I), ти (you sg.), тој/таа/тоа (he/she/it), ние (we), вие (you pl./formal), тие (they). Тој/таа/тоа match noun gender.',
    examples: [
      'Јас сум од Скопје.',
      'Ти си студент.',
      'Тој е мој брат.',
      'Таа е учителка.',
      'Тоа е моето куче.',
      'Ние сме пријатели.',
      'Вие сте од Англија.',
      'Тие се гладни.',
    ],
  },

  // 11. Verb "to speak" - зборува
  {
    title: 'Глаголот "зборува" (To speak)',
    titleVariants: ['глаголот зборув', 'глаголот зборува', 'глаголот "зборув"', 'to speak'],
    explanation:
      'Present tense conjugation of "to speak" (зборува). Regular -а verb pattern. Used to express language ability and verbal communication.',
    examples: [
      'Јас зборувам македонски.',
      'Ти зборуваш англиски.',
      'Тој зборува многу брзо.',
      'Таа зборува три јазици.',
      'Ние зборуваме за работата.',
      'Вие зборувате добро.',
      'Тие зборуваат тивко.',
      'Дали зборуваш германски?',
    ],
  },

  // 12. Verb "to eat" - јаде
  {
    title: 'Глаголот "јаде" (To eat)',
    titleVariants: ['глаголот јаде', 'глаголот "јаде"', 'to eat'],
    explanation:
      'Present tense conjugation of "to eat" (јаде). Regular -е verb pattern. The -е verbs use different endings: -м, -ш, -ø, -ме, -те, -ат.',
    examples: [
      'Јас јадам леб.',
      'Ти јадеш месо.',
      'Тој јаде појадок.',
      'Таа јаде салата.',
      'Ние јадеме ручек.',
      'Вие јадете вечера.',
      'Тие јадат пица.',
      'Што јадеш за појадок?',
    ],
  },

  // 13. Verb "to want" - сака
  {
    title: 'Глаголот "сака" (To want)',
    titleVariants: ['глаголот сака', 'глаголот "сака"', 'to want'],
    explanation:
      'Present tense conjugation of "to want/love" (сака). Regular -а verb pattern. Used to express desire, wants, and also love/affection.',
    examples: [
      'Јас сакам кафе.',
      'Ти сакаш сладолед.',
      'Тој сака да оди.',
      'Таа сака музика.',
      'Ние сакаме да учиме.',
      'Вие сакате да одите.',
      'Тие сакаат македонска храна.',
      'Дали сакаш да дојдеш?',
    ],
  },

  // 14. Verb conjugation (general patterns)
  {
    title: 'Глаголи (Verb conjugation)',
    titleVariants: ['глаголи', 'глагол', 'verbs', 'verb conjugation', 'сегашно време'],
    explanation:
      'Macedonian verbs conjugate for person and number in present tense. Two main groups: -а verbs (сакам, имам) and -е verbs (јадам). Endings differ by group.',
    examples: [
      'сакам → сакаш → сака → сакаме → сакате → сакаат',
      'имам → имаш → има → имаме → имате → имаат',
      'одам → одиш → оди → одиме → одите → одат',
      'јадам → јадеш → јаде → јадеме → јадете → јадат',
      'читам → читаш → чита → читаме → читате → читаат',
      'Јас работам секој ден.',
      'Тој живее во Скопје.',
      'Ние учиме македонски.',
    ],
  },

  // 15. Sentence structure
  {
    title: 'Реченична структура (Sentence structure)',
    titleVariants: ['реченична структура', 'sentence structure', 'ред на зборови'],
    explanation:
      'Macedonian basic sentence order is Subject-Verb-Object (SVO), similar to English. Questions often use "дали" or intonation. Word order is relatively flexible.',
    examples: [
      'Јас читам книга. (SVO)',
      'Дали читаш книга?',
      'Што правиш?',
      'Каде живееш?',
      'Кој е тој?',
      'Книгата е на масата.',
      'Утре одам на работа.',
      'Марија сака музика.',
    ],
  },
];

/**
 * Find a grammar template by matching title
 * @param title - The grammar topic title to search for
 * @returns The matching template or undefined
 */
export function findGrammarTemplate(title: string): GrammarTemplate | undefined {
  const normalizedTitle = title.toLowerCase().trim();

  // Try exact match first
  for (const template of A1_GRAMMAR_CONTENT) {
    if (template.title.toLowerCase() === normalizedTitle) {
      return template;
    }
  }

  // Try variant matches
  for (const template of A1_GRAMMAR_CONTENT) {
    for (const variant of template.titleVariants) {
      if (normalizedTitle.includes(variant) || variant.includes(normalizedTitle)) {
        return template;
      }
    }
  }

  // Try partial keyword match
  const keywords = normalizedTitle.split(/[\s()""]/);
  for (const template of A1_GRAMMAR_CONTENT) {
    const templateKeywords = template.title.toLowerCase().split(/[\s()""]/);
    const matchCount = keywords.filter((k) =>
      templateKeywords.some((tk) => tk.includes(k) || k.includes(tk))
    ).length;
    if (matchCount >= 2) {
      return template;
    }
  }

  return undefined;
}

// CLI: Print content summary when run directly
if (require.main === module) {
  console.log('='.repeat(60));
  console.log('A1 Grammar Content Templates');
  console.log('='.repeat(60));
  console.log();

  for (const template of A1_GRAMMAR_CONTENT) {
    console.log(`Topic: ${template.title}`);
    console.log(`  Explanation (${template.explanation.length} chars): ${template.explanation.substring(0, 80)}...`);
    console.log(`  Examples: ${template.examples.length}`);
    console.log();
  }

  console.log('Summary:');
  console.log(`  Total topics: ${A1_GRAMMAR_CONTENT.length}`);
  console.log(
    `  Topics with explanation >= 50 chars: ${A1_GRAMMAR_CONTENT.filter((t) => t.explanation.length >= 50).length}`
  );
  console.log(
    `  Topics with examples >= 3: ${A1_GRAMMAR_CONTENT.filter((t) => t.examples.length >= 3).length}`
  );
}
