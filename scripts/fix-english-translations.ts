/**
 * Fix English Translations Audit Script
 * 
 * This script audits and fixes English translations across the app:
 * 1. Lesson summaries - make them natural English
 * 2. Empty vocabulary translations
 * 3. Grammar note titles - add English translations
 * 4. Remove PDF instruction artifacts from vocabulary
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// LESSON SUMMARY FIXES
// ============================================
const lessonSummaryFixes: Record<string, string> = {
  // A1 Lessons - Make summaries natural English only
  'Lesson 1: Јас и ти': 'Learn greetings, pronouns, and introducing yourself',
  'Lesson 2: Семејство': 'Learn family members and relationships',
  'Lesson 3: Прашуваме': 'Learn question words and asking questions',
  'Lesson 4: Околу нас': 'Learn prepositions and describing surroundings',
  'Lesson 5: Има...': 'Learn "there is/are" and existence expressions',
  'Lesson 6: Твојот дом': 'Learn rooms, furniture, and describing your home',
  'Lesson 7: Што прават луѓето?': 'Learn daily activities and routines',
  'Lesson 8: Јадење и пиење': 'Learn food, drinks, and ordering at restaurants',
  'Lesson 9: Дали...?': 'Learn yes/no questions and giving answers',
  'Lesson 10: Што купуваат луѓето?': 'Learn shopping vocabulary and transactions',
  'Lesson 11: Што се случува?': 'Learn present continuous and ongoing actions',
  'Lesson 12: Опишување луѓе': 'Learn adjectives for describing people',
  'Lesson 13: Колку чини?': 'Learn numbers, prices, and making purchases',
  'Lesson 14: Преку годината': 'Learn seasons, months, and time expressions',
  'Lesson 15: Во минатото 1': 'Learn basic past tense conjugations',
  'Lesson 16: Околу светот': 'Learn countries, nationalities, and geography',
  'Lesson 17: Во минатото 2': 'Learn more past tense forms and usage',
  'Lesson 18: Како да стигнеш таму?': 'Learn directions and navigation',
  'Lesson 19: Не смееш да го правиш тоа!': 'Learn modal verbs and expressing obligations',
  'Lesson 20: Тело': 'Learn body parts and health vocabulary',
  'Lesson 21: Добро, подобро, најдобро': 'Learn comparative and superlative forms',
  'Lesson 22: Слободно време': 'Learn hobbies and leisure activities',
  'Lesson 23: Идни планови': 'Learn future tense and making plans',
  'Lesson 24: Чувства': 'Learn emotions and expressing feelings',
  
  // A2 Lessons
  'Lesson 1: Кои сме – што сме': 'Learn identity, background, and self-description',
  'Lesson 2: Градот на мојата душа и душата на мојот град': 'Learn city vocabulary and describing places',
  'Lesson 3: Нејзиното височество – храната': 'Learn detailed food vocabulary and cuisine',
  'Lesson 4: Во светот на купувањето': 'Learn shopping conversations and retail vocabulary',
  'Lesson 5: Професијата – сон или реалност': 'Learn professions, careers, and work vocabulary',
  'Lesson 6: Светот на дланка': 'Learn technology and digital communication',
  'Lesson 7: Празнуваме, одбележуваме, честитаме, подаруваме...': 'Learn holidays, celebrations, and traditions',
  'Lesson 8: Најди време!': 'Learn time management and scheduling',
  
  // B1 Lessons
  'Lesson 1: Дали се разбираме?': 'Learn communication strategies and clarification',
  'Lesson 2: Има ли надеж?': 'Learn expressing hope, doubt, and future possibilities',
  'Lesson 3: Моето здравје': 'Learn medical vocabulary and health discussions',
  'Lesson 4: Што (ќе) јадеме (денес)?': 'Learn culinary discussions and food culture',
  'Lesson 5: Дајте музика!': 'Learn arts, music, and cultural vocabulary',
  'Lesson 6: Патуваме, сонуваме!': 'Learn travel stories and adventure vocabulary',
  'Lesson 7: Луѓето се луѓе': 'Learn character descriptions and human nature',
  'Lesson 8: Градска џунгла': 'Learn urban life and city challenges',
};

// ============================================
// VOCABULARY TRANSLATIONS TO FIX
// ============================================
const vocabularyFixes: Record<string, string> = {
  // Common words with empty translations
  'село': 'village',
  'учили': 'studied (past)',
  'списание': 'magazine',
  'видеоигри': 'video games',
  'филмови': 'movies',
  'сок': 'juice',
  'чаша': 'cup/glass',
  'свет': 'world',
  'цел': 'goal/whole',
  'допаѓа': 'pleases (to like)',
  'Обично': 'usually',
  'ручек': 'lunch',
  'работи': 'works/things',
  'гледа': 'watches/sees',
  'телевизија': 'television',
  'чита': 'reads',
  'хотел': 'hotel',
  'зборувам': 'I speak',
  'молам': 'please/I request',
  'прават': 'they do/make',
  'кого': 'whom',
  'обично': 'usually',
  'гледаш': 'you watch/see',
  'шолја': 'cup (for coffee)',
  'држење': 'holding/behavior',
  'глаголи': 'verbs',
  'Играме': 'we play',
  'пуши': 'smokes',
  'слуша': 'listens',
  'крајот': 'the end',
  'почна': 'began',
  'свиреше': 'was playing (music)',
  'напиша': 'wrote',
  'Потсети': 'remind',
  'гледаше': 'was watching',
  'Тест': 'test',
  'помнење': 'memory/remembering',
  'јадеше': 'was eating',
  'Високи': 'tall (plural)',
  'однос': 'relationship',
  'хотелска': 'hotel (adjective)',
  'победи': 'victories/wins',
  'носам': 'I carry/wear',
  'играме': 'we play',
  'почувствувате': 'you will feel',
  'хотели': 'hotels',
  'планирале': 'they had planned',
  'даден': 'given',
  'сојузник': 'ally',
  // Proper names - keep as is but mark as names
  'Училиштето': 'the school',
  'Марко': 'Marko (name)',
  'колата': 'the car',
  'Ангела': 'Angela (name)',
  'Мирјана': 'Mirjana (name)',
  'Владимир': 'Vladimir (name)',
  'Марјан': 'Marjan (name)',
  'Бети': 'Betty (name)',
  'Миле': 'Mile (name)',
  'Јоланда': 'Jolanda (name)',
  'Елена': 'Elena (name)',
};

// ============================================
// GRAMMAR NOTE TITLE TRANSLATIONS
// ============================================
const grammarNoteTitleFixes: Record<string, string> = {
  'Броеви': 'Numbers (Броеви)',
  'Глаголот "сум"': 'The verb "to be" (Глаголот "сум")',
  'Глаголот сум': 'The verb "to be" (Глаголот сум)',
  'Предлози': 'Prepositions (Предлози)',
  'Придавки': 'Adjectives (Придавки)',
  'Еднина и множина': 'Singular and Plural (Еднина и множина)',
  'Глаголот "зборув"': 'The verb "to speak" (Глаголот "зборува")',
  'Глаголот јаде': 'The verb "to eat" (Глаголот јаде)',
  'Именки': 'Nouns (Именки)',
  'Заменки': 'Pronouns (Заменки)',
  'Сегашно време (презент)': 'Present Tense (Сегашно време)',
  'Определеностa кај именките – членување': 'Definite Articles (Определеност)',
  'Придавки од имиња на географски поими': 'Adjectives from Geographic Names',
  'Прашални реченици': 'Question Sentences (Прашални реченици)',
  'Да-конструкција': 'Da-construction (Да-конструкција)',
  'Бројни придавки со редно значење': 'Ordinal Numbers (Бројни придавки)',
  'Долги и кратки заменски форми за директен и за индиректен предмет': 'Long and Short Pronoun Forms',
  'Идно време (футур)': 'Future Tense (Идно време)',
  'Прилози (адверби)': 'Adverbs (Прилози)',
  'Предлози (препозиции)': 'Prepositions (Предлози)',
  'Заповеден начин (императив)': 'Imperative Mood (Заповеден начин)',
  'Глаголска л-форма': 'L-form of Verbs (Глаголска л-форма)',
  'Можен начин (потенцијал)': 'Potential Mood (Можен начин)',
  'Модални зборови и изрази': 'Modal Words and Expressions',
  'Минато определено несвршено време (имперфект)': 'Past Imperfect Tense (Имперфект)',
  'Минато определено свршено време (аорист)': 'Past Perfect/Aorist Tense (Аорист)',
  'Глаголска придавка': 'Verbal Adjective (Глаголска придавка)',
  'Глаголска сум-конструкција': 'Sum-construction (Глаголска сум-конструкција)',
  'Глаголска именка': 'Verbal Noun (Глаголска именка)',
  'Индиректен предмет': 'Indirect Object (Индиректен предмет)',
  'Реален услов': 'Real Conditional (Реален услов)',
  'Глаголот што': 'The verb "what" (Глаголот што)',
  'Минато неопределено време (перфект)': 'Perfect Tense (Перфект)',
  'Честички (партикули)': 'Particles (Честички)',
  'Минато-идно време': 'Past-Future Tense (Минато-идно време)',
  'Нереален услов': 'Unreal Conditional (Нереален услов)',
  'Глаголска има-конструкција': 'Ima-construction (Глаголска има-конструкција)',
  'Извици (интерјекции)': 'Interjections (Извици)',
  'Можен услов': 'Potential Conditional (Можен услов)',
  'Глаголски прилог': 'Verbal Adverb (Глаголски прилог)',
  'Пасивни реченици': 'Passive Sentences (Пасивни реченици)',
  'Предминато време (плусквамперфект)': 'Pluperfect Tense (Плусквамперфект)',
  'Сврзници (конјункции)': 'Conjunctions (Сврзници)',
  'Пресказ': 'Reported Speech (Пресказ)',
  'Глаголот честита': 'The verb "to congratulate"',
  'Глаголот ако': 'The conjunction "if" (ако)',
};

// ============================================
// PDF INSTRUCTION WORDS TO REMOVE FROM VOCABULARY
// ============================================
const instructionWordsToRemove = [
  'Напиши',
  'Пишувај', 
  'Пополни',
  'Пополнете',
  'Избери',
  'Направи',
  'Види',
  'Слушај',
  'Прочитај',
  'Преобразете',
  'Трансформирајте',
  'Поврзете',
  'Дополнете',
  'Наведете',
  'Обидете',
  'Разговарајте',
  'реченици', // "sentences" as instruction
  'вистинити', // "true" as instruction
  'празните', // "the empty ones" as instruction
  'места', // "places" as instruction (in context)
  'пасус', // "paragraph" as instruction
  'Белешки', // "notes" as instruction
];

async function fixLessonSummaries() {
  console.log('\n📝 FIXING LESSON SUMMARIES\n');
  
  let fixed = 0;
  for (const [title, newSummary] of Object.entries(lessonSummaryFixes)) {
    const result = await prisma.curriculumLesson.updateMany({
      where: { title },
      data: { summary: newSummary }
    });
    if (result.count > 0) {
      console.log(`  ✅ ${title} → "${newSummary}"`);
      fixed += result.count;
    }
  }
  
  console.log(`\n  Fixed ${fixed} lesson summaries`);
  return fixed;
}

async function fixEmptyVocabularyTranslations() {
  console.log('\n📚 FIXING EMPTY VOCABULARY TRANSLATIONS\n');
  
  let fixed = 0;
  
  // First fix known words
  for (const [mk, en] of Object.entries(vocabularyFixes)) {
    const result = await prisma.vocabularyItem.updateMany({
      where: { 
        macedonianText: mk,
        englishText: ''
      },
      data: { englishText: en }
    });
    if (result.count > 0) {
      console.log(`  ✅ ${mk} → ${en} (${result.count} items)`);
      fixed += result.count;
    }
  }
  
  // Check remaining empty translations
  const remaining = await prisma.vocabularyItem.findMany({
    where: { englishText: '' },
    select: { macedonianText: true },
    distinct: ['macedonianText']
  });
  
  if (remaining.length > 0) {
    console.log(`\n  ⚠️ ${remaining.length} words still have empty translations:`);
    remaining.slice(0, 20).forEach(v => console.log(`    - ${v.macedonianText}`));
    if (remaining.length > 20) {
      console.log(`    ... and ${remaining.length - 20} more`);
    }
  }
  
  console.log(`\n  Fixed ${fixed} vocabulary translations`);
  return fixed;
}

async function fixGrammarNoteTitles() {
  console.log('\n📖 FIXING GRAMMAR NOTE TITLES\n');
  
  let fixed = 0;
  for (const [oldTitle, newTitle] of Object.entries(grammarNoteTitleFixes)) {
    const result = await prisma.grammarNote.updateMany({
      where: { title: oldTitle },
      data: { title: newTitle }
    });
    if (result.count > 0) {
      console.log(`  ✅ ${oldTitle} → ${newTitle}`);
      fixed += result.count;
    }
  }
  
  console.log(`\n  Fixed ${fixed} grammar note titles`);
  return fixed;
}

async function removeInstructionVocabulary() {
  console.log('\n🗑️ REMOVING PDF INSTRUCTION ARTIFACTS FROM VOCABULARY\n');
  
  // First, let's check how many would be affected
  const toRemove = await prisma.vocabularyItem.findMany({
    where: {
      OR: instructionWordsToRemove.map(word => ({
        macedonianText: word
      }))
    },
    include: { lesson: { select: { title: true } } }
  });
  
  console.log(`  Found ${toRemove.length} instruction words in vocabulary`);
  
  // Group by lesson
  const byLesson: Record<string, string[]> = {};
  for (const v of toRemove) {
    if (!byLesson[v.lesson.title]) byLesson[v.lesson.title] = [];
    byLesson[v.lesson.title].push(v.macedonianText);
  }
  
  for (const [lesson, words] of Object.entries(byLesson)) {
    console.log(`  ${lesson}: ${words.join(', ')}`);
  }
  
  // Note: We're not deleting these as they might be valid vocabulary
  // Just flagging them for manual review
  console.log('\n  ⚠️ These are flagged for review - not automatically deleted');
  console.log('  Some may be valid vocabulary (e.g., "реченици" = sentences)');
  
  return toRemove.length;
}

async function auditReport() {
  console.log('\n📊 FINAL AUDIT REPORT\n');
  
  // Check remaining issues
  const emptyVocab = await prisma.vocabularyItem.count({
    where: { englishText: '' }
  });
  
  const totalVocab = await prisma.vocabularyItem.count();
  
  const lessons = await prisma.curriculumLesson.findMany({
    select: { title: true, summary: true }
  });
  
  const grammarNotes = await prisma.grammarNote.findMany({
    distinct: ['title'],
    select: { title: true }
  });
  
  console.log(`  Vocabulary:`);
  console.log(`    - Total items: ${totalVocab}`);
  console.log(`    - Empty translations: ${emptyVocab} (${((emptyVocab/totalVocab)*100).toFixed(1)}%)`);
  console.log(`\n  Lessons: ${lessons.length}`);
  console.log(`\n  Grammar notes: ${grammarNotes.length} unique titles`);
  
  // Check for Macedonian-only titles
  const mkOnlyTitles = grammarNotes.filter(g => 
    /^[а-яА-ЯЃѓЅѕЈјЉљЊњЌќЏџ\s\-–"„""']+$/.test(g.title)
  );
  
  if (mkOnlyTitles.length > 0) {
    console.log(`\n  ⚠️ ${mkOnlyTitles.length} grammar notes still have Macedonian-only titles`);
  }
}

async function main() {
  console.log('🔧 ENGLISH TRANSLATION FIX SCRIPT\n');
  console.log('='.repeat(60));
  
  try {
    await fixLessonSummaries();
    await fixEmptyVocabularyTranslations();
    await fixGrammarNoteTitles();
    await removeInstructionVocabulary();
    await auditReport();
    
    console.log('\n✅ Translation fixes complete!\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

