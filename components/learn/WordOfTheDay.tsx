'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

type WordOfTheDayData = {
  macedonian: string;
  pronunciation: string;
  english: string;
  partOfSpeech: string;
  exampleMk: string;
  exampleEn: string;
  icon: string;
};

// Rotating word list - changes based on day of year
const wordList: WordOfTheDayData[] = [
  {
    macedonian: 'здраво',
    pronunciation: 'zdravo',
    english: 'hello',
    partOfSpeech: 'greeting',
    exampleMk: 'Здраво, како си?',
    exampleEn: 'Hello, how are you?',
    icon: '👋',
  },
  {
    macedonian: 'благодарам',
    pronunciation: 'blagodaram',
    english: 'thank you',
    partOfSpeech: 'expression',
    exampleMk: 'Благодарам за помошта!',
    exampleEn: 'Thank you for the help!',
    icon: '🙏',
  },
  {
    macedonian: 'љубов',
    pronunciation: 'ljubov',
    english: 'love',
    partOfSpeech: 'noun',
    exampleMk: 'Љубовта е важна.',
    exampleEn: 'Love is important.',
    icon: '❤️',
  },
  {
    macedonian: 'семејство',
    pronunciation: 'semejstvo',
    english: 'family',
    partOfSpeech: 'noun',
    exampleMk: 'Семејството е најважно.',
    exampleEn: 'Family is most important.',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    macedonian: 'пријател',
    pronunciation: 'prijatel',
    english: 'friend',
    partOfSpeech: 'noun',
    exampleMk: 'Тој е мој добар пријател.',
    exampleEn: 'He is my good friend.',
    icon: '🤝',
  },
  {
    macedonian: 'среќа',
    pronunciation: 'srekja',
    english: 'happiness',
    partOfSpeech: 'noun',
    exampleMk: 'Среќата е избор.',
    exampleEn: 'Happiness is a choice.',
    icon: '😊',
  },
  {
    macedonian: 'учам',
    pronunciation: 'učam',
    english: 'I learn',
    partOfSpeech: 'verb',
    exampleMk: 'Јас учам македонски јазик.',
    exampleEn: 'I am learning Macedonian language.',
    icon: '📚',
  },
];

// Get word based on day of year (so it rotates daily)
function getTodaysWord(): WordOfTheDayData {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % wordList.length;
  return wordList[index];
}

export function WordOfTheDay() {
  const t = useTranslations('wordOfTheDay');
  const word = getTodaysWord();

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t('title')}
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {t(`partOfSpeech.${word.partOfSpeech}`)}
          </Badge>
        </div>

        {/* Main Word */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{word.icon}</span>
            <div className="flex-1 space-y-2">
              <h4 className="text-4xl font-bold text-foreground">
                {word.macedonian}
              </h4>
              <p className="text-lg text-muted-foreground">
                [{word.pronunciation}]
              </p>
            </div>
          </div>

          <p className="text-2xl font-medium text-primary">
            {word.english}
          </p>
        </div>

        {/* Example Sentence */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <p className="text-base font-medium text-foreground">
            {word.exampleMk}
          </p>
          <p className="text-sm text-muted-foreground">
            {word.exampleEn}
          </p>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          {t('footer')}
        </p>
      </div>
    </Card>
  );
}
