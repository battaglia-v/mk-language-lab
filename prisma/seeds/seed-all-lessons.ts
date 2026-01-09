/**
 * Batch Seed Script: All A1 and A2 Lessons
 * 
 * This script adds enhanced content (dialogues, exercises, example sentences)
 * to all A1 (Тешкото) and A2 (Лозје) lessons.
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
// A1 Lesson Enhancements (Lessons 3-24)
// ============================================================================

const A1_ENHANCEMENTS: LessonEnhancement[] = [
  // Lesson 3: Прашуваме (Asking questions)
  {
    lessonId: 'cmk48ms09000css33nqh19fmw',
    dialogues: [{
      title: 'Во кафуле (At the café)',
      lines: [
        { speaker: 'Келнер', textMk: 'Добар ден! Што сакате?', textEn: 'Good day! What would you like?', transliteration: 'Dobar den! Shto sakate?' },
        { speaker: 'Марија', textMk: 'Едно кафе, ве молам.', textEn: 'One coffee, please.', transliteration: 'Edno kafe, ve molam.' },
        { speaker: 'Келнер', textMk: 'Со шеќер или без?', textEn: 'With sugar or without?', transliteration: 'So shekjer ili bez?' },
        { speaker: 'Марија', textMk: 'Без шеќер, благодарам.', textEn: 'Without sugar, thank you.', transliteration: 'Bez shekjer, blagodaram.' },
        { speaker: 'Келнер', textMk: 'Нешто друго?', textEn: 'Anything else?', transliteration: 'Neshto drugo?' },
        { speaker: 'Марија', textMk: 'Не, тоа е сè. Колку чини?', textEn: 'No, that\'s all. How much is it?', transliteration: 'Ne, toa e sè. Kolku chini?' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "Што сакате?" mean?', options: ['Where are you?', 'What would you like?', 'How are you?', 'Who are you?'], correctAnswer: 'B', explanation: '"Што сакате?" means "What would you like?" - a polite way to ask what someone wants.' },
      { type: 'fill_blank', question: 'Едно кафе, ве ___. (One coffee, ___.)', options: [], correctAnswer: 'молам', explanation: '"Ве молам" means "please" in formal speech.' },
      { type: 'translation', question: 'Translate: "How much is it?"', options: [], correctAnswer: 'Колку чини?', explanation: '"Колку" means "how much" and "чини" means "costs".' },
    ]
  },

  // Lesson 4: Околу нас (Around us)
  {
    lessonId: 'cmk48ms55000gss337tk9bl2q',
    dialogues: [{
      title: 'Во паркот (In the park)',
      lines: [
        { speaker: 'Ана', textMk: 'Погледни! Што има таму?', textEn: 'Look! What\'s there?', transliteration: 'Pogledni! Shto ima tamu?' },
        { speaker: 'Петар', textMk: 'Тоа е фонтана. Убава е, нели?', textEn: 'That\'s a fountain. It\'s beautiful, isn\'t it?', transliteration: 'Toa e fontana. Ubava e, neli?' },
        { speaker: 'Ана', textMk: 'Да, многу убава! А што е до неа?', textEn: 'Yes, very beautiful! And what\'s next to it?', transliteration: 'Da, mnogu ubava! A shto e do nea?' },
        { speaker: 'Петар', textMk: 'Тоа е споменик. Стар е 100 години.', textEn: 'That\'s a monument. It\'s 100 years old.', transliteration: 'Toa e spomenik. Star e 100 godini.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "Погледни!" mean?', options: ['Listen!', 'Look!', 'Wait!', 'Come!'], correctAnswer: 'B', explanation: '"Погледни" is the imperative form of "гледа" (to look).' },
      { type: 'fill_blank', question: 'Тоа е ___. (That is a fountain.)', options: [], correctAnswer: 'фонтана', explanation: '"Фонтана" means "fountain".' },
      { type: 'multiple_choice', question: 'How do you say "next to it" in Macedonian?', options: ['до неа', 'пред неа', 'зад неа', 'над неа'], correctAnswer: 'A', explanation: '"До" means "next to" or "beside".' },
    ]
  },

  // Lesson 5: Има... (There is...)
  {
    lessonId: 'cmk48msaq000kss33jem9eev1',
    dialogues: [{
      title: 'Во собата (In the room)',
      lines: [
        { speaker: 'Мама', textMk: 'Што има во твојата соба?', textEn: 'What\'s in your room?', transliteration: 'Shto ima vo tvojata soba?' },
        { speaker: 'Дете', textMk: 'Има кревет, маса и столица.', textEn: 'There\'s a bed, table, and chair.', transliteration: 'Ima krevet, masa i stolica.' },
        { speaker: 'Мама', textMk: 'А дали има компјутер?', textEn: 'And is there a computer?', transliteration: 'A dali ima kompjuter?' },
        { speaker: 'Дете', textMk: 'Да, има! На масата е.', textEn: 'Yes, there is! It\'s on the table.', transliteration: 'Da, ima! Na masata e.' },
        { speaker: 'Мама', textMk: 'Нема книги?', textEn: 'There are no books?', transliteration: 'Nema knigi?' },
        { speaker: 'Дете', textMk: 'Има многу книги, на полицата се.', textEn: 'There are many books, they\'re on the shelf.', transliteration: 'Ima mnogu knigi, na policata se.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What is the negative form of "има"?', options: ['не има', 'нема', 'без', 'нели'], correctAnswer: 'B', explanation: '"Нема" is the negative form of "има" (there is/are).' },
      { type: 'fill_blank', question: '___ кревет во собата. (There is a bed in the room.)', options: [], correctAnswer: 'Има', explanation: '"Има" means "there is/there are".' },
      { type: 'translation', question: 'Translate: "There are many books."', options: [], correctAnswer: 'Има многу книги.', explanation: '"Многу" means "many" or "a lot".' },
    ]
  },

  // Lesson 6: Твојот дом (Your home)
  {
    lessonId: 'cmk48msfh000oss33u5ze8fds',
    dialogues: [{
      title: 'Нов стан (New apartment)',
      lines: [
        { speaker: 'Сара', textMk: 'Добредојде во мојот нов стан!', textEn: 'Welcome to my new apartment!', transliteration: 'Dobredojde vo mojot nov stan!' },
        { speaker: 'Лука', textMk: 'Вау! Колку соби има?', textEn: 'Wow! How many rooms are there?', transliteration: 'Vau! Kolku sobi ima?' },
        { speaker: 'Сара', textMk: 'Има три соби: дневна, спална и кујна.', textEn: 'There are three rooms: living room, bedroom, and kitchen.', transliteration: 'Ima tri sobi: dnevna, spalna i kujna.' },
        { speaker: 'Лука', textMk: 'А бања има ли?', textEn: 'And is there a bathroom?', transliteration: 'A banja ima li?' },
        { speaker: 'Сара', textMk: 'Секако! Таму е, до спалната.', textEn: 'Of course! It\'s there, next to the bedroom.', transliteration: 'Sekako! Tamu e, do spalnata.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "дневна" mean?', options: ['bedroom', 'kitchen', 'living room', 'bathroom'], correctAnswer: 'C', explanation: '"Дневна" (соба) means "living room" - the room for day activities.' },
      { type: 'fill_blank', question: 'Колку ___ има? (How many rooms are there?)', options: [], correctAnswer: 'соби', explanation: '"Соби" is the plural of "соба" (room).' },
      { type: 'translation', question: 'Translate: "Welcome to my home!"', options: [], correctAnswer: 'Добредојде во мојот дом!', explanation: '"Добредојде" is the welcome greeting.' },
    ]
  },

  // Lesson 7: Што прават луѓето? (What are people doing?)
  {
    lessonId: 'cmk48msk6000sss33a8i5vhts',
    dialogues: [{
      title: 'Во паркот (In the park)',
      lines: [
        { speaker: 'Марко', textMk: 'Погледни ги луѓето во паркот!', textEn: 'Look at the people in the park!', transliteration: 'Pogledni gi lugjeto vo parkot!' },
        { speaker: 'Ива', textMk: 'Да! Што прават?', textEn: 'Yes! What are they doing?', transliteration: 'Da! Shto pravat?' },
        { speaker: 'Марко', textMk: 'Децата играат фудбал.', textEn: 'The children are playing football.', transliteration: 'Decata igraat fudbal.' },
        { speaker: 'Ива', textMk: 'А оние таму?', textEn: 'And those over there?', transliteration: 'A onie tamu?' },
        { speaker: 'Марко', textMk: 'Тие трчаат. А жената чита книга.', textEn: 'They\'re running. And the woman is reading a book.', transliteration: 'Tie trchaat. A zhenata chita kniga.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "прават" mean?', options: ['are going', 'are doing', 'are eating', 'are sleeping'], correctAnswer: 'B', explanation: '"Прават" is the 3rd person plural of "правам" (to do/make).' },
      { type: 'fill_blank', question: 'Децата ___ фудбал. (The children are playing football.)', options: [], correctAnswer: 'играат', explanation: '"Играат" is the 3rd person plural of "игра" (to play).' },
      { type: 'translation', question: 'Translate: "The woman is reading a book."', options: [], correctAnswer: 'Жената чита книга.', explanation: '"Чита" means "reads/is reading".' },
    ]
  },

  // Lesson 8: Јадење и пиење (Food and drink)
  {
    lessonId: 'cmk48msnp000uss33enz5cgbf',
    dialogues: [{
      title: 'Во ресторан (In a restaurant)',
      lines: [
        { speaker: 'Келнер', textMk: 'Добар ден! Што ќе јадете денес?', textEn: 'Good day! What will you eat today?', transliteration: 'Dobar den! Shto kje jadete denes?' },
        { speaker: 'Гост', textMk: 'Ќе јадам салата и риба.', textEn: 'I\'ll have salad and fish.', transliteration: 'Kje jadam salata i riba.' },
        { speaker: 'Келнер', textMk: 'А за пиење?', textEn: 'And to drink?', transliteration: 'A za pienje?' },
        { speaker: 'Гост', textMk: 'Едно вино, црвено.', textEn: 'One wine, red.', transliteration: 'Edno vino, crveno.' },
        { speaker: 'Келнер', textMk: 'Одлично! Нешто друго?', textEn: 'Excellent! Anything else?', transliteration: 'Odlichno! Neshto drugo?' },
        { speaker: 'Гост', textMk: 'Десерт на крај, ве молам.', textEn: 'Dessert at the end, please.', transliteration: 'Desert na kraj, ve molam.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "јадете" mean?', options: ['you drink', 'you eat', 'you want', 'you order'], correctAnswer: 'B', explanation: '"Јадете" is the formal/plural "you eat" from "јадам" (to eat).' },
      { type: 'fill_blank', question: 'Ќе ___ салата и риба. (I\'ll have salad and fish.)', options: [], correctAnswer: 'јадам', explanation: '"Ќе јадам" is the future tense "I will eat".' },
      { type: 'translation', question: 'Translate: "And to drink?"', options: [], correctAnswer: 'А за пиење?', explanation: '"Пиење" is the noun form of "to drink".' },
    ]
  },

  // Lesson 9: Дали...? (Do...?)
  {
    lessonId: 'cmk48msr5000wss33hrqm0tw3',
    dialogues: [{
      title: 'Разговор за хоби (Talking about hobbies)',
      lines: [
        { speaker: 'Ана', textMk: 'Дали свириш некој инструмент?', textEn: 'Do you play any instrument?', transliteration: 'Dali svirish nekoj instrument?' },
        { speaker: 'Бојан', textMk: 'Да, свирам гитара. А ти?', textEn: 'Yes, I play guitar. And you?', transliteration: 'Da, sviram gitara. A ti?' },
        { speaker: 'Ана', textMk: 'Не свирам, но пеам.', textEn: 'I don\'t play, but I sing.', transliteration: 'Ne sviram, no peam.' },
        { speaker: 'Бојан', textMk: 'Дали пееш во хор?', textEn: 'Do you sing in a choir?', transliteration: 'Dali peesh vo hor?' },
        { speaker: 'Ана', textMk: 'Да, пеам во училишниот хор.', textEn: 'Yes, I sing in the school choir.', transliteration: 'Da, peam vo uchilishniot hor.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'How do you form yes/no questions in Macedonian?', options: ['Add "ли" at the end', 'Add "дали" at the beginning', 'Change word order', 'All of the above'], correctAnswer: 'D', explanation: 'Yes/no questions can use "дали" at the start, "ли" after the verb, or intonation.' },
      { type: 'fill_blank', question: '___ свириш некој инструмент? (Do you play any instrument?)', options: [], correctAnswer: 'Дали', explanation: '"Дали" is a question particle for yes/no questions.' },
      { type: 'translation', question: 'Translate: "I don\'t play, but I sing."', options: [], correctAnswer: 'Не свирам, но пеам.', explanation: '"Но" means "but" for contrast.' },
    ]
  },

  // Lesson 10: Што купуваат луѓето? (What do people buy?)
  {
    lessonId: 'cmk48msvb000yss33xm1n1rm3',
    dialogues: [{
      title: 'На пазар (At the market)',
      lines: [
        { speaker: 'Продавач', textMk: 'Добро утро! Што барате?', textEn: 'Good morning! What are you looking for?', transliteration: 'Dobro utro! Shto barate?' },
        { speaker: 'Купувач', textMk: 'Барам свежо овошје.', textEn: 'I\'m looking for fresh fruit.', transliteration: 'Baram svezho ovoshje.' },
        { speaker: 'Продавач', textMk: 'Имаме јаболки, портокали и банани.', textEn: 'We have apples, oranges, and bananas.', transliteration: 'Imame jabolki, portokali i banani.' },
        { speaker: 'Купувач', textMk: 'Колку чинат јаболките?', textEn: 'How much are the apples?', transliteration: 'Kolku chinat jabolkite?' },
        { speaker: 'Продавач', textMk: 'Педесет денари за килограм.', textEn: 'Fifty denars per kilogram.', transliteration: 'Pedeset denari za kilogram.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "барате" mean?', options: ['you buy', 'you sell', 'you look for', 'you want'], correctAnswer: 'C', explanation: '"Барам" means "I look for/search".' },
      { type: 'fill_blank', question: 'Колку ___ јаболките? (How much are the apples?)', options: [], correctAnswer: 'чинат', explanation: '"Чинат" is the plural form of "costs".' },
      { type: 'translation', question: 'Translate: "We have apples."', options: [], correctAnswer: 'Имаме јаболки.', explanation: '"Имаме" is "we have".' },
    ]
  },

  // Lesson 11: Што се случува? (What's happening?)
  {
    lessonId: 'cmk48msyz0010ss334bliw8jl',
    dialogues: [{
      title: 'На улица (On the street)',
      lines: [
        { speaker: 'Пешак', textMk: 'Што се случува таму?', textEn: 'What\'s happening there?', transliteration: 'Shto se sluchuva tamu?' },
        { speaker: 'Сосед', textMk: 'Има концерт на плоштадот.', textEn: 'There\'s a concert in the square.', transliteration: 'Ima koncert na ploshtadot.' },
        { speaker: 'Пешак', textMk: 'Кој пее?', textEn: 'Who\'s singing?', transliteration: 'Koj pee?' },
        { speaker: 'Сосед', textMk: 'Не знам, ама има многу луѓе.', textEn: 'I don\'t know, but there are many people.', transliteration: 'Ne znam, ama ima mnogu lugje.' },
        { speaker: 'Пешак', textMk: 'Ајде да одиме да видиме!', textEn: 'Let\'s go see!', transliteration: 'Ajde da odime da vidime!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "се случува" mean?', options: ['is happening', 'is coming', 'is going', 'is staying'], correctAnswer: 'A', explanation: '"Се случува" is a reflexive verb meaning "is happening".' },
      { type: 'fill_blank', question: 'Ајде да ___ да видиме! (Let\'s go see!)', options: [], correctAnswer: 'одиме', explanation: '"Одиме" is "we go" from "одам" (to go).' },
      { type: 'translation', question: 'Translate: "I don\'t know."', options: [], correctAnswer: 'Не знам.', explanation: '"Знам" means "I know".' },
    ]
  },

  // Lesson 12: Опишување луѓе (Describing people)
  {
    lessonId: 'cmk48mt2o0012ss33n9qt3rf6',
    dialogues: [{
      title: 'Нов колега (New colleague)',
      lines: [
        { speaker: 'Марија', textMk: 'Како изгледа новиот колега?', textEn: 'What does the new colleague look like?', transliteration: 'Kako izgleda noviot kolega?' },
        { speaker: 'Петар', textMk: 'Тој е висок и слаб.', textEn: 'He\'s tall and thin.', transliteration: 'Toj e visok i slab.' },
        { speaker: 'Марија', textMk: 'Каква коса има?', textEn: 'What kind of hair does he have?', transliteration: 'Kakva kosa ima?' },
        { speaker: 'Петар', textMk: 'Има кратка црна коса.', textEn: 'He has short black hair.', transliteration: 'Ima kratka crna kosa.' },
        { speaker: 'Марија', textMk: 'А очите?', textEn: 'And the eyes?', transliteration: 'A ochite?' },
        { speaker: 'Петар', textMk: 'Кафени очи и носи очила.', textEn: 'Brown eyes and he wears glasses.', transliteration: 'Kafeni ochi i nosi ochila.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "изгледа" mean?', options: ['sounds', 'looks', 'feels', 'seems'], correctAnswer: 'B', explanation: '"Изгледа" means "looks" (appearance).' },
      { type: 'fill_blank', question: 'Тој е ___ и слаб. (He\'s tall and thin.)', options: [], correctAnswer: 'висок', explanation: '"Висок" means "tall".' },
      { type: 'translation', question: 'Translate: "short black hair"', options: [], correctAnswer: 'кратка црна коса', explanation: 'Adjectives agree with the noun in gender.' },
    ]
  },

  // Lesson 13: Колку чини? (How much does it cost?)
  {
    lessonId: 'cmk48mt6y0014ss33xet93xng',
    dialogues: [{
      title: 'Во продавница (In a store)',
      lines: [
        { speaker: 'Купувач', textMk: 'Извинете, колку чини оваа кошула?', textEn: 'Excuse me, how much is this shirt?', transliteration: 'Izvinete, kolku chini ovaa koshula?' },
        { speaker: 'Продавач', textMk: 'Чини илјада денари.', textEn: 'It costs one thousand denars.', transliteration: 'Chini iljada denari.' },
        { speaker: 'Купувач', textMk: 'Многу скапо! Има ли попуст?', textEn: 'Very expensive! Is there a discount?', transliteration: 'Mnogu skapo! Ima li popust?' },
        { speaker: 'Продавач', textMk: 'Имаме 20% попуст денес.', textEn: 'We have 20% discount today.', transliteration: 'Imame 20% popust denes.' },
        { speaker: 'Купувач', textMk: 'Одлично! Ќе ја земам.', textEn: 'Excellent! I\'ll take it.', transliteration: 'Odlichno! Kje ja zemam.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "скапо" mean?', options: ['cheap', 'expensive', 'nice', 'big'], correctAnswer: 'B', explanation: '"Скапо" means "expensive". The opposite is "евтино" (cheap).' },
      { type: 'fill_blank', question: 'Колку ___ оваа кошула? (How much is this shirt?)', options: [], correctAnswer: 'чини', explanation: '"Чини" means "costs".' },
      { type: 'translation', question: 'Translate: "I\'ll take it."', options: [], correctAnswer: 'Ќе ја земам.', explanation: '"Ќе земам" is future tense of "to take".' },
    ]
  },

  // Lesson 14: Преку годината (Throughout the year)
  {
    lessonId: 'cmk48mtb60016ss33g0kg23mq',
    dialogues: [{
      title: 'Годишни времиња (Seasons)',
      lines: [
        { speaker: 'Учител', textMk: 'Кое е твоето омилено годишно време?', textEn: 'What\'s your favorite season?', transliteration: 'Koe e tvoeto omileno godishno vreme?' },
        { speaker: 'Ученик', textMk: 'Мене ми се допаѓа летото.', textEn: 'I like summer.', transliteration: 'Mene mi se dopagja letoto.' },
        { speaker: 'Учител', textMk: 'Зошто?', textEn: 'Why?', transliteration: 'Zoshto?' },
        { speaker: 'Ученик', textMk: 'Затоа што е топло и имаме распуст.', textEn: 'Because it\'s warm and we have vacation.', transliteration: 'Zatoa shto e toplo i imame raspust.' },
        { speaker: 'Учител', textMk: 'А зимата?', textEn: 'And winter?', transliteration: 'A zimata?' },
        { speaker: 'Ученик', textMk: 'Зимата е студена, но има снег!', textEn: 'Winter is cold, but there\'s snow!', transliteration: 'Zimata e studena, no ima sneg!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'How many seasons are there?', options: ['три', 'четири', 'пет', 'шест'], correctAnswer: 'B', explanation: 'There are four seasons: пролет, лето, есен, зима.' },
      { type: 'fill_blank', question: 'Мене ми се ___ летото. (I like summer.)', options: [], correctAnswer: 'допаѓа', explanation: '"Ми се допаѓа" means "I like" (pleases me).' },
      { type: 'translation', question: 'Translate: "Winter is cold."', options: [], correctAnswer: 'Зимата е студена.', explanation: '"Студена" is the feminine form of "cold".' },
    ]
  },

  // Lesson 15: Во минатото 1 (In the past 1)
  {
    lessonId: 'cmk48mtey0018ss33eo3dei1p',
    dialogues: [{
      title: 'Што правеше вчера? (What did you do yesterday?)',
      lines: [
        { speaker: 'Марко', textMk: 'Што правеше вчера?', textEn: 'What did you do yesterday?', transliteration: 'Shto praveshe vchera?' },
        { speaker: 'Ана', textMk: 'Гледав филм дома.', textEn: 'I watched a movie at home.', transliteration: 'Gledav film doma.' },
        { speaker: 'Марко', textMk: 'Каков филм?', textEn: 'What kind of movie?', transliteration: 'Kakov film?' },
        { speaker: 'Ана', textMk: 'Комедија. Беше многу смешна!', textEn: 'A comedy. It was very funny!', transliteration: 'Komedija. Beshe mnogu smeshna!' },
        { speaker: 'Марко', textMk: 'Јас работев цел ден.', textEn: 'I worked all day.', transliteration: 'Jas rabotev cel den.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What tense is "гледав"?', options: ['present', 'past (л-form)', 'future', 'imperative'], correctAnswer: 'B', explanation: '"Гледав" is the past tense л-form of "гледам" (to watch).' },
      { type: 'fill_blank', question: 'Што ___ вчера? (What did you do yesterday?)', options: [], correctAnswer: 'правеше', explanation: '"Правеше" is past tense of "правам" for 2nd person.' },
      { type: 'translation', question: 'Translate: "It was very funny!"', options: [], correctAnswer: 'Беше многу смешна!', explanation: '"Беше" is past tense of "е" (is).' },
    ]
  },

  // Lesson 16: Околу светот (Around the world)
  {
    lessonId: 'cmk48mtia001ass332q4u3ean',
    dialogues: [{
      title: 'Патување (Travel)',
      lines: [
        { speaker: 'Ива', textMk: 'Каде патуваше минатото лето?', textEn: 'Where did you travel last summer?', transliteration: 'Kade patuvvashe minatoto leto?' },
        { speaker: 'Горан', textMk: 'Бев во Грција.', textEn: 'I was in Greece.', transliteration: 'Bev vo Grcija.' },
        { speaker: 'Ива', textMk: 'Убаво! Како беше?', textEn: 'Nice! How was it?', transliteration: 'Ubavo! Kako beshe?' },
        { speaker: 'Горан', textMk: 'Одлично! Морето беше прекрасно.', textEn: 'Excellent! The sea was wonderful.', transliteration: 'Odlichno! Moreto beshe prekrasno.' },
        { speaker: 'Ива', textMk: 'Јас сакам да одам во Италија.', textEn: 'I want to go to Italy.', transliteration: 'Jas sakam da odam vo Italija.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "бев" mean?', options: ['I am', 'I was', 'I will be', 'I have been'], correctAnswer: 'B', explanation: '"Бев" is the past tense of "сум" (I am) → I was.' },
      { type: 'fill_blank', question: 'Морето ___ прекрасно. (The sea was wonderful.)', options: [], correctAnswer: 'беше', explanation: '"Беше" is 3rd person past tense of "е".' },
      { type: 'translation', question: 'Translate: "I want to go to Italy."', options: [], correctAnswer: 'Сакам да одам во Италија.', explanation: '"Сакам да" + verb for "I want to..."' },
    ]
  },

  // Lesson 17: Во минатото 2 (In the past 2)
  {
    lessonId: 'cmk48mtm5001css33omz13gok',
    dialogues: [{
      title: 'Детство (Childhood)',
      lines: [
        { speaker: 'Баба', textMk: 'Кога бев мала, живеевме на село.', textEn: 'When I was little, we lived in a village.', transliteration: 'Koga bev mala, zhiveevme na selo.' },
        { speaker: 'Внука', textMk: 'Имавте ли телевизор?', textEn: 'Did you have a TV?', transliteration: 'Imavte li televizor?' },
        { speaker: 'Баба', textMk: 'Не, немавме. Слушавме радио.', textEn: 'No, we didn\'t. We listened to the radio.', transliteration: 'Ne, nemavme. Slushavme radio.' },
        { speaker: 'Внука', textMk: 'А како се забавувавте?', textEn: 'And how did you have fun?', transliteration: 'A kako se zabavuvavte?' },
        { speaker: 'Баба', textMk: 'Игравме надвор секој ден!', textEn: 'We played outside every day!', transliteration: 'Igravme nadvor sekoj den!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What is the past tense of "имаме"?', options: ['имавме', 'имаа', 'имале', 'имаше'], correctAnswer: 'A', explanation: '"Имавме" is "we had" - past tense of "имаме".' },
      { type: 'fill_blank', question: '___ надвор секој ден! (We played outside every day!)', options: [], correctAnswer: 'Игравме', explanation: '"Игравме" is past tense "we played".' },
      { type: 'translation', question: 'Translate: "We listened to the radio."', options: [], correctAnswer: 'Слушавме радио.', explanation: '"Слушавме" is past tense of "слушаме".' },
    ]
  },

  // Lesson 18: Како да стигнеш таму? (How to get there?)
  {
    lessonId: 'cmk48mtq0001ess3357v574bi',
    dialogues: [{
      title: 'Барање насоки (Asking for directions)',
      lines: [
        { speaker: 'Турист', textMk: 'Извинете, каде е музејот?', textEn: 'Excuse me, where is the museum?', transliteration: 'Izvinete, kade e muzejot?' },
        { speaker: 'Минувач', textMk: 'Одете право, па свртете лево.', textEn: 'Go straight, then turn left.', transliteration: 'Odete pravo, pa svrtete levo.' },
        { speaker: 'Турист', textMk: 'Е далеку?', textEn: 'Is it far?', transliteration: 'E daleku?' },
        { speaker: 'Минувач', textMk: 'Не, пет минути пешки.', textEn: 'No, five minutes on foot.', transliteration: 'Ne, pet minuti peshki.' },
        { speaker: 'Турист', textMk: 'Благодарам многу!', textEn: 'Thank you very much!', transliteration: 'Blagodaram mnogu!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "свртете лево" mean?', options: ['go right', 'turn left', 'go straight', 'turn around'], correctAnswer: 'B', explanation: '"Свртете" means "turn" (formal), "лево" means "left".' },
      { type: 'fill_blank', question: 'Одете ___, па свртете лево. (Go straight, then turn left.)', options: [], correctAnswer: 'право', explanation: '"Право" means "straight".' },
      { type: 'translation', question: 'Translate: "five minutes on foot"', options: [], correctAnswer: 'пет минути пешки', explanation: '"Пешки" means "on foot" or "walking".' },
    ]
  },

  // Lesson 19: Не смееш да го правиш тоа! (You mustn't do that!)
  {
    lessonId: 'cmk48mtu1001gss33lri19z3b',
    dialogues: [{
      title: 'Правила (Rules)',
      lines: [
        { speaker: 'Мама', textMk: 'Не смееш да излезеш без домашна!', textEn: 'You mustn\'t go out without homework!', transliteration: 'Ne smeesh da izlezesh bez domashna!' },
        { speaker: 'Дете', textMk: 'Ама мама, сите пријатели се надвор!', textEn: 'But mom, all friends are outside!', transliteration: 'Ama mama, site prijateli se nadvor!' },
        { speaker: 'Мама', textMk: 'Мораш прво да ја завршиш домашната.', textEn: 'You must finish the homework first.', transliteration: 'Morash prvo da ja zvrshish domashnata.' },
        { speaker: 'Дете', textMk: 'Добро, ќе ја завршам брзо.', textEn: 'Okay, I\'ll finish it quickly.', transliteration: 'Dobro, kje ja zavrsham brzo.' },
        { speaker: 'Мама', textMk: 'Можеш да излезеш после.', textEn: 'You can go out afterwards.', transliteration: 'Mozhesh da izlezesh posle.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "не смееш" mean?', options: ['you can', 'you mustn\'t', 'you should', 'you want'], correctAnswer: 'B', explanation: '"Не смееш" means "you mustn\'t" or "you\'re not allowed".' },
      { type: 'fill_blank', question: '___ прво да ја завршиш домашната. (You must finish the homework first.)', options: [], correctAnswer: 'Мораш', explanation: '"Мораш" means "you must".' },
      { type: 'translation', question: 'Translate: "You can go out afterwards."', options: [], correctAnswer: 'Можеш да излезеш после.', explanation: '"Можеш" means "you can".' },
    ]
  },

  // Lesson 20: Тело (Body)
  {
    lessonId: 'cmk48mtxu001iss33royckov8',
    dialogues: [{
      title: 'Кај доктор (At the doctor)',
      lines: [
        { speaker: 'Доктор', textMk: 'Што ве боли?', textEn: 'What hurts?', transliteration: 'Shto ve boli?' },
        { speaker: 'Пациент', textMk: 'Ме боли главата и грлото.', textEn: 'My head and throat hurt.', transliteration: 'Me boli glavata i grloto.' },
        { speaker: 'Доктор', textMk: 'Имате ли температура?', textEn: 'Do you have a temperature?', transliteration: 'Imate li temperatura?' },
        { speaker: 'Пациент', textMk: 'Да, малку.', textEn: 'Yes, a little.', transliteration: 'Da, malku.' },
        { speaker: 'Доктор', textMk: 'Треба да се одморите дома.', textEn: 'You need to rest at home.', transliteration: 'Treba da se odmorite doma.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "ме боли" mean?', options: ['I hurt', 'it hurts me', 'I\'m sick', 'I feel'], correctAnswer: 'B', explanation: '"Ме боли" literally means "it hurts me" - how Macedonian expresses pain.' },
      { type: 'fill_blank', question: 'Ме боли ___ и грлото. (My head and throat hurt.)', options: [], correctAnswer: 'главата', explanation: '"Главата" is "the head" with definite article.' },
      { type: 'translation', question: 'Translate: "You need to rest."', options: [], correctAnswer: 'Треба да се одморите.', explanation: '"Треба да" means "need to/should".' },
    ]
  },

  // Lesson 21: Добро, подобро, најдобро (Good, better, best)
  {
    lessonId: 'cmk48mu1n001kss33oceelyl3',
    dialogues: [{
      title: 'Споредување (Comparing)',
      lines: [
        { speaker: 'Марко', textMk: 'Која пица е подобра?', textEn: 'Which pizza is better?', transliteration: 'Koja pica e podobra?' },
        { speaker: 'Ана', textMk: 'Маргаритата е поевтина, но капричозата е повкусна.', textEn: 'Margherita is cheaper, but capricciosa is tastier.', transliteration: 'Margaritata e poevtina, no kaprichozata e povkusna.' },
        { speaker: 'Марко', textMk: 'А која е најголема?', textEn: 'And which is the biggest?', transliteration: 'A koja e najgolema?' },
        { speaker: 'Ана', textMk: 'Фамилијарната е најголема од сите.', textEn: 'The family-size is the biggest of all.', transliteration: 'Familijarnata e najgolema od site.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'How do you form the comparative in Macedonian?', options: ['Add -er', 'Add по-', 'Add most', 'Change the word'], correctAnswer: 'B', explanation: 'Comparatives use the prefix "по-": добар → подобар.' },
      { type: 'fill_blank', question: 'Маргаритата е ___, но капричозата е повкусна. (Margherita is cheaper...)', options: [], correctAnswer: 'поевтина', explanation: '"Поевтина" is comparative of "евтина" (cheap).' },
      { type: 'translation', question: 'Translate: "the biggest of all"', options: [], correctAnswer: 'најголема од сите', explanation: 'Superlative uses "нај-" prefix.' },
    ]
  },

  // Lesson 22: Слободно време (Free time)
  {
    lessonId: 'cmk48mu58001mss33e0jalsy7',
    dialogues: [{
      title: 'Хобија (Hobbies)',
      lines: [
        { speaker: 'Лена', textMk: 'Што правиш во слободно време?', textEn: 'What do you do in your free time?', transliteration: 'Shto pravish vo slobodno vreme?' },
        { speaker: 'Стефан', textMk: 'Најмногу сакам да читам книги.', textEn: 'I like reading books the most.', transliteration: 'Najmnogu sakam da chitam knigi.' },
        { speaker: 'Лена', textMk: 'А спортуваш ли?', textEn: 'And do you do sports?', transliteration: 'A sportuvash li?' },
        { speaker: 'Стефан', textMk: 'Да, играм тенис секоја сабота.', textEn: 'Yes, I play tennis every Saturday.', transliteration: 'Da, igram tenis sekoja sabota.' },
        { speaker: 'Лена', textMk: 'Одлично! Јас пливам и трчам.', textEn: 'Excellent! I swim and run.', transliteration: 'Odlichno! Jas plivam i trcham.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "слободно време" mean?', options: ['work time', 'free time', 'school time', 'sleep time'], correctAnswer: 'B', explanation: '"Слободно време" means "free time" - time for hobbies.' },
      { type: 'fill_blank', question: 'Најмногу сакам да ___ книги. (I like reading books the most.)', options: [], correctAnswer: 'читам', explanation: '"Читам" means "I read".' },
      { type: 'translation', question: 'Translate: "I play tennis every Saturday."', options: [], correctAnswer: 'Играм тенис секоја сабота.', explanation: '"Секоја сабота" means "every Saturday".' },
    ]
  },

  // Lesson 23: Идни планови (Future plans)
  {
    lessonId: 'cmk48mu8w001oss33cpywgioo',
    dialogues: [{
      title: 'Планови за викенд (Weekend plans)',
      lines: [
        { speaker: 'Ивана', textMk: 'Што ќе правиш за викенд?', textEn: 'What will you do on the weekend?', transliteration: 'Shto kje pravish za vikend?' },
        { speaker: 'Дарко', textMk: 'Ќе одам на планина со пријатели.', textEn: 'I\'ll go to the mountains with friends.', transliteration: 'Kje odam na planina so prijateli.' },
        { speaker: 'Ивана', textMk: 'Супер! Ќе кампувате?', textEn: 'Super! Will you camp?', transliteration: 'Super! Kje kampuvate?' },
        { speaker: 'Дарко', textMk: 'Да, ќе останеме две ноќи.', textEn: 'Yes, we\'ll stay two nights.', transliteration: 'Da, kje ostaneme dve nokji.' },
        { speaker: 'Ивана', textMk: 'Убаво! Јас ќе останам дома.', textEn: 'Nice! I\'ll stay home.', transliteration: 'Ubavo! Jas kje ostanam doma.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'How do you form future tense in Macedonian?', options: ['Add -ше', 'Use ќе + verb', 'Change ending', 'Use би'], correctAnswer: 'B', explanation: 'Future tense uses "ќе" + present tense verb.' },
      { type: 'fill_blank', question: '___ одам на планина. (I\'ll go to the mountains.)', options: [], correctAnswer: 'Ќе', explanation: '"Ќе" is the future tense particle.' },
      { type: 'translation', question: 'Translate: "We\'ll stay two nights."', options: [], correctAnswer: 'Ќе останеме две ноќи.', explanation: '"Останеме" is "we stay", "ќе останеме" = "we will stay".' },
    ]
  },

  // Lesson 24: Чувства (Feelings)
  {
    lessonId: 'cmk48mucz001qss33zi5kk398',
    dialogues: [{
      title: 'Како се чувствуваш? (How do you feel?)',
      lines: [
        { speaker: 'Мила', textMk: 'Како се чувствуваш денес?', textEn: 'How do you feel today?', transliteration: 'Kako se chuvstvuvash denes?' },
        { speaker: 'Никола', textMk: 'Малку сум уморен, но среќен.', textEn: 'I\'m a bit tired, but happy.', transliteration: 'Malku sum umoren, no srekjen.' },
        { speaker: 'Мила', textMk: 'Зошто си среќен?', textEn: 'Why are you happy?', transliteration: 'Zoshto si srekjen?' },
        { speaker: 'Никола', textMk: 'Затоа што утре имам роденден!', textEn: 'Because tomorrow is my birthday!', transliteration: 'Zatoa shto utre imam rodenden!' },
        { speaker: 'Мила', textMk: 'Вау! Честит роденден однапред!', textEn: 'Wow! Happy birthday in advance!', transliteration: 'Vau! Chestit rodenden odnapred!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "се чувствувам" mean?', options: ['I think', 'I feel', 'I believe', 'I hope'], correctAnswer: 'B', explanation: '"Се чувствувам" is reflexive verb meaning "I feel".' },
      { type: 'fill_blank', question: 'Малку сум ___, но среќен. (I\'m a bit tired, but happy.)', options: [], correctAnswer: 'уморен', explanation: '"Уморен" means "tired" (masculine form).' },
      { type: 'translation', question: 'Translate: "Happy birthday!"', options: [], correctAnswer: 'Честит роденден!', explanation: '"Честит" means "congratulations/happy".' },
    ]
  },
];

// ============================================================================
// A2 Lesson Enhancements (Lessons 1-8)
// ============================================================================

const A2_ENHANCEMENTS: LessonEnhancement[] = [
  // Lesson 1: Кои сме – што сме (Who we are – what we are)
  {
    lessonId: 'cmk48muii001tss33hl1egpr8',
    dialogues: [{
      title: 'Интервју за работа (Job interview)',
      lines: [
        { speaker: 'Интервјуер', textMk: 'Кажете ми нешто за себе.', textEn: 'Tell me something about yourself.', transliteration: 'Kazhete mi neshto za sebe.' },
        { speaker: 'Кандидат', textMk: 'Јас сум инженер со 5 години искуство.', textEn: 'I\'m an engineer with 5 years of experience.', transliteration: 'Jas sum inzhener so 5 godini iskustvo.' },
        { speaker: 'Интервјуер', textMk: 'Какви се вашите јаки страни?', textEn: 'What are your strengths?', transliteration: 'Kakvi se vashite jaki strani?' },
        { speaker: 'Кандидат', textMk: 'Организиран сум и добро работам во тим.', textEn: 'I\'m organized and work well in a team.', transliteration: 'Organiziran sum i dobro rabotam vo tim.' },
        { speaker: 'Интервјуер', textMk: 'Зошто сакате да работите кај нас?', textEn: 'Why do you want to work with us?', transliteration: 'Zoshto sakate da rabotite kaj nas?' },
        { speaker: 'Кандидат', textMk: 'Вашата компанија е лидер во индустријата.', textEn: 'Your company is a leader in the industry.', transliteration: 'Vashata kompanija e lider vo industrijata.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "јаки страни" mean?', options: ['weak points', 'strengths', 'interests', 'experiences'], correctAnswer: 'B', explanation: '"Јаки страни" literally means "strong sides" = strengths.' },
      { type: 'fill_blank', question: 'Кажете ми нешто за ___. (Tell me something about yourself.)', options: [], correctAnswer: 'себе', explanation: '"Себе" is the reflexive pronoun "yourself/oneself".' },
      { type: 'translation', question: 'Translate: "I work well in a team."', options: [], correctAnswer: 'Добро работам во тим.', explanation: '"Во тим" means "in a team".' },
    ]
  },

  // Lesson 2: Градот на мојата душа (The city of my soul)
  {
    lessonId: 'cmk48murs0023ss334ifm2j2e',
    dialogues: [{
      title: 'Опишување град (Describing a city)',
      lines: [
        { speaker: 'Турист', textMk: 'Какво е Скопје?', textEn: 'What is Skopje like?', transliteration: 'Kakvo e Skopje?' },
        { speaker: 'Водич', textMk: 'Скопје е главен град со богата историја.', textEn: 'Skopje is a capital city with rich history.', transliteration: 'Skopje e glaven grad so bogata istorija.' },
        { speaker: 'Турист', textMk: 'Што може да се види?', textEn: 'What can be seen?', transliteration: 'Shto mozhe da se vidi?' },
        { speaker: 'Водич', textMk: 'Старата чаршија, Камениот мост, Калето...', textEn: 'The Old Bazaar, Stone Bridge, Kale Fortress...', transliteration: 'Starata charshija, Kameniot most, Kaleto...' },
        { speaker: 'Турист', textMk: 'А каква е храната?', textEn: 'And what\'s the food like?', transliteration: 'A kakva e hranata?' },
        { speaker: 'Водич', textMk: 'Одлична! Мора да пробате тавче гравче!', textEn: 'Excellent! You must try tavche gravche!', transliteration: 'Odlichna! Mora da probate tavche gravche!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "богата историја" mean?', options: ['old history', 'rich history', 'long history', 'interesting history'], correctAnswer: 'B', explanation: '"Богата" means "rich" and "историја" means "history".' },
      { type: 'fill_blank', question: 'Скопје е ___ град. (Skopje is a capital city.)', options: [], correctAnswer: 'главен', explanation: '"Главен" means "main" or "capital".' },
      { type: 'translation', question: 'Translate: "You must try it!"', options: [], correctAnswer: 'Мора да пробате!', explanation: '"Мора да" expresses obligation, "пробате" is formal "try".' },
    ]
  },

  // Lesson 3: Нејзиното височество – храната (Her Majesty – Food)
  {
    lessonId: 'cmk48mv31002hss33j4uraso0',
    dialogues: [{
      title: 'Во ресторан (At a restaurant)',
      lines: [
        { speaker: 'Келнер', textMk: 'Добредојдовте! Дали имате резервација?', textEn: 'Welcome! Do you have a reservation?', transliteration: 'Dobredojdovte! Dali imate rezervacija?' },
        { speaker: 'Гостин', textMk: 'Да, на името Петровски.', textEn: 'Yes, under the name Petrovski.', transliteration: 'Da, na imeto Petrovski.' },
        { speaker: 'Келнер', textMk: 'Изволете, вашата маса е готова.', textEn: 'Please, your table is ready.', transliteration: 'Izvolete, vashata masa e gotova.' },
        { speaker: 'Гостин', textMk: 'Што препорачувате од менито?', textEn: 'What do you recommend from the menu?', transliteration: 'Shto preporachuvate od menito?' },
        { speaker: 'Келнер', textMk: 'Денешната специјалност е јагнешко со компир.', textEn: 'Today\'s specialty is lamb with potatoes.', transliteration: 'Deneshnata specijalnost e jagneshko so kompir.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "препорачувате" mean?', options: ['you order', 'you recommend', 'you want', 'you like'], correctAnswer: 'B', explanation: '"Препорачувам" means "I recommend".' },
      { type: 'fill_blank', question: 'Дали имате ___? (Do you have a reservation?)', options: [], correctAnswer: 'резервација', explanation: '"Резервација" means "reservation".' },
      { type: 'translation', question: 'Translate: "Your table is ready."', options: [], correctAnswer: 'Вашата маса е готова.', explanation: '"Готова" means "ready" (feminine form).' },
    ]
  },

  // Lesson 4: Во светот на купувањето (In the world of shopping)
  {
    lessonId: 'cmk48mvbz002rss33y5py158j',
    dialogues: [{
      title: 'Во трговски центар (At the mall)',
      lines: [
        { speaker: 'Продавач', textMk: 'Дали можам да ви помогнам?', textEn: 'Can I help you?', transliteration: 'Dali mozham da vi pomognam?' },
        { speaker: 'Купувач', textMk: 'Барам зимска јакна, големина М.', textEn: 'I\'m looking for a winter jacket, size M.', transliteration: 'Baram zimska jakna, golemina M.' },
        { speaker: 'Продавач', textMk: 'Имаме нова колекција. Оваа е на попуст.', textEn: 'We have a new collection. This one is on sale.', transliteration: 'Imame nova kolekcija. Ovaa e na popust.' },
        { speaker: 'Купувач', textMk: 'Може ли да ја пробам?', textEn: 'May I try it on?', transliteration: 'Mozhe li da ja probam?' },
        { speaker: 'Продавач', textMk: 'Секако! Соблекувалната е таму.', textEn: 'Of course! The fitting room is there.', transliteration: 'Sekako! Soblekuvalnata e tamu.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "на попуст" mean?', options: ['new arrival', 'on sale', 'expensive', 'sold out'], correctAnswer: 'B', explanation: '"На попуст" means "on sale/discounted".' },
      { type: 'fill_blank', question: 'Може ли да ја ___? (May I try it on?)', options: [], correctAnswer: 'пробам', explanation: '"Пробам" means "try" or "try on".' },
      { type: 'translation', question: 'Translate: "The fitting room is there."', options: [], correctAnswer: 'Соблекувалната е таму.', explanation: '"Соблекувална" is "fitting room".' },
    ]
  },

  // Lesson 5: Професијата – сон или реалност (Profession – dream or reality)
  {
    lessonId: 'cmk48mvp80037ss33wj3xq7pc',
    dialogues: [{
      title: 'Кариера (Career)',
      lines: [
        { speaker: 'Советник', textMk: 'Каква професија сакате?', textEn: 'What profession do you want?', transliteration: 'Kakva profesija sakate?' },
        { speaker: 'Студент', textMk: 'Сакам да бидам програмер.', textEn: 'I want to be a programmer.', transliteration: 'Sakam da bidam programer.' },
        { speaker: 'Советник', textMk: 'Зошто избравте таа професија?', textEn: 'Why did you choose that profession?', transliteration: 'Zoshto izbravte taa profesija?' },
        { speaker: 'Студент', textMk: 'Ме интересира технологијата.', textEn: 'I\'m interested in technology.', transliteration: 'Me interesira tehnologijata.' },
        { speaker: 'Советник', textMk: 'Добар избор! Има голема побарувачка.', textEn: 'Good choice! There\'s high demand.', transliteration: 'Dobar izbor! Ima golema pobaruvachka.' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "побарувачка" mean?', options: ['supply', 'demand', 'salary', 'experience'], correctAnswer: 'B', explanation: '"Побарувачка" means "demand" (in job market context).' },
      { type: 'fill_blank', question: 'Сакам да ___ програмер. (I want to be a programmer.)', options: [], correctAnswer: 'бидам', explanation: '"Бидам" is the subjunctive form of "to be".' },
      { type: 'translation', question: 'Translate: "I\'m interested in technology."', options: [], correctAnswer: 'Ме интересира технологијата.', explanation: '"Ме интересира" means "I\'m interested in" (it interests me).' },
    ]
  },

  // Lesson 6: Светот на дланка (The world at your fingertips)
  {
    lessonId: 'cmk48mvx7003fss3365ob0fru',
    dialogues: [{
      title: 'Технологија (Technology)',
      lines: [
        { speaker: 'Баба', textMk: 'Како да испратам порака на телефонот?', textEn: 'How do I send a message on the phone?', transliteration: 'Kako da ispratam poraka na telefonot?' },
        { speaker: 'Внук', textMk: 'Прво, отвори ја апликацијата.', textEn: 'First, open the app.', transliteration: 'Prvo, otvori ja aplikacijata.' },
        { speaker: 'Баба', textMk: 'А потоа?', textEn: 'And then?', transliteration: 'A potoa?' },
        { speaker: 'Внук', textMk: 'Напиши ја пораката и притисни "испрати".', textEn: 'Write the message and press "send".', transliteration: 'Napishi ja porakata i pritisni "isprati".' },
        { speaker: 'Баба', textMk: 'Ура! Успеав!', textEn: 'Hurray! I did it!', transliteration: 'Ura! Uspeav!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "апликација" mean?', options: ['application form', 'mobile app', 'website', 'document'], correctAnswer: 'B', explanation: '"Апликација" in this context means "mobile app".' },
      { type: 'fill_blank', question: '___ ја пораката и притисни "испрати". (Write the message...)', options: [], correctAnswer: 'Напиши', explanation: '"Напиши" is the imperative "write".' },
      { type: 'translation', question: 'Translate: "I did it!"', options: [], correctAnswer: 'Успеав!', explanation: '"Успеав" means "I succeeded/managed".' },
    ]
  },

  // Lesson 7: Празнуваме, одбележуваме... (Celebrating, commemorating...)
  {
    lessonId: 'cmk48mw6x003pss332g3awqag',
    dialogues: [{
      title: 'Покана за свадба (Wedding invitation)',
      lines: [
        { speaker: 'Невеста', textMk: 'Ве покануваме на нашата свадба!', textEn: 'We invite you to our wedding!', transliteration: 'Ve pokanuvame na nashata svadba!' },
        { speaker: 'Гостин', textMk: 'Честитки! Кога е свадбата?', textEn: 'Congratulations! When is the wedding?', transliteration: 'Chestitki! Koga e svadbata?' },
        { speaker: 'Невеста', textMk: 'На 15-ти јуни, во хотел Александар.', textEn: 'On June 15th, at Hotel Aleksandar.', transliteration: 'Na 15-ti juni, vo hotel Aleksandar.' },
        { speaker: 'Гостин', textMk: 'Прекрасно! Со задоволство ќе дојдеме.', textEn: 'Wonderful! We\'ll gladly come.', transliteration: 'Prekrasno! So zadovolstvo kje dojdeme.' },
        { speaker: 'Невеста', textMk: 'Се радувам! Ќе биде незаборавно!', textEn: 'I\'m delighted! It will be unforgettable!', transliteration: 'Se raduvam! Kje bide nezaboravno!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "покануваме" mean?', options: ['we celebrate', 'we invite', 'we announce', 'we organize'], correctAnswer: 'B', explanation: '"Покануваме" means "we invite".' },
      { type: 'fill_blank', question: 'Со задоволство ќе ___. (We\'ll gladly come.)', options: [], correctAnswer: 'дојдеме', explanation: '"Дојдеме" is "we come", "ќе дојдеме" = "we will come".' },
      { type: 'translation', question: 'Translate: "It will be unforgettable!"', options: [], correctAnswer: 'Ќе биде незаборавно!', explanation: '"Незаборавно" means "unforgettable".' },
    ]
  },

  // Lesson 8: Најди време! (Find time!)
  {
    lessonId: 'cmk48mwei003xss33aefi1xac',
    dialogues: [{
      title: 'Договарање средба (Arranging a meeting)',
      lines: [
        { speaker: 'Марија', textMk: 'Кога си слободна следната недела?', textEn: 'When are you free next week?', transliteration: 'Koga si slobodna slednata nedela?' },
        { speaker: 'Сара', textMk: 'Во понеделник и среда сум зафатена.', textEn: 'On Monday and Wednesday I\'m busy.', transliteration: 'Vo ponedelnik i sreda sum zafatena.' },
        { speaker: 'Марија', textMk: 'А во четврток?', textEn: 'And on Thursday?', transliteration: 'A vo chetvrtok?' },
        { speaker: 'Сара', textMk: 'Четврток е добро! Во колку часот?', textEn: 'Thursday is good! At what time?', transliteration: 'Chetvrtok e dobro! Vo kolku chasot?' },
        { speaker: 'Марија', textMk: 'Во 17 часот, во кафуле "Центар"?', textEn: 'At 5 PM, at café "Center"?', transliteration: 'Vo 17 chasot, vo kafule "Centar"?' },
        { speaker: 'Сара', textMk: 'Супер! Се гледаме тогаш!', textEn: 'Super! See you then!', transliteration: 'Super! Se gledame togash!' },
      ]
    }],
    exercises: [
      { type: 'multiple_choice', question: 'What does "зафатена" mean?', options: ['free', 'busy', 'tired', 'happy'], correctAnswer: 'B', explanation: '"Зафатена" means "busy" (feminine form).' },
      { type: 'fill_blank', question: 'Во колку ___? (At what time?)', options: [], correctAnswer: 'часот', explanation: '"Часот" means "the hour/o\'clock".' },
      { type: 'translation', question: 'Translate: "See you then!"', options: [], correctAnswer: 'Се гледаме тогаш!', explanation: '"Се гледаме" means "we\'ll see each other".' },
    ]
  },
];

// ============================================================================
// Seeding Functions
// ============================================================================

async function seedLessonEnhancement(enhancement: LessonEnhancement) {
  const { lessonId, dialogues, exercises } = enhancement;

  // Check if lesson exists
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

async function addExampleSentencesToVocabulary(lessonId: string) {
  // Get vocabulary items without example sentences
  const vocabItems = await prisma.vocabularyItem.findMany({
    where: {
      lessonId,
      exampleSentenceMk: null,
    },
    take: 20, // Process in batches
  });

  if (vocabItems.length === 0) return 0;

  // Generate simple example sentences
  let updated = 0;
  for (const item of vocabItems) {
    const exampleMk = generateExampleSentence(item.macedonianText, item.partOfSpeech);
    const exampleEn = `Example with "${item.englishText}"`;
    
    if (exampleMk) {
      await prisma.vocabularyItem.update({
        where: { id: item.id },
        data: {
          exampleSentenceMk: exampleMk,
          exampleSentenceEn: exampleEn,
        },
      });
      updated++;
    }
  }

  return updated;
}

function generateExampleSentence(word: string, partOfSpeech: string | null): string | null {
  // Simple example sentence templates based on part of speech
  switch (partOfSpeech?.toLowerCase()) {
    case 'noun':
      return `Ова е ${word}.`;
    case 'verb':
      return `Јас ${word}.`;
    case 'adjective':
      return `Тоа е ${word}.`;
    case 'adverb':
      return `Тој работи ${word}.`;
    default:
      return `Пример со "${word}".`;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('\n🌱 Seeding All A1 and A2 Lessons\n');
  console.log('=' .repeat(60));

  // Seed A1 lessons (3-24, since 1-2 are already done)
  console.log('\n📚 A1 Lessons (Тешкото)\n');
  let a1Success = 0;
  for (const enhancement of A1_ENHANCEMENTS) {
    const success = await seedLessonEnhancement(enhancement);
    if (success) a1Success++;
  }
  console.log(`\n  ✅ A1: ${a1Success}/${A1_ENHANCEMENTS.length} lessons enhanced`);

  // Seed A2 lessons
  console.log('\n📚 A2 Lessons (Лозје)\n');
  let a2Success = 0;
  for (const enhancement of A2_ENHANCEMENTS) {
    const success = await seedLessonEnhancement(enhancement);
    if (success) a2Success++;
  }
  console.log(`\n  ✅ A2: ${a2Success}/${A2_ENHANCEMENTS.length} lessons enhanced`);

  console.log('\n' + '=' .repeat(60));
  console.log(`\n🎉 Complete! ${a1Success + a2Success} lessons enhanced with dialogues and exercises.\n`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

