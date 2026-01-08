/**
 * Quality grammar content templates for B1 (Златоврв) level
 *
 * These templates provide substantive explanations and examples for B1 grammar topics.
 * Used to supplement extracted content that may be incomplete or missing.
 *
 * B1 covers advanced grammar beyond A2:
 * - Conditional mood (би particle)
 * - Advanced noun declension
 * - Adjective comparison
 * - Complex verb aspects and tenses
 * - Relative pronouns and clauses
 * - Passive voice constructions
 * - Reported speech
 * - Complex sentence structures
 *
 * Each topic has:
 * - title: Topic name in Macedonian (with variants)
 * - explanation: 100+ char English explanation of the grammar concept
 * - examples: 5-10 example sentences in Macedonian at B1 level
 */

import type { GrammarTemplate } from './a1-grammar-content';

/**
 * B1 grammar content templates organized by topic
 * Maps to B1-specific grammar needs in parse-b1-structure.ts
 */
export const B1_GRAMMAR_CONTENT: GrammarTemplate[] = [
  // ============================================
  // 1. Conditional mood (Условен начин) - Core B1 topic
  // ============================================
  {
    title: 'Условен начин (Conditional)',
    titleVariants: ['условен начин', 'conditional', 'би', 'потенцијал'],
    explanation:
      'The conditional mood in Macedonian uses the particle "би" + L-form to express hypothetical situations, polite requests, and wishes. Three types: real (possible), unreal (contrary to fact), and possible (unlikely but theoretically possible). Used for politeness, imagination, and expressing conditions.',
    examples: [
      'Би сакал да дојдам, но не можам.',
      'Би ли можеле да ми помогнете?',
      'Таа би студирала медицина, но не положи.',
      'Кога би имал пари, би патувал по светот.',
      'Би било убаво да се видиме.',
      'Што би правел на мое место?',
      'Би ја препорачал оваа книга.',
      'Би сакале да научите повеќе?',
      'Ако би знаел, би ти кажал.',
      'Тие би дошле ако би имале време.',
    ],
  },

  // ============================================
  // 2. Nouns - Advanced (Именки)
  // ============================================
  {
    title: 'Именки (Nouns)',
    titleVariants: ['именки', 'nouns', 'именка', 'именска деклинација'],
    explanation:
      'At B1 level, noun usage includes advanced declension patterns, vocative case for direct address, and complex plural formations. Macedonian nouns show gender through articles and agreement patterns. Special attention to irregular plurals and collective nouns.',
    examples: [
      'Татко! (vocative - direct address)',
      'Марија, дојди овде! (vocative)',
      'човек → луѓе (irregular plural)',
      'дете → деца (irregular plural)',
      'брат → браќа (collective)',
      'книга → книги → книгите (definite plural)',
      'Професоре, имам прашање.',
      'Децата играат во паркот.',
      'Браќата живеат заедно.',
      'Луѓето се добри.',
    ],
  },

  // ============================================
  // 3. Adjectives - Comparison (Придавки)
  // ============================================
  {
    title: 'Придавки (Adjectives)',
    titleVariants: ['придавки', 'adjectives', 'компарација', 'споредба'],
    explanation:
      'B1 adjectives include comparative and superlative forms. Comparatives use "по-" prefix (по-добар), superlatives use "нај-" (најдобар). Irregular forms exist (добар → подобар → најдобар). Adjectives agree in gender, number, and definiteness with modified nouns.',
    examples: [
      'добар → подобар → најдобар',
      'висок → повисок → највисок',
      'убав → поубав → најубав',
      'Оваа книга е поинтересна.',
      'Тој е најдобриот студент.',
      'Денес е потопло отколку вчера.',
      'Скопје е поголемо од Охрид.',
      'Ова е најважното прашање.',
      'Марија е помлада од Петар.',
      'Зимата е најстудениот период.',
    ],
  },

  // ============================================
  // 4. Verbs - Advanced aspects (Глаголи)
  // ============================================
  {
    title: 'Глаголи (Verbs)',
    titleVariants: ['глаголи', 'verbs', 'глаголски вид', 'аспект'],
    explanation:
      'B1 verbs focus on aspect (perfective vs. imperfective), complex tense usage, and verb derivation. Perfective verbs indicate completed actions (прочита), imperfective indicate ongoing/repeated actions (чита). Aspect affects tense formation and meaning. Important for expressing nuanced time relationships.',
    examples: [
      'чита (imperfective) → прочита (perfective)',
      'пишува → напишува (perfective)',
      'Јас читам книга. (ongoing)',
      'Јас ја прочитав книгата. (completed)',
      'Секој ден одев на работа. (repeated)',
      'Вчера отидов на концерт. (single event)',
      'Ќе читам цела недела.',
      'Ќе ја прочитам книгата до петок.',
      'Пишував кога ме прекина.',
      'Го напишав писмото веднаш.',
    ],
  },

  // ============================================
  // 5. Pronouns - Relative (Заменки)
  // ============================================
  {
    title: 'Заменки (Pronouns)',
    titleVariants: ['заменки', 'pronouns', 'релативни заменки', 'кој', 'што', 'каде'],
    explanation:
      'Relative pronouns connect clauses: кој/која/кое (who/which - for people/things), што (that/what), каде (where), кога (when), како (how). They introduce relative clauses that modify nouns or provide additional information. Gender and number agreement required.',
    examples: [
      'Човекот кој дојде е мој пријател.',
      'Жената која работи тука е учителка.',
      'Детето кое игра е мало.',
      'Книгата што ја читам е интересна.',
      'Градот каде живеам е голем.',
      'Денот кога дојде беше убав.',
      'Начинот како зборува е чуден.',
      'Оној што дојде прв победи.',
      'Сè што видов беше убаво.',
      'Луѓето кои учат напредуваат.',
    ],
  },

  // ============================================
  // 6. Numbers - Ordinal (Броеви)
  // ============================================
  {
    title: 'Броеви (Numbers)',
    titleVariants: ['броеви', 'numbers', 'редни броеви', 'ординални'],
    explanation:
      'B1 ordinal numbers function as adjectives: прв/втор/трет (first/second/third), четврт, петти, шести, etc. They agree in gender and number: прв/прва/прво. Used for dates, rankings, sequences, and ordering. Common in everyday B1-level communication.',
    examples: [
      'прв, прва, прво (first)',
      'втор, втора, второ (second)',
      'трет, трета, трето (third)',
      'четврт, четврта, четврто (fourth)',
      'Живеам на петтиот кат.',
      'Ова е втората лекција.',
      'Првиот ден беше тежок.',
      'Третата книга е најдобра.',
      'Дојдов на десеттото место.',
      'Вториот јануари е празник.',
    ],
  },

  // ============================================
  // 7. Complex sentences (Сложени реченици)
  // ============================================
  {
    title: 'Сложени реченици (Complex sentences)',
    titleVariants: ['сложени реченици', 'complex sentences', 'составени реченици'],
    explanation:
      'Complex sentences combine independent and dependent clauses using conjunctions: дека (that), додека (while), затоа што (because), иако (although), ако (if), кога (when). Subordinate clauses provide context, conditions, reasons, or contrasts. Essential for B1-level expression.',
    examples: [
      'Знам дека ќе дојде утре.',
      'Додека јас работев, тој спиеше.',
      'Не дојдов затоа што бев болен.',
      'Иако е тешко, ќе пробам.',
      'Ако врне, ќе седам дома.',
      'Кога дојде, ќе ти јавам.',
      'Мислам дека е вистина.',
      'Не можев да дојдам бидејќи работев.',
      'Останав дома додека тие патуваа.',
      'Ќе успеам ако работам напорно.',
    ],
  },

  // ============================================
  // 8. Relative clauses (Релативни реченици)
  // ============================================
  {
    title: 'Релативни реченици (Relative clauses)',
    titleVariants: ['релативни реченици', 'relative clauses', 'придавски реченици'],
    explanation:
      'Relative clauses modify nouns using relative pronouns (кој, која, кое, што, каде). They provide additional information: defining (essential) or non-defining (extra information). The relative pronoun agrees with the antecedent in gender and number.',
    examples: [
      'Студентот кој учи добро ќе положи.',
      'Книгата што ја читам е интересна.',
      'Куќата каде живеам е стара.',
      'Жената која работи тука е мојата сестра.',
      'Филмот што го гледавме беше одличен.',
      'Градот во кој се родив е мал.',
      'Пријателот со кого одов е весел.',
      'Денот кога те запознав беше убав.',
      'Причината поради која дојдов е важна.',
      'Местото каде се сретнавме е далеку.',
    ],
  },

  // ============================================
  // 9. Passive voice (Пасив)
  // ============================================
  {
    title: 'Пасив (Passive voice)',
    titleVariants: ['пасив', 'passive', 'пасивна конструкција', 'страдателна форма'],
    explanation:
      'Passive voice shifts focus from doer to action/recipient. Two main forms: "се" + active verb (Книгата се чита), or "е/беше" + passive participle (Книгата е прочитана). Agent can be expressed with "од" (by). Common in formal and written Macedonian.',
    examples: [
      'Книгата се чита лесно.',
      'Книгата е прочитана.',
      'Куќата беше изградена пред десет години.',
      'Писмото е напишано од Марија.',
      'Работата ќе биде завршена утре.',
      'Храната се подготвува во кујната.',
      'Задачата е решена.',
      'Филмот беше гледан од милиони луѓе.',
      'Новите закони се усвоени.',
      'Проблемот може да се реши.',
    ],
  },

  // ============================================
  // 10. Reported speech (Индиректен говор)
  // ============================================
  {
    title: 'Индиректен говор (Reported speech)',
    titleVariants: ['индиректен говор', 'reported speech', 'пресказ', 'неправ говор'],
    explanation:
      'Reported speech conveys what someone said without direct quotation. Uses "дека" (that) to introduce the reported clause. Verbs: рече дека, кажа дека, мисли дека, вели дека. Tense relationships differ from English - perfect often replaces aorist for hearsay.',
    examples: [
      'Тој рече дека ќе дојде.',
      'Таа кажа дека е уморна.',
      'Велат дека бил добар човек.',
      'Мислам дека е вистина.',
      'Слушнав дека заминале.',
      'Се вели дека е тешко.',
      'Ми објасни дека не може.',
      'Професорот рече дека имаме испит.',
      'Пишува дека ќе врне дожд.',
      'Вестите кажуваат дека има промени.',
    ],
  },

  // ============================================
  // 11. Prepositions - Advanced usage (Предлози)
  // ============================================
  {
    title: 'Предлози (Prepositions)',
    titleVariants: ['предлози', 'prepositions', 'препозиции'],
    explanation:
      'B1 prepositions include complex spatial and temporal relationships: покрај (beside/despite), помеѓу (between), против (against), според (according to), околу (around/about), без (without), заради (for the sake of). They govern noun phrases and create nuanced meaning.',
    examples: [
      'Седам покрај прозорецот.',
      'Помеѓу градовите има патот.',
      'Тој е против предлогот.',
      'Според мене, тоа е точно.',
      'Ќе се видиме околу пет часот.',
      'Без тебе не можам.',
      'Заради тебе дојдов.',
      'Покрај проблемите, успеавме.',
      'Помеѓу нас има разбирање.',
      'Се движи околу центарот.',
    ],
  },

  // ============================================
  // 12. Verb conjugation - Advanced patterns (Глаголи)
  // ============================================
  {
    title: 'Глаголска конјугација (Verb conjugation)',
    titleVariants: ['глаголска конјугација', 'verb conjugation', 'спрегување'],
    explanation:
      'B1 verb conjugation includes irregular verbs, aspectual pairs, and derived verbs with prefixes (раз-, на-, из-, по-, пре-). These prefixes change verb meaning and aspect. Understanding these patterns enables precise expression of actions.',
    examples: [
      'оди → раздои → доаѓа',
      'прави → направи (perfective)',
      'чита → прочита (perfective)',
      'пишува → напишува → препишува',
      'Разговарав со него. (discussed)',
      'Го дооформив текстот. (finalized)',
      'Ја предадов задачата. (handed in)',
      'Го извршив планот. (carried out)',
      'Се населија во Скопје. (settled)',
      'Ја подготвив вечерата. (prepared)',
    ],
  },

  // ============================================
  // 13. Modal expressions - Advanced (Модални изрази)
  // ============================================
  {
    title: 'Модални изрази (Modal expressions)',
    titleVariants: ['модални изрази', 'modal expressions', 'модалност'],
    explanation:
      'Advanced modal expressions convey necessity (мора/треба да), possibility (може да), ability (умее да), permission (смее да), and desire (сака да). Combined with conditional (би) for polite requests. Essential for nuanced B1 communication.',
    examples: [
      'Мора да се труди повеќе.',
      'Треба да учи редовно.',
      'Може да дојде доцна.',
      'Умее да плива одлично.',
      'Не смее да пуши тука.',
      'Сака да стане лекар.',
      'Би можеле да помогнете?',
      'Треба да се обидеме.',
      'Мора да заврши навреме.',
      'Може да се направи подобро.',
    ],
  },

  // ============================================
  // 14. Temporal expressions (Временски изрази)
  // ============================================
  {
    title: 'Временски изрази (Temporal expressions)',
    titleVariants: ['временски изрази', 'temporal expressions', 'време'],
    explanation:
      'B1 temporal expressions mark time relationships: пред (before), после (after), додека (while), откако (after), пред да (before), веднаш штом (as soon as). They coordinate actions in complex sentences and narratives.',
    examples: [
      'Дојдов пред да почне филмот.',
      'После работа одам дома.',
      'Додека јас работам, ти одмори.',
      'Откако дојде, ќе зборуваме.',
      'Веднаш штом чув, дојдов.',
      'Пред час беше тука.',
      'После неделава ќе патувам.',
      'Додека не дојдеш, ќе чекам.',
      'Пред да заминам, ќе ти јавам.',
      'Веднаш по завршувањето, почнав работа.',
    ],
  },

  // ============================================
  // 15. Conjunctions - Advanced (Сврзници)
  // ============================================
  {
    title: 'Сврзници (Conjunctions)',
    titleVariants: ['сврзници', 'conjunctions', 'конјункции'],
    explanation:
      'Advanced conjunctions connect clauses with complex relationships: иако (although), додека (while), затоа што/бидејќи (because), за да (in order to), освен ако (unless), сè додека (as long as). Essential for sophisticated B1 expression.',
    examples: [
      'Иако е тешко, продолжувам.',
      'Додека имам сила, ќе работам.',
      'Не дојдов затоа што бев болен.',
      'Учам за да успеам.',
      'Освен ако не врне, ќе одиме.',
      'Сè додека учиш, ќе напредуваш.',
      'Иако е млад, е искусен.',
      'Останав бидејќи немав превоз.',
      'Работам за да заработам пари.',
      'Нема да дојдам освен ако не мора.',
    ],
  },
];

/**
 * Find a B1 grammar template by matching title
 * @param title - The grammar topic title to search for
 * @returns The matching template or undefined
 */
export function findB1GrammarTemplate(title: string): GrammarTemplate | undefined {
  const normalizedTitle = title.toLowerCase().trim();

  // Try exact match first
  for (const template of B1_GRAMMAR_CONTENT) {
    if (template.title.toLowerCase() === normalizedTitle) {
      return template;
    }
  }

  // Try variant matches
  for (const template of B1_GRAMMAR_CONTENT) {
    for (const variant of template.titleVariants) {
      if (normalizedTitle.includes(variant) || variant.includes(normalizedTitle)) {
        return template;
      }
    }
  }

  // Try partial keyword match
  const keywords = normalizedTitle.split(/[\s()""–-]/);
  for (const template of B1_GRAMMAR_CONTENT) {
    const templateKeywords = template.title.toLowerCase().split(/[\s()""–-]/);
    const matchCount = keywords.filter(
      (k) => k.length > 2 && templateKeywords.some((tk) => tk.includes(k) || k.includes(tk))
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
  console.log('B1 Grammar Content Templates');
  console.log('='.repeat(60));
  console.log();

  for (const template of B1_GRAMMAR_CONTENT) {
    console.log(`Topic: ${template.title}`);
    console.log(
      `  Explanation (${template.explanation.length} chars): ${template.explanation.substring(0, 80)}...`
    );
    console.log(`  Examples: ${template.examples.length}`);
    console.log();
  }

  console.log('Summary:');
  console.log(`  Total topics: ${B1_GRAMMAR_CONTENT.length}`);
  console.log(
    `  Topics with explanation >= 100 chars: ${B1_GRAMMAR_CONTENT.filter((t) => t.explanation.length >= 100).length}`
  );
  console.log(
    `  Topics with examples >= 5: ${B1_GRAMMAR_CONTENT.filter((t) => t.examples.length >= 5).length}`
  );
}
