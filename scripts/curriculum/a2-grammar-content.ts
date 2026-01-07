/**
 * Quality grammar content templates for A2 (Лозје) level
 *
 * These templates provide substantive explanations and examples for A2 grammar topics.
 * Used to supplement extracted content that may be incomplete or missing.
 *
 * A2 covers more advanced grammar than A1:
 * - Multiple verb tenses (present, future, imperfect, aorist, perfect, pluperfect, future-in-past)
 * - Three conditional types (real, unreal, possible)
 * - Object pronouns (long/short forms)
 * - Verbal forms (adjective, noun, adverb)
 * - Passive voice and reported speech
 *
 * Each topic has:
 * - title: Topic name in Macedonian (with variants)
 * - explanation: 50-150 char English explanation of the grammar concept
 * - examples: 5-10 example sentences in Macedonian at A2 level
 */

import type { GrammarTemplate } from './a1-grammar-content';

/**
 * A2 grammar content templates organized by topic
 * Maps to LESSON_GRAMMAR in parse-a2-structure.ts
 */
export const A2_GRAMMAR_CONTENT: GrammarTemplate[] = [
  // ============================================
  // LESSON 1: Present tense, articles, adjectives, questions
  // ============================================

  // 1. Present tense (Сегашно време)
  {
    title: 'Сегашно време (презент)',
    titleVariants: ['сегашно време', 'презент', 'present tense', 'сегашно'],
    explanation:
      'Present tense in Macedonian conjugates verbs by person and number. Two main verb groups: -а verbs (работа, чита) and -и verbs (зборува, учи). Used for current actions, habits, and general truths.',
    examples: [
      'Јас работам секој ден.',
      'Тој чита книга.',
      'Ние учиме македонски јазик.',
      'Дали ти зборуваш англиски?',
      'Тие живеат во Скопје.',
      'Таа готви вечера.',
      'Вие пишувате писмо.',
      'Децата играат во паркот.',
    ],
  },

  // 2. Definite articles (Членување)
  {
    title: 'Определеностa кај именките – членување',
    titleVariants: ['членување', 'определеност', 'definite article', 'член', 'определеностa'],
    explanation:
      'Macedonian uses suffix articles for definiteness: -от/-та/-то (singular) and -те (plural). The article attaches to the end of the noun or the first modifier. Three forms indicate proximity.',
    examples: [
      'книга → книгата (the book)',
      'маж → мажот (the man)',
      'дете → детето (the child)',
      'убавата жена (the beautiful woman)',
      'големиот град (the big city)',
      'новите студенти (the new students)',
      'Книгата е на масата.',
      'Човекот доаѓа утре.',
    ],
  },

  // 3. Geographical adjectives
  {
    title: 'Придавки од имиња на географски поими',
    titleVariants: ['географски придавки', 'geographical adjectives', 'придавки од географски'],
    explanation:
      'Adjectives derived from geographical names follow regular adjective patterns with -ски/-ска/-ско endings. They agree in gender with the noun they modify.',
    examples: [
      'Македонија → македонски, македонска, македонско',
      'Англија → англиски, англиска, англиско',
      'Европа → европски, европска, европско',
      'Јас сум од македонско потекло.',
      'Тој зборува англиски јазик.',
      'Ова е европска култура.',
      'Американски филм е на телевизија.',
      'Италијанската храна е вкусна.',
    ],
  },

  // 4. Questions
  {
    title: 'Прашални реченици',
    titleVariants: ['прашални реченици', 'questions', 'прашања'],
    explanation:
      'Questions in Macedonian use question words (што, кој, каде, кога, како, зошто, колку) or the particle "дали" for yes/no questions. Word order is flexible.',
    examples: [
      'Што правиш?',
      'Кој е тој човек?',
      'Каде живееш?',
      'Кога доаѓаш?',
      'Како си?',
      'Зошто учиш македонски?',
      'Колку чини ова?',
      'Дали зборуваш македонски?',
    ],
  },

  // ============================================
  // LESSON 2: Da-construction, ordinals, pronouns, future, adverbs, prepositions
  // ============================================

  // 5. Da-construction
  {
    title: 'Да-конструкција',
    titleVariants: ['да-конструкција', 'да конструкција', 'da-construction', 'да'],
    explanation:
      'The da-construction (да + present tense verb) replaces infinitives in Macedonian. Used after modal verbs, for purpose, desire, and indirect commands. Never use infinitives in spoken Macedonian.',
    examples: [
      'Сакам да одам на кино.',
      'Морам да работам утре.',
      'Можам да зборувам македонски.',
      'Тој сака да учи.',
      'Ние треба да купиме леб.',
      'Дали можеш да ми помогнеш?',
      'Таа оди да купи храна.',
      'Почнувам да разбирам.',
    ],
  },

  // 6. Ordinal numerals
  {
    title: 'Бројни придавки со редно значење',
    titleVariants: ['редни броеви', 'ordinal numerals', 'редни', 'бројни придавки'],
    explanation:
      'Ordinal numbers in Macedonian are adjectives and agree in gender with the noun. Formed by adding -в/-ва/-во (first), -ри/-ра/-ро (second), or -ти/-та/-то for larger numbers.',
    examples: [
      'прв, прва, прво (first)',
      'втор, втора, второ (second)',
      'трет, трета, трето (third)',
      'четврт, четврта, четврто (fourth)',
      'петти, петта, петто (fifth)',
      'Ова е првиот час.',
      'Живеам на третиот кат.',
      'Тоа е петтата лекција.',
    ],
  },

  // 7. Object pronouns (long and short forms)
  {
    title: 'Долги и кратки заменски форми за директен и за индиректен предмет',
    titleVariants: [
      'заменски форми',
      'object pronouns',
      'директен предмет',
      'индиректен предмет',
      'кратки форми',
      'долги форми',
    ],
    explanation:
      'Macedonian has two sets of object pronouns: long (emphatic) and short (clitic). Short forms are more common and attach to verbs. Direct: ме, те, го, ја, не, ве, ги. Indirect: ми, ти, му, ѝ, ни, ви, им.',
    examples: [
      'Тој ме гледа. (He sees me)',
      'Јас те сакам. (I love you)',
      'Таа го чита. (She reads it)',
      'Тој ми дава книга. (He gives me a book)',
      'Јас му кажувам. (I tell him)',
      'Мене ме гледа. (He sees ME)',
      'Тебе ти кажувам. (I tell YOU)',
      'Нему му давам. (I give to HIM)',
    ],
  },

  // 8. Future tense
  {
    title: 'Идно време (футур)',
    titleVariants: ['идно време', 'футур', 'future tense', 'ќе'],
    explanation:
      'Future tense is formed with the particle "ќе" + present tense verb. The particle remains unchanged for all persons. Used for future actions, predictions, and intentions.',
    examples: [
      'Јас ќе одам утре.',
      'Ти ќе учиш македонски.',
      'Тој ќе работи во понеделник.',
      'Ние ќе патуваме во Охрид.',
      'Вие ќе дојдете на забава?',
      'Тие ќе купат нова куќа.',
      'Ќе врне дожд утре.',
      'Дали ќе дојдеш?',
    ],
  },

  // 9. Adverbs
  {
    title: 'Прилози (адверби)',
    titleVariants: ['прилози', 'адверби', 'adverbs'],
    explanation:
      'Adverbs modify verbs, adjectives, or other adverbs. Types include manner (брзо, полека), time (сега, утре), place (тука, таму), and degree (многу, малку). Most are invariable.',
    examples: [
      'Тој работи брзо.',
      'Таа зборува полека.',
      'Ние живееме тука.',
      'Јас ќе дојдам утре.',
      'Тие многу учат.',
      'Детето малку јаде.',
      'Одете десно.',
      'Тој секогаш доаѓа рано.',
    ],
  },

  // 10. Prepositions
  {
    title: 'Предлози (препозиции)',
    titleVariants: ['предлози', 'препозиции', 'prepositions'],
    explanation:
      'Macedonian prepositions indicate spatial, temporal, and abstract relationships. Key prepositions: во (in), на (on/at), со (with), од (from), за (for), до (to/until), по (after/along).',
    examples: [
      'Јас сум во училиште.',
      'Книгата е на масата.',
      'Одам со пријател.',
      'Доаѓам од работа.',
      'Ова е за тебе.',
      'Одам до продавница.',
      'По часот одиме дома.',
      'Живеам покрај реката.',
    ],
  },

  // ============================================
  // LESSON 3: Imperative, L-form, conditional, modal expressions
  // ============================================

  // 11. Imperative
  {
    title: 'Заповеден начин (императив)',
    titleVariants: ['заповеден начин', 'императив', 'imperative'],
    explanation:
      'The imperative mood expresses commands, requests, and advice. Forms: 2nd singular (-ј/-и), 2nd plural (-јте/-ете), 1st plural (да + present). Negative imperative uses "не" or "немој(те)".',
    examples: [
      'Читај! (Read! - singular)',
      'Читајте! (Read! - plural/formal)',
      'Да одиме! (Let us go!)',
      'Седни! (Sit down!)',
      'Слушајте! (Listen!)',
      'Не зборувај! (Do not speak!)',
      'Немој да одиш! (Do not go!)',
      'Помогни ми! (Help me!)',
    ],
  },

  // 12. L-form (verbal adjective)
  {
    title: 'Глаголска л-форма',
    titleVariants: ['л-форма', 'глаголска л-форма', 'l-form', 'л форма'],
    explanation:
      'The L-form is the past participle used in compound tenses (perfect, pluperfect). Formed by adding -л/-ла/-ло/-ле to the verb stem. Agrees in gender and number with the subject.',
    examples: [
      'читал, читала, читало, читале (read)',
      'работел, работела, работело, работеле (worked)',
      'јадел, јадела, јадело, јаделе (ate)',
      'Тој е дојден. → дошол',
      'Таа имала убав ден.',
      'Ние сме биле тука.',
      'Детето спиело.',
      'Тие патувале на море.',
    ],
  },

  // 13. Conditional (possibility)
  {
    title: 'Можен начин (потенцијал)',
    titleVariants: ['можен начин', 'потенцијал', 'conditional', 'би'],
    explanation:
      'The potential mood (би + L-form) expresses hypothetical situations, wishes, and polite requests. The particle "би" is invariable and combines with the L-form of the verb.',
    examples: [
      'Би сакал да дојдам.',
      'Би сакала чаша вода.',
      'Би можеле да помогнеме.',
      'Што би правел ти?',
      'Тој би работел, но е болен.',
      'Би ви препорачал оваа книга.',
      'Дали би ми помогнал?',
      'Би било убаво да се видиме.',
    ],
  },

  // 14. Modal expressions
  {
    title: 'Модални зборови и изрази',
    titleVariants: ['модални зборови', 'modal expressions', 'модални изрази'],
    explanation:
      'Modal words express necessity (мора, треба), possibility (може), desire (сака), and ability (умее). They combine with da-constructions to express nuanced meanings.',
    examples: [
      'Морам да одам.',
      'Треба да учиш.',
      'Можам да помогнам.',
      'Сакам да јадам.',
      'Умеам да возам.',
      'Не смее да пуши тука.',
      'Вреди да се обидеш.',
      'Мора да се работи.',
    ],
  },

  // ============================================
  // LESSON 4: Imperfect, aorist, verbal adjective, sum-construction, verbal noun, indirect object, real conditional
  // ============================================

  // 15. Imperfect tense
  {
    title: 'Минато определено несвршено време (имперфект)',
    titleVariants: ['имперфект', 'минато несвршено', 'imperfect'],
    explanation:
      'The imperfect describes past ongoing, habitual, or repeated actions. Formed by adding imperfect endings to the verb stem. Emphasizes duration or repetition in the past.',
    examples: [
      'Јас читав книга. (I was reading)',
      'Тој работеше секој ден. (He used to work)',
      'Ние живеевме во Скопје. (We were living)',
      'Таа секогаш пееше. (She always sang)',
      'Тие одеа на училиште. (They went/were going)',
      'Додека јадев, ѕвонеше телефонот.',
      'Кога бев мал, сакав сладолед.',
      'Секое лето патувавме.',
    ],
  },

  // 16. Aorist tense
  {
    title: 'Минато определено свршено време (аорист)',
    titleVariants: ['аорист', 'минато свршено', 'aorist'],
    explanation:
      'The aorist describes completed past actions witnessed by the speaker. Formed with aorist endings. Used for single, completed events. Contrasts with imperfect (ongoing) and perfect (reported).',
    examples: [
      'Јас дојдов вчера. (I came yesterday)',
      'Тој купи нова кола. (He bought a new car)',
      'Ние видовме филм. (We saw a film)',
      'Таа отиде на работа. (She went to work)',
      'Тие испеаа песна. (They sang a song)',
      'Вчера паднав. (Yesterday I fell)',
      'Што рече? (What did you say?)',
      'Појдов рано наутро.',
    ],
  },

  // 17. Verbal adjective
  {
    title: 'Глаголска придавка',
    titleVariants: ['глаголска придавка', 'verbal adjective', 'придавка од глагол'],
    explanation:
      'Verbal adjectives are formed from verbs and function as adjectives. Two types: active (-чки from -е verbs) and passive (-н/-т). They agree with the noun in gender and number.',
    examples: [
      'читачки апарат (reading device)',
      'пишувачка машина (writing machine)',
      'прочитан роман (read novel)',
      'направена храна (prepared food)',
      'отворена врата (open door)',
      'затворена продавница (closed shop)',
      'испечен леб (baked bread)',
      'измиени садови (washed dishes)',
    ],
  },

  // 18. Sum-construction
  {
    title: 'Глаголска сум-конструкција',
    titleVariants: ['сум-конструкција', 'sum-construction', 'сум конструкција'],
    explanation:
      'The sum-construction (сум + passive participle) creates passive voice or describes states resulting from actions. The participle agrees with the subject in gender and number.',
    examples: [
      'Вратата е отворена. (The door is opened)',
      'Книгата е прочитана. (The book is read)',
      'Јадењето е подготвено. (The food is prepared)',
      'Писмото е напишано. (The letter is written)',
      'Собата е исчистена. (The room is cleaned)',
      'Работата е завршена. (The work is finished)',
      'Задачата е решена. (The task is solved)',
      'Билетите се купени. (The tickets are bought)',
    ],
  },

  // 19. Verbal noun
  {
    title: 'Глаголска именка',
    titleVariants: ['глаголска именка', 'verbal noun', 'именка од глагол'],
    explanation:
      'Verbal nouns are formed from verbs using the suffix -ње (or -ење/-ање). They function as nouns and can take articles. Used for actions as concepts or ongoing processes.',
    examples: [
      'чита → читање (reading)',
      'пишува → пишување (writing)',
      'учи → учење (learning)',
      'работи → работење (working)',
      'Читањето е важно. (Reading is important)',
      'Учењето бара време. (Learning takes time)',
      'Пливањето е забавно. (Swimming is fun)',
      'Готвењето е моето хоби. (Cooking is my hobby)',
    ],
  },

  // 20. Indirect object
  {
    title: 'Индиректен предмет',
    titleVariants: ['индиректен предмет', 'indirect object', 'дативна форма'],
    explanation:
      'The indirect object receives the action indirectly (to/for whom). In Macedonian, short dative pronouns (ми, ти, му, ѝ, ни, ви, им) are commonly used. Long forms add emphasis.',
    examples: [
      'Тој ми дава книга. (He gives me a book)',
      'Јас ти раскажувам приказна. (I tell you a story)',
      'Таа му пишува писмо. (She writes him a letter)',
      'Ние ѝ помагаме. (We help her)',
      'Дајте ми вода, ве молам.',
      'Кажи му ја вистината.',
      'На татко му се допаѓа.',
      'На децата им е студено.',
    ],
  },

  // 21. Real conditional
  {
    title: 'Реален услов',
    titleVariants: ['реален услов', 'real conditional', 'прва услов'],
    explanation:
      'Real conditional expresses likely or possible conditions using "ако" (if) + present/future. The condition is realistic and the result is probable if the condition is met.',
    examples: [
      'Ако учиш, ќе положиш.',
      'Ако имам време, ќе дојдам.',
      'Ако врне, ќе седиме дома.',
      'Ќе одиме на излет ако е убаво.',
      'Ако сакаш, можеш да дојдеш.',
      'Ако го видиш, кажи му.',
      'Ако не се грижиш, ќе пропаднеш.',
      'Ќе ти помогнам ако ми кажеш.',
    ],
  },

  // ============================================
  // LESSON 5: Perfect tense, adverbs, particles
  // ============================================

  // 22. Perfect tense
  {
    title: 'Минато неопределено време (перфект)',
    titleVariants: ['перфект', 'минато неопределено', 'perfect tense'],
    explanation:
      'The perfect tense (сум + L-form) describes past actions not witnessed by the speaker, or actions with present relevance. Common in storytelling, reports, and general statements about the past.',
    examples: [
      'Јас сум читал таа книга. (I have read)',
      'Тој е дошол од Охрид. (He has come)',
      'Ние сме биле тука. (We have been here)',
      'Таа е заминала вчера. (She has left)',
      'Тие се запознале лани. (They met last year)',
      'Се вели дека бил добар човек.',
      'Никогаш не сум патувал во Австралија.',
      'Дали си го видел тој филм?',
    ],
  },

  // 23. Adverbs (expanded)
  {
    title: 'Прилози (адверби)',
    titleVariants: ['прилози', 'адверби', 'adverbs'],
    explanation:
      'Adverbs modify verbs, adjectives, or other adverbs. Types include manner (брзо, полека), time (сега, утре), place (тука, таму), and degree (многу, малку). Most are invariable.',
    examples: [
      'Тој работи брзо. (quickly)',
      'Таа пее убаво. (beautifully)',
      'Јас секогаш доаѓам рано. (always, early)',
      'Ние живееме далеку. (far)',
      'Вие многу учите. (a lot)',
      'Тие малку спијат. (little)',
      'Денес е топло. (today, warm)',
      'Можеби ќе врне. (maybe)',
    ],
  },

  // 24. Particles
  {
    title: 'Честички (партикули)',
    titleVariants: ['честички', 'партикули', 'particles'],
    explanation:
      'Particles are small invariable words that modify meaning. Key particles: да (for da-construction), ќе (future), би (conditional), не (negation), ли (question), нека (let), дури/само (only).',
    examples: [
      'Сакам да одам. (да = to)',
      'Ќе дојдам утре. (ќе = will)',
      'Би сакал кафе. (би = would)',
      'Не сакам. (не = not)',
      'Дали доаѓаш? (дали = question)',
      'Нека дојде! (нека = let)',
      'Само ти можеш. (само = only)',
      'Дури и тој дојде. (дури и = even)',
    ],
  },

  // ============================================
  // LESSON 6: Future-in-past, unreal conditional, ima-construction, interjections
  // ============================================

  // 25. Future-in-past
  {
    title: 'Минато-идно време',
    titleVariants: ['минато-идно време', 'future in past', 'ќе + имперфект'],
    explanation:
      'Future-in-past (ќе + imperfect) expresses planned future actions from a past perspective. Used in reported speech and narratives to describe what was going to happen.',
    examples: [
      'Реков дека ќе дојдев.',
      'Мислеше дека ќе заминеше.',
      'Ветив дека ќе помогнев.',
      'Знаев дека ќе успеев.',
      'Се надевавме дека ќе врнеше.',
      'Таа рече дека ќе готвеше.',
      'Планиравме дека ќе патувавме.',
      'Беше јасно дека ќе доцнееше.',
    ],
  },

  // 26. Unreal conditional
  {
    title: 'Нереален услов',
    titleVariants: ['нереален услов', 'unreal conditional', 'втор услов'],
    explanation:
      'Unreal conditional expresses hypothetical or contrary-to-fact situations using "ако" + би + L-form in both clauses. Describes impossible or unlikely scenarios.',
    examples: [
      'Ако би имал пари, би купил куќа.',
      'Да бев тука, би помогнал.',
      'Ако би знаела, би ти кажала.',
      'Да можев, би дошол.',
      'Ако би бил поумен, би разбрал.',
      'Би патувал ако би имал време.',
      'Да имаше среќа, би победил.',
      'Ако не беше болен, би работел.',
    ],
  },

  // 27. Ima-construction
  {
    title: 'Глаголска има-конструкција',
    titleVariants: ['има-конструкција', 'ima-construction', 'има конструкција'],
    explanation:
      'The ima-construction (има + passive participle) creates perfect passive meaning, emphasizing completed state. Often interchangeable with sum-construction but adds nuance of completion.',
    examples: [
      'Има напишано писмо. (A letter has been written)',
      'Има направено грешка. (A mistake has been made)',
      'Има кажано многу работи. (Many things have been said)',
      'Има дојдено многу луѓе. (Many people have come)',
      'Има останато малку. (Little has remained)',
      'Нема купено ништо. (Nothing has been bought)',
      'Има приготвено храна. (Food has been prepared)',
      'Има изгубено време. (Time has been lost)',
    ],
  },

  // 28. Interjections
  {
    title: 'Извици (интерјекции)',
    titleVariants: ['извици', 'интерјекции', 'interjections'],
    explanation:
      'Interjections are exclamatory words expressing emotions. They stand alone or at the start of sentences. Common ones: ох/ах (surprise), еј (attention), море (emphatic), леле (surprise/dismay).',
    examples: [
      'Ох, колку е убаво!',
      'Ах, заборавив!',
      'Еј, дојди овде!',
      'Море, што правиш?',
      'Леле, што се случи!',
      'Ау, ме боли!',
      'Браво, одлично!',
      'Оф, уморен сум.',
    ],
  },

  // ============================================
  // LESSON 7: Possible conditional, verbal adverb, passive sentences
  // ============================================

  // 29. Possible conditional
  {
    title: 'Можен услов',
    titleVariants: ['можен услов', 'possible conditional', 'трет услов'],
    explanation:
      'Possible conditional expresses unlikely but theoretically possible conditions. Uses imperfect in the condition and би + L-form in the result. For hypothetical future scenarios.',
    examples: [
      'Ако дојдеше, би се радувал.',
      'Ако ме прашаа, би кажал.',
      'Ако врнеше, не би излегол.',
      'Ако добиев пари, би патувал.',
      'Да знаеше, би разбрал.',
      'Ако беше тука, би видел.',
      'Кога би можел, би ти помогнал.',
      'Ако сакаше, би успеал.',
    ],
  },

  // 30. Verbal adverb
  {
    title: 'Глаголски прилог',
    titleVariants: ['глаголски прилог', 'verbal adverb', 'герунд', 'прилог'],
    explanation:
      'The verbal adverb (formed with -јќи) describes an action simultaneous with the main verb. Equivalent to English "-ing" forms as adverbs. Invariable and modifies the main action.',
    examples: [
      'Читајќи, учам. (While reading, I learn)',
      'Одејќи, пееше. (While walking, he sang)',
      'Седејќи, работам. (While sitting, I work)',
      'Гледајќи ТВ, јадам. (While watching TV, I eat)',
      'Чекајќи, читав книга.',
      'Слушајќи музика, се релаксирам.',
      'Трчајќи, се задишав.',
      'Размислувајќи, одлучив.',
    ],
  },

  // 31. Passive sentences
  {
    title: 'Пасивни реченици',
    titleVariants: ['пасивни реченици', 'passive sentences', 'пасив'],
    explanation:
      'Passive voice in Macedonian is formed with "се" + active verb, or сум + passive participle. The subject receives the action. Agent can be introduced with "од" (by).',
    examples: [
      'Книгата се чита. (The book is being read)',
      'Домот е изграден. (The house is built)',
      'Писмото беше напишано од неа.',
      'Работата ќе се заврши утре.',
      'Храната се подготвува.',
      'Проблемот е решен.',
      'Вестите се објавуваат секој ден.',
      'Задачата беше завршена навреме.',
    ],
  },

  // ============================================
  // LESSON 8: Pluperfect, conjunctions, reported speech
  // ============================================

  // 32. Pluperfect
  {
    title: 'Предминато време (плусквамперфект)',
    titleVariants: ['плусквамперфект', 'предминато време', 'pluperfect'],
    explanation:
      'The pluperfect describes an action completed before another past action. Formed with imperfect of "сум" (бев, беше...) + L-form. Used to establish sequence of past events.',
    examples: [
      'Бев дошол пред тебе. (I had come before you)',
      'Беше заминала кога дојдов. (She had left when I came)',
      'Бевме јаделе пред да дојдеш.',
      'Тој беше читал таа книга.',
      'Тие беа пристигнале рано.',
      'Дали беше видел тоа?',
      'Веќе бев завршил работата.',
      'Кога дојде, веќе бевме заминале.',
    ],
  },

  // 33. Conjunctions
  {
    title: 'Сврзници (конјункции)',
    titleVariants: ['сврзници', 'конјункции', 'conjunctions'],
    explanation:
      'Conjunctions connect words, phrases, or clauses. Coordinating: и (and), а/но (but), или (or). Subordinating: дека/оти (that), ако (if), кога (when), затоа што (because).',
    examples: [
      'Јас и ти. (and)',
      'Сакам, но не можам. (but)',
      'Кафе или чај? (or)',
      'Знам дека доаѓа. (that)',
      'Ако врне, седам дома. (if)',
      'Кога дојде, ми кажа. (when)',
      'Не дојдов затоа што бев болен.',
      'Иако е тешко, ќе пробам. (although)',
    ],
  },

  // 34. Reported speech
  {
    title: 'Пресказ',
    titleVariants: ['пресказ', 'reported speech', 'индиректен говор'],
    explanation:
      'Reported speech conveys what someone said indirectly. In Macedonian, perfect tense often replaces aorist for hearsay. Verbs like "рече дека", "кажа дека" introduce reported clauses.',
    examples: [
      'Тој рече дека ќе дојде.',
      'Таа кажа дека е уморна.',
      'Велат дека бил добар човек.',
      'Слушнав дека заминале.',
      'Се вели дека е тешко.',
      'Мислев дека знаеш.',
      'Објасни ми дека не може.',
      'Пишува дека сите се добро.',
    ],
  },

  // 35. Negation patterns (supplementary - A2 level refinement)
  {
    title: 'Негација',
    titleVariants: ['негација', 'негирање', 'negation'],
    explanation:
      'Negation in Macedonian uses "не" before the verb. Double negatives are standard and required (никогаш не). "Нема" negates "има". Short pronoun forms come between "не" and the verb.',
    examples: [
      'Јас не сакам. (I do not want)',
      'Не го видов. (I did not see him)',
      'Никогаш не доаѓа. (He never comes)',
      'Нема никого. (There is nobody)',
      'Никој не знае. (Nobody knows)',
      'Ништо не се случи. (Nothing happened)',
      'Не ми се спие. (I do not feel like sleeping)',
      'Не можам да дојдам. (I cannot come)',
    ],
  },

  // 36. Nouns (supplementary - matches generic noun sections)
  {
    title: 'Именки (Nouns)',
    titleVariants: ['именки', 'именка', 'nouns', 'noun'],
    explanation:
      'Macedonian nouns have three genders (masculine, feminine, neuter) which affect article attachment, adjective agreement, and plural formation. Gender is typically predictable from noun endings.',
    examples: [
      'маж, град, студент (masculine - consonant ending)',
      'жена, книга, улица (feminine - -а ending)',
      'дете, село, јајце (neuter - -о/-е ending)',
      'маж → мажи (m. plural)',
      'жена → жени (f. plural)',
      'дете → деца (n. plural)',
      'Градот е голем. (m. definite)',
      'Книгата е интересна. (f. definite)',
    ],
  },
];

/**
 * Find an A2 grammar template by matching title
 * @param title - The grammar topic title to search for
 * @returns The matching template or undefined
 */
export function findA2GrammarTemplate(title: string): GrammarTemplate | undefined {
  const normalizedTitle = title.toLowerCase().trim();

  // Try exact match first
  for (const template of A2_GRAMMAR_CONTENT) {
    if (template.title.toLowerCase() === normalizedTitle) {
      return template;
    }
  }

  // Try variant matches
  for (const template of A2_GRAMMAR_CONTENT) {
    for (const variant of template.titleVariants) {
      if (normalizedTitle.includes(variant) || variant.includes(normalizedTitle)) {
        return template;
      }
    }
  }

  // Try partial keyword match
  const keywords = normalizedTitle.split(/[\s()""–-]/);
  for (const template of A2_GRAMMAR_CONTENT) {
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
  console.log('A2 Grammar Content Templates');
  console.log('='.repeat(60));
  console.log();

  for (const template of A2_GRAMMAR_CONTENT) {
    console.log(`Topic: ${template.title}`);
    console.log(
      `  Explanation (${template.explanation.length} chars): ${template.explanation.substring(0, 80)}...`
    );
    console.log(`  Examples: ${template.examples.length}`);
    console.log();
  }

  console.log('Summary:');
  console.log(`  Total topics: ${A2_GRAMMAR_CONTENT.length}`);
  console.log(
    `  Topics with explanation >= 50 chars: ${A2_GRAMMAR_CONTENT.filter((t) => t.explanation.length >= 50).length}`
  );
  console.log(
    `  Topics with examples >= 3: ${A2_GRAMMAR_CONTENT.filter((t) => t.examples.length >= 3).length}`
  );
}
