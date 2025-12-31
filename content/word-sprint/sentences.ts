import type { Difficulty } from '@/components/practice/word-sprint/types';

export type WordSprintItem = {
  id: string; mk: string; en: string; missing: string; maskedMk: string;
  choices: string[]; wordBank: string[]; difficulty: Difficulty;
  tags: string[]; sourceName: string; sourceUrl?: string; attribution: string;
};

const wordBanks: Record<string, string[]> = {
  greetings: ['Здраво', 'Добро', 'утро', 'ден', 'вечер', 'ноќ', 'Довидување', 'Како', 'си', 'сум', 'благодарам'],
  common: ['благодарам', 'Молам', 'фала', 'да', 'не', 'извинете', 'ве', 'молам'],
  questions: ['Каде', 'Колку', 'Што', 'Кој', 'Зошто', 'Како', 'Кога'],
  places: ['тоалетот', 'аптеката', 'болница', 'ресторан', 'хотел', 'банка', 'пошта'],
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
