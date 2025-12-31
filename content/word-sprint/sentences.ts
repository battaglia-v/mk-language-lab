import type { Difficulty } from '@/components/practice/word-sprint/types';

export type WordSprintItem = {
  id: string; mk: string; en: string; missing: string; maskedMk: string;
  choices: string[]; wordBank: string[]; difficulty: Difficulty;
  tags: string[]; sourceName: string; sourceUrl?: string; attribution: string;
};

const wordBanks: Record<string, string[]> = {
  greetings: ['Здраво', 'Добро', 'утро', 'ден', 'вечер', 'ноќ', 'Довидување', 'Како', 'си', 'сум', 'благодарам', 'пријатно'],
  common: ['благодарам', 'Молам', 'фала', 'да', 'не', 'извинете', 'ве', 'молам', 'секогаш', 'никогаш', 'сега', 'потоа'],
  questions: ['Каде', 'Колку', 'Што', 'Кој', 'Зошто', 'Како', 'Кога', 'Дали', 'Чие'],
  places: ['тоалетот', 'аптеката', 'болница', 'ресторан', 'хотел', 'банка', 'пошта', 'пазар', 'продавница', 'парк'],
  food: ['кафе', 'вода', 'чај', 'леб', 'месо', 'риба', 'салата', 'супа', 'сок', 'пиво', 'вино', 'млеко'],
  numbers: ['еден', 'два', 'три', 'четири', 'пет', 'шест', 'седум', 'осум', 'девет', 'десет'],
  family: ['мајка', 'татко', 'брат', 'сестра', 'баба', 'дедо', 'сопруг', 'сопруга', 'дете', 'пријател'],
  activities: ['читам', 'пишувам', 'зборувам', 'учам', 'работам', 'одам', 'доаѓам', 'спијам', 'јадам', 'пијам'],
  adjectives: ['голем', 'мал', 'убав', 'добар', 'лош', 'нов', 'стар', 'топол', 'ладен', 'брз', 'бавен'],
  time: ['денес', 'утре', 'вчера', 'сега', 'потоа', 'секогаш', 'никогаш', 'рано', 'доцна', 'час'],
};

function getDistractors(correct: string, category: string, count = 3): string[] {
  const words = [...(wordBanks[category] || []), ...Object.values(wordBanks).flat()]
    .filter(w => w.toLowerCase() !== correct.toLowerCase());
  return [...new Set(words)].sort(() => Math.random() - 0.5).slice(0, count);
}

function createItem(id: string, mk: string, en: string, missing: string, difficulty: Difficulty, category: string): WordSprintItem {
  const maskedMk = mk.replace(missing, '____');
  const distractors = getDistractors(missing, category);
  const choices = [...distractors, missing].sort(() => Math.random() - 0.5);
  const wordBank = [...distractors, missing, ...getDistractors(missing, category, 3)].sort(() => Math.random() - 0.5);
  return { id, mk, en, missing, maskedMk, choices, wordBank, difficulty, tags: [category], sourceName: 'Wikivoyage', attribution: 'CC BY-SA 3.0' };
}

export const sentences: WordSprintItem[] = [
  // Easy (20)
  createItem('ws-1', 'Здраво', 'Hello', 'Здраво', 'easy', 'greetings'),
  createItem('ws-2', 'Како си?', 'How are you?', 'Како', 'easy', 'greetings'),
  createItem('ws-3', 'Добро сум', 'I am good', 'Добро', 'easy', 'greetings'),
  createItem('ws-4', 'Добро утро', 'Good morning', 'утро', 'easy', 'greetings'),
  createItem('ws-5', 'Добар ден', 'Good day', 'ден', 'easy', 'greetings'),
  createItem('ws-6', 'Добра вечер', 'Good evening', 'вечер', 'easy', 'greetings'),
  createItem('ws-7', 'Добра ноќ', 'Good night', 'ноќ', 'easy', 'greetings'),
  createItem('ws-8', 'Довидување', 'Goodbye', 'Довидување', 'easy', 'greetings'),
  createItem('ws-9', 'Да', 'Yes', 'Да', 'easy', 'common'),
  createItem('ws-10', 'Не', 'No', 'Не', 'easy', 'common'),
  createItem('ws-11', 'Благодарам', 'Thank you', 'Благодарам', 'easy', 'common'),
  createItem('ws-12', 'Молам', 'Please', 'Молам', 'easy', 'common'),
  createItem('ws-13', 'Извинете', 'Excuse me', 'Извинете', 'easy', 'common'),
  createItem('ws-14', 'Јас сум добро', 'I am well', 'добро', 'easy', 'greetings'),
  createItem('ws-15', 'Ти си добро', 'You are well', 'добро', 'easy', 'greetings'),
  createItem('ws-16', 'Тој е тука', 'He is here', 'тука', 'easy', 'common'),
  createItem('ws-17', 'Таа е дома', 'She is home', 'дома', 'easy', 'common'),
  createItem('ws-18', 'Ние сме тука', 'We are here', 'тука', 'easy', 'common'),
  createItem('ws-19', 'Вие сте добри', 'You are good', 'добри', 'easy', 'common'),
  createItem('ws-20', 'Тие се тука', 'They are here', 'тука', 'easy', 'common'),
  // Medium (20)
  createItem('ws-21', 'Каде е тоалетот?', 'Where is the toilet?', 'тоалетот', 'medium', 'places'),
  createItem('ws-22', 'Каде е аптеката?', 'Where is the pharmacy?', 'аптеката', 'medium', 'places'),
  createItem('ws-23', 'Ми треба доктор', 'I need a doctor', 'доктор', 'medium', 'common'),
  createItem('ws-24', 'Не разбирам', 'I don\'t understand', 'разбирам', 'medium', 'common'),
  createItem('ws-25', 'Зборувате ли англиски?', 'Do you speak English?', 'англиски', 'medium', 'common'),
  createItem('ws-26', 'Колку чини ова?', 'How much is this?', 'чини', 'medium', 'questions'),
  createItem('ws-27', 'Каде е хотелот?', 'Where is the hotel?', 'хотелот', 'medium', 'places'),
  createItem('ws-28', 'Јас сум од Америка', 'I am from America', 'Америка', 'medium', 'common'),
  createItem('ws-29', 'Како се викаш?', 'What is your name?', 'викаш', 'medium', 'questions'),
  createItem('ws-30', 'Јас се викам Марко', 'My name is Marko', 'викам', 'medium', 'common'),
  createItem('ws-31', 'Каде е ресторанот?', 'Where is the restaurant?', 'ресторанот', 'medium', 'places'),
  createItem('ws-32', 'Сакам вода', 'I want water', 'вода', 'medium', 'common'),
  createItem('ws-33', 'Сакам кафе', 'I want coffee', 'кафе', 'medium', 'common'),
  createItem('ws-34', 'Тоа е многу убаво', 'That is very nice', 'убаво', 'medium', 'common'),
  createItem('ws-35', 'Денес е убав ден', 'Today is a nice day', 'убав', 'medium', 'common'),
  createItem('ws-36', 'Можам ли да помогнам?', 'Can I help?', 'помогнам', 'medium', 'common'),
  createItem('ws-37', 'Колку е часот?', 'What time is it?', 'часот', 'medium', 'questions'),
  createItem('ws-38', 'Каде е банката?', 'Where is the bank?', 'банката', 'medium', 'places'),
  createItem('ws-39', 'Имате ли соба?', 'Do you have a room?', 'соба', 'medium', 'questions'),
  createItem('ws-40', 'Јас учам македонски', 'I am learning Macedonian', 'учам', 'medium', 'common'),
  // Hard (15)
  createItem('ws-41', 'Би сакал да резервирам маса', 'I would like to reserve a table', 'резервирам', 'hard', 'common'),
  createItem('ws-42', 'Можете ли да ми помогнете?', 'Can you help me?', 'помогнете', 'hard', 'common'),
  createItem('ws-43', 'Колку чини билетот?', 'How much is the ticket?', 'билетот', 'hard', 'questions'),
  createItem('ws-44', 'Каде е железничката станица?', 'Where is the train station?', 'станица', 'hard', 'places'),
  createItem('ws-45', 'Кога тргнува автобусот?', 'When does the bus leave?', 'тргнува', 'hard', 'questions'),
  createItem('ws-46', 'Ми треба преведувач', 'I need a translator', 'преведувач', 'hard', 'common'),
  createItem('ws-47', 'Не ми е добро', 'I don\'t feel well', 'добро', 'hard', 'common'),
  createItem('ws-48', 'Каде можам да купам билет?', 'Where can I buy a ticket?', 'купам', 'hard', 'questions'),
  createItem('ws-49', 'Дали прифаќате кредитни картички?', 'Do you accept credit cards?', 'кредитни', 'hard', 'questions'),
  createItem('ws-50', 'Би сакал да платам', 'I would like to pay', 'платам', 'hard', 'common'),
  createItem('ws-51', 'Каде е најблиската болница?', 'Where is the nearest hospital?', 'болница', 'hard', 'places'),
  createItem('ws-52', 'Имам резервација', 'I have a reservation', 'резервација', 'hard', 'common'),
  createItem('ws-53', 'Можам ли да добијам сметката?', 'Can I get the bill?', 'сметката', 'hard', 'questions'),
  createItem('ws-54', 'Колку далеку е центарот?', 'How far is the center?', 'далеку', 'hard', 'questions'),
  createItem('ws-55', 'Дали има интернет овде?', 'Is there internet here?', 'интернет', 'hard', 'questions'),

  // Food & Drinks - Easy (10)
  createItem('ws-56', 'Сакам кафе', 'I want coffee', 'кафе', 'easy', 'food'),
  createItem('ws-57', 'Сакам вода', 'I want water', 'вода', 'easy', 'food'),
  createItem('ws-58', 'Сакам чај', 'I want tea', 'чај', 'easy', 'food'),
  createItem('ws-59', 'Сакам леб', 'I want bread', 'леб', 'easy', 'food'),
  createItem('ws-60', 'Еден кафе, молам', 'One coffee, please', 'кафе', 'easy', 'food'),
  createItem('ws-61', 'Една вода, молам', 'One water, please', 'вода', 'easy', 'food'),
  createItem('ws-62', 'Супата е топла', 'The soup is hot', 'топла', 'easy', 'food'),
  createItem('ws-63', 'Јадењето е добро', 'The food is good', 'добро', 'easy', 'food'),
  createItem('ws-64', 'Сакам салата', 'I want salad', 'салата', 'easy', 'food'),
  createItem('ws-65', 'Пијам млеко', 'I drink milk', 'млеко', 'easy', 'food'),

  // Family - Easy (10)
  createItem('ws-66', 'Моја мајка', 'My mother', 'мајка', 'easy', 'family'),
  createItem('ws-67', 'Мој татко', 'My father', 'татко', 'easy', 'family'),
  createItem('ws-68', 'Мој брат', 'My brother', 'брат', 'easy', 'family'),
  createItem('ws-69', 'Моја сестра', 'My sister', 'сестра', 'easy', 'family'),
  createItem('ws-70', 'Моја баба', 'My grandmother', 'баба', 'easy', 'family'),
  createItem('ws-71', 'Мој дедо', 'My grandfather', 'дедо', 'easy', 'family'),
  createItem('ws-72', 'Тој е мој пријател', 'He is my friend', 'пријател', 'easy', 'family'),
  createItem('ws-73', 'Таа е моја сестра', 'She is my sister', 'сестра', 'easy', 'family'),
  createItem('ws-74', 'Имам брат', 'I have a brother', 'брат', 'easy', 'family'),
  createItem('ws-75', 'Имам сестра', 'I have a sister', 'сестра', 'easy', 'family'),

  // Activities - Medium (10)
  createItem('ws-76', 'Јас читам книга', 'I read a book', 'читам', 'medium', 'activities'),
  createItem('ws-77', 'Јас пишувам писмо', 'I write a letter', 'пишувам', 'medium', 'activities'),
  createItem('ws-78', 'Јас учам македонски', 'I learn Macedonian', 'учам', 'medium', 'activities'),
  createItem('ws-79', 'Јас работам секој ден', 'I work every day', 'работам', 'medium', 'activities'),
  createItem('ws-80', 'Јас одам дома', 'I go home', 'одам', 'medium', 'activities'),
  createItem('ws-81', 'Јас доаѓам од работа', 'I come from work', 'доаѓам', 'medium', 'activities'),
  createItem('ws-82', 'Јас спијам осум часа', 'I sleep eight hours', 'спијам', 'medium', 'activities'),
  createItem('ws-83', 'Јас јадам појадок', 'I eat breakfast', 'јадам', 'medium', 'activities'),
  createItem('ws-84', 'Јас пијам кафе наутро', 'I drink coffee in the morning', 'пијам', 'medium', 'activities'),
  createItem('ws-85', 'Јас зборувам македонски', 'I speak Macedonian', 'зборувам', 'medium', 'activities'),

  // Time - Medium (10)
  createItem('ws-86', 'Денес е понеделник', 'Today is Monday', 'Денес', 'medium', 'time'),
  createItem('ws-87', 'Утре имам работа', 'Tomorrow I have work', 'Утре', 'medium', 'time'),
  createItem('ws-88', 'Вчера беше убаво', 'Yesterday was nice', 'Вчера', 'medium', 'time'),
  createItem('ws-89', 'Сега е три часот', 'Now it is three o\'clock', 'Сега', 'medium', 'time'),
  createItem('ws-90', 'Доаѓам потоа', 'I come later', 'потоа', 'medium', 'time'),
  createItem('ws-91', 'Секогаш доаѓам рано', 'I always come early', 'рано', 'medium', 'time'),
  createItem('ws-92', 'Никогаш не доцнам', 'I never am late', 'доцнам', 'medium', 'time'),
  createItem('ws-93', 'Станувам рано наутро', 'I wake up early in the morning', 'рано', 'medium', 'time'),
  createItem('ws-94', 'Вечерам доцна', 'I have dinner late', 'доцна', 'medium', 'time'),
  createItem('ws-95', 'Колку е часот?', 'What time is it?', 'часот', 'medium', 'time'),

  // Adjectives - Medium (10)
  createItem('ws-96', 'Куќата е голема', 'The house is big', 'голема', 'medium', 'adjectives'),
  createItem('ws-97', 'Детето е мало', 'The child is small', 'мало', 'medium', 'adjectives'),
  createItem('ws-98', 'Градот е убав', 'The city is beautiful', 'убав', 'medium', 'adjectives'),
  createItem('ws-99', 'Храната е добра', 'The food is good', 'добра', 'medium', 'adjectives'),
  createItem('ws-100', 'Времето е лошо', 'The weather is bad', 'лошо', 'medium', 'adjectives'),
  createItem('ws-101', 'Автомобилот е нов', 'The car is new', 'нов', 'medium', 'adjectives'),
  createItem('ws-102', 'Зградата е стара', 'The building is old', 'стара', 'medium', 'adjectives'),
  createItem('ws-103', 'Кафето е топло', 'The coffee is hot', 'топло', 'medium', 'adjectives'),
  createItem('ws-104', 'Водата е ладна', 'The water is cold', 'ладна', 'medium', 'adjectives'),
  createItem('ws-105', 'Возот е брз', 'The train is fast', 'брз', 'medium', 'adjectives'),

  // Numbers - Easy (10)
  createItem('ws-106', 'Имам еден брат', 'I have one brother', 'еден', 'easy', 'numbers'),
  createItem('ws-107', 'Имам две сестри', 'I have two sisters', 'две', 'easy', 'numbers'),
  createItem('ws-108', 'Три кафиња, молам', 'Three coffees, please', 'Три', 'easy', 'numbers'),
  createItem('ws-109', 'Четири луѓе', 'Four people', 'Четири', 'easy', 'numbers'),
  createItem('ws-110', 'Пет минути', 'Five minutes', 'Пет', 'easy', 'numbers'),
  createItem('ws-111', 'Шест часот', 'Six o\'clock', 'Шест', 'easy', 'numbers'),
  createItem('ws-112', 'Седум дена', 'Seven days', 'Седум', 'easy', 'numbers'),
  createItem('ws-113', 'Осум години', 'Eight years', 'Осум', 'easy', 'numbers'),
  createItem('ws-114', 'Девет месеци', 'Nine months', 'Девет', 'easy', 'numbers'),
  createItem('ws-115', 'Десет денари', 'Ten denars', 'Десет', 'easy', 'numbers'),

  // More Hard sentences (15)
  createItem('ws-116', 'Би сакал да нарачам вечера', 'I would like to order dinner', 'нарачам', 'hard', 'food'),
  createItem('ws-117', 'Можете ли да ми препорачате нешто?', 'Can you recommend something?', 'препорачате', 'hard', 'questions'),
  createItem('ws-118', 'Каде се наоѓа најблискиот банкомат?', 'Where is the nearest ATM?', 'банкомат', 'hard', 'places'),
  createItem('ws-119', 'Дали имате вегетаријанска храна?', 'Do you have vegetarian food?', 'вегетаријанска', 'hard', 'food'),
  createItem('ws-120', 'Колку време трае патувањето?', 'How long does the trip take?', 'патувањето', 'hard', 'questions'),
  createItem('ws-121', 'Сакам да направам резервација', 'I want to make a reservation', 'резервација', 'hard', 'common'),
  createItem('ws-122', 'Каде можам да разменам пари?', 'Where can I exchange money?', 'разменам', 'hard', 'questions'),
  createItem('ws-123', 'Дали е вклучен појадокот?', 'Is breakfast included?', 'вклучен', 'hard', 'questions'),
  createItem('ws-124', 'Би сакал соба со поглед на море', 'I would like a room with sea view', 'поглед', 'hard', 'places'),
  createItem('ws-125', 'Можам ли да добијам рецепт?', 'Can I get a receipt?', 'рецепт', 'hard', 'questions'),
  createItem('ws-126', 'Каде е полициска станица?', 'Where is the police station?', 'полициска', 'hard', 'places'),
  createItem('ws-127', 'Изгубив мојот пасош', 'I lost my passport', 'пасош', 'hard', 'common'),
  createItem('ws-128', 'Треба ми лекар итно', 'I need a doctor urgently', 'итно', 'hard', 'common'),
  createItem('ws-129', 'Алергичен сум на ореви', 'I am allergic to nuts', 'Алергичен', 'hard', 'food'),
  createItem('ws-130', 'Дали прифаќате евра?', 'Do you accept euros?', 'евра', 'hard', 'questions'),
];

export function getWordSprintSession(count: number, difficulty?: Difficulty): WordSprintItem[] {
  const items = difficulty ? sentences.filter(s => s.difficulty === difficulty) : [...sentences];
  return items.sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length));
}

export function refreshItemOptions(item: WordSprintItem): WordSprintItem {
  const distractors = getDistractors(item.missing, item.tags[0] || 'common');
  const choices = [...distractors, item.missing].sort(() => Math.random() - 0.5);
  const wordBank = [...distractors, item.missing, ...getDistractors(item.missing, item.tags[0] || 'common', 3)].sort(() => Math.random() - 0.5);
  return { ...item, choices, wordBank };
}
