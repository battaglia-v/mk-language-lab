/**
 * Fill Blanks Seed Data - 20 essential Macedonian phrases
 * XP by difficulty: Easy 8, Medium 10, Hard 15
 */

export type FillBlankSentence = {
  id: string;
  mk: string;
  en: string;
  blankIndex: number;
  distractors: { easy: string[]; medium: string[]; hard: string[] };
  category: 'greeting' | 'courtesy' | 'emergency' | 'shopping' | 'communication';
};

export const FILL_BLANK_XP = { easy: 8, medium: 10, hard: 15 } as const;
export type FillBlankDifficulty = keyof typeof FILL_BLANK_XP;

export const fillBlanksSeed: FillBlankSentence[] = [
  { id: 'fb-1', mk: 'Здраво', en: 'Hello', blankIndex: 0, distractors: { easy: ['Добро', 'Да', 'Не'], medium: ['Довидување', 'Благодарам', 'Молам'], hard: ['Поздрав', 'Привет', 'Чао'] }, category: 'greeting' },
  { id: 'fb-2', mk: 'Како си?', en: 'How are you?', blankIndex: 0, distractors: { easy: ['Што', 'Кој', 'Каде'], medium: ['Зошто', 'Кога', 'Колку'], hard: ['Дали', 'Чија', 'Која'] }, category: 'greeting' },
  { id: 'fb-3', mk: 'Добро сум, благодарам', en: "I'm good, thank you", blankIndex: 0, distractors: { easy: ['Лошо', 'Да', 'Не'], medium: ['Одлично', 'Слабо', 'Супер'], hard: ['Одлично', 'Извонредно', 'Прекрасно'] }, category: 'greeting' },
  { id: 'fb-4', mk: 'Добро утро', en: 'Good morning', blankIndex: 1, distractors: { easy: ['ден', 'вечер', 'ноќ'], medium: ['попладне', 'свечер', 'навечер'], hard: ['ден', 'денес', 'јутро'] }, category: 'greeting' },
  { id: 'fb-5', mk: 'Добар ден', en: 'Good day', blankIndex: 1, distractors: { easy: ['утро', 'вечер', 'ноќ'], medium: ['пат', 'поздрав', 'збор'], hard: ['миг', 'час', 'момент'] }, category: 'greeting' },
  { id: 'fb-6', mk: 'Добра вечер', en: 'Good evening', blankIndex: 1, distractors: { easy: ['утро', 'ден', 'ноќ'], medium: ['средба', 'вест', 'работа'], hard: ['ноќ', 'свечер', 'навечер'] }, category: 'greeting' },
  { id: 'fb-7', mk: 'Добра ноќ', en: 'Good night', blankIndex: 1, distractors: { easy: ['утро', 'ден', 'вечер'], medium: ['средба', 'забава', 'работа'], hard: ['вечер', 'свечер', 'полноќ'] }, category: 'greeting' },
  { id: 'fb-8', mk: 'Довидување', en: 'Goodbye', blankIndex: 0, distractors: { easy: ['Здраво', 'Да', 'Не'], medium: ['Поздрав', 'Пријатно', 'Среќно'], hard: ['Збогум', 'Чао', 'Адио'] }, category: 'greeting' },
  { id: 'fb-9', mk: 'Благодарам', en: 'Thank you', blankIndex: 0, distractors: { easy: ['Молам', 'Да', 'Не'], medium: ['Извини', 'Простете', 'Помош'], hard: ['Фала', 'Мерси', 'Данке'] }, category: 'courtesy' },
  { id: 'fb-10', mk: 'Молам', en: 'Please', blankIndex: 0, distractors: { easy: ['Да', 'Не', 'Добро'], medium: ['Благодарам', 'Извини', 'Помош'], hard: ['Ве молам', 'Ако сакате', 'Љубезно'] }, category: 'courtesy' },
  { id: 'fb-11', mk: 'Каде е тоалетот?', en: 'Where is the toilet?', blankIndex: 0, distractors: { easy: ['Што', 'Кој', 'Како'], medium: ['Зошто', 'Кога', 'Колку'], hard: ['Дали', 'Чија', 'Која'] }, category: 'emergency' },
  { id: 'fb-12', mk: 'Каде е аптеката?', en: 'Where is the pharmacy?', blankIndex: 2, distractors: { easy: ['болницата', 'банката', 'училиштето'], medium: ['ресторанот', 'хотелот', 'продавницата'], hard: ['дрогеријата', 'лекарната', 'клиниката'] }, category: 'emergency' },
  { id: 'fb-13', mk: 'Ми треба доктор!', en: 'I need a doctor!', blankIndex: 2, distractors: { easy: ['вода', 'храна', 'помош'], medium: ['лекар', 'полиција', 'такси'], hard: ['лекар', 'медик', 'здравник'] }, category: 'emergency' },
  { id: 'fb-14', mk: 'Итно!', en: 'Urgently!', blankIndex: 0, distractors: { easy: ['Брзо', 'Бавно', 'Добро'], medium: ['Веднаш', 'Сега', 'Денес'], hard: ['Неодложно', 'Моментално', 'Набрзина'] }, category: 'emergency' },
  { id: 'fb-15', mk: 'Не разбирам', en: "I don't understand", blankIndex: 0, distractors: { easy: ['Да', 'Добро', 'Сакам'], medium: ['Можам', 'Знам', 'Сакам'], hard: ['Немам', 'Никогаш', 'Ништо'] }, category: 'communication' },
  { id: 'fb-16', mk: 'Разбирам', en: 'I understand', blankIndex: 0, distractors: { easy: ['Не', 'Да', 'Добро'], medium: ['Сфаќам', 'Знам', 'Гледам'], hard: ['Сфаќам', 'Капирам', 'Схватам'] }, category: 'communication' },
  { id: 'fb-17', mk: 'Зборуваш ли англиски?', en: 'Do you speak English?', blankIndex: 2, distractors: { easy: ['македонски', 'германски', 'француски'], medium: ['руски', 'шпански', 'италијански'], hard: ['британски', 'американски', 'австралиски'] }, category: 'communication' },
  { id: 'fb-18', mk: 'Колку е ова?', en: 'How much is this?', blankIndex: 0, distractors: { easy: ['Што', 'Каде', 'Кој'], medium: ['Зошто', 'Кога', 'Како'], hard: ['Колкаво', 'Колкава', 'Киломеѓу'] }, category: 'shopping' },
  { id: 'fb-19', mk: 'Скапо е!', en: "It's expensive!", blankIndex: 0, distractors: { easy: ['Евтино', 'Добро', 'Лошо'], medium: ['Поевтино', 'Поскапо', 'Убаво'], hard: ['Прескапо', 'Ценето', 'Вредно'] }, category: 'shopping' },
  { id: 'fb-20', mk: 'Намали ми ја цената!', en: 'Lower the price!', blankIndex: 0, distractors: { easy: ['Зголеми', 'Дај', 'Земи'], medium: ['Спушти', 'Симни', 'Измени'], hard: ['Снижи', 'Редуцирај', 'Попусти'] }, category: 'shopping' },
];

export function getFillBlanksSession(count = 10) {
  return [...fillBlanksSeed].sort(() => Math.random() - 0.5).slice(0, count);
}

export function generateQuestion(sentence: FillBlankSentence, difficulty: FillBlankDifficulty) {
  const words = sentence.mk.split(' ');
  const answer = words[sentence.blankIndex];
  const questionWords = [...words];
  questionWords[sentence.blankIndex] = '______';
  const options = [answer, ...sentence.distractors[difficulty]].sort(() => Math.random() - 0.5);
  return { id: sentence.id, questionText: questionWords.join(' '), translation: sentence.en, answer, options, xp: FILL_BLANK_XP[difficulty] };
}
