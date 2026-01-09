/**
 * Batch Seed Script: B1 Lessons (Златоврв)
 *
 * This script adds enhanced content (dialogues, exercises)
 * to all B1 lessons (1-8).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Types
// ============================================================================

interface DialogueLineData {
  speaker: string;
  textMk: string;
  textEn: string;
  transliteration: string;
}

interface DialogueData {
  title: string;
  lines: DialogueLineData[];
}

interface ExerciseData {
  type: 'multiple_choice' | 'fill_blank' | 'translation';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface LessonEnhancement {
  lessonId: string;
  dialogues: DialogueData[];
  exercises: ExerciseData[];
}

// ============================================================================
// B1 Lesson Content Data (Lessons 1-8)
// ============================================================================

interface LessonContentData {
  lessonNumber: number;
  dialogues: DialogueData[];
  exercises: ExerciseData[];
}

const B1_LESSON_CONTENT: LessonContentData[] = [
  // Lesson 1: Дали се разбираме? (Do we understand each other?)
  {
    lessonNumber: 1,
    dialogues: [{
      title: 'Недоразбирање (Misunderstanding)',
      lines: [
        { speaker: 'Марко', textMk: 'Извини, можеш ли да ми објасниш уште еднаш?', textEn: 'Sorry, can you explain to me once more?', transliteration: 'Izvini, mozhesh li da mi objashnish ushte ednash?' },
        { speaker: 'Ана', textMk: 'Секако. Кажав дека состанокот е преместен.', textEn: 'Of course. I said the meeting was moved.', transliteration: 'Sekako. Kazhav deka sostanokot e premesten.' },
        { speaker: 'Марко', textMk: 'А, јас разбрав дека е откажан!', textEn: 'Ah, I understood that it was cancelled!', transliteration: 'A, jas razbrav deka e otkzhan!' },
        { speaker: 'Ана', textMk: 'Не, не е откажан. Само е во друга сала.', textEn: 'No, it\'s not cancelled. It\'s just in a different room.', transliteration: 'Ne, ne e otkazhan. Samo e vo druga sala.' },
        { speaker: 'Марко', textMk: 'Сега разбирам. Извини за конфузијата.', textEn: 'Now I understand. Sorry for the confusion.', transliteration: 'Sega razbiram. Izvini za konfuzijata.' },
        { speaker: 'Ана', textMk: 'Нема проблем. Важно е да се разбереме.', textEn: 'No problem. The important thing is that we understand each other.', transliteration: 'Nema problem. Vazhno e da se razbereme.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "разбирам" mean?', options: ['I speak', 'I understand', 'I hear', 'I think'], correctAnswer: 'B', explanation: '"Разбирам" means "I understand" - the key concept of this lesson.' },
      { type: 'fill_blank', question: 'Важно е да се ___. (It\'s important that we understand each other.)', options: [], correctAnswer: 'разбереме', explanation: '"Разбереме" is the 1st person plural perfective form of "разбира".' },
      { type: 'translation', question: 'Translate: "Can you explain to me once more?"', options: [], correctAnswer: 'Можеш ли да ми објасниш уште еднаш?', explanation: '"Објасни" means "explain" and "уште еднаш" means "once more".' },
    ]
  },
];

// ============================================================================
// B1 Lesson Enhancements with IDs (Lessons 2-8)
// ============================================================================

const B1_ENHANCEMENTS: LessonEnhancement[] = [
  // Lesson 2: Има ли надеж? (Is there hope?)
  {
    lessonId: 'cmk48mwoq0048ss33lpiihlrf',
    dialogues: [{
      title: 'Разговор за иднината (Talking about the future)',
      lines: [
        { speaker: 'Марија', textMk: 'Што мислиш за иднината?', textEn: 'What do you think about the future?', transliteration: 'Shto mislish za idninata?' },
        { speaker: 'Петар', textMk: 'Искрено, малку сум загрижен.', textEn: 'Honestly, I\'m a bit worried.', transliteration: 'Iskreno, malku sum zagrizhen.' },
        { speaker: 'Марија', textMk: 'Зошто? Што те загрижува?', textEn: 'Why? What worries you?', transliteration: 'Zoshto? Shto te zagrizhuva?' },
        { speaker: 'Петар', textMk: 'Економијата, климатските промени...', textEn: 'The economy, climate change...', transliteration: 'Ekonomijata, klimatskite promeni...' },
        { speaker: 'Марија', textMk: 'Разбирам, но мора да имаме надеж.', textEn: 'I understand, but we must have hope.', transliteration: 'Razbiram, no mora da imame nadezh.' },
        { speaker: 'Петар', textMk: 'Имаш право. Оптимизмот е важен.', textEn: 'You\'re right. Optimism is important.', transliteration: 'Imash pravo. Optimizmot e vazhen.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "загрижен" mean?', options: ['happy', 'worried', 'tired', 'excited'], correctAnswer: 'B', explanation: '"Загрижен" means "worried" - from the verb "загрижува" (to worry).' },
      { type: 'fill_blank', question: 'Мора да ___ надеж. (We must have hope.)', options: [], correctAnswer: 'имаме', explanation: '"Мора да + verb" expresses obligation.' },
      { type: 'translation', question: 'Translate: "What do you think about the future?"', options: [], correctAnswer: 'Што мислиш за иднината?', explanation: '"Иднината" means "the future" with definite article.' },
    ]
  },

  // Lesson 3: Моето здравје (My health)
  {
    lessonId: 'cmk48mwpz004ass339vdiu63y',
    dialogues: [{
      title: 'Кај доктор (At the doctor)',
      lines: [
        { speaker: 'Доктор', textMk: 'Добар ден. Како се чувствувате?', textEn: 'Good day. How do you feel?', transliteration: 'Dobar den. Kako se chuvstvuvate?' },
        { speaker: 'Пациент', textMk: 'Не се чувствувам добро веќе неколку дена.', textEn: 'I haven\'t felt well for several days.', transliteration: 'Ne se chuvstvuvam dobro vekje nekolku dena.' },
        { speaker: 'Доктор', textMk: 'Какви симптоми имате?', textEn: 'What symptoms do you have?', transliteration: 'Kakvi simptomi imate?' },
        { speaker: 'Пациент', textMk: 'Имам висока температура и кашлица.', textEn: 'I have a high fever and a cough.', transliteration: 'Imam visoka temperatura i kashlica.' },
        { speaker: 'Доктор', textMk: 'Ќе ви препишам антибиотици. Треба да се одморите.', textEn: 'I\'ll prescribe antibiotics. You need to rest.', transliteration: 'Kje vi prepishaam antibiotici. Treba da se odmorite.' },
        { speaker: 'Пациент', textMk: 'Колку долго треба да ги земам?', textEn: 'How long should I take them?', transliteration: 'Kolku dolgo treba da gi zemam?' },
        { speaker: 'Доктор', textMk: 'Седум дена, по три пати дневно.', textEn: 'Seven days, three times daily.', transliteration: 'Sedum dena, po tri pati dnevno.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "препишам" mean?', options: ['write', 'prescribe', 'read', 'describe'], correctAnswer: 'B', explanation: '"Препишам" means "prescribe" in medical context.' },
      { type: 'fill_blank', question: 'Имам висока ___ и кашлица. (I have a high fever and a cough.)', options: [], correctAnswer: 'температура', explanation: '"Температура" means "temperature/fever".' },
      { type: 'translation', question: 'Translate: "You need to rest."', options: [], correctAnswer: 'Треба да се одморите.', explanation: '"Се одмора" is the reflexive verb "to rest".' },
    ]
  },

  // Lesson 4: Што (ќе) јадеме (денес)? (What will we eat today?)
  {
    lessonId: 'cmk48mwrg004css338fsw2hhk',
    dialogues: [{
      title: 'Во ресторан (At a restaurant)',
      lines: [
        { speaker: 'Келнер', textMk: 'Добредојдовте! Дали сте спремни да нарачате?', textEn: 'Welcome! Are you ready to order?', transliteration: 'Dobredojdovte! Dali ste spremni da narachate?' },
        { speaker: 'Гостин', textMk: 'Да, би сакал да пробам нешто традиционално.', textEn: 'Yes, I\'d like to try something traditional.', transliteration: 'Da, bi sakal da probam neshto tradicionalno.' },
        { speaker: 'Келнер', textMk: 'Ви препорачувам тавче гравче или турли тава.', textEn: 'I recommend tavche gravche or turli tava.', transliteration: 'Vi preporachuvam tavche gravche ili turli tava.' },
        { speaker: 'Гостин', textMk: 'Што е турли тава?', textEn: 'What is turli tava?', transliteration: 'Shto e turli tava?' },
        { speaker: 'Келнер', textMk: 'Тоа е јадење со месо и зеленчук печено во тава.', textEn: 'It\'s a dish with meat and vegetables baked in a pan.', transliteration: 'Toa e jadenje so meso i zelenchuk pecheno vo tava.' },
        { speaker: 'Гостин', textMk: 'Звучи одлично! Ќе го земам тоа.', textEn: 'Sounds great! I\'ll have that.', transliteration: 'Zvuchi odlichno! Kje go zemam toa.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "би сакал" mean?', options: ['I want', 'I would like', 'I need', 'I must'], correctAnswer: 'B', explanation: '"Би сакал" is the conditional "I would like" - more polite than "сакам".' },
      { type: 'fill_blank', question: 'Дали сте ___ да нарачате? (Are you ready to order?)', options: [], correctAnswer: 'спремни', explanation: '"Спремни" means "ready" (plural/formal).' },
      { type: 'translation', question: 'Translate: "I recommend tavche gravche."', options: [], correctAnswer: 'Ви препорачувам тавче гравче.', explanation: '"Препорачувам" means "I recommend".' },
    ]
  },

  // Lesson 5: Дајте музика! (Give us music!)
  {
    lessonId: 'cmk48mwsu004ess338kuf6see',
    dialogues: [{
      title: 'За музика (About music)',
      lines: [
        { speaker: 'Ана', textMk: 'Каква музика најмногу сакаш?', textEn: 'What kind of music do you like most?', transliteration: 'Kakva muzika najmnogu sakash?' },
        { speaker: 'Бојан', textMk: 'Јас обожавам народна музика.', textEn: 'I love folk music.', transliteration: 'Jas obozhavam narodna muzika.' },
        { speaker: 'Ана', textMk: 'Навистина? Зошто?', textEn: 'Really? Why?', transliteration: 'Navistina? Zoshto?' },
        { speaker: 'Бојан', textMk: 'Затоа што ме потсетува на детството.', textEn: 'Because it reminds me of my childhood.', transliteration: 'Zatoa shto me potsetuva na detstvoto.' },
        { speaker: 'Ана', textMk: 'Интересно! Јас повеќе слушам поп и рок.', textEn: 'Interesting! I listen more to pop and rock.', transliteration: 'Interesno! Jas povekje slusham pop i rok.' },
        { speaker: 'Бојан', textMk: 'Дали свириш некој инструмент?', textEn: 'Do you play any instrument?', transliteration: 'Dali svirish nekoj instrument?' },
        { speaker: 'Ана', textMk: 'Да, свирам пијано од мала.', textEn: 'Yes, I\'ve played piano since I was little.', transliteration: 'Da, sviram pijano od mala.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "обожавам" mean?', options: ['I like', 'I love/adore', 'I prefer', 'I listen to'], correctAnswer: 'B', explanation: '"Обожавам" means "I adore/love" - stronger than "сакам".' },
      { type: 'fill_blank', question: 'Ме ___ на детството. (It reminds me of my childhood.)', options: [], correctAnswer: 'потсетува', explanation: '"Потсетува" means "reminds".' },
      { type: 'translation', question: 'Translate: "I\'ve played piano since I was little."', options: [], correctAnswer: 'Свирам пијано од мала.', explanation: '"Од мала" literally means "since small" - since childhood.' },
    ]
  },

  // Lesson 6: Патуваме, сонуваме! (We travel, we dream!)
  {
    lessonId: 'cmk48mwua004gss33eu5mz00o',
    dialogues: [{
      title: 'Планирање патување (Planning a trip)',
      lines: [
        { speaker: 'Марко', textMk: 'Каде би сакал да патуваш?', textEn: 'Where would you like to travel?', transliteration: 'Kade bi sakal da patuvash?' },
        { speaker: 'Ивана', textMk: 'Сонувам да отидам во Јапонија.', textEn: 'I dream of going to Japan.', transliteration: 'Sonuvam da otidam vo Japonija.' },
        { speaker: 'Марко', textMk: 'Зошто баш Јапонија?', textEn: 'Why Japan specifically?', transliteration: 'Zoshto bash Japonija?' },
        { speaker: 'Ивана', textMk: 'Ме фасцинира нивната култура и храна.', textEn: 'I\'m fascinated by their culture and food.', transliteration: 'Me fascinira nivnata kultura i hrana.' },
        { speaker: 'Марко', textMk: 'А јас би сакал да ја видам Исланд.', textEn: 'And I\'d like to see Iceland.', transliteration: 'A jas bi sakal da ja vidam Island.' },
        { speaker: 'Ивана', textMk: 'Одличен избор! Северната светлина е прекрасна.', textEn: 'Excellent choice! The Northern Lights are beautiful.', transliteration: 'Odlichen izbor! Severnata svetlina e prekrasna.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "сонувам" mean?', options: ['I think', 'I dream', 'I plan', 'I want'], correctAnswer: 'B', explanation: '"Сонувам" means "I dream" - can be used for aspirations.' },
      { type: 'fill_blank', question: 'Ме ___ нивната култура. (I\'m fascinated by their culture.)', options: [], correctAnswer: 'фасцинира', explanation: '"Фасцинира" means "fascinates".' },
      { type: 'translation', question: 'Translate: "Where would you like to travel?"', options: [], correctAnswer: 'Каде би сакал да патуваш?', explanation: '"Би сакал да + verb" is the conditional for wishes.' },
    ]
  },

  // Lesson 7: Луѓето се луѓе (People are people)
  {
    lessonId: 'cmk48mwvj004iss33v06b3zxf',
    dialogues: [{
      title: 'За карактер (About character)',
      lines: [
        { speaker: 'Лена', textMk: 'Каков човек е твојот нов колега?', textEn: 'What kind of person is your new colleague?', transliteration: 'Kakov chovek e tvojot nov kolega?' },
        { speaker: 'Стефан', textMk: 'Многу е пријателски настроен и помага на сите.', textEn: 'He\'s very friendly and helps everyone.', transliteration: 'Mnogu e prijatelski nastroen i pomaga na site.' },
        { speaker: 'Лена', textMk: 'Тоа е убаво. А има ли некој недостаток?', textEn: 'That\'s nice. Does he have any flaws?', transliteration: 'Toa e ubavo. A ima li nekoj nedostatok?' },
        { speaker: 'Стефан', textMk: 'Понекогаш е премногу искрен.', textEn: 'Sometimes he\'s too honest.', transliteration: 'Ponekogash e premnogu iskren.' },
        { speaker: 'Лена', textMk: 'Искреноста е доблест, нели?', textEn: 'Honesty is a virtue, isn\'t it?', transliteration: 'Iskrenosta e doblest, neli?' },
        { speaker: 'Стефан', textMk: 'Да, но понекогаш треба да бидеш дипломатски.', textEn: 'Yes, but sometimes you need to be diplomatic.', transliteration: 'Da, no ponekogash treba da bidesh diplomatski.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "настроен" mean?', options: ['dressed', 'disposed/inclined', 'tired', 'confused'], correctAnswer: 'B', explanation: '"Настроен" means "disposed/inclined" - describes attitude.' },
      { type: 'fill_blank', question: 'Искреноста е ___. (Honesty is a virtue.)', options: [], correctAnswer: 'доблест', explanation: '"Доблест" means "virtue".' },
      { type: 'translation', question: 'Translate: "Sometimes he\'s too honest."', options: [], correctAnswer: 'Понекогаш е премногу искрен.', explanation: '"Премногу" means "too much".' },
    ]
  },

  // Lesson 8: Градска џунгла (Urban jungle)
  {
    lessonId: 'cmk48mwx5004kss33j1nufi0g',
    dialogues: [{
      title: 'Живот во град (City life)',
      lines: [
        { speaker: 'Ана', textMk: 'Дали ти се допаѓа животот во градот?', textEn: 'Do you like living in the city?', transliteration: 'Dali ti se dopagja zhivotot vo gradot?' },
        { speaker: 'Никола', textMk: 'Има и добри и лоши страни.', textEn: 'There are good and bad sides.', transliteration: 'Ima i dobri i loshi strani.' },
        { speaker: 'Ана', textMk: 'Кои се добрите?', textEn: 'What are the good ones?', transliteration: 'Koi se dobrite?' },
        { speaker: 'Никола', textMk: 'Културните настани, рестораните, работните можности.', textEn: 'Cultural events, restaurants, job opportunities.', transliteration: 'Kulturnite nastani, restoranite, rabotnite mozhnosti.' },
        { speaker: 'Ана', textMk: 'А лошите?', textEn: 'And the bad ones?', transliteration: 'A loshite?' },
        { speaker: 'Никола', textMk: 'Загадувањето, сообраќајот и високите цени.', textEn: 'Pollution, traffic, and high prices.', transliteration: 'Zagaduvanjeto, soobrakajot i visokite ceni.' },
        { speaker: 'Ана', textMk: 'Така е секаде во големите градови.', textEn: 'It\'s like that everywhere in big cities.', transliteration: 'Taka e sekade vo golemite gradovi.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "загадување" mean?', options: ['traffic', 'noise', 'pollution', 'crime'], correctAnswer: 'C', explanation: '"Загадување" means "pollution".' },
      { type: 'fill_blank', question: 'Има и добри и ___ страни. (There are good and bad sides.)', options: [], correctAnswer: 'лоши', explanation: '"Лоши" means "bad" (plural).' },
      { type: 'translation', question: 'Translate: "job opportunities"', options: [], correctAnswer: 'работни можности', explanation: '"Можности" means "opportunities/possibilities".' },
    ]
  },
];

// ============================================================================
// Seeding Function
// ============================================================================

async function seedLessonEnhancement(enhancement: LessonEnhancement) {
  const { lessonId, dialogues, exercises } = enhancement;

  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: lessonId },
    select: { id: true, title: true }
  });

  if (!lesson) {
    console.log(`  ⚠️  Lesson ${lessonId} not found, skipping...`);
    return false;
  }

  console.log(`  📝 ${lesson.title}`);

  // Clear existing dialogues and exercises
  await prisma.dialogueLine.deleteMany({ where: { dialogue: { lessonId } } });
  await prisma.dialogue.deleteMany({ where: { lessonId } });
  await prisma.exercise.deleteMany({ where: { lessonId } });

  // Add dialogues
  for (let i = 0; i < dialogues.length; i++) {
    const dialogue = dialogues[i];
    await prisma.dialogue.create({
      data: {
        lessonId,
        title: dialogue.title,
        orderIndex: i,
        lines: {
          create: dialogue.lines.map((line, index) => ({
            speaker: line.speaker,
            textMk: line.textMk,
            textEn: line.textEn,
            transliteration: line.transliteration,
            hasBlanks: false,
            orderIndex: index,
          })),
        },
      },
    });
  }
  console.log(`      ✓ ${dialogues.length} dialogue(s)`);

  // Add exercises
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    await prisma.exercise.create({
      data: {
        lessonId,
        type: ex.type,
        question: ex.question,
        options: ex.options.join('|'),
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        orderIndex: i,
      },
    });
  }
  console.log(`      ✓ ${exercises.length} exercise(s)`);

  return true;
}

// ============================================================================
// Seed by Lesson Number (for lessons without hardcoded IDs)
// ============================================================================

async function seedLessonByNumber(lessonContent: LessonContentData) {
  const { lessonNumber, dialogues, exercises } = lessonContent;

  // Find the B1 module
  const b1Module = await prisma.module.findFirst({
    where: { journeyId: 'ukim-b1' },
  });

  if (!b1Module) {
    console.log(`  ⚠️  B1 module not found, skipping Lesson ${lessonNumber}...`);
    return false;
  }

  // Find the lesson by module and order index
  const lesson = await prisma.curriculumLesson.findFirst({
    where: {
      moduleId: b1Module.id,
      orderIndex: lessonNumber,
    },
    select: { id: true, title: true },
  });

  if (!lesson) {
    console.log(`  ⚠️  B1 Lesson ${lessonNumber} not found, skipping...`);
    return false;
  }

  console.log(`  📝 ${lesson.title}`);

  // Clear existing dialogues and exercises
  await prisma.dialogueLine.deleteMany({ where: { dialogue: { lessonId: lesson.id } } });
  await prisma.dialogue.deleteMany({ where: { lessonId: lesson.id } });
  await prisma.exercise.deleteMany({ where: { lessonId: lesson.id } });

  // Add dialogues
  for (let i = 0; i < dialogues.length; i++) {
    const dialogue = dialogues[i];
    await prisma.dialogue.create({
      data: {
        lessonId: lesson.id,
        title: dialogue.title,
        orderIndex: i,
        lines: {
          create: dialogue.lines.map((line, index) => ({
            speaker: line.speaker,
            textMk: line.textMk,
            textEn: line.textEn,
            transliteration: line.transliteration,
            hasBlanks: false,
            orderIndex: index,
          })),
        },
      },
    });
  }
  console.log(`      ✓ ${dialogues.length} dialogue(s)`);

  // Add exercises
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    await prisma.exercise.create({
      data: {
        lessonId: lesson.id,
        type: ex.type,
        question: ex.question,
        options: ex.options.join('|'),
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        orderIndex: i,
      },
    });
  }
  console.log(`      ✓ ${exercises.length} exercise(s)`);

  return true;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('\n🌱 Seeding B1 Lessons (Златоврв)\n');
  console.log('=' .repeat(60));

  let success = 0;

  // Seed lessons using dynamic lookup (Lesson 1)
  console.log('\n📖 Seeding Lesson 1 (dynamic lookup)...\n');
  for (const content of B1_LESSON_CONTENT) {
    const result = await seedLessonByNumber(content);
    if (result) success++;
  }

  // Seed lessons using hardcoded IDs (Lessons 2-8)
  console.log('\n📖 Seeding Lessons 2-8 (hardcoded IDs)...\n');
  for (const enhancement of B1_ENHANCEMENTS) {
    const result = await seedLessonEnhancement(enhancement);
    if (result) success++;
  }

  const totalLessons = B1_LESSON_CONTENT.length + B1_ENHANCEMENTS.length;
  console.log('\n' + '=' .repeat(60));
  console.log(`\n🎉 Complete! ${success}/${totalLessons} B1 lessons enhanced.\n`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

