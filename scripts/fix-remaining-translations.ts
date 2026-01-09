/**
 * Fix remaining empty translations and grammar titles
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Remaining vocabulary fixes
const vocabularyFixes: Record<string, string> = {
  'Црвената': 'the red (one, feminine)',
  'нашите': 'ours (plural)',
  'соседи': 'neighbors',
  'присвојни': 'possessive',
  'Зборувајте': 'speak (plural imperative)',
  'студентите': 'the students',
  'познати': 'famous/known',
  'Слушајте': 'listen (plural imperative)',
  'гласовите': 'the voices',
  'мобилни': 'mobile (plural)',
  'брои': 'counts',
  'крој': 'style/cut',
  'спои': 'joined/connected',
  'минусот': 'the minus/negative',
  'плусот': 'the plus/positive',
  'кабелот': 'the cable',
  'албум': 'album',
  'бој': 'battle/fight',
  'крои': 'cuts/sews',
  'спој': 'connection/joint',
  'Повели': 'here you go (informal)',
  'Фала': 'thanks (informal)',
  'Повелете': 'here you go (formal)',
  'банана': 'banana',
  'трети': 'third',
  'јаболкото': 'the apple',
  'кутијата': 'the box',
  'ред': 'row/order',
  'Вметни': 'insert',
  'испуштените': 'the omitted (ones)',
  'согласки': 'consonants',
  'Ванчо': 'Vancho (name)',
  'Наталија': 'Natalija (name)',
  'множински': 'plural (adjective)',
  'Составете': 'compose/create (plural imperative)',
  'сендви': 'sandwich (informal)',
  'весни': 'Vesna (name, plural form)',
  'антоними': 'antonyms',
  'седи': 'sits',
  'високи': 'tall (plural)',
  'германски': 'German',
  'Предавам': 'I teach',
  'кенд': 'weekend (informal)',
  'плани': 'plans',
  'слатки': 'sweet (plural)/sweets',
  'Неговите': 'his (plural)',
  'спротивно': 'opposite',
  'Марта': 'Marta (name)',
  'Соколова': 'Sokolova (surname)',
  'паузата': 'the break/pause',
  'уморна': 'tired (feminine)',
  'болна': 'sick (feminine)',
  'ситуација': 'situation',
  'сендвич': 'sandwich',
  'пинг': 'ping',
  'понг': 'pong',
  'неговите': 'his (plural)',
  'продаваат': 'they sell',
  'титули': 'titles',
  'првак': 'champion',
  'пиеше': 'was drinking',
  'ручаше': 'was having lunch',
  'носеше': 'was carrying/wearing',
  'земаше': 'was taking',
  'чинеше': 'was costing',
  'правеше': 'was doing/making',
  'испи': 'drank (up)',
  'облече': 'dressed/put on',
  'потроши': 'spent',
  'доцнам': 'I am late',
  'возам': 'I drive',
  'автобуска': 'bus (adjective)',
  'постојка': 'stop/station',
  'левата': 'the left',
  'Библиотеката': 'the library',
};

// Grammar note title fix
const grammarNoteTitleFixes: Record<string, string> = {
  'Глаголот патува': 'The verb "to travel" (Глаголот патува)',
};

async function main() {
  console.log('🔧 FIXING REMAINING TRANSLATIONS\n');
  
  // Fix vocabulary
  let vocabFixed = 0;
  for (const [mk, en] of Object.entries(vocabularyFixes)) {
    const result = await prisma.vocabularyItem.updateMany({
      where: { 
        macedonianText: mk,
        englishText: ''
      },
      data: { englishText: en }
    });
    if (result.count > 0) {
      console.log(`  ✅ ${mk} → ${en}`);
      vocabFixed += result.count;
    }
  }
  console.log(`\n  Fixed ${vocabFixed} vocabulary items`);
  
  // Fix grammar note titles
  let grammarFixed = 0;
  for (const [oldTitle, newTitle] of Object.entries(grammarNoteTitleFixes)) {
    const result = await prisma.grammarNote.updateMany({
      where: { title: oldTitle },
      data: { title: newTitle }
    });
    if (result.count > 0) {
      console.log(`  ✅ ${oldTitle} → ${newTitle}`);
      grammarFixed += result.count;
    }
  }
  console.log(`\n  Fixed ${grammarFixed} grammar note titles`);
  
  // Final check
  const remaining = await prisma.vocabularyItem.count({
    where: { englishText: '' }
  });
  console.log(`\n📊 Remaining empty translations: ${remaining}`);
  
  await prisma.$disconnect();
}

main();

