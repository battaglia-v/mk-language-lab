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
  weather: ['сонце', 'дожд', 'снег', 'ветер', 'облачно', 'топло', 'ладно', 'студено', 'жешко', 'влажно'],
  transport: ['автобус', 'воз', 'такси', 'авион', 'брод', 'велосипед', 'автомобил', 'трамвај', 'метро', 'станица'],
  shopping: ['пари', 'цена', 'скапо', 'евтино', 'сметка', 'готовина', 'картичка', 'попуст', 'големина', 'боја'],
  emotions: ['среќен', 'тажен', 'љут', 'уморен', 'гладен', 'жеден', 'заљубен', 'изненаден', 'загрижен', 'возбуден'],
  colors: ['црвена', 'сина', 'зелена', 'жолта', 'бела', 'црна', 'кафеава', 'розова', 'портокалова', 'виолетова'],
  body: ['глава', 'раце', 'нозе', 'очи', 'уши', 'нос', 'уста', 'заби', 'коса', 'грб'],
  clothing: ['кошула', 'панталони', 'фустан', 'чевли', 'чорапи', 'јакна', 'капа', 'шал', 'ракавици', 'чанта'],
  work: ['работа', 'канцеларија', 'шеф', 'колега', 'состанок', 'проект', 'плата', 'одмор', 'работник', 'компанија'],
  health: ['болен', 'здрав', 'лек', 'болница', 'доктор', 'рецепт', 'преглед', 'операција', 'алергија', 'симптом'],
  home: ['куќа', 'стан', 'соба', 'кујна', 'бања', 'спална', 'дневна', 'балкон', 'двор', 'врата'],
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

  // Weather - Easy/Medium (20)
  createItem('ws-131', 'Денес е сончево', 'Today is sunny', 'сончево', 'easy', 'weather'),
  createItem('ws-132', 'Врне дожд', 'It is raining', 'дожд', 'easy', 'weather'),
  createItem('ws-133', 'Паѓа снег', 'It is snowing', 'снег', 'easy', 'weather'),
  createItem('ws-134', 'Дува ветер', 'The wind is blowing', 'ветер', 'easy', 'weather'),
  createItem('ws-135', 'Времето е убаво', 'The weather is nice', 'убаво', 'easy', 'weather'),
  createItem('ws-136', 'Надвор е топло', 'It is warm outside', 'топло', 'medium', 'weather'),
  createItem('ws-137', 'Надвор е ладно', 'It is cold outside', 'ладно', 'medium', 'weather'),
  createItem('ws-138', 'Денес е облачно', 'Today is cloudy', 'облачно', 'medium', 'weather'),
  createItem('ws-139', 'Утре ќе врне', 'Tomorrow it will rain', 'врне', 'medium', 'weather'),
  createItem('ws-140', 'Зимата е студена', 'Winter is cold', 'студена', 'medium', 'weather'),
  createItem('ws-141', 'Летото е жешко', 'Summer is hot', 'жешко', 'medium', 'weather'),
  createItem('ws-142', 'Пролетта е убава', 'Spring is beautiful', 'убава', 'medium', 'weather'),
  createItem('ws-143', 'Есента е влажна', 'Autumn is humid', 'влажна', 'medium', 'weather'),
  createItem('ws-144', 'Има магла', 'There is fog', 'магла', 'medium', 'weather'),
  createItem('ws-145', 'Грми и свети', 'It is thundering and lightning', 'Грми', 'hard', 'weather'),
  createItem('ws-146', 'Временската прогноза е добра', 'The weather forecast is good', 'прогноза', 'hard', 'weather'),
  createItem('ws-147', 'Температурата е високa', 'The temperature is high', 'Температурата', 'hard', 'weather'),
  createItem('ws-148', 'Ќе има невреме', 'There will be a storm', 'невреме', 'hard', 'weather'),
  createItem('ws-149', 'Денес е многу влажно', 'Today is very humid', 'влажно', 'medium', 'weather'),
  createItem('ws-150', 'Сонцето грее силно', 'The sun is shining brightly', 'грее', 'medium', 'weather'),

  // Transport - Easy/Medium/Hard (20)
  createItem('ws-151', 'Каде е автобусот?', 'Where is the bus?', 'автобусот', 'easy', 'transport'),
  createItem('ws-152', 'Возот доаѓа', 'The train is coming', 'Возот', 'easy', 'transport'),
  createItem('ws-153', 'Сакам такси', 'I want a taxi', 'такси', 'easy', 'transport'),
  createItem('ws-154', 'Авионот лета', 'The plane is flying', 'Авионот', 'easy', 'transport'),
  createItem('ws-155', 'Имам велосипед', 'I have a bicycle', 'велосипед', 'easy', 'transport'),
  createItem('ws-156', 'Каде е станицата?', 'Where is the station?', 'станицата', 'medium', 'transport'),
  createItem('ws-157', 'Автобусот заминува во пет', 'The bus leaves at five', 'заминува', 'medium', 'transport'),
  createItem('ws-158', 'Возот е брз', 'The train is fast', 'брз', 'medium', 'transport'),
  createItem('ws-159', 'Летот е одложен', 'The flight is delayed', 'одложен', 'medium', 'transport'),
  createItem('ws-160', 'Колку чини билетот?', 'How much is the ticket?', 'билетот', 'medium', 'transport'),
  createItem('ws-161', 'Каде можам да купам билет?', 'Where can I buy a ticket?', 'купам', 'medium', 'transport'),
  createItem('ws-162', 'Возот пристигнува во осум', 'The train arrives at eight', 'пристигнува', 'medium', 'transport'),
  createItem('ws-163', 'Сакам билет за Охрид', 'I want a ticket to Ohrid', 'Охрид', 'medium', 'transport'),
  createItem('ws-164', 'Метрото е затворено', 'The metro is closed', 'затворено', 'medium', 'transport'),
  createItem('ws-165', 'Трамвајот е полн', 'The tram is full', 'полн', 'medium', 'transport'),
  createItem('ws-166', 'Дали има директен лет?', 'Is there a direct flight?', 'директен', 'hard', 'transport'),
  createItem('ws-167', 'Патувањето трае три часа', 'The trip takes three hours', 'Патувањето', 'hard', 'transport'),
  createItem('ws-168', 'Возниот ред е променет', 'The schedule is changed', 'ред', 'hard', 'transport'),
  createItem('ws-169', 'Мојот багаж е изгубен', 'My luggage is lost', 'багаж', 'hard', 'transport'),
  createItem('ws-170', 'Седиштето до прозорец', 'The seat by the window', 'прозорец', 'hard', 'transport'),

  // Shopping - Easy/Medium/Hard (20)
  createItem('ws-171', 'Колку чини?', 'How much does it cost?', 'чини', 'easy', 'shopping'),
  createItem('ws-172', 'Тоа е скапо', 'That is expensive', 'скапо', 'easy', 'shopping'),
  createItem('ws-173', 'Тоа е евтино', 'That is cheap', 'евтино', 'easy', 'shopping'),
  createItem('ws-174', 'Сакам да платам', 'I want to pay', 'платам', 'easy', 'shopping'),
  createItem('ws-175', 'Имам пари', 'I have money', 'пари', 'easy', 'shopping'),
  createItem('ws-176', 'Каде е касата?', 'Where is the cash register?', 'касата', 'medium', 'shopping'),
  createItem('ws-177', 'Дали имате попуст?', 'Do you have a discount?', 'попуст', 'medium', 'shopping'),
  createItem('ws-178', 'Плаќам со картичка', 'I pay by card', 'картичка', 'medium', 'shopping'),
  createItem('ws-179', 'Плаќам со готовина', 'I pay with cash', 'готовина', 'medium', 'shopping'),
  createItem('ws-180', 'Можам ли да пробам?', 'Can I try it on?', 'пробам', 'medium', 'shopping'),
  createItem('ws-181', 'Која е големината?', 'What is the size?', 'големината', 'medium', 'shopping'),
  createItem('ws-182', 'Сакам друга боја', 'I want a different color', 'боја', 'medium', 'shopping'),
  createItem('ws-183', 'Дали имате помало?', 'Do you have a smaller one?', 'помало', 'medium', 'shopping'),
  createItem('ws-184', 'Дали имате поголемо?', 'Do you have a bigger one?', 'поголемо', 'medium', 'shopping'),
  createItem('ws-185', 'Сметката, ве молам', 'The bill, please', 'Сметката', 'medium', 'shopping'),
  createItem('ws-186', 'Сакам да го вратам ова', 'I want to return this', 'вратам', 'hard', 'shopping'),
  createItem('ws-187', 'Дали е ова на распродажба?', 'Is this on sale?', 'распродажба', 'hard', 'shopping'),
  createItem('ws-188', 'Треба ми фактура', 'I need an invoice', 'фактура', 'hard', 'shopping'),
  createItem('ws-189', 'Дали имате гаранција?', 'Do you have a warranty?', 'гаранција', 'hard', 'shopping'),
  createItem('ws-190', 'Тоа не функционира', 'It does not work', 'функционира', 'hard', 'shopping'),

  // Emotions - Easy/Medium/Hard (20)
  createItem('ws-191', 'Јас сум среќен', 'I am happy', 'среќен', 'easy', 'emotions'),
  createItem('ws-192', 'Јас сум тажен', 'I am sad', 'тажен', 'easy', 'emotions'),
  createItem('ws-193', 'Јас сум уморен', 'I am tired', 'уморен', 'easy', 'emotions'),
  createItem('ws-194', 'Јас сум гладен', 'I am hungry', 'гладен', 'easy', 'emotions'),
  createItem('ws-195', 'Јас сум жеден', 'I am thirsty', 'жеден', 'easy', 'emotions'),
  createItem('ws-196', 'Таа е љута', 'She is angry', 'љута', 'medium', 'emotions'),
  createItem('ws-197', 'Тој е изненаден', 'He is surprised', 'изненаден', 'medium', 'emotions'),
  createItem('ws-198', 'Ние сме возбудени', 'We are excited', 'возбудени', 'medium', 'emotions'),
  createItem('ws-199', 'Тие се загрижени', 'They are worried', 'загрижени', 'medium', 'emotions'),
  createItem('ws-200', 'Јас сум заљубен', 'I am in love', 'заљубен', 'medium', 'emotions'),
  createItem('ws-201', 'Се чувствувам добро', 'I feel good', 'чувствувам', 'medium', 'emotions'),
  createItem('ws-202', 'Тој е нервозен', 'He is nervous', 'нервозен', 'medium', 'emotions'),
  createItem('ws-203', 'Таа е задоволна', 'She is satisfied', 'задоволна', 'medium', 'emotions'),
  createItem('ws-204', 'Ми е досадно', 'I am bored', 'досадно', 'medium', 'emotions'),
  createItem('ws-205', 'Се плашам', 'I am afraid', 'плашам', 'medium', 'emotions'),
  createItem('ws-206', 'Јас сум разочаран', 'I am disappointed', 'разочаран', 'hard', 'emotions'),
  createItem('ws-207', 'Се чувствувам осамено', 'I feel lonely', 'осамено', 'hard', 'emotions'),
  createItem('ws-208', 'Тој е вознемирен', 'He is upset', 'вознемирен', 'hard', 'emotions'),
  createItem('ws-209', 'Таа е благодарна', 'She is grateful', 'благодарна', 'hard', 'emotions'),
  createItem('ws-210', 'Ние сме горди', 'We are proud', 'горди', 'hard', 'emotions'),

  // Colors - Easy/Medium (15)
  createItem('ws-211', 'Тоа е црвено', 'That is red', 'црвено', 'easy', 'colors'),
  createItem('ws-212', 'Небото е сино', 'The sky is blue', 'сино', 'easy', 'colors'),
  createItem('ws-213', 'Тревата е зелена', 'The grass is green', 'зелена', 'easy', 'colors'),
  createItem('ws-214', 'Сонцето е жолто', 'The sun is yellow', 'жолто', 'easy', 'colors'),
  createItem('ws-215', 'Снегот е бел', 'The snow is white', 'бел', 'easy', 'colors'),
  createItem('ws-216', 'Ноќта е црна', 'The night is black', 'црна', 'medium', 'colors'),
  createItem('ws-217', 'Кафето е кафеаво', 'The coffee is brown', 'кафеаво', 'medium', 'colors'),
  createItem('ws-218', 'Цветот е розов', 'The flower is pink', 'розов', 'medium', 'colors'),
  createItem('ws-219', 'Портокалот е портокалов', 'The orange is orange', 'портокалов', 'medium', 'colors'),
  createItem('ws-220', 'Сакам сина боја', 'I like blue color', 'сина', 'medium', 'colors'),
  createItem('ws-221', 'Автомобилот е црн', 'The car is black', 'црн', 'medium', 'colors'),
  createItem('ws-222', 'Косата е кафеава', 'The hair is brown', 'кафеава', 'medium', 'colors'),
  createItem('ws-223', 'Очите се зелени', 'The eyes are green', 'зелени', 'medium', 'colors'),
  createItem('ws-224', 'Ѕидот е бел', 'The wall is white', 'бел', 'medium', 'colors'),
  createItem('ws-225', 'Која боја сакаш?', 'What color do you like?', 'боја', 'medium', 'colors'),

  // Body - Easy/Medium (15)
  createItem('ws-226', 'Ме боли глава', 'My head hurts', 'глава', 'easy', 'body'),
  createItem('ws-227', 'Имам две раце', 'I have two hands', 'раце', 'easy', 'body'),
  createItem('ws-228', 'Имам две нозе', 'I have two legs', 'нозе', 'easy', 'body'),
  createItem('ws-229', 'Очите се сини', 'The eyes are blue', 'Очите', 'easy', 'body'),
  createItem('ws-230', 'Ушите се мали', 'The ears are small', 'Ушите', 'easy', 'body'),
  createItem('ws-231', 'Носот е голем', 'The nose is big', 'Носот', 'medium', 'body'),
  createItem('ws-232', 'Устата е црвена', 'The mouth is red', 'Устата', 'medium', 'body'),
  createItem('ws-233', 'Забите се бели', 'The teeth are white', 'Забите', 'medium', 'body'),
  createItem('ws-234', 'Косата е долга', 'The hair is long', 'Косата', 'medium', 'body'),
  createItem('ws-235', 'Ме боли грб', 'My back hurts', 'грб', 'medium', 'body'),
  createItem('ws-236', 'Ме болат нозете', 'My legs hurt', 'нозете', 'medium', 'body'),
  createItem('ws-237', 'Рацете се студени', 'The hands are cold', 'Рацете', 'medium', 'body'),
  createItem('ws-238', 'Срцето тупка брзо', 'The heart beats fast', 'Срцето', 'hard', 'body'),
  createItem('ws-239', 'Мускулите се јаки', 'The muscles are strong', 'Мускулите', 'hard', 'body'),
  createItem('ws-240', 'Кожата е мека', 'The skin is soft', 'Кожата', 'hard', 'body'),

  // Clothing - Easy/Medium/Hard (15)
  createItem('ws-241', 'Носам кошула', 'I wear a shirt', 'кошула', 'easy', 'clothing'),
  createItem('ws-242', 'Носам панталони', 'I wear pants', 'панталони', 'easy', 'clothing'),
  createItem('ws-243', 'Носам фустан', 'I wear a dress', 'фустан', 'easy', 'clothing'),
  createItem('ws-244', 'Чевлите се нови', 'The shoes are new', 'Чевлите', 'easy', 'clothing'),
  createItem('ws-245', 'Чорапите се топли', 'The socks are warm', 'Чорапите', 'easy', 'clothing'),
  createItem('ws-246', 'Јакната е топла', 'The jacket is warm', 'Јакната', 'medium', 'clothing'),
  createItem('ws-247', 'Капата е црвена', 'The hat is red', 'Капата', 'medium', 'clothing'),
  createItem('ws-248', 'Шалот е долг', 'The scarf is long', 'Шалот', 'medium', 'clothing'),
  createItem('ws-249', 'Ракавиците се топли', 'The gloves are warm', 'Ракавиците', 'medium', 'clothing'),
  createItem('ws-250', 'Чантата е голема', 'The bag is big', 'Чантата', 'medium', 'clothing'),
  createItem('ws-251', 'Овој фустан е убав', 'This dress is beautiful', 'фустан', 'medium', 'clothing'),
  createItem('ws-252', 'Кошулата е премала', 'The shirt is too small', 'премала', 'hard', 'clothing'),
  createItem('ws-253', 'Панталоните се преголеми', 'The pants are too big', 'преголеми', 'hard', 'clothing'),
  createItem('ws-254', 'Дали имате друга големина?', 'Do you have another size?', 'големина', 'hard', 'clothing'),
  createItem('ws-255', 'Оваа боја не ми одговара', 'This color does not suit me', 'одговара', 'hard', 'clothing'),

  // Work/Profession - Easy/Medium/Hard (15)
  createItem('ws-256', 'Јас работам', 'I work', 'работам', 'easy', 'work'),
  createItem('ws-257', 'Каде работиш?', 'Where do you work?', 'работиш', 'easy', 'work'),
  createItem('ws-258', 'Имам работа', 'I have a job', 'работа', 'easy', 'work'),
  createItem('ws-259', 'Мојот шеф е добар', 'My boss is good', 'шеф', 'easy', 'work'),
  createItem('ws-260', 'Имам колега', 'I have a colleague', 'колега', 'easy', 'work'),
  createItem('ws-261', 'Работам во канцеларија', 'I work in an office', 'канцеларија', 'medium', 'work'),
  createItem('ws-262', 'Имам состанок денес', 'I have a meeting today', 'состанок', 'medium', 'work'),
  createItem('ws-263', 'Работам на проект', 'I work on a project', 'проект', 'medium', 'work'),
  createItem('ws-264', 'Платата е добра', 'The salary is good', 'Платата', 'medium', 'work'),
  createItem('ws-265', 'Сакам одмор', 'I want vacation', 'одмор', 'medium', 'work'),
  createItem('ws-266', 'Компанијата е голема', 'The company is big', 'Компанијата', 'medium', 'work'),
  createItem('ws-267', 'Работното време е флексибилно', 'The working hours are flexible', 'флексибилно', 'hard', 'work'),
  createItem('ws-268', 'Барам нова работа', 'I am looking for a new job', 'Барам', 'hard', 'work'),
  createItem('ws-269', 'Имам интервју утре', 'I have an interview tomorrow', 'интервју', 'hard', 'work'),
  createItem('ws-270', 'Ќе го завршам проектот', 'I will finish the project', 'завршам', 'hard', 'work'),

  // Health/Medical - Easy/Medium/Hard (15)
  createItem('ws-271', 'Јас сум болен', 'I am sick', 'болен', 'easy', 'health'),
  createItem('ws-272', 'Јас сум здрав', 'I am healthy', 'здрав', 'easy', 'health'),
  createItem('ws-273', 'Ми треба лек', 'I need medicine', 'лек', 'easy', 'health'),
  createItem('ws-274', 'Каде е болницата?', 'Where is the hospital?', 'болницата', 'easy', 'health'),
  createItem('ws-275', 'Ми треба доктор', 'I need a doctor', 'доктор', 'easy', 'health'),
  createItem('ws-276', 'Имам рецепт', 'I have a prescription', 'рецепт', 'medium', 'health'),
  createItem('ws-277', 'Имам преглед утре', 'I have an appointment tomorrow', 'преглед', 'medium', 'health'),
  createItem('ws-278', 'Ме боли глава', 'My head hurts', 'боли', 'medium', 'health'),
  createItem('ws-279', 'Имам температура', 'I have a fever', 'температура', 'medium', 'health'),
  createItem('ws-280', 'Не се чувствувам добро', 'I don\'t feel well', 'чувствувам', 'medium', 'health'),
  createItem('ws-281', 'Алергичен сум на пеницилин', 'I am allergic to penicillin', 'пеницилин', 'hard', 'health'),
  createItem('ws-282', 'Кои се симптомите?', 'What are the symptoms?', 'симптомите', 'hard', 'health'),
  createItem('ws-283', 'Треба ми итна помош', 'I need urgent help', 'итна', 'hard', 'health'),
  createItem('ws-284', 'Дали имате нешто за болка?', 'Do you have something for pain?', 'болка', 'hard', 'health'),
  createItem('ws-285', 'Мора да одам во аптека', 'I must go to the pharmacy', 'аптека', 'hard', 'health'),

  // Home/Housing - Easy/Medium/Hard (15)
  createItem('ws-286', 'Ова е мојата куќа', 'This is my house', 'куќа', 'easy', 'home'),
  createItem('ws-287', 'Живеам во стан', 'I live in an apartment', 'стан', 'easy', 'home'),
  createItem('ws-288', 'Собата е голема', 'The room is big', 'Собата', 'easy', 'home'),
  createItem('ws-289', 'Кујната е мала', 'The kitchen is small', 'Кујната', 'easy', 'home'),
  createItem('ws-290', 'Бањата е чиста', 'The bathroom is clean', 'Бањата', 'easy', 'home'),
  createItem('ws-291', 'Спалната е топла', 'The bedroom is warm', 'Спалната', 'medium', 'home'),
  createItem('ws-292', 'Дневната е светла', 'The living room is bright', 'Дневната', 'medium', 'home'),
  createItem('ws-293', 'Имам балкон', 'I have a balcony', 'балкон', 'medium', 'home'),
  createItem('ws-294', 'Дворот е убав', 'The yard is nice', 'Дворот', 'medium', 'home'),
  createItem('ws-295', 'Затвори ја вратата', 'Close the door', 'вратата', 'medium', 'home'),
  createItem('ws-296', 'Отвори го прозорецот', 'Open the window', 'прозорецот', 'medium', 'home'),
  createItem('ws-297', 'Станот има три соби', 'The apartment has three rooms', 'соби', 'hard', 'home'),
  createItem('ws-298', 'Кирија е премногу скапа', 'The rent is too expensive', 'Кирија', 'hard', 'home'),
  createItem('ws-299', 'Домот е таму каде е срцето', 'Home is where the heart is', 'срцето', 'hard', 'home'),
  createItem('ws-300', 'Сакам да купам куќа', 'I want to buy a house', 'купам', 'hard', 'home'),

  // Directions/Navigation - Medium/Hard (5)
  createItem('ws-301', 'Каде е центарот?', 'Where is the center?', 'центарот', 'medium', 'places'),
  createItem('ws-302', 'Одете десно', 'Go right', 'десно', 'medium', 'places'),
  createItem('ws-303', 'Одете лево', 'Go left', 'лево', 'medium', 'places'),
  createItem('ws-304', 'Продолжете право', 'Go straight', 'право', 'medium', 'places'),
  createItem('ws-305', 'Тоа е зад аголот', 'It is around the corner', 'аголот', 'hard', 'places'),

  // Advanced Conversation - Opinions & Nuance (20)
  createItem('ws-306', 'Мислам дека тоа е добра идеја', 'I think that is a good idea', 'Мислам', 'hard', 'common'),
  createItem('ws-307', 'Не се согласувам со тебе', 'I don\'t agree with you', 'согласувам', 'hard', 'common'),
  createItem('ws-308', 'Според мене, тоа е погрешно', 'In my opinion, that is wrong', 'погрешно', 'hard', 'common'),
  createItem('ws-309', 'Би сакал да ти објаснам', 'I would like to explain to you', 'објаснам', 'hard', 'common'),
  createItem('ws-310', 'Тоа зависи од ситуацијата', 'That depends on the situation', 'зависи', 'hard', 'common'),
  createItem('ws-311', 'Имам поинакво мислење', 'I have a different opinion', 'поинакво', 'hard', 'common'),
  createItem('ws-312', 'Можеби си во право', 'Maybe you are right', 'право', 'hard', 'common'),
  createItem('ws-313', 'Не сум сигурен што да мислам', 'I\'m not sure what to think', 'сигурен', 'hard', 'emotions'),
  createItem('ws-314', 'Ми се допаѓа твојата идеја', 'I like your idea', 'допаѓа', 'hard', 'emotions'),
  createItem('ws-315', 'Треба да размислам за тоа', 'I need to think about that', 'размислам', 'hard', 'common'),
  createItem('ws-316', 'Се извинувам, но не можам', 'I\'m sorry, but I can\'t', 'извинувам', 'hard', 'common'),
  createItem('ws-317', 'Дали би можел да ми помогнеш?', 'Could you help me?', 'можел', 'hard', 'questions'),
  createItem('ws-318', 'Би било убаво да дојдеш', 'It would be nice if you came', 'убаво', 'hard', 'common'),
  createItem('ws-319', 'Се надевам дека ќе успееме', 'I hope we will succeed', 'надевам', 'hard', 'emotions'),
  createItem('ws-320', 'Жал ми е што ти го кажав тоа', 'I\'m sorry I told you that', 'кажав', 'hard', 'emotions'),
  createItem('ws-321', 'Признавам дека згрешив', 'I admit that I was wrong', 'згрешив', 'hard', 'common'),
  createItem('ws-322', 'Се чувствувам посреќен сега', 'I feel happier now', 'посреќен', 'hard', 'emotions'),
  createItem('ws-323', 'Тоа ме навредува', 'That offends me', 'навредува', 'hard', 'emotions'),
  createItem('ws-324', 'Ценам го твоето мислење', 'I appreciate your opinion', 'Ценам', 'hard', 'common'),
  createItem('ws-325', 'Се сложувам целосно', 'I completely agree', 'целосно', 'hard', 'common'),
];

export function getWordSprintSession(count: number, difficulty?: Difficulty): WordSprintItem[] {
  const items = difficulty ? sentences.filter(s => s.difficulty === difficulty) : [...sentences];
  return items.sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length));
}

export function refreshItemOptions(item: WordSprintItem): WordSprintItem {
  const category = item.tags[0] || 'common';

  // For easy mode: only 2 choices (ensure correct answer is included)
  if (item.difficulty === 'easy') {
    const distractors = getDistractors(item.missing, category, 1);
    const choices = [item.missing, ...distractors].sort(() => Math.random() - 0.5);
    const wordBank = [...choices, ...getDistractors(item.missing, category, 4)].sort(() => Math.random() - 0.5);
    return { ...item, choices, wordBank };
  }

  // For medium/hard mode: 4 choices
  const distractors = getDistractors(item.missing, category);
  const choices = [...distractors, item.missing].sort(() => Math.random() - 0.5);
  const wordBank = [...distractors, item.missing, ...getDistractors(item.missing, category, 3)].sort(() => Math.random() - 0.5);
  return { ...item, choices, wordBank };
}
